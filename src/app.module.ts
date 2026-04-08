import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { BoardModule } from './board/board.module';
import { BoardColumnModule } from './board-column/board-column.module';
import { TaskModule } from './task/task.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLDirective } from 'graphql/type';
import { DirectiveLocation } from 'graphql/language';
import { MinioModule } from './minio/minio.module';
import { ImageCacheModule } from './image-cache/image-cache.module';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    DatabaseModule,
    BoardModule,
    BoardColumnModule,
    TaskModule,
    MinioModule,
    ImageCacheModule,
    ImagesModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      transformSchema: (schema) => schema,
      installSubscriptionHandlers: true,
      buildSchemaOptions: {
        directives: [
          new GraphQLDirective({
            locations: [DirectiveLocation.FIELD_DEFINITION],
            name: 'upper',
          }),
        ],
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
