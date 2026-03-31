import { Test, TestingModule } from '@nestjs/testing';
import { BoardColumnService } from './board-column.service';

describe('BoardColumnService', () => {
  let service: BoardColumnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardColumnService],
    }).compile();

    service = module.get<BoardColumnService>(BoardColumnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
