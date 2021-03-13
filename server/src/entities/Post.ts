import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity
} from 'typeorm';
import { ObjectType, Field, Int } from 'type-graphql';

//this is now both an object type and an entity
@ObjectType()
@Entity()
export class Post extends BaseEntity {

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = Date;

  @Field()
  @Column()
  title!: string;

}