import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from '../../board/entities/board.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class BoardColumn {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  title: string;

  @Column({ type: 'int', nullable: true })
  @Field(() => Number, { nullable: true })
  limit: number | null;

  @ManyToMany(() => BoardColumn)
  @JoinTable({
    name: 'board_column_allowed_to',
    joinColumn: { name: 'fromColumnId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'toColumnId', referencedColumnName: 'id' },
  })
  @Field(() => [BoardColumn])
  allowedTo: BoardColumn[];

  @ManyToOne(() => Board, (board) => board.id)
  @Field(() => Board)
  board: Board;
}
