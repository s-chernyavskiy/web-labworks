import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './entities/user-role.enum';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User)
  @Roles(UserRole.ADMIN)
  async users(@Args('id') id: number): Promise<User> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  @Mutation(() => User)
  @Public()
  async addUser(
    @Args('createUser') createUserDto: CreateUserDto,
  ): Promise<User> {
    return await this.usersService.create(createUserDto);
  }
}
