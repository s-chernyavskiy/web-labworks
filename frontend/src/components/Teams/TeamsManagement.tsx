import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Button, Modal, Form, Input, Select, Tag, Avatar, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { RootState } from '../../store';
import { Team } from '../../types';
import { canEditTeam } from '../../utils/permissions';

const { Option } = Select;
const { TextArea } = Input;

const TeamsManagement: React.FC = () => {
    const { teams } = useSelector((state: RootState) => state.teams);
    const { users } = useSelector((state: RootState) => state.users);
    const { currentUser } = useSelector((state: RootState) => state.auth);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [form] = Form.useForm();

    const canEdit = currentUser ? canEditTeam(currentUser.role) : false;

    const handleAddTeam = () => {
        setEditingTeam(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditTeam = (team: Team) => {
        setEditingTeam(team);
        form.setFieldsValue(team);
        setIsModalVisible(true);
    };

    const handleDeleteTeam = (_teamId: string) => {
        message.warning(
            'На бэкенде нет API команд: удаление не сохраняется на сервере.',
        );
    };

    const handleSubmit = () => {
        form.validateFields().then(() => {
            message.warning(
                'На бэкенде нет API команд: состав команд строится из пользователей, загруженных с сервера.',
            );
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleAddMember = (_teamId: string, _userId: string) => {
        message.warning(
            'На бэкенде нет API команд: участники берутся из списка пользователей с сервера.',
        );
    };

    const handleStatusChange = (_teamId: string, _status: Team['status']) => {
        message.warning(
            'На бэкенде нет API команд: статус команды не сохраняется на сервере.',
        );
    };

    const statusColors = {
        active: 'green',
        inactive: 'orange',
        archived: 'red',
    };

    const columns = [
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Описание',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            render: (status: Team['status'], record: Team) => (
                <Select
                    value={status}
                    onChange={(value) => handleStatusChange(record.id, value)}
                    disabled={!canEdit}
                    style={{ width: 120 }}
                >
                    <Option value="active">Активна</Option>
                    <Option value="inactive">Неактивна</Option>
                    <Option value="archived">Архивирована</Option>
                </Select>
            ),
        },
        {
            title: 'Участники',
            key: 'members',
            render: (_: any, record: Team) => (
                <div style={{ maxWidth: 300 }}>
                    <Avatar.Group maxCount={3}>
                        {record.members.map(memberId => {
                            const user = users.find(u => u.id === memberId);
                            return (
                                <Avatar
                                    key={memberId}
                                    icon={<UserOutlined />}
                                    style={{ backgroundColor: user ? '#1890ff' : '#d9d9d9' }}
                                >
                                    {user?.name.charAt(0)}
                                </Avatar>
                            );
                        })}
                    </Avatar.Group>

                    {canEdit && (
                        <Select
                            placeholder="Добавить участника"
                            style={{ width: 200, marginTop: 8 }}
                            onChange={(value) => handleAddMember(record.id, value)}
                        >
                            {users
                                .filter(user => !record.members.includes(user.id))
                                .map(user => (
                                    <Option key={user.id} value={user.id}>
                                        {user.name} ({user.role})
                                    </Option>
                                ))}
                        </Select>
                    )}
                </div>
            ),
        },
        {
            title: 'Дата создания',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: Date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_: any, record: Team) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditTeam(record)}
                        disabled={!canEdit}
                    />

                    <Popconfirm
                        title="Удалить команду?"
                        onConfirm={() => handleDeleteTeam(record.id)}
                        okText="Да"
                        cancelText="Нет"
                        disabled={!canEdit}
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            disabled={!canEdit}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Управление командами</h2>
                {canEdit && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddTeam}
                    >
                        Создать команду
                    </Button>
                )}
            </div>

            <Table
                columns={columns}
                dataSource={teams}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingTeam ? 'Редактировать команду' : 'Создать команду'}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                onOk={handleSubmit}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Название команды"
                        rules={[{ required: true, message: 'Введите название команды' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Описание"
                        rules={[{ required: true, message: 'Введите описание команды' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Статус"
                        initialValue="active"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Option value="active">Активна</Option>
                            <Option value="inactive">Неактивна</Option>
                            <Option value="archived">Архивирована</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TeamsManagement;