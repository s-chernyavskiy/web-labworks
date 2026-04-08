import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBoardColumnDto } from './dto/create-board-column.dto';
import { UpdateBoardColumnDto } from './dto/update-board-column.dto';
import { BoardColumn } from './entities/board-column.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../board/entities/board.entity';
import { AuthUser } from '../auth/auth-user.type';
import { UserRole } from '../users/entities/user-role.enum';

@Injectable()
export class BoardColumnService {
  constructor(
    @InjectRepository(BoardColumn)
    private columnRepository: Repository<BoardColumn>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async create(
    actor: AuthUser,
    createBoardColumnDto: CreateBoardColumnDto,
  ): Promise<BoardColumn> {
    const board = await this.boardRepository.findOne({
      where: { id: createBoardColumnDto.boardId },
      relations: { owner: true },
    });
    if (board === null) {
      throw new NotFoundException(
        `board with id ${createBoardColumnDto.boardId} not found`,
      );
    }
    this.assertCanEditBoard(actor, board.owner?.id);

    const column = new BoardColumn();
    column.title = createBoardColumnDto.title;
    column.board = board;
    column.limit = createBoardColumnDto.limit ?? null;
    column.allowedTo = [];

    if (createBoardColumnDto.allowedToIds?.length) {
      const allowedTo = await this.columnRepository.find({
        where: createBoardColumnDto.allowedToIds.map((id) => ({ id })) as never,
        relations: { board: true },
      });

      const invalid = allowedTo.find((c) => c.board?.id !== board.id);
      if (invalid) {
        throw new ForbiddenException(
          'allowedToIds must reference columns from the same board',
        );
      }
      column.allowedTo = allowedTo;
    }

    return await this.columnRepository.save(column);
  }

  async findAll(): Promise<BoardColumn[]> {
    return await this.columnRepository.find();
  }

  async findOne(id: number): Promise<BoardColumn | null> {
    return await this.columnRepository.findOne({ where: { id } });
  }

  async update(
    actor: AuthUser,
    id: number,
    updateColumnDto: UpdateBoardColumnDto,
  ): Promise<BoardColumn> {
    const column = await this.columnRepository.findOne({
      where: { id },
      relations: { board: { owner: true }, allowedTo: true },
    });
    if (column === null) {
      throw new NotFoundException(`column with id ${id} not found`);
    }
    this.assertCanEditBoard(actor, column.board?.owner?.id);

    if (updateColumnDto.allowedToIds) {
      if (updateColumnDto.allowedToIds.length === 0) {
        column.allowedTo = [];
      } else {
        const allowedTo = await this.columnRepository.find({
          where: updateColumnDto.allowedToIds.map((cid) => ({
            id: cid,
          })) as never,
          relations: { board: true },
        });
        const invalid = allowedTo.find((c) => c.board?.id !== column.board.id);
        if (invalid) {
          throw new ForbiddenException(
            'allowedToIds must reference columns from the same board',
          );
        }
        column.allowedTo = allowedTo;
      }
    }

    if (updateColumnDto.title !== undefined)
      column.title = updateColumnDto.title;
    if (updateColumnDto.limit !== undefined)
      column.limit = updateColumnDto.limit;

    return await this.columnRepository.save(column);
  }

  async remove(actor: AuthUser, id: number): Promise<void> {
    const column = await this.columnRepository.findOne({
      where: { id },
      relations: { board: { owner: true } },
    });
    if (column === null) {
      throw new NotFoundException(`column with id ${id} not found`);
    }
    this.assertCanEditBoard(actor, column.board?.owner?.id);

    await this.columnRepository.delete(id);
  }

  private assertCanEditBoard(actor: AuthUser, ownerId?: number): void {
    if (actor.role === UserRole.ADMIN || ownerId === actor.id) {
      return;
    }
    throw new ForbiddenException('Only board owner can modify columns');
  }
}
