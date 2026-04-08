import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateTaskDto {
  @ApiProperty({ example: 'Do something' })
  @Field()
  title: string;

  @ApiProperty({ example: 'Do something described explicitly' })
  @Field()
  description: string;

  @ApiProperty({ example: 1, description: 'Target column id' })
  @Field()
  boardColumnId: number;
}
