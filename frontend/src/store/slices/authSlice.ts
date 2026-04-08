import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
    currentUser: User | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    currentUser: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCurrentUser: (state, action: PayloadAction<User>) => {
            state.currentUser = action.payload;
            state.isAuthenticated = true;
            localStorage.setItem('currentUser', JSON.stringify(action.payload));
        },

        updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
            if (state.currentUser) {
                const updatedUser = {
                    ...state.currentUser,
                    ...action.payload,
                };
                state.currentUser = updatedUser;
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
        },

        logout: (state) => {
            state.currentUser = null;
            state.isAuthenticated = false;
            localStorage.removeItem('currentUser');
        },
    },
});

export const { setCurrentUser, updateUserProfile, logout } = authSlice.actions;
export default authSlice.reducer;