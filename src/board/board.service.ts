import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const board = new Board();
    board.owner = createBoardDto.owner;
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

  async update(id: number, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const board = await this.boardRepository.findOne({ where: { id } });
    if (board === null) {
      throw new NotFoundException(`could not find board: ${id}`);
    }

    await this.boardRepository.update(id, updateBoardDto);
    return board;
  }

  async remove(id: number): Promise<void> {
    await this.boardRepository.delete(id);
  }
}
