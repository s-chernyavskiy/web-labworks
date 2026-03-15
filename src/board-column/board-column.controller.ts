import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BoardColumnService } from './board-column.service';
import { CreateBoardColumnDto } from './dto/create-board-column.dto';
import { UpdateBoardColumnDto } from './dto/update-board-column.dto';

@Controller('board-column')
export class BoardColumnController {
  constructor(private readonly boardColumnService: BoardColumnService) {}

  @Post()
  create(@Body() createBoardColumnDto: CreateBoardColumnDto) {
    return this.boardColumnService.create(createBoardColumnDto);
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
  update(@Param('id') id: string, @Body() updateBoardColumnDto: UpdateBoardColumnDto) {
    return this.boardColumnService.update(+id, updateBoardColumnDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardColumnService.remove(+id);
  }
}
