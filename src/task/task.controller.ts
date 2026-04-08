import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.type';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@CurrentUser() actor: AuthUser, @Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(actor, createTaskDto);
  }

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(+id);
  }

  @Patch(':id')
  update(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(actor, +id, updateTaskDto);
  }

  @Delete(':id')
  remove(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.taskService.remove(actor, +id);
  }
}
