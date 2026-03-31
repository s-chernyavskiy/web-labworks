import { Test, TestingModule } from '@nestjs/testing';
import { BoardColumnService } from './board-column.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardColumn } from './entities/board-column.entity';
import { Board } from '../board/entities/board.entity';

describe('BoardColumnService', () => {
  let service: BoardColumnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardColumnService,
        {
          provide: getRepositoryToken(BoardColumn),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Board),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BoardColumnService>(BoardColumnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
