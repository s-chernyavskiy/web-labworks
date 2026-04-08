import React, { useState } from 'react';
import { Card, Avatar, Descriptions, Button, Space, Typography, Tag, Modal } from 'antd';
import { UserOutlined, EditOutlined, MailOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import EditProfileForm from './EditProfileForm';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const { currentUser } = useSelector((state: RootState) => state.auth);

    if (!currentUser) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <UserOutlined style={{ fontSize: 48, color: '#999', marginBottom: 16 }} />
                    <Title level={4}>Пользователь не найден</Title>
                    <Text type="secondary">Войдите в систему</Text>
                </div>
            </Card>
        );
    }

    const handleEditProfile = () => {
        setIsEditModalVisible(true);
    };

    const handleSaveProfile = () => {
        setIsEditModalVisible(false);
    };

    return (
        <>
            <div className="profile-container">
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <UserOutlined style={{ marginRight: 8 }} />
                            <span>Мой профиль</span>
                        </div>
                    }
                    extra={
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={handleEditProfile}
                        >
                            Редактировать профиль
                        </Button>
                    }
                    style={{ maxWidth: 800, margin: '0 auto' }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
                        <Avatar
                            size={100}
                            icon={<UserOutlined />}
                            src={currentUser.avatar}
                            style={{
                                marginBottom: 16,
                                backgroundColor: currentUser.avatar ? 'transparent' : '#1890ff',
                                fontSize: 40
                            }}
                        />
                        <Title level={3} style={{ margin: 0 }}>{currentUser.name}</Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>{currentUser.role}</Text>
                    </div>

                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item
                            label={
                                <Space>
                                    <UserOutlined />
                                    <span>ID пользователя</span>
                                </Space>
                            }
                        >
                            <Text copyable>{currentUser.id}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <Space>
                                    <MailOutlined />
                                    <span>Email</span>
                                </Space>
                            }
                        >
                            {currentUser.email}
                        </Descriptions.Item>

                        <Descriptions.Item
                            label={
                                <Space>
                                    <TeamOutlined />
                                    <span>Роль</span>
                                </Space>
                            }
                        >
                            <Tag color="blue">{currentUser.role}</Tag>
                        </Descriptions.Item>

                        {(
                            <Descriptions.Item
                                label={
                                    <Space>
                                        <TeamOutlined />
                                        <span>Команда</span>
                                    </Space>
                                }
                            >
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                        <Text type="secondary">
                            <CalendarOutlined style={{ marginRight: 8 }} />
                            Дата регистрации: {new Date().toLocaleDateString()}
                        </Text>
                    </div>
                </Card>
            </div>

            <Modal
                title="Редактирование профиля"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
                width={600}
                centered
            >
                <EditProfileForm
                    initialValues={currentUser}
                    onSave={handleSaveProfile}
                    onCancel={() => setIsEditModalVisible(false)}
                />
            </Modal>
        </>
    );
};

export default ProfilePage;