import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import { Task, TaskStatus, UserRole } from '../../types';
import { RootState } from '../../store';
import { loadTasks } from '../../store/slices/tasksSlice';
import {
    createTaskForCurrentUser,
    fetchTasksForCurrentUser,
    updateTaskForCurrentUser,
} from '../../api/backend';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

interface TaskModalProps {
    task: Task | null;
    visible: boolean;
    onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, visible, onClose }) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();

    const { users } = useSelector((state: RootState) => state.users);
    const { teams } = useSelector((state: RootState) => state.teams);
    const { currentUser } = useSelector((state: RootState) => state.auth);

    const [selectedTags, setSelectedTags] = useState<string[]>(task?.tags || []);

    useEffect(() => {
        if (task) {
            form.setFieldsValue({
                ...task,
                dueDate: task.dueDate ? moment(task.dueDate) : null,
            });
            setSelectedTags(task.tags);
        } else {
            form.resetFields();
            setSelectedTags([]);
            if (visible && teams.length > 0) {
                form.setFieldsValue({
                    teamId: teams[0].id,
                    priority: 'medium',
                });
            }
        }
    }, [task, form, visible, teams]);

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            if (!currentUser?.id) {
                message.error('Пользователь не авторизован');
                return;
            }

            void (async () => {
                try {
                    if (task) {
                        await updateTaskForCurrentUser(currentUser.id, task.id, {
                            title: values.title,
                            description: values.description,
                            status: values.status,
                        });
                    } else {
                        await createTaskForCurrentUser(currentUser.id, {
                            title: values.title,
                            description: values.description,
                        });
                    }
                    const tasks = await fetchTasksForCurrentUser(currentUser.id);
                    dispatch(loadTasks(tasks));
                    onClose();
                } catch {
                    message.error(
                        task ? 'Не удалось обновить задачу' : 'Не удалось создать задачу',
                    );
                }
            })();
        });
    };

    const canEdit = !task || (currentUser && (
        currentUser.role === UserRole.ADMIN ||
        currentUser.role === UserRole.TEAM_LEAD ||
        task.reporterId === currentUser.id
    ));

    return (
        <Modal
            title={task ? 'Редактировать задачу' : 'Создать задачу'}
            open={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            width={700}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Отмена
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleSubmit}
                    disabled={!canEdit}
                >
                    {task ? 'Обновить' : 'Создать'}
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="title"
                    label="Название"
                    rules={[{ required: true, message: 'Введите название задачи' }]}
                >
                    <Input disabled={!canEdit} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Описание"
                    rules={[{ required: true, message: 'Введите описание задачи' }]}
                >
                    <TextArea rows={4} disabled={!canEdit} />
                </Form.Item>

                <Form.Item
                    name="teamId"
                    label="Команда"
                    rules={[{ required: true, message: 'Выберите команду' }]}
                >
                    <Select disabled={!canEdit}>
                        {teams.map(team => (
                            <Option key={team.id} value={team.id}>
                                {team.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="assigneeId"
                    label="Исполнитель"
                >
                    <Select allowClear disabled={!canEdit}>
                        {users.map(user => (
                            <Option key={user.id} value={user.id}>
                                {user.name} ({user.role})
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {task && (
                    <Form.Item
                        name="status"
                        label="Статус"
                        rules={[{ required: true, message: 'Выберите статус' }]}
                    >
                        <Select disabled={!canEdit}>
                            {Object.values(TaskStatus).map(status => (
                                <Option key={status} value={status}>
                                    {status.replace('_', ' ').toUpperCase()}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Form.Item
                    name="priority"
                    label="Приоритет"
                    rules={[{ required: true, message: 'Выберите приоритет' }]}
                >
                    <Select disabled={!canEdit}>
                        <Option value="low">Низкий</Option>
                        <Option value="medium">Средний</Option>
                        <Option value="high">Высокий</Option>
                        <Option value="critical">Критический</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Теги">
                    <Select
                        mode="tags"
                        value={selectedTags}
                        onChange={setSelectedTags}
                        disabled={!canEdit}
                        placeholder="Введите теги"
                    />
                </Form.Item>

                <Form.Item name="dueDate" label="Срок выполнения">
                    <DatePicker disabled={!canEdit} style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TaskModal;