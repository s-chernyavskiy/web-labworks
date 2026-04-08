import React from 'react';
import { Form, Input, Button, Upload, message, Row, Col, Avatar } from 'antd';
import { UserOutlined, MailOutlined, UploadOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../../store/slices/authSlice';
import { loadUsers } from '../../store/slices/usersSlice';
import { UserRole } from '../../types';
import {
    fetchUsersForCurrentUser,
    updateUserProfileOnBackend,
} from '../../api/backend';
import { useAvatarUpload } from '../../hooks/useAvatarUpload';

interface EditProfileFormProps {
    initialValues: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        avatar?: string;
    };
    onSave: (values: any) => void;
    onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
                                                             initialValues,
                                                             onSave,
                                                             onCancel
                                                         }) => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const { avatarUrl, uploadProps, uploading } = useAvatarUpload(
        initialValues.id,
        initialValues.avatar,
    );

    React.useEffect(() => {
        form.setFieldsValue(initialValues);
    }, [initialValues, form]);

    const onFinish = (values: { name: string; email: string }) => {
        void (async () => {
            try {
                const fromApi = await updateUserProfileOnBackend(initialValues.id, {
                    name: values.name,
                    email: values.email,
                });
                const merged = { ...fromApi, avatar: avatarUrl };
                dispatch(updateUserProfile(merged));
                try {
                    const users = await fetchUsersForCurrentUser(initialValues.id);
                    dispatch(loadUsers(users));
                } catch {
                    /* список пользователей недоступен без прав admin */
                }
                message.success('Профиль успешно обновлен');
                onSave(merged);
            } catch {
                message.error('Не удалось сохранить профиль на сервере');
            }
        })();
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ paddingTop: 24 }}
            initialValues={initialValues}
        >
            <Row gutter={16}>
                <Col span={8}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <Upload {...uploadProps}>
                            <div>
                                <Avatar
                                    size={100}
                                    src={avatarUrl}
                                    icon={<UserOutlined />}
                                    style={{
                                        cursor: 'pointer',
                                        marginBottom: 8,
                                        backgroundColor: avatarUrl ? 'transparent' : '#1890ff',
                                        border: uploading ? '2px dashed #1890ff' : 'none'
                                    }}
                                />
                                {uploading && (
                                    <div style={{ color: '#1890ff', fontSize: 12 }}>
                                        Загрузка...
                                    </div>
                                )}
                                <div>
                                    <Button
                                        icon={<UploadOutlined />}
                                        type="link"
                                        loading={uploading}
                                        disabled={uploading}
                                    >
                                        {avatarUrl ? 'Изменить фото' : 'Загрузить фото'}
                                    </Button>
                                </div>
                            </div>
                        </Upload>
                    </div>
                </Col>

                <Col span={16}>
                    <Form.Item
                        label="Имя"
                        name="name"
                        rules={[{ required: true, message: 'Введите имя' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Ваше имя"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Введите email' },
                            { type: 'email', message: 'Введите корректный email' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Email"
                            size="large"
                        />
                    </Form.Item>
                </Col>
            </Row>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
                <Button onClick={onCancel} style={{ marginRight: 8 }}>
                    Отмена
                </Button>
                <Button type="primary" htmlType="submit">
                    Сохранить изменения
                </Button>
            </div>
        </Form>
    );
};

export default EditProfileForm;