import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Button, Avatar, Dropdown, message } from 'antd';
import {
    UserOutlined,
    LoginOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import LoginModal from './components/Auth/LoginModal';
import { RootState } from './store';
import { logout, setCurrentUser } from './store/slices/authSlice';
import { loadUsers } from './store/slices/usersSlice';
import { loadTasks } from './store/slices/tasksSlice';
import { loadTeams } from './store/slices/teamsSlice';
import MainApp from './MainApp';
import './App.css';
import {
    fetchTasksForCurrentUser,
    fetchUserById,
    fetchUsersForCurrentUser,
} from './api/backend';

const { Header, Content } = Layout;

const App: React.FC = () => {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state: RootState) => state.auth);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                dispatch(setCurrentUser(JSON.parse(savedUser)));
                return;
            } catch {
                localStorage.removeItem('currentUser');
            }
        }
        if (!savedUser) {
            dispatch(logout());
        }
    }, [dispatch]);

    useEffect(() => {
        if (!currentUser) {
            return;
        }

        const syncBackendData = async () => {
            try {
                const [users, tasks] = await Promise.all([
                    fetchUsersForCurrentUser(currentUser.id),
                    fetchTasksForCurrentUser(currentUser.id),
                ]);

                dispatch(loadUsers(users));
                dispatch(loadTasks(tasks));
                dispatch(
                    loadTeams([
                        {
                            id: 'default-team',
                            name: 'Main Team',
                            description: 'Default team',
                            members: users.map((u) => u.id),
                            createdAt: new Date(),
                            status: 'active',
                        },
                    ]),
                );
            } catch (error) {
                message.error('Не удалось загрузить данные из backend');
            }
        };

        void syncBackendData();
    }, [currentUser, dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        message.success('Вы успешно вышли из системы');
    };

    const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
        switch (key) {
            case 'logout':
                handleLogout();
                break;
            case 'login':
                setIsLoginModalVisible(true);
                break;
            default:
                break;
        }
    };

    const authenticatedUserMenuItems: MenuProps['items'] = [
        {
            key: 'logout',
            icon: <LoginOutlined />,
            label: 'Выйти',
        },
    ];

    const guestUserMenuItems: MenuProps['items'] = [
        {
            key: 'login',
            icon: <LoginOutlined />,
            label: 'Войти',
        },
    ];

    const userMenuItems = currentUser ? authenticatedUserMenuItems : guestUserMenuItems;

    const handleLoginAs = async (userId: string, label: string) => {
        try {
            const user = await fetchUserById(userId);
            dispatch(setCurrentUser(user));
            message.success(`Вы вошли как ${label}`);
        } catch {
            message.error(`Пользователь с id=${userId} не найден в backend`);
        }
    };

    if (currentUser) {
        return (
            <>
                <MainApp
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    userMenuItems={userMenuItems}
                    onUserMenuClick={handleUserMenuClick}
                />
                <LoginModal
                    visible={isLoginModalVisible}
                    onClose={() => setIsLoginModalVisible(false)}
                />
            </>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh', background: 'white' }}>
            <Header style={{
                background: 'white',
                padding: '0 24px',
                boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '100%'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 32,
                            height: 32,
                            background: '#1890ff',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                        }}>
                            o_O
                        </div>
                    </div>

                    <Dropdown
                        menu={{
                            items: userMenuItems,
                            onClick: handleUserMenuClick
                        }}
                        placement="bottomRight"
                        arrow
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: 6,
                            transition: 'background-color 0.3s'
                        }}>
                            <Avatar icon={<UserOutlined />} size="small" />
                            <span style={{ color: '#595959' }}>Гость</span>
                        </div>
                    </Dropdown>
                </div>
            </Header>

            <Content style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px'
            }}>
                <div style={{
                    maxWidth: 800,
                    width: '100%',
                    textAlign: 'center'
                }}>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 24,
                        marginBottom: 48
                    }}>
                        <div style={{
                            padding: 32,
                            border: '1px solid #f0f0f0',
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}>
                            <h3 style={{ marginBottom: 12, color: '#262626' }}>Разработчик</h3>
                            <Button
                                type="primary"
                                onClick={() => void handleLoginAs('2', 'Разработчик')}
                            >
                                Войти как Разработчик
                            </Button>
                        </div>

                        <div style={{
                            padding: 32,
                            border: '1px solid #f0f0f0',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}>
                            <h3 style={{ marginBottom: 12, color: '#262626' }}>Тестировщик</h3>
                            <Button
                                type="primary"
                                onClick={() => void handleLoginAs('3', 'Тестировщик')}
                            >
                                Войти как Тестировщик
                            </Button>
                        </div>

                        <div style={{
                            padding: 32,
                            border: '1px solid #f0f0f0',
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}>
                            <h3 style={{ marginBottom: 12, color: '#262626' }}>Администратор</h3>
                            <Button
                                type="primary"
                                onClick={() => void handleLoginAs('1', 'Администратор')}
                            >
                                Войти как Администратор
                            </Button>
                        </div>
                    </div>
                </div>
            </Content>

            <LoginModal
                visible={isLoginModalVisible}
                onClose={() => setIsLoginModalVisible(false)}
            />
        </Layout>
    );
};

export default App;