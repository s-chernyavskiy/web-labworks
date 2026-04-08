import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { BoardColumn } from '../board-column/entities/board-column.entity';
import {
  assertDoneEntryRequirements,
  assertDoneExitAllowed,
  assertSameBoard,
  assertLimitNotExceeded,
} from '../domain/kanban/kanban.rules';
import { AuthUser } from '../auth/auth-user.type';
import { UserRole } from '../users/entities/user-role.enum';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(BoardColumn)
    private columnRepository: Repository<BoardColumn>,
  ) {}

  async create(actor: AuthUser, createTaskDto: CreateTaskDto): Promise<Task> {
    const column = await this.columnRepository.findOne({
      where: { id: createTaskDto.boardColumnId },
      relations: { board: { owner: true } },
    });
    if (column === null) {
      throw new NotFoundException(
        `column with id ${createTaskDto.boardColumnId} not found`,
      );
    }
    this.assertCanEditBoard(actor, column.board?.owner?.id);

    const tasksInTargetColumn = await this.taskRepository.count({
      where: { boardColumn: { id: column.id } },
    });
    assertLimitNotExceeded({
      toColumn: { id: column.id, limit: column.limit },
      tasksInTargetColumn,
    });

    return await this.taskRepository.manager.transaction(async (tx) => {
      await tx
        .createQueryBuilder()
        .update(Task)
        .set({ order: () => '"order" + 1' })
        .where('"boardColumnId" = :columnId', { columnId: column.id })
        .execute();

      const task = new Task();
      task.title = createTaskDto.title;
      task.description = createTaskDto.description;
      task.createdAt = new Date();
      task.updatedAt = new Date();
      task.boardColumn = column;
      task.order = 1;

      return await tx.getRepository(Task).save(task);
    });
  }

  async findAll(): Promise<Task[]> {
    return await this.taskRepository.find();
  }

  async findOne(id: number): Promise<Task | null> {
    return await this.taskRepository.findOne({ where: { id } });
  }

  async update(
    actor: AuthUser,
    id: number,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: { boardColumn: { board: { owner: true } } },
    });
    if (task === null) {
      throw new NotFoundException(`task with id ${id} not found`);
    }
    this.assertCanEditBoard(actor, task.boardColumn?.board?.owner?.id);

    const movingToColumnId = updateTaskDto.boardColumnId;
    if (movingToColumnId != null) {
      const fromColumn = await this.columnRepository.findOne({
        where: { id: task.boardColumn.id },
        relations: { allowedTo: true, board: true },
      });
      if (fromColumn === null) {
        throw new NotFoundException(
          `column with id ${task.boardColumn.id} not found`,
        );
      }

      const targetColumn = await this.columnRepository.findOne({
        where: { id: movingToColumnId },
        relations: { board: { owner: true } },
      });
      if (targetColumn === null) {
        throw new NotFoundException(
          `column with id ${movingToColumnId} not found`,
        );
      }

      assertSameBoard({
        fromBoardId: task.boardColumn.board.id,
        toBoardId: targetColumn.board.id,
      });

      const allowed = fromColumn.allowedTo?.some(
        (c) => c.id === targetColumn.id,
      );
      if (!allowed) {
        throw new BadRequestException(
          'Transition to target column is not allowed',
        );
      }

      const actorIsOwner = targetColumn.board?.owner?.id === actor.id;
      assertDoneExitAllowed({
        fromColumn: { title: task.boardColumn.title },
        actorIsOwner,
      });

      const nextTitle = updateTaskDto.title ?? task.title;
      const nextDescription = updateTaskDto.description ?? task.description;
      assertDoneEntryRequirements({
        toColumn: { title: targetColumn.title },
        title: nextTitle,
        description: nextDescription,
      });

      const tasksInTargetColumn = await this.taskRepository.count({
        where: { boardColumn: { id: targetColumn.id } },
      });
      assertLimitNotExceeded({
        toColumn: { id: targetColumn.id, limit: targetColumn.limit },
        tasksInTargetColumn,
      });
    }

    await this.taskRepository.update({ id }, updateTaskDto as never);
    return task;
  }

  async remove(actor: AuthUser, id: number): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: { boardColumn: { board: { owner: true } } },
    });
    if (task === null) {
      throw new NotFoundException(`task with id ${id} not found`);
    }
    this.assertCanEditBoard(actor, task.boardColumn?.board?.owner?.id);

    await this.taskRepository.delete(id);
  }

  private assertCanEditBoard(actor: AuthUser, ownerId?: number): void {
    if (actor.role === UserRole.ADMIN || ownerId === actor.id) {
      return;
    }
    throw new ForbiddenException('Only board owner can modify tasks');
  }
}
