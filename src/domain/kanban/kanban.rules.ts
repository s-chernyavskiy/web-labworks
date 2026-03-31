import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { BoardColumn } from '../../board-column/entities/board-column.entity';

function normalizeTitle(title: string | null | undefined): string {
  return (title ?? '').trim().toLowerCase();
}

export function isDoneColumn(column: Pick<BoardColumn, 'title'>): boolean {
  return normalizeTitle(column.title) === 'done';
}

export function assertSameBoard(params: {
  fromBoardId: number;
  toBoardId: number;
}): void {
  if (params.fromBoardId !== params.toBoardId) {
    throw new BadRequestException('Cannot move task between different boards');
  }
}

export function assertLimitNotExceeded(params: {
  toColumn: Pick<BoardColumn, 'id' | 'limit'>;
  tasksInTargetColumn: number;
}): void {
  const limit = params.toColumn.limit;
  if (limit == null) return;
  if (limit <= 0) return;

  if (params.tasksInTargetColumn >= limit) {
    throw new ForbiddenException('Limit exceeded for target column');
  }
}

export function assertDoneEntryRequirements(params: {
  toColumn: Pick<BoardColumn, 'title'>;
  title?: string;
  description?: string;
}): void {
  if (!isDoneColumn(params.toColumn)) return;

  const titleOk = (params.title ?? '').trim().length > 0;
  const descriptionOk = (params.description ?? '').trim().length > 0;
  if (!titleOk || !descriptionOk) {
    throw new BadRequestException('ti eblan');
  }
}

export function assertDoneExitAllowed(params: {
  fromColumn: Pick<BoardColumn, 'title'>;
  actorIsOwner: boolean;
}): void {
  if (!isDoneColumn(params.fromColumn)) return;
  if (!params.actorIsOwner) {
    throw new ForbiddenException('Only owner can move tasks out of Done');
  }
}
