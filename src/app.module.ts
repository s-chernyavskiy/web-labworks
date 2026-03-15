import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import {ConfigModule} from "@nestjs/config";
import { BoardModule } from './board/board.module';
import { BoardColumnModule } from './board-column/board-column.module';

@Module({
  imports: [
      ConfigModule.forRoot({
          isGlobal: true,
      }),
      UsersModule, DatabaseModule, BoardModule, BoardColumnModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
