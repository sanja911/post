import { ObjectType, Field } from '@nestjs/graphql';
import { Post } from '../posts/posts.entity';

@ObjectType()
export class CommentResponse {
  @Field()
  id: number;

  @Field()
  userId: number;

  @Field()
  body: number;

  @Field()
  postId: number;

  @Field()
  post: Post;
}
