import { Module } from '@nestjs/common';
import { BoardColumnService } from './board-column.service';
import { BoardColumnController } from './board-column.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardColumn } from './entities/board-column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BoardColumn])],
  controllers: [BoardColumnController],
  providers: [BoardColumnService],
})
export class BoardColumnModule {}
