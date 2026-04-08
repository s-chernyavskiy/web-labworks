import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Select, Button, Tag } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { RootState } from '../../store';
import { setFilters, clearFilters } from '../../store/slices/tasksSlice';
import { TaskStatus } from '../../types';

const { Option } = Select;

const Filters: React.FC = () => {
    const dispatch = useDispatch();
    const { filters } = useSelector((state: RootState) => state.tasks);
    const { users } = useSelector((state: RootState) => state.users);
    const { teams } = useSelector((state: RootState) => state.teams);

    const handleFilterChange = (key: string, value: any) => {
        dispatch(setFilters({ ...filters, [key]: value }));
    };

    const handleClearFilters = () => {
        dispatch(clearFilters());
    };

    const hasActiveFilters = Object.values(filters).some(
        filter => filter && (Array.isArray(filter) ? filter.length > 0 : true)
    );

    return (
        <Card title="Фильтры" size="small">
            <div className="filters-container">
                <div className="filter-row">
                    <Select
                        placeholder="Исполнитель"
                        allowClear
                        style={{ width: 200, marginRight: 16 }}
                        value={filters.assigneeId}
                        onChange={(value) => handleFilterChange('assigneeId', value)}
                    >
                        {users.map((user: any) => (
                            <Option key={user.id} value={user.id}>
                                {user.name}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        placeholder="Команда"
                        allowClear
                        style={{ width: 200, marginRight: 16 }}
                        value={filters.teamId}
                        onChange={(value) => handleFilterChange('teamId', value)}
                    >
                        {teams.map((team: any) => (
                            <Option key={team.id} value={team.id}>
                                {team.name}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        placeholder="Статус"
                        mode="multiple"
                        allowClear
                        style={{ width: 300, marginRight: 16 }}
                        value={filters.status}
                        onChange={(value) => handleFilterChange('status', value)}
                    >
                        {Object.values(TaskStatus).map(status => (
                            <Option key={status} value={status}>
                                {status.replace('_', ' ').toUpperCase()}
                            </Option>
                        ))}
                    </Select>

                    <Select
                        placeholder="Приоритет"
                        mode="multiple"
                        allowClear
                        style={{ width: 200 }}
                        value={filters.priority}
                        onChange={(value) => handleFilterChange('priority', value)}
                    >
                        <Option value="low">Низкий</Option>
                        <Option value="medium">Средний</Option>
                        <Option value="high">Высокий</Option>
                        <Option value="critical">Критический</Option>
                    </Select>
                </div>

                {hasActiveFilters && (
                    <div className="active-filters">
                        <div className="filter-tags">
                            {filters.assigneeId && (
                                <Tag
                                    closable
                                    onClose={() => handleFilterChange('assigneeId', undefined)}
                                >
                                    Исполнитель: {users.find((u: any) => u.id === filters.assigneeId)?.name}
                                </Tag>
                            )}

                            {filters.teamId && (
                                <Tag
                                    closable
                                    onClose={() => handleFilterChange('teamId', undefined)}
                                >
                                    Команда: {teams.find((t: any) => t.id === filters.teamId)?.name}
                                </Tag>
                            )}

                            {filters.status?.map((status: TaskStatus) => (
                                <Tag
                                    key={status}
                                    closable
                                    onClose={() => {
                                        const newStatuses = filters.status?.filter(s => s !== status);
                                        handleFilterChange('status', newStatuses?.length ? newStatuses : undefined);
                                    }}
                                >
                                    Статус: {status.replace('_', ' ').toUpperCase()}
                                </Tag>
                            ))}

                            {filters.priority?.map((priority: string) => (
                                <Tag
                                    key={priority}
                                    closable
                                    onClose={() => {
                                        const newPriorities = filters.priority?.filter(p => p !== priority);
                                        handleFilterChange('priority', newPriorities?.length ? newPriorities : undefined);
                                    }}
                                >
                                    Приоритет: {priority}
                                </Tag>
                            ))}
                        </div>

                        <Button
                            type="link"
                            icon={<CloseOutlined />}
                            onClick={handleClearFilters}
                            style={{ marginLeft: 16 }}
                        >
                            Очистить все
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default Filters;