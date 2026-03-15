import { Test, TestingModule } from '@nestjs/testing';
import { BoardColumnController } from './board-column.controller';
import { BoardColumnService } from './board-column.service';

describe('BoardColumnController', () => {
  let controller: BoardColumnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardColumnController],
      providers: [BoardColumnService],
    }).compile();

    controller = module.get<BoardColumnController>(BoardColumnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
