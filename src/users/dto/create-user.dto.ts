import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe@gmail.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;
}
