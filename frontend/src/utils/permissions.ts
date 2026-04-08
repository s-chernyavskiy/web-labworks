import { UserRole, TaskStatus, StatusTransitions } from '../types';

export const checkPermission = (
    userRole: UserRole,
    currentStatus: TaskStatus,
    newStatus: TaskStatus
): boolean => {
    if ([UserRole.ADMIN, UserRole.TEAM_LEAD].includes(userRole)) {
        return true;
    }

    if (currentStatus === TaskStatus.TESTING_DONE && newStatus === TaskStatus.DONE) {
        return true;
    }

    if (userRole === UserRole.DEVELOPER) {
        const allowedStatuses = [TaskStatus.BACKLOG, TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.CODE_REVIEW];
        if (!allowedStatuses.includes(newStatus)) {
            return false;
        }
    }

    if (userRole === UserRole.TESTER) {
        const allowedStatuses = [TaskStatus.CODE_REVIEW, TaskStatus.TESTING, TaskStatus.TESTING_DONE];
        if (!allowedStatuses.includes(currentStatus) || !allowedStatuses.includes(newStatus)) {
            return false;
        }
    }

    if (userRole === UserRole.PRODUCT_OWNER) {
        const backlogToTodo = currentStatus === TaskStatus.BACKLOG && newStatus === TaskStatus.TODO;
        if (!backlogToTodo) {
            return false;
        }
    }

    const allowedTransitions = StatusTransitions[userRole];
    return allowedTransitions.includes(newStatus);
};

export const canCreateTask = (userRole: UserRole): boolean => {
    return [UserRole.PRODUCT_OWNER, UserRole.TEAM_LEAD, UserRole.ADMIN].includes(userRole);
};

export const canEditTeam = (userRole: UserRole): boolean => {
    return [UserRole.TEAM_LEAD, UserRole.ADMIN].includes(userRole);
};