import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from '../../board/entities/board.entity';

@Entity()
export class BoardColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'int', nullable: true })
  limit: number | null;

  @ManyToMany(() => BoardColumn)
  @JoinTable({
    name: 'board_column_allowed_to',
    joinColumn: { name: 'fromColumnId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'toColumnId', referencedColumnName: 'id' },
  })
  allowedTo: BoardColumn[];

  @ManyToOne(() => Board, (board) => board.id)
  board: Board;
}
