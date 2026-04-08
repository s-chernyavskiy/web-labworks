import { ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Do something' })
  @Field({ nullable: true })
  title?: string;

  @ApiPropertyOptional({ example: 'Do something described explicitly' })
  @Field({ nullable: true })
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'Target column id' })
  @Field({ nullable: true })
  boardColumnId?: number;
}
