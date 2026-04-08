import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.type';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(
    @CurrentUser() actor: AuthUser,
    @Body() createBoardDto: CreateBoardDto,
  ) {
    return this.boardService.create(actor, createBoardDto);
  }

  @Get()
  findAll(@CurrentUser() actor: AuthUser) {
    return this.boardService.findAll(actor);
  }

  @Get(':id')
  findOne(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.boardService.findOne(actor, +id);
  }

  @Get(':id/columns')
  findColumns(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.boardService.findColumns(actor, +id);
  }

  @Get(':id/tasks')
  findTasks(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.boardService.findTasks(actor, +id);
  }

  @Patch(':id')
  update(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardService.update(actor, +id, updateBoardDto);
  }

  @Delete(':id')
  remove(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.boardService.remove(actor, +id);
  }
}
