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

@Injectable()
export class BoardColumnService {
  constructor(
    @InjectRepository(BoardColumn)
    private columnRepository: Repository<BoardColumn>,
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async create(
    actorUserId: number,
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
    if (board.owner?.id !== actorUserId) {
      throw new ForbiddenException('Only board owner can create columns');
    }

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
    actorUserId: number,
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
    if (column.board?.owner?.id !== actorUserId) {
      throw new ForbiddenException('Only board owner can update columns');
    }

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

  async remove(actorUserId: number, id: number): Promise<void> {
    const column = await this.columnRepository.findOne({
      where: { id },
      relations: { board: { owner: true } },
    });
    if (column === null) {
      throw new NotFoundException(`column with id ${id} not found`);
    }
    if (column.board?.owner?.id !== actorUserId) {
      throw new ForbiddenException('Only board owner can delete columns');
    }

    await this.columnRepository.delete(id);
  }
}
