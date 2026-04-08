import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBoardDto {
  @ApiProperty({ example: 'Board' })
  @Field()
  title: string;

  @ApiProperty({ example: 'Board description' })
  @Field()
  description: string;
}
