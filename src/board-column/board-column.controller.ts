import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BoardColumnService } from './board-column.service';
import { CreateBoardColumnDto } from './dto/create-board-column.dto';
import { UpdateBoardColumnDto } from './dto/update-board-column.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.type';

@Controller('board-column')
export class BoardColumnController {
  constructor(private readonly boardColumnService: BoardColumnService) {}

  @Post()
  create(
    @CurrentUser() actor: AuthUser,
    @Body() createBoardColumnDto: CreateBoardColumnDto,
  ) {
    return this.boardColumnService.create(actor, createBoardColumnDto);
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
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() updateBoardColumnDto: UpdateBoardColumnDto,
  ) {
    return this.boardColumnService.update(actor, +id, updateBoardColumnDto);
  }

  @Delete(':id')
  remove(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.boardColumnService.remove(actor, +id);
  }
}
