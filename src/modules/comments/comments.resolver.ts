import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CommentsService } from './comments.service';
import { Comment } from './comments.entity';
import { Post } from '../posts/posts.entity';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private commentsService: CommentsService) {}

  @Query(() => [Comment])
  async comments(@Args('postId', { type: () => Int }) postId: number) {
    return this.commentsService.findAllByPostId(postId);
  }

  @Mutation(() => Comment)
  async createComment(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('postId', { type: () => Int }) postId: number,
    @Args('body') body: string,
  ) {
    return this.commentsService.create({ userId, postId, body });
  }

  @ResolveField(() => Post)
  async post(@Parent() comment: Comment) {
    return this.commentsService.getPost(comment.postId);
  }
}
