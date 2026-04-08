import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import { UserRole } from './user-role.enum';

@Entity()
@ObjectType({ description: 'recipe' })
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  email: string;

  @Column()
  @Field()
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  @Field(() => String)
  role: UserRole;

  @Column()
  @Field()
  createdAt: Date;

  @Column()
  @Field()
  updatedAt: Date;
}
