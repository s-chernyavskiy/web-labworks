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
import { AuthUser } from '../auth/auth-user.type';
import { UserRole } from '../users/entities/user-role.enum';

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
    actor: AuthUser,
    createBoardDto: CreateBoardDto,
  ): Promise<Board> {
    const owner = await this.userRepository.findOne({
      where: { id: actor.id },
    });
    if (owner === null) {
      throw new NotFoundException(`user with id ${actor.id} not found`);
    }

    const board = new Board();
    board.owner = owner;
    board.title = createBoardDto.title;
    board.description = createBoardDto.description;
    board.createdAt = new Date();

    return await this.boardRepository.save(board);
  }

  async findAll(actor: AuthUser): Promise<Board[]> {
    if (actor.role === UserRole.ADMIN) {
      return await this.boardRepository.find({
        relations: { owner: true },
      });
    }

    return await this.boardRepository.find({
      where: { owner: { id: actor.id } },
      relations: { owner: true },
    });
  }

  async findOne(actor: AuthUser, id: number): Promise<Board | null> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (!board) {
      return null;
    }

    this.assertBoardReadable(actor, board);
    return board;
  }

  async findColumns(actor: AuthUser, boardId: number): Promise<BoardColumn[]> {
    await this.assertBoardReadableById(actor, boardId);

    return await this.boardColumnRepository.find({
      where: { board: { id: boardId } },
      relations: { allowedTo: true },
    });
  }

  async findTasks(actor: AuthUser, boardId: number): Promise<Task[]> {
    await this.assertBoardReadableById(actor, boardId);

    return await this.taskRepository.find({
      where: { boardColumn: { board: { id: boardId } } },
      relations: { boardColumn: true },
      order: { order: 'ASC', id: 'ASC' },
    });
  }

  async update(
    actor: AuthUser,
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
    if (actor.role !== UserRole.ADMIN && board.owner?.id !== actor.id) {
      throw new ForbiddenException('Only board owner can update board');
    }

    await this.boardRepository.update(id, updateBoardDto);
    return board;
  }

  async remove(actor: AuthUser, id: number): Promise<void> {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: { owner: true },
    });
    if (board === null) {
      throw new NotFoundException(`could not find board: ${id}`);
    }
    if (actor.role !== UserRole.ADMIN && board.owner?.id !== actor.id) {
      throw new ForbiddenException('Only board owner can delete board');
    }

    await this.boardRepository.delete(id);
  }

  private async assertBoardReadableById(
    actor: AuthUser,
    boardId: number,
  ): Promise<void> {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: { owner: true },
    });
    if (!board) {
      throw new NotFoundException(`could not find board: ${boardId}`);
    }
    this.assertBoardReadable(actor, board);
  }

  private assertBoardReadable(actor: AuthUser, board: Board): void {
    if (actor.role === UserRole.ADMIN || board.owner?.id === actor.id) {
      return;
    }
    throw new ForbiddenException('No access to this board');
  }
}
