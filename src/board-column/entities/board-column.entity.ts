import {Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Board} from "../../board/entities/board.entity";

@Entity()
export class BoardColumn {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @ManyToOne(() => Board, (board) => board.id)
    board: Board;
}
