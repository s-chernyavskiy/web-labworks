import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Modal } from 'antd';
import type { MenuProps } from 'antd';
import SimpleTaskBoard from './components/TaskBoard/SimpleTaskBoard';
import Filters from './components/Filters/Filters';
import TeamsManagement from './components/Teams/TeamsManagement';
import Backlog from './components/Backlog/Backlog';
import Archive from './components/Archive/Archive';
import TaskModal from './components/TaskModal/TaskModal';
import ProfilePage from './components/Profile/ProfilePage';
import {User, UserRole} from './types';
import { canCreateTask } from './utils/permissions';

const { Header, Sider, Content } = Layout;

interface MainAppProps {
    currentUser: User;
    onLogout: () => void;
    userMenuItems: MenuProps['items'];
    onUserMenuClick: MenuProps['onClick'];
}

const MainApp: React.FC<MainAppProps> = ({
                                             currentUser,
                                             userMenuItems,
                                             onUserMenuClick
                                         }) => {
    const [selectedMenu, setSelectedMenu] = useState('dashboard');
    const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
    const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

    const canCreate = canCreateTask(currentUser.role);
    const isAdmin = currentUser.role === UserRole.ADMIN;

    const getPageTitle = () => {
        switch (selectedMenu) {
            case 'backlog':
                return 'Бэклог';
            case 'dashboard':
                return 'Доска задач';
            case 'archive':
                return 'Архив';
            case 'teams':
                return 'Управление командами';
            default:
                return '';
        }
    };

    const menuItems = [
        {
            key: 'backlog',
            label: 'Бэклог',
        },
        {
            key: 'dashboard',
            label: 'Доска задач',
        },
        {
            key: 'archive',
            label: 'Архив',
        },
    ];

    if (isAdmin) {
        menuItems.push({
            key: 'teams',
            label: 'Управление командами',
        });
    }

    return (
        <Layout className="app-layout">
            <Sider width={250} theme="dark">
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedMenu]}
                    onSelect={({ key }) => setSelectedMenu(key)}
                    items={menuItems}
                />
            </Sider>

            <Layout>
                <Header className="app-header">
                    <div className="header-content">
                        <div className="header-left">
                            <h1 className="page-title">
                                {getPageTitle()}
                            </h1>
                        </div>

                        <div className="header-right">
                            {(selectedMenu === 'backlog' || selectedMenu === 'dashboard') && canCreate && (
                                <Button
                                    type="primary"
                                    onClick={() => setIsTaskModalVisible(true)}
                                    style={{
                                        flexShrink: 0,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Создать задачу
                                </Button>
                            )}

                            <Dropdown
                                menu={{
                                    items: userMenuItems,
                                    onClick: onUserMenuClick
                                }}
                                placement="bottomRight"
                                arrow
                            >
                                <div className="user-profile">
                                    <Avatar
                                        src={currentUser.avatar}
                                        style={{
                                            backgroundColor: currentUser.avatar ? 'transparent' : '#1890ff'
                                        }}
                                    />
                                    <span className="user-name">{currentUser.name}</span>
                                </div>
                            </Dropdown>
                        </div>
                    </div>
                </Header>

                <Content className="app-content">
                    {selectedMenu === 'backlog' && (
                        <div className="content-wrapper">
                            <Backlog />
                        </div>
                    )}
                    {selectedMenu === 'dashboard' && (
                        <>
                            <Filters />
                            <div className="content-wrapper">
                                <SimpleTaskBoard />
                            </div>
                        </>
                    )}
                    {selectedMenu === 'archive' && (
                        <div className="content-wrapper">
                            <Archive />
                        </div>
                    )}
                    {selectedMenu === 'teams' && isAdmin && (
                        <div className="content-wrapper">
                            <TeamsManagement />
                        </div>
                    )}
                </Content>
            </Layout>

            <TaskModal
                task={null}
                visible={isTaskModalVisible}
                onClose={() => setIsTaskModalVisible(false)}
            />

            <Modal
                title="Мой профиль"
                open={isProfileModalVisible}
                onCancel={() => setIsProfileModalVisible(false)}
                footer={null}
                width={700}
                centered
            >
                <ProfilePage />
            </Modal>
        </Layout>
    );
};

export default MainApp;