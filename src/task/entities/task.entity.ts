import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BoardColumn } from '../../board-column/entities/board-column.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => BoardColumn, (boardColumn) => boardColumn.id)
  boardColumn: BoardColumn;

  @Column()
  order: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
