import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Badge, Avatar, Button, Tag, List, Empty, Tooltip, message } from 'antd';
import { 
    UserOutlined, 
    ArrowRightOutlined, 
    EditOutlined,
    ClockCircleOutlined 
} from '@ant-design/icons';
import { Task, TaskStatus } from '../../types';
import { RootState } from '../../store';
import { checkPermission } from '../../utils/permissions';
import { loadTasks } from '../../store/slices/tasksSlice';
import { fetchTasksForCurrentUser, updateTaskForCurrentUser } from '../../api/backend';
import TaskModal from '../TaskModal/TaskModal';
import './Backlog.css';

const priorityColors: Record<string, string> = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    critical: 'red'
};

const priorityLabels: Record<string, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический'
};

const Backlog: React.FC = () => {
    const dispatch = useDispatch();
    const { tasks } = useSelector((state: RootState) => state.tasks);
    const { users } = useSelector((state: RootState) => state.users);
    const { teams } = useSelector((state: RootState) => state.teams);
    const { currentUser } = useSelector((state: RootState) => state.auth);

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const backlogTasks = tasks.filter(task => task.status === TaskStatus.BACKLOG);

    const getAssigneeName = (assigneeId: string | null) => {
        if (!assigneeId) return 'Не назначен';
        const user = users.find(u => u.id === assigneeId);
        return user ? user.name : 'Неизвестный';
    };

    const getTeamName = (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        return team ? team.name : 'Неизвестная команда';
    };

    const handleMoveToTodo = (task: Task) => {
        if (!currentUser) {
            message.error('Пользователь не авторизован');
            return;
        }

        if (!checkPermission(currentUser.role, task.status, TaskStatus.TODO)) {
            message.error('Недостаточно прав для перемещения задачи');
            return;
        }

        void (async () => {
            try {
                await updateTaskForCurrentUser(currentUser.id, task.id, {
                    status: TaskStatus.TODO,
                });
                const tasks = await fetchTasksForCurrentUser(currentUser.id);
                dispatch(loadTasks(tasks));
                message.success(`Задача "${task.title}" перемещена в To Do`);
            } catch {
                message.error('Ошибка при перемещении задачи');
            }
        })();
    };

    const handleOpenTask = (task: Task) => {
        setSelectedTask(task);
        setIsModalVisible(true);
    };

    if (backlogTasks.length === 0) {
        return (
            <div className="backlog-container">
                <div className="backlog-header">
                    <h2>
                        Бэклог
                    </h2>
                    <Badge count={0} showZero style={{ backgroundColor: '#8c8c8c' }} />
                </div>
                <Empty 
                    description="Бэклог пуст" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </div>
        );
    }

    return (
        <div className="backlog-container">
            <div className="backlog-header">
                <h2>
                    Бэклог
                </h2>
                <Badge count={backlogTasks.length} style={{ backgroundColor: '#1890ff' }} />
            </div>

            <List
                className="backlog-list"
                dataSource={backlogTasks}
                renderItem={(task) => (
                    <List.Item className="backlog-item">
                        <Card 
                            className="backlog-card"
                            hoverable
                            onClick={() => handleOpenTask(task)}
                        >
                            <div className="backlog-card-content">
                                <div className="backlog-card-main">
                                    <div className="backlog-card-header">
                                        <Badge
                                            color={priorityColors[task.priority]}
                                            text={
                                                <span className="task-title">{task.title}</span>
                                            }
                                        />
                                        <Tag color={priorityColors[task.priority]}>
                                            {priorityLabels[task.priority]}
                                        </Tag>
                                    </div>
                                    
                                    <p className="task-description">
                                        {task.description.substring(0, 150)}
                                        {task.description.length > 150 ? '...' : ''}
                                    </p>

                                    <div className="backlog-card-footer">
                                        <div className="assignee-info">
                                            <Avatar size="small" icon={<UserOutlined />} />
                                            <span>{getAssigneeName(task.assigneeId)}</span>
                                        </div>
                                        <Tag color="blue">{getTeamName(task.teamId)}</Tag>
                                        <div className="task-tags">
                                            {task.tags.slice(0, 2).map(tag => (
                                                <Tag key={tag} style={{ fontSize: '10px' }}>
                                                    {tag}
                                                </Tag>
                                            ))}
                                            {task.tags.length > 2 && (
                                                <Tag style={{ fontSize: '10px' }}>
                                                    +{task.tags.length - 2}
                                                </Tag>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="backlog-card-actions">
                                    <Tooltip title="Редактировать">
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenTask(task);
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Переместить в To Do">
                                        <Button
                                            type="primary"
                                            icon={<ArrowRightOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMoveToTodo(task);
                                            }}
                                        >
                                            В работу
                                        </Button>
                                    </Tooltip>
                                </div>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />

            <TaskModal
                task={selectedTask}
                visible={isModalVisible}
                onClose={() => {
                    setIsModalVisible(false);
                    setSelectedTask(null);
                }}
            />
        </div>
    );
};

export default Backlog;

