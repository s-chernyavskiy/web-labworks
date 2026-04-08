import { Args, Query, Resolver } from '@nestjs/graphql';
import { BoardColumn } from '../board-column/entities/board-column.entity';
import { Task } from '../task/entities/task.entity';
import { BoardService } from './board.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.type';
import { Board } from './entities/board.entity';
import { NotFoundException } from '@nestjs/common';

@Resolver()
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  @Query(() => [Board])
  async boards(@CurrentUser() actor: AuthUser): Promise<Board[]> {
    return await this.boardService.findAll(actor);
  }

  @Query(() => Board)
  async board(
    @CurrentUser() actor: AuthUser,
    @Args('id') id: number,
  ): Promise<Board> {
    const board = await this.boardService.findOne(actor, id);
    if (!board) {
      throw new NotFoundException(`Board with id ${id} not found`);
    }

    return board;
  }

  @Query(() => [BoardColumn])
  async boardColumns(
    @CurrentUser() actor: AuthUser,
    @Args('boardId') boardId: number,
  ): Promise<BoardColumn[]> {
    return await this.boardService.findColumns(actor, boardId);
  }

  @Query(() => [Task])
  async boardTasks(
    @CurrentUser() actor: AuthUser,
    @Args('boardId') boardId: number,
  ): Promise<Task[]> {
    return await this.boardService.findTasks(actor, boardId);
  }
}
