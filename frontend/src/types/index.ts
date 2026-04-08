export enum TaskStatus {
    BACKLOG = 'backlog',
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    CODE_REVIEW = 'code_review',
    TESTING = 'testing',
    TESTING_DONE = 'testing_done',
    DONE = 'done'
}

export enum UserRole {
    DEVELOPER = 'developer',
    TESTER = 'tester',
    PRODUCT_OWNER = 'product_owner',
    TEAM_LEAD = 'team_lead',
    ADMIN = 'admin'
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

export interface Team {
    id: string;
    name: string;
    description: string;
    members: string[];
    createdAt: Date;
    status: 'active' | 'inactive' | 'archived';
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    assigneeId: string | null;
    reporterId: string;
    teamId: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
    updatedAt: Date;
    dueDate?: Date;
    tags: string[];
}

export interface TaskComment {
    id: string;
    taskId: string;
    userId: string;
    content: string;
    createdAt: Date;
}

export interface AppState {
    tasks: Task[];
    users: User[];
    teams: Team[];
    currentUser: User | null;
    filters: {
        assigneeId?: string;
        teamId?: string;
        status?: TaskStatus[];
        priority?: string[];
    };
}
export const StatusTransitions: Record<UserRole, TaskStatus[]> = {
    [UserRole.DEVELOPER]: [
        TaskStatus.BACKLOG,
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.CODE_REVIEW
    ],
    [UserRole.TESTER]: [
        TaskStatus.CODE_REVIEW,
        TaskStatus.TESTING,
        TaskStatus.TESTING_DONE
    ],
    [UserRole.PRODUCT_OWNER]: [
        TaskStatus.BACKLOG,
        TaskStatus.TODO,
        TaskStatus.TESTING_DONE,
        TaskStatus.DONE
    ],
    [UserRole.TEAM_LEAD]: Object.values(TaskStatus),
    [UserRole.ADMIN]: Object.values(TaskStatus)
};