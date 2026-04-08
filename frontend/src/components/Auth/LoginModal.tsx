import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import { useDispatch } from 'react-redux';
import { setCurrentUser } from '../../store/slices/authSlice';
import { fetchUserById } from '../../api/backend';

interface LoginModalProps {
    visible: boolean;
    onClose: () => void;
}

/** Совпадает с кнопками входа на гостевом экране (id — из backend). */
const loginOptions: { id: string; label: string }[] = [
    { id: '2', label: 'Разработчик' },
    { id: '3', label: 'Тестировщик' },
    { id: '1', label: 'Администратор' },
];

const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState<string | null>(null);

    const handleLogin = (userId: string, label: string) => {
        setLoading(userId);
        void (async () => {
            try {
                const user = await fetchUserById(userId);
                dispatch(setCurrentUser(user));
                message.success(`Вы вошли как ${label}`);
                onClose();
            } catch {
                message.error(`Пользователь с id=${userId} не найден в backend`);
            } finally {
                setLoading(null);
            }
        })();
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            centered
            width={500}
        >
            <div style={{ padding: '24px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {loginOptions.map((opt) => (
                        <Button
                            key={opt.id}
                            onClick={() => handleLogin(opt.id, opt.label)}
                            loading={loading === opt.id}
                            size="large"
                            style={{
                                height: 80,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `2px solid`,
                                borderColor: '#d9d9d9',
                                backgroundColor: 'white',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>
                                        {opt.label}
                                    </div>
                                </div>
                            </div>
                        </Button>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default LoginModal;