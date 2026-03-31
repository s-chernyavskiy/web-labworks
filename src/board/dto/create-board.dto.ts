import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty({ example: 'Board' })
  title: string;

  @ApiProperty({ example: 'Board description' })
  description: string;
}
