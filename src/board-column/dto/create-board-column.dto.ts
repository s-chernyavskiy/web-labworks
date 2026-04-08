import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateBoardColumnDto {
  @ApiProperty({ example: 'To Do' })
  @Field()
  title: string;

  @ApiProperty({ example: 1 })
  @Field()
  boardId: number;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Max tasks allowed in this column (dont set this to not set any limit)',
    nullable: true,
  })
  @Field(() => Number, { nullable: true })
  limit?: number | null;

  @ApiPropertyOptional({
    example: [2, 3],
    description:
      'List of column ids this column can transition tasks to (same board)',
  })
  @Field(() => [Number], { nullable: true })
  allowedToIds?: number[];
}
