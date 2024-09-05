import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comments.entity';
import { Cache } from 'cache-manager';
import { PostsService } from '../posts/posts.service';
import { Post } from '../posts/posts.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly postService: PostsService,
  ) {}

  async findAllByPostId(postId: number): Promise<Comment[]> {
    const cacheKey = `comments_post_${postId}`;
    const cachedComments = await this.cacheManager.get<Comment[]>(cacheKey);

    if (cachedComments) {
      return cachedComments;
    }

    const comments = await this.commentsRepository.find({ where: { postId } });
    for (const comm of comments) {
      console.log('THIS IS COMMENT', comm);
    }

    await this.cacheManager.set(cacheKey, comments, 60000);
    return comments;
  }

  async create(commentData: {
    userId: number;
    postId: number;
    body: string;
  }): Promise<Comment> {
    const post = await this.postService.findOne(commentData.postId);
    if (!post) {
      throw new NotFoundException(
        `Post with ID ${commentData.postId} not found`,
      );
    }

    const comment = this.commentsRepository.create({
      ...commentData,
      post,
    });

    await this.commentsRepository.save(comment);

    // Invalidate cache
    await this.cacheManager.del(`comments_post_${commentData.postId}`);

    return comment;
  }

  async getPost(postId: number): Promise<Post> {
    return await this.postService.findOne(postId);
  }
}
