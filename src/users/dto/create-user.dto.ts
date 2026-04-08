import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from '../entities/user-role.enum';

@InputType()
export class CreateUserDto {
  @Field()
  @ApiProperty({ example: 'johndoe@gmail.com' })
  email: string;

  @Field()
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @Field(() => String, { nullable: true })
  @ApiProperty({ example: UserRole.USER, required: false })
  role?: UserRole;
}
