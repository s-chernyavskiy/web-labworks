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
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { requireActorUserId } from '../common/actor';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(
    @Headers('user-id') actor: string,
    @Body() createBoardDto: CreateBoardDto,
  ) {
    return this.boardService.create(requireActorUserId(actor), createBoardDto);
  }

  @Get()
  findAll() {
    return this.boardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardService.findOne(+id);
  }

  @Get(':id/columns')
  findColumns(@Param('id') id: string) {
    return this.boardService.findColumns(+id);
  }

  @Get(':id/tasks')
  findTasks(@Param('id') id: string) {
    return this.boardService.findTasks(+id);
  }

  @Patch(':id')
  update(
    @Headers('user-id') actor: string,
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardService.update(
      requireActorUserId(actor),
      +id,
      updateBoardDto,
    );
  }

  @Delete(':id')
  remove(@Headers('user-id') actor: string, @Param('id') id: string) {
    return this.boardService.remove(requireActorUserId(actor), +id);
  }
}
