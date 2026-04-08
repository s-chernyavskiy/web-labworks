import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { Task } from './entities/task.entity';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.type';

@Resolver(() => Task)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Mutation(() => Task)
  async addTask(
    @CurrentUser() actor: AuthUser,
    @Args('createTask') dto: CreateTaskDto,
  ): Promise<Task> {
    return await this.taskService.create(actor, dto);
  }

  @Mutation(() => Task)
  async updateTask(
    @Args({ name: 'id', type: () => ID }) id: number,
    @CurrentUser() actor: AuthUser,
    @Args('updateTask') dto: UpdateTaskDto,
  ): Promise<Task> {
    return await this.taskService.update(actor, id, dto);
  }
}
