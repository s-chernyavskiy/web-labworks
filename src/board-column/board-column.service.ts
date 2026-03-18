import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardColumnDto } from './dto/create-board-column.dto';
import { UpdateBoardColumnDto } from './dto/update-board-column.dto';
import { BoardColumn } from './entities/board-column.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BoardColumnService {
  constructor(
    @InjectRepository(BoardColumn)
    private columnRepository: Repository<BoardColumn>,
  ) {}

  async create(
    createBoardColumnDto: CreateBoardColumnDto,
  ): Promise<BoardColumn> {
    const column = new BoardColumn();
    column.title = createBoardColumnDto.title;
    column.board = createBoardColumnDto.board;

    return await this.columnRepository.save(column);
  }

  async findAll(): Promise<BoardColumn[]> {
    return await this.columnRepository.find();
  }

  async findOne(id: number): Promise<BoardColumn | null> {
    return await this.columnRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateColumnDto: UpdateBoardColumnDto,
  ): Promise<BoardColumn> {
    const column = await this.columnRepository.findOne({ where: { id } });
    if (column === null) {
      throw new NotFoundException(`column with id ${id} not found`);
    }
    await this.columnRepository.update({ id }, updateColumnDto);
    return column;
  }

  async remove(id: number): Promise<void> {
    await this.columnRepository.delete(id);
  }
}
