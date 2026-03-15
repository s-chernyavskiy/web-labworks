import {Module} from '@nestjs/common';
import {BoardService} from './board.service';
import {BoardController} from './board.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../users/entities/user.entity";
import {Board} from "./entities/board.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Board])],
    controllers: [BoardController],
    providers: [BoardService],
})
export class BoardModule {}
