import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.email = createUserDto.email;
    user.name = createUserDto.name;
    user.role = createUserDto.role ?? UserRole.USER;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user === null) {
      throw new NotFoundException(`user with id ${id} not found`);
    }
    await this.usersRepository.update({ id }, updateUserDto);
    return user;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
