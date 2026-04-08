import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { Task } from './entities/task.entity';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Resolver(() => Task)
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

  @Mutation(() => Task)
  async addTask(
    @Args('actorUserId') actorUserId: number,
    @Args('createTask') dto: CreateTaskDto,
  ): Promise<Task> {
    return await this.taskService.create(actorUserId, dto);
  }

  @Mutation(() => Task)
  async updateTask(
    @Args({ name: 'id', type: () => ID }) id: number,
    @Args('actorUserId') actorUserId: number,
    @Args('updateTask') dto: UpdateTaskDto,
  ): Promise<Task> {
    return await this.taskService.update(actorUserId, id, dto);
  }
}
