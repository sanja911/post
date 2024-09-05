import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post as PostEntity } from '../posts/posts.entity';

@ObjectType()
@Entity()
export class Comment {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column()
  userId: number;

  @Field()
  @Column()
  body: string;

  @Field(() => Int)
  @Column()
  postId: number;

  @OneToMany(() => PostEntity, (post) => post.comments, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  posts: PostEntity[];
}
