import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
} from '@nestjs/common';
import { BoardColumnService } from './board-column.service';
import { CreateBoardColumnDto } from './dto/create-board-column.dto';
import { UpdateBoardColumnDto } from './dto/update-board-column.dto';
import { requireActorUserId } from '../common/actor';

@Controller('board-column')
export class BoardColumnController {
  constructor(private readonly boardColumnService: BoardColumnService) {}

  @Post()
  create(
    @Headers('user-id') actor: string,
    @Body() createBoardColumnDto: CreateBoardColumnDto,
  ) {
    return this.boardColumnService.create(
      requireActorUserId(actor),
      createBoardColumnDto,
    );
  }

  @Get()
  findAll() {
    return this.boardColumnService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardColumnService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Headers('user-id') actor: string,
    @Param('id') id: string,
    @Body() updateBoardColumnDto: UpdateBoardColumnDto,
  ) {
    return this.boardColumnService.update(
      requireActorUserId(actor),
      +id,
      updateBoardColumnDto,
    );
  }

  @Delete(':id')
  remove(@Headers('user-id') actor: string, @Param('id') id: string) {
    return this.boardColumnService.remove(requireActorUserId(actor), +id);
  }
}
