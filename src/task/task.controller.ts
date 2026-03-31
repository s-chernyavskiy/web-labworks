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
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { requireActorUserId } from '../common/actor';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(
    @Headers('x-user-id') actor: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.taskService.create(requireActorUserId(actor), createTaskDto);
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
    @Headers('x-user-id') actor: string,
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(
      requireActorUserId(actor),
      +id,
      updateTaskDto,
    );
  }

  @Delete(':id')
  remove(@Headers('x-user-id') actor: string, @Param('id') id: string) {
    return this.taskService.remove(requireActorUserId(actor), +id);
  }
}
