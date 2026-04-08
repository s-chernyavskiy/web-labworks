import { Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { User } from '../users/entities/user.entity';
import { BoardColumn } from '../board-column/entities/board-column.entity';
import { Task } from '../task/entities/task.entity';
import { BoardResolver } from './board.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Board, User, BoardColumn, Task])],
  controllers: [BoardController],
  providers: [BoardService, BoardResolver],
})
export class BoardModule {}
