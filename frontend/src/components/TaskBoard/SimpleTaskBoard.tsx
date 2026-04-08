import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Badge, Avatar, Button, Tag, Dropdown, message } from 'antd';
import { EditOutlined, UserOutlined, MoreOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus, UserRole } from '../../types';
import { RootState } from '../../store';
import { loadTasks } from '../../store/slices/tasksSlice';
import { fetchTasksForCurrentUser, updateTaskForCurrentUser } from '../../api/backend';
import TaskModal from '../TaskModal/TaskModal';
import './TaskBoard.css';

const statusColumns = [
    { key: TaskStatus.TODO, title: 'To Do', color: '#1890ff' },
    { key: TaskStatus.IN_PROGRESS, title: 'In Progress', color: '#722ed1' },
    { key: TaskStatus.CODE_REVIEW, title: 'Code Review', color: '#faad14' },
    { key: TaskStatus.TESTING, title: 'Testing', color: '#eb2f96' },
    { key: TaskStatus.TESTING_DONE, title: 'Testing Done', color: '#52c41a' },
    { key: TaskStatus.DONE, title: 'Done (Архив)', color: '#13c2c2', isArchive: true },
];

const priorityColors: Record<string, string> = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    critical: 'red'
};

const SimpleTaskBoard: React.FC = () => {
    const dispatch = useDispatch();
    const { tasks, filters } = useSelector((state: RootState) => state.tasks);
    const { users } = useSelector((state: RootState) => state.users);
    const { teams } = useSelector((state: RootState) => state.teams);
    const { currentUser } = useSelector((state: RootState) => state.auth);

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    const wasDraggingRef = useRef(false);

    const getAssigneeName = (assigneeId: string | null) => {
        if (!assigneeId) return 'Не назначен';
        const user = users.find(u => u.id === assigneeId);
        return user ? user.name : 'Неизвестный';
    };

    const getTeamName = (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        return team ? team.name : 'Неизвестная команда';
    };

    const handleDragStart = () => {
        wasDraggingRef.current = true;
    };

    const handleDragEnd = (result: DropResult) => {
        setTimeout(() => {
            wasDraggingRef.current = false;
        }, 100);
        
        const { destination, source, draggableId } = result;

        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const newStatus = destination.droppableId as TaskStatus;
        
        const task = tasks.find(t => t.id === draggableId);
        if (!task) {
            message.error('Задача не найдена');
            return;
        }

        if (!currentUser) {
            message.error('Пользователь не авторизован');
            return;
        }

        const canMove = checkPermissionForDrag(currentUser.role, task.status, newStatus);
        if (!canMove) {
            message.error('Недостаточно прав для перемещения задачи в этот статус');
            return;
        }

        handleStatusChange(draggableId, newStatus);
    };

    const isTaskVisible = (task: Task): boolean => {
        if (filters.assigneeId && task.assigneeId !== filters.assigneeId) return false;
        if (filters.teamId && task.teamId !== filters.teamId) return false;
        if (filters.status && !filters.status.includes(task.status)) return false;
        return !(filters.priority && !filters.priority.includes(task.priority));

    };

    const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
        if (!currentUser) {
            message.error('Пользователь не авторизован');
            return;
        }

        void (async () => {
            try {
                await updateTaskForCurrentUser(currentUser.id, taskId, {
                    status: newStatus,
                });
                const tasks = await fetchTasksForCurrentUser(currentUser.id);
                dispatch(loadTasks(tasks));
                message.success('Статус задачи успешно изменен');
            } catch {
                message.error('Недостаточно прав или ошибка сервера');
            }
        })();
    };

    const getStatusMenuItems = (task: Task): MenuProps['items'] => {
        const items: MenuProps['items'] = statusColumns
            .filter(col => {
                if (!currentUser) return false;

                if (currentUser.role === UserRole.DEVELOPER) {
                    const allowedStatuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.CODE_REVIEW];
                    if (!allowedStatuses.includes(col.key)) {
                        return false;
                    }
                }

                if (currentUser.role === UserRole.TESTER) {
                    const allowedStatuses = [TaskStatus.CODE_REVIEW, TaskStatus.TESTING, TaskStatus.TESTING_DONE];
                    if (!allowedStatuses.includes(task.status) || !allowedStatuses.includes(col.key)) {
                        return false;
                    }
                }

                if (currentUser.role === UserRole.PRODUCT_OWNER) {
                    return false;
                }

                return col.key !== task.status;
            })
            .map(col => ({
                key: col.key,
                label: (
                    <span style={{ color: col.color }}>
            Переместить в {col.title}
          </span>
                ),
                onClick: () => handleStatusChange(task.id, col.key),
            }));

        return items;
    };

    const checkPermissionForDrag = (userRole: UserRole, currentStatus: TaskStatus, newStatus: TaskStatus): boolean => {
        if ([UserRole.ADMIN, UserRole.TEAM_LEAD].includes(userRole)) {
            return true;
        }

        if (currentStatus === TaskStatus.TESTING_DONE && newStatus === TaskStatus.DONE) {
            return true;
        }

        if (userRole === UserRole.DEVELOPER) {
            const allowedStatuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.CODE_REVIEW];
            if (!allowedStatuses.includes(newStatus)) {
                return false;
            }
        }

        if (userRole === UserRole.TESTER) {
            const allowedStatuses = [TaskStatus.CODE_REVIEW, TaskStatus.TESTING, TaskStatus.TESTING_DONE];
            if (!allowedStatuses.includes(currentStatus) || !allowedStatuses.includes(newStatus)) {
                return false;
            }
        }

        return userRole !== UserRole.PRODUCT_OWNER;


    };

    const renderTaskCard = (task: Task, index: number) => {
        statusColumns.find(col => col.key === task.status);
        const isVisible = isTaskVisible(task);

        const handleCardClick = (e: React.MouseEvent) => {
            if (wasDraggingRef.current) {
                return;
            }
            
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('.ant-dropdown-trigger')) {
                return;
            }
            setSelectedTask(task);
            setIsModalVisible(true);
        };
    
        return (
            <Draggable 
                key={task.id} 
                draggableId={task.id} 
                index={index}
                isDragDisabled={!isVisible}
            >
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`task-card ${snapshot.isDragging ? 'is-dragging' : ''} ${!isVisible ? 'hidden-task' : ''}`}
                        style={{
                            ...provided.draggableProps.style,
                            marginBottom: 12,
                            opacity: snapshot.isDragging ? 0.8 : (isVisible ? 1 : 0.3),
                            pointerEvents: isVisible ? 'auto' : 'none',
                        }}
                    >
                        <Card
                            hoverable={isVisible}
                            onClick={handleCardClick}
                            style={{ 
                                border: snapshot.isDragging ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                boxShadow: snapshot.isDragging ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
                                cursor: isVisible ? 'pointer' : 'not-allowed',
                            }}
                        >
                            <div className="task-header">
                                <Badge
                                    color={priorityColors[task.priority]}
                                    text={task.title}
                                    style={{ fontWeight: 'bold' }}
                                />
                                <div>
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTask(task);
                                            setIsModalVisible(true);
                                        }}
                                        disabled={!isVisible}
                                    />
                                    <Dropdown
                                        menu={{ items: getStatusMenuItems(task) }}
                                        placement="bottomRight"
                                        trigger={['click']}
                                        disabled={!currentUser || !isVisible}
                                    >
                                        <Button
                                            type="text"
                                            icon={<MoreOutlined />}
                                            size="small"
                                            disabled={!currentUser || !isVisible}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </Dropdown>
                                </div>
                            </div>
    
                            <p className="task-description">{task.description.substring(0, 100)}...</p>
    
                            <div className="task-footer">
                                <div className="assignee-info">
                                    <Avatar size="small" icon={<UserOutlined />} />
                                    <span style={{ marginLeft: 8 }}>{getAssigneeName(task.assigneeId)}</span>
                                </div>
    
                                <Tag color="blue">{getTeamName(task.teamId)}</Tag>
    
                                <div className="task-tags">
                                    {task.tags.slice(0, 2).map(tag => (
                                        <Tag key={tag} style={{ fontSize: '10px', padding: '0 4px', lineHeight: '16px' }}>
                                            {tag}
                                        </Tag>
                                    ))}
                                    {task.tags.length > 2 && (
                                        <Tag style={{ fontSize: '10px', padding: '0 4px', lineHeight: '16px' }}>
                                            +{task.tags.length - 2}
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </Draggable>
        );
    };

    return (
        <>
            <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="task-board">
                    {statusColumns.map(column => {
                        const isArchiveColumn = column.key === TaskStatus.DONE;
                        
                        const allColumnTasks = isArchiveColumn
                            ? []
                            : tasks.filter(task => task.status === column.key);
                        const visibleColumnTasks = allColumnTasks.filter(isTaskVisible);

                        const archiveCount = isArchiveColumn 
                            ? tasks.filter(task => task.status === TaskStatus.DONE).length 
                            : visibleColumnTasks.length;

                        return (
                            <div key={column.key} className={`status-column ${isArchiveColumn ? 'archive-column' : ''}`}>
                                <div className="column-header" style={{ backgroundColor: column.color }}>
                                    <h3 style={{ margin: 0, color: 'white' }}>{column.title}</h3>
                                    <Badge 
                                        count={archiveCount} 
                                        showZero 
                                        style={isArchiveColumn ? { backgroundColor: '#52c41a' } : undefined}
                                    />
                                </div>

                                <Droppable droppableId={column.key}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''} ${isArchiveColumn ? 'archive-dropzone' : ''}`}
                                            style={{
                                                backgroundColor: snapshot.isDraggingOver 
                                                    ? (isArchiveColumn ? 'rgba(82, 196, 26, 0.1)' : 'rgba(24, 144, 255, 0.05)') 
                                                    : undefined,
                                            }}
                                        >
                                            {
                                                allColumnTasks.map((task, index) => renderTaskCard(task, index))
                                            }
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            <TaskModal
                task={selectedTask}
                visible={isModalVisible}
                onClose={() => {
                    setIsModalVisible(false);
                    setSelectedTask(null);
                }}
            />
        </>
    );
};

export default SimpleTaskBoard;