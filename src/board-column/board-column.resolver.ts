import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BoardColumn } from './entities/board-column.entity';
import { BoardColumnService } from './board-column.service';
import { CreateBoardColumnDto } from './dto/create-board-column.dto';
import { UpdateBoardColumnDto } from './dto/update-board-column.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.type';
import { NotFoundException } from '@nestjs/common';

@Resolver(() => BoardColumn)
export class BoardColumnResolver {
  constructor(private readonly boardColumnService: BoardColumnService) {}

  @Query(() => BoardColumn)
  async boardColumn(@Args('id') id: number): Promise<BoardColumn> {
    const column = await this.boardColumnService.findOne(id);
    if (!column) {
      throw new NotFoundException(`BoardColumn with id ${id} not found`);
    }

    return column;
  }

  @Mutation(() => BoardColumn)
  async addBoardColumn(
    @CurrentUser() actor: AuthUser,
    @Args('createBoardColumn') dto: CreateBoardColumnDto,
  ): Promise<BoardColumn> {
    return await this.boardColumnService.create(actor, dto);
  }

  @Mutation(() => BoardColumn)
  async updateBoardColumn(
    @Args({ name: 'id', type: () => ID }) id: number,
    @CurrentUser() actor: AuthUser,
    @Args('updateBoardColumn') dto: UpdateBoardColumnDto,
  ): Promise<BoardColumn> {
    return await this.boardColumnService.update(actor, id, dto);
  }
}
