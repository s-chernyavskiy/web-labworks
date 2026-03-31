import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = new Task();
    task.title = createTaskDto.title;
    task.description = createTaskDto.description;
    task.createdAt = new Date();
    task.updatedAt = new Date();
    task.boardColumn = createTaskDto.boardColumn;
    task.order = createTaskDto.order;

    return await this.taskRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return await this.taskRepository.find();
  }

  async findOne(id: number): Promise<Task | null> {
    return await this.taskRepository.findOne({ where: { id } });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (task === null) {
      throw new NotFoundException(`task with id ${id} not found`);
    }
    await this.taskRepository.update({ id }, updateTaskDto);
    return task;
  }

  async remove(id: number): Promise<void> {
    await this.taskRepository.delete(id);
  }
}
