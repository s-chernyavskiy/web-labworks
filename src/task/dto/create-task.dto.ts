import { BoardColumn } from '../../board-column/entities/board-column.entity';

export class CreateTaskDto {
  title: string;
  description: string;
  boardColumn: BoardColumn;
  order: number;
}
