import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Do something' })
  title: string;

  @ApiProperty({ example: 'Do something described explicitly' })
  description: string;

  @ApiProperty({ example: 1, description: 'Target column id' })
  boardColumnId: number;
}
