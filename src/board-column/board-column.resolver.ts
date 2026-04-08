import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { BoardColumn } from './entities/board-column.entity';
import { BoardColumnService } from './board-column.service';
import { CreateBoardColumnDto } from './dto/create-board-column.dto';
import { UpdateBoardColumnDto } from './dto/update-board-column.dto';

@Resolver(() => BoardColumn)
export class BoardColumnResolver {
  constructor(private readonly boardColumnService: BoardColumnService) {}

  @Mutation(() => BoardColumn)
  async addBoardColumn(
    @Args('actorUserId') actorUserId: number,
    @Args('createBoardColumn') dto: CreateBoardColumnDto,
  ): Promise<BoardColumn> {
    return await this.boardColumnService.create(actorUserId, dto);
  }

  @Mutation(() => BoardColumn)
  async updateBoardColumn(
    @Args({ name: 'id', type: () => ID }) id: number,
    @Args('actorUserId') actorUserId: number,
    @Args('updateBoardColumn') dto: UpdateBoardColumnDto,
  ): Promise<BoardColumn> {
    return await this.boardColumnService.update(actorUserId, id, dto);
  }
}
