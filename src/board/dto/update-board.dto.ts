import { ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateBoardDto {
  @ApiPropertyOptional({ example: 'Board' })
  @Field({ nullable: true })
  title?: string;

  @ApiPropertyOptional({ example: 'Board description' })
  @Field({ nullable: true })
  description?: string;
}
