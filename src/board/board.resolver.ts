import { Args, Query, Resolver } from '@nestjs/graphql';
import { BoardColumn } from '../board-column/entities/board-column.entity';
import { Task } from '../task/entities/task.entity';
import { BoardService } from './board.service';

@Resolver()
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  @Query(() => [BoardColumn])
  async boardColumns(@Args('boardId') boardId: number): Promise<BoardColumn[]> {
    return await this.boardService.findColumns(boardId);
  }

  @Query(() => [Task])
  async boardTasks(@Args('boardId') boardId: number): Promise<Task[]> {
    return await this.boardService.findTasks(boardId);
  }
}
