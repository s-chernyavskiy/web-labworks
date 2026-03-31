import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBoardColumnDto {
  @ApiPropertyOptional({ example: 'In Progress' })
  title?: string;

  @ApiPropertyOptional({ example: 3, nullable: true })
  limit?: number | null;

  @ApiPropertyOptional({
    example: [1, 3],
    description:
      'Replace list of column ids that allow to get tasks transitioned to' +
      '(set to [] to forbid all transitions)',
  })
  allowedToIds?: number[];
}
