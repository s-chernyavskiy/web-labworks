import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Badge, Avatar, Tag, List, Empty, Input } from 'antd';
import { 
    UserOutlined, 
    CheckCircleOutlined,
    SearchOutlined 
} from '@ant-design/icons';
import { Task, TaskStatus } from '../../types';
import { RootState } from '../../store';
import TaskModal from '../TaskModal/TaskModal';
import './Archive.css';

const priorityColors: Record<string, string> = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    critical: 'red'
};

const Archive: React.FC = () => {
    const { tasks } = useSelector((state: RootState) => state.tasks);
    const { users } = useSelector((state: RootState) => state.users);
    const { teams } = useSelector((state: RootState) => state.teams);

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    const doneTasks = tasks.filter(task => task.status === TaskStatus.DONE);

    const filteredTasks = doneTasks.filter(task =>
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description.toLowerCase().includes(searchText.toLowerCase())
    );

    const getAssigneeName = (assigneeId: string | null) => {
        if (!assigneeId) return 'Не назначен';
        const user = users.find(u => u.id === assigneeId);
        return user ? user.name : 'Неизвестный';
    };

    const getTeamName = (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        return team ? team.name : 'Неизвестная команда';
    };

    const handleOpenTask = (task: Task) => {
        setSelectedTask(task);
        setIsModalVisible(true);
    };

    return (
        <div className="archive-container">
            <div className="archive-header">
                <div className="archive-title">
                    <h2>
                        Архив выполненных задач
                    </h2>
                    <Badge count={doneTasks.length} style={{ backgroundColor: '#52c41a' }} />
                </div>
                
                <Input
                    placeholder="Поиск в архиве..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="archive-search"
                    allowClear
                />
            </div>

            {filteredTasks.length === 0 ? (
                <Empty 
                    description={searchText ? "Ничего не найдено" : "Архив пуст"} 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                <List
                    className="archive-list"
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
                    dataSource={filteredTasks}
                    renderItem={(task) => (
                        <List.Item>
                            <Card 
                                className="archive-card"
                                hoverable
                                onClick={() => handleOpenTask(task)}
                            >
                                <div className="archive-card-status">
                                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                                    <span>Выполнено</span>
                                </div>

                                <div className="archive-card-header">
                                    <Badge
                                        color={priorityColors[task.priority]}
                                        text={
                                            <span className="task-title">{task.title}</span>
                                        }
                                    />
                                </div>
                                
                                <p className="task-description">
                                    {task.description.substring(0, 100)}
                                    {task.description.length > 100 ? '...' : ''}
                                </p>

                                <div className="archive-card-footer">
                                    <div className="assignee-info">
                                        <Avatar size="small" icon={<UserOutlined />} />
                                        <span>{getAssigneeName(task.assigneeId)}</span>
                                    </div>
                                    <Tag color="blue">{getTeamName(task.teamId)}</Tag>
                                </div>

                                <div className="task-tags">
                                    {task.tags.slice(0, 3).map(tag => (
                                        <Tag key={tag} style={{ fontSize: '10px', marginTop: 8 }}>
                                            {tag}
                                        </Tag>
                                    ))}
                                    {task.tags.length > 3 && (
                                        <Tag style={{ fontSize: '10px', marginTop: 8 }}>
                                            +{task.tags.length - 3}
                                        </Tag>
                                    )}
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            )}

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

export default Archive;

