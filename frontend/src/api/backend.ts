import { apiRequest } from './client';
import { Task, TaskStatus, User, UserRole } from '../types';

type BackendUser = {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
};

type Board = {
  id: number;
  title: string;
  description: string;
};

type BoardColumn = {
  id: number;
  title: string;
  board: Board;
};

type BackendTask = {
  id: number;
  title: string;
  description: string;
  boardColumn: BoardColumn;
  createdAt: string;
  updatedAt: string;
};

const STATUS_TO_TITLE: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: 'Backlog',
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.CODE_REVIEW]: 'Code Review',
  [TaskStatus.TESTING]: 'Testing',
  [TaskStatus.TESTING_DONE]: 'Testing Done',
  [TaskStatus.DONE]: 'Done',
};

const TITLE_TO_STATUS: Record<string, TaskStatus> = Object.entries(
  STATUS_TO_TITLE,
).reduce(
  (acc, [status, title]) => ({ ...acc, [title.toLowerCase()]: status as TaskStatus }),
  {} as Record<string, TaskStatus>,
);

let currentBoardId: number | null = null;
let columnByStatus: Partial<Record<TaskStatus, number>> = {};

function mapRole(role: BackendUser['role']): UserRole {
  return role === 'ADMIN' ? UserRole.ADMIN : UserRole.DEVELOPER;
}

function toFrontendUser(user: BackendUser): User {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: mapRole(user.role),
  };
}

function ensureColumnMapping(columns: BoardColumn[]): void {
  columnByStatus = {};
  columns.forEach((column) => {
    const status = TITLE_TO_STATUS[column.title.toLowerCase()];
    if (status) {
      columnByStatus[status] = column.id;
    }
  });
}

async function ensureBoardAndColumns(userId: string): Promise<number> {
  const boards = await apiRequest<Board[]>('/board', { userId });
  let board = boards[0];

  if (!board) {
    board = await apiRequest<Board>('/board', {
      method: 'POST',
      userId,
      body: {
        title: 'Main Board',
        description: 'Main board',
      },
    });
  }

  currentBoardId = board.id;
  let columns = await apiRequest<BoardColumn[]>(`/board/${board.id}/columns`, {
    userId,
  });

  if (columns.length === 0) {
    const order = [
      TaskStatus.BACKLOG,
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.CODE_REVIEW,
      TaskStatus.TESTING,
      TaskStatus.TESTING_DONE,
      TaskStatus.DONE,
    ];

    const created: BoardColumn[] = [];
    for (const status of order) {
      const column = await apiRequest<BoardColumn>('/board-column', {
        method: 'POST',
        userId,
        body: {
          title: STATUS_TO_TITLE[status],
          boardId: board.id,
          allowedToIds: [],
        },
      });
      created.push(column);
    }

    // Allow transitions between all columns to avoid blocking DnD updates.
    for (const column of created) {
      await apiRequest<BoardColumn>(`/board-column/${column.id}`, {
        method: 'PATCH',
        userId,
        body: {
          allowedToIds: created.filter((c) => c.id !== column.id).map((c) => c.id),
        },
      });
    }

    columns = await apiRequest<BoardColumn[]>(`/board/${board.id}/columns`, {
      userId,
    });
  }

  ensureColumnMapping(columns);
  return board.id;
}

function toFrontendTask(task: BackendTask): Task {
  const mappedStatus = TITLE_TO_STATUS[task.boardColumn.title.toLowerCase()] ?? TaskStatus.BACKLOG;

  return {
    id: String(task.id),
    title: task.title,
    description: task.description,
    status: mappedStatus,
    assigneeId: null,
    reporterId: '',
    teamId: 'default-team',
    priority: 'medium',
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    tags: [],
  };
}

export async function fetchUserById(userId: string): Promise<User> {
  const user = await apiRequest<BackendUser>(`/users/${userId}`, { userId });
  return toFrontendUser(user);
}

export async function updateUserProfileOnBackend(
  userId: string,
  body: { name: string; email: string },
): Promise<User> {
  const user = await apiRequest<BackendUser>(`/users/${userId}`, {
    method: 'PATCH',
    userId,
    body,
  });
  return toFrontendUser(user);
}

export async function fetchUsersForCurrentUser(userId: string): Promise<User[]> {
  try {
    const users = await apiRequest<BackendUser[]>('/users', { userId });
    return users.map(toFrontendUser);
  } catch {
    const self = await fetchUserById(userId);
    return [self];
  }
}

export async function fetchTasksForCurrentUser(userId: string): Promise<Task[]> {
  const boardId = await ensureBoardAndColumns(userId);
  const tasks = await apiRequest<BackendTask[]>(`/board/${boardId}/tasks`, { userId });
  return tasks.map(toFrontendTask);
}

export async function createTaskForCurrentUser(
  userId: string,
  payload: { title: string; description: string },
): Promise<void> {
  const boardId = await ensureBoardAndColumns(userId);
  const backlogColumnId = columnByStatus[TaskStatus.BACKLOG];
  if (!backlogColumnId) {
    throw new Error(`Backlog column not found on board ${boardId}`);
  }

  await apiRequest('/task', {
    method: 'POST',
    userId,
    body: {
      title: payload.title,
      description: payload.description,
      boardColumnId: backlogColumnId,
    },
  });
}

export async function updateTaskForCurrentUser(
  userId: string,
  taskId: string,
  changes: Partial<Pick<Task, 'title' | 'description' | 'status'>>,
): Promise<void> {
  if (changes.status) {
    await ensureBoardAndColumns(userId);
  }

  await apiRequest(`/task/${taskId}`, {
    method: 'PATCH',
    userId,
    body: {
      ...(changes.title !== undefined ? { title: changes.title } : {}),
      ...(changes.description !== undefined ? { description: changes.description } : {}),
      ...(changes.status ? { boardColumnId: columnByStatus[changes.status] } : {}),
    },
  });
}

export async function getUploadUrl(params: {
  userId: string;
  key: string;
  contentType: string;
}): Promise<string> {
  const result = await apiRequest<{ url: string }>(
    `/images/${encodeURIComponent(params.key)}/upload-url`,
    {
      method: 'POST',
      userId: params.userId,
      body: { contentType: params.contentType, ttl: 300 },
    },
  );
  return result.url;
}

export async function getDownloadUrl(params: {
  userId: string;
  key: string;
}): Promise<string> {
  const result = await apiRequest<{ url: string }>(
    `/images/${encodeURIComponent(params.key)}/url?ttl=300`,
    {
      userId: params.userId,
    },
  );
  return result.url;
}
