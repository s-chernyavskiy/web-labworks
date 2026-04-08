import { ApiPropertyOptional } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateBoardColumnDto {
  @ApiPropertyOptional({ example: 'In Progress' })
  @Field({ nullable: true })
  title?: string;

  @ApiPropertyOptional({ example: 3, nullable: true })
  @Field(() => Number, { nullable: true })
  limit?: number | null;

  @ApiPropertyOptional({
    example: [1, 3],
    description:
      'Replace list of column ids that allow to get tasks transitioned to' +
      '(set to [] to forbid all transitions)',
  })
  @Field(() => [Number], { nullable: true })
  allowedToIds?: number[];
}
