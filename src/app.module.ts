import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import {ConfigModule} from "@nestjs/config";
import { BoardModule } from './board/board.module';

@Module({
  imports: [
      ConfigModule.forRoot({
          isGlobal: true,
      }),
      UsersModule, DatabaseModule, BoardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
