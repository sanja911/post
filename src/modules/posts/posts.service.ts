import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Post } from './posts.entity';
import { PostRepository } from './posts.repository';
import { ApiService } from '../../shared/http/api.service';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private postRepository: PostRepository,
    private apiService: ApiService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(): Promise<Post[]> {
    const cachedPosts = await this.cacheManager.get<Post[]>('all_posts');
    if (cachedPosts) {
      this.logger.debug('Returning posts from cache');
      return cachedPosts;
    }

    this.logger.debug('Fetching posts from API and saving to cache');
    const responses = await this.apiService.get('/posts');
    const posts = responses.data;
    if (posts.length === 0) {
      throw new NotFoundException('No posts found');
    }
    // const savedPosts = await this.postRepository.save(posts);
    await this.cacheManager.set('all_posts', responses.data, 60000); // Cache for 1 minute
    return responses.data;
  }

  async findOne(id: number): Promise<Post> {
    const cacheKey = `post_${id}`;
    const cachedPost = await this.cacheManager.get<Post>(cacheKey);
    if (cachedPost) {
      this.logger.debug(`Returning post ${id} from cache`);
      return cachedPost;
    }

    this.logger.debug(`Fetching post ${id} from API and saving to cache`);
    try {
      let post = await this.postRepository.findOneBy({ id });
      if (!post) {
        const response = await this.apiService.getById(`/posts/${id}`);
        post = response?.data;
      }

      await this.cacheManager.set(cacheKey, post, 60000); // Cache for 1 minute
      return post;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
      throw error;
    }
  }

  async create(postData: Partial<Post>): Promise<Post> {
    const existingPost = await this.postRepository.findOne({
      where: { title: postData.title },
    });
    if (existingPost) {
      throw new ConflictException('A post with this title already exists');
    }

    const response = await this.apiService.post('/posts', postData);
    const postEntry = response.data;
    const createdPost = await this.postRepository.save(postEntry);
    const cacheKey = `post_${createdPost.id}`;
    await this.cacheManager.set(cacheKey, createdPost, 60000); // Cache for 1 minute
    // Update the all_posts cache
    const cachedAllPosts = await this.cacheManager.get<Post[]>('all_posts');
    if (cachedAllPosts) {
      cachedAllPosts.push(createdPost);
      await this.cacheManager.set('all_posts', cachedAllPosts, 60000); // Cache for 1 minute
    }
    return createdPost;
  }

  async update(id: any, postData: Partial<Post>): Promise<Post> {
    const existingPostData = await this.apiService.getById(`/posts/${id}`);
    const existingPost = await this.postRepository.findOneBy({ id });
    if (!existingPost && existingPostData.status === 404) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (!existingPost && existingPostData.status === 200) {
      const response = await this.apiService.put(`/posts/${id}`, postData);
      return response.data;
    }

    const response = await this.apiService.put(`/posts/${id}`, postData);
    const updatedPost = response.data;
    const savedPost = await this.postRepository.save(updatedPost);
    await this.cacheManager.del(`post_${id}`);
    return savedPost;
  }

  async partialUpdate(id: any, postData: Partial<Post>): Promise<Post> {
    const existingPostData = await this.apiService.getById(`/posts/${id}`);
    const existingPost = await this.postRepository.findOneBy({ id });
    if (!existingPost && existingPostData.status === 404) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (!existingPost && existingPostData.status === 200) {
      const response = await this.apiService.put(`/posts/${id}`, postData);
      return response.data;
    }

    const response = await this.apiService.patch(`/posts/${id}`, postData);
    const updatedPost = response.data;
    const savedPost = await this.postRepository.save(updatedPost);
    await this.cacheManager.del(`post_${id}`);
    return savedPost;
  }

  async remove(id: any): Promise<void> {
    const existingPost = await this.postRepository.findOneBy({ id });
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    await this.apiService.delete(`/posts/${id}`);
    await this.postRepository.delete(id);
    await this.cacheManager.del(`post_${id}`);
  }

  async getCacheKeys(): Promise<string[]> {
    return this.cacheManager.store.keys();
  }

  async getCacheValue(key: string): Promise<any> {
    const value = await this.cacheManager.get(key);
    if (!value) {
      throw new NotFoundException(`No cache found for key: ${key}`);
    }
    return value;
  }
}
