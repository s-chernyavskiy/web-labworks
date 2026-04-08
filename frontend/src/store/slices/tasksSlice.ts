import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskStatus } from '../../types';

interface TasksState {
    tasks: Task[];
    filters: {
        assigneeId?: string;
        teamId?: string;
        status?: TaskStatus[];
        priority?: string[];
    };
}

const initialState: TasksState = {
    tasks: [],
    filters: {},
};

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        loadTasks: (state, action: PayloadAction<Task[]>) => {
            state.tasks = action.payload;
        },
        addTask: (state, action: PayloadAction<Task>) => {
            state.tasks.push(action.payload);
        },
        updateTask: (state, action: PayloadAction<Partial<Task> & { id: string }>) => {
            const index = state.tasks.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = {
                    ...state.tasks[index],
                    ...action.payload,
                    updatedAt: new Date(),
                };
            }
        },
        deleteTask: (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter(t => t.id !== action.payload);
        },
        setFilters: (state, action: PayloadAction<TasksState['filters']>) => {
            state.filters = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {};
        },
    },
});

export const {
    loadTasks,
    addTask,
    updateTask,
    setFilters,
    clearFilters,
} = tasksSlice.actions;

export default tasksSlice.reducer;
