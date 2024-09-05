import { ObjectType, Field } from '@nestjs/graphql';

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
}
