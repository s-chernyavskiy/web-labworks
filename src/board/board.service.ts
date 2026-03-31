import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { BoardColumn } from '../board-column/entities/board-column.entity';
import { Task } from '../task/entities/task.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(BoardColumn)
    private boardColumnRepository: Repository<BoardColumn>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(
    actorUserId: number,
    createBoardDto: CreateBoardDto,
  ): Promise<Board> {
    const owner = await this.userRepository.findOne({
      where: { id: actorUserId },
    });
    if (owner === null) {
      throw new NotFoundException(`user with id ${actorUserId} not found`);
    }

    const board = new Board();
    board.owner = owner;
    board.title = createBoardDto.title;
    board.description = createBoardDto.description;
    board.createdAt = new Date();

    return await this.boardRepository.save(board);
  }

  async findAll(): Promise<Board[]> {
    return await this.boardRepository.find();
  }

  async findOne(id: number): Promise<Board | null> {
    return await this.boardRepository.findOne({ where: { id } });
  }

  async findColumns(boardId: number): Promise<BoardColumn[]> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (board === null) {
      throw new NotFoundException(`could not find board: ${boardId}`);
    }

    return await this.boardColumnRepository.find({
      where: { board: { id: boardId } },
      relations: { allowedTo: true },
    });
  }

  async findTasks(boardId: number): Promise<Task[]> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
    });
    if (board === null) {
      throw new NotFoundException(`could not find board: ${boardId}`);
    }

    return await this.taskRepository.find({
      where: { boardColumn: { board: { id: boardId } } },
      relations: { boardColumn: true },
      order: { order: 'ASC', id: 'ASC' },
    });
  }

  async update(
    actorUserId: number,
    id: number,
    updateBoardDto: UpdateBoardDto,
  ): Promise<Board> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (board === null) {
      throw new NotFoundException(`could not find board: ${id}`);
    }
    if (board.owner?.id !== actorUserId) {
      throw new ForbiddenException('Only board owner can update board');
    }

    await this.boardRepository.update(id, updateBoardDto);
    return board;
  }

  async remove(actorUserId: number, id: number): Promise<void> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (board === null) {
      throw new NotFoundException(`could not find board: ${id}`);
    }
    if (board.owner?.id !== actorUserId) {
      throw new ForbiddenException('Only board owner can delete board');
    }

    await this.boardRepository.delete(id);
  }
}
