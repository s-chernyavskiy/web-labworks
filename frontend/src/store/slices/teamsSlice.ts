import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Team } from '../../types';

interface TeamsState {
    teams: Team[];
}

const initialState: TeamsState = {
    teams: [],
};

const teamsSlice = createSlice({
    name: 'teams',
    initialState,
    reducers: {
        loadTeams: (state, action: PayloadAction<Team[]>) => {
            state.teams = action.payload;
        },
        addTeam: (state, action: PayloadAction<Team>) => {
            state.teams.push(action.payload);
        },
        updateTeam: (state, action: PayloadAction<Partial<Team> & { id: string }>) => {
            const index = state.teams.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.teams[index] = {
                    ...state.teams[index],
                    ...action.payload,
                };
            }
        },
        updateTeamStatus: (
            state,
            action: PayloadAction<{ teamId: string; status: Team['status'] }>
        ) => {
            const team = state.teams.find(t => t.id === action.payload.teamId);
            if (team) {
                team.status = action.payload.status;
            }
        },
        deleteTeam: (state, action: PayloadAction<string>) => {
            state.teams = state.teams.filter(t => t.id !== action.payload);
        },
        addTeamMember: (
            state,
            action: PayloadAction<{ teamId: string; userId: string }>
        ) => {
            const team = state.teams.find(t => t.id === action.payload.teamId);
            if (team && !team.members.includes(action.payload.userId)) {
                team.members.push(action.payload.userId);
            }
        },
        removeTeamMember: (
            state,
            action: PayloadAction<{ teamId: string; userId: string }>
        ) => {
            const team = state.teams.find(t => t.id === action.payload.teamId);
            if (team) {
                team.members = team.members.filter(id => id !== action.payload.userId);
            }
        },
    },
});

export const {
    loadTeams,
    addTeam,
    updateTeam,
    updateTeamStatus,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
} = teamsSlice.actions;

export default teamsSlice.reducer;