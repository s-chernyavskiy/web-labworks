import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBoardColumnDto {
  @ApiProperty({ example: 'To Do' })
  title: string;

  @ApiProperty({ example: 1 })
  boardId: number;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Max tasks allowed in this column (dont set this to not set any limit)',
    nullable: true,
  })
  limit?: number | null;

  @ApiPropertyOptional({
    example: [2, 3],
    description:
      'List of column ids this column can transition tasks to (same board)',
  })
  allowedToIds?: number[];
}
