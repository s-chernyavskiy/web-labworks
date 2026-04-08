import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserDto {
  @Field()
  @ApiProperty({ example: 'johndoe@gmail.com' })
  email: string;

  @Field()
  @ApiProperty({ example: 'John Doe' })
  name: string;
}
