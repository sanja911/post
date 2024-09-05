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
    const response = await this.apiService.get('/posts');
    const posts = response.data;
    if (posts.length === 0) {
      throw new NotFoundException('No posts found');
    }

    const existingPost = [];
    for (const post of posts) {
      const postData = await this.postRepository.findOneBy({
        title: post.title,
        body: post.body,
      });

      if (postData) {
        existingPost.push(postData);
      }
    }

    if (existingPost.length >= 1) {
      return posts;
    }
    const savedPosts = await this.postRepository.save(posts);
    await this.cacheManager.set('all_posts', savedPosts, 60000); // Cache for 1 minute
    return savedPosts;
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
    const createdPost = response.data;
    const savedPost = await this.postRepository.save(createdPost);

    // Cache the new post
    const cacheKey = `post_${savedPost.id}`;
    await this.cacheManager.set(cacheKey, savedPost, 60000); // Cache for 1 minute

    // Update the all_posts cache
    const cachedAllPosts = await this.cacheManager.get<Post[]>('all_posts');
    if (cachedAllPosts) {
      cachedAllPosts.push(savedPost);
      await this.cacheManager.set('all_posts', cachedAllPosts, 60000); // Cache for 1 minute
    }

    this.logger.debug(`Created and cached new post with ID ${savedPost.id}`);
    return savedPost;
  }

  async update(id: any, postData: Post): Promise<Post> {
    const existingPost = await this.postRepository.findOneBy({ id });
    console.log('existingPost', existingPost);
    if (existingPost.id) {
      postData.id = id;
      const savedPost = await this.postRepository.save(postData);
      await this.cacheManager.del(`post_${id}`);
      return savedPost;
    }

    const existingPostData = await this.apiService.getById(`/posts/${id}`);
    if (!existingPost && existingPostData.status === 404) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (!existingPost && existingPostData.status === 200) {
      const response = await this.apiService.put(`/posts/${id}`, postData);
      return response.data;
    }
  }

  async partialUpdate(id: number, postData: Partial<Post>): Promise<Post> {
    const existingPost = await this.postRepository.findOneBy({ id });
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const response = await this.apiService.patch(`/posts/${id}`, postData);
    const updatedPost = response.data;
    updatedPost.id = id;
    const savedPost = await this.postRepository.save(updatedPost);

    // Update the cache for this specific post
    const cacheKey = `post_${id}`;
    await this.cacheManager.set(cacheKey, savedPost, 60000); // Cache for 1 minute

    // Update the all_posts cache
    const cachedAllPosts = await this.cacheManager.get<Post[]>('all_posts');
    if (cachedAllPosts) {
      const index = cachedAllPosts.findIndex((post) => post.id === id);
      if (index !== -1) {
        cachedAllPosts[index] = savedPost;
        await this.cacheManager.set('all_posts', cachedAllPosts, 60000); // Cache for 1 minute
      }
    }

    this.logger.debug(`Partially updated and cached post with ID ${id}`);
    return savedPost;
  }

  async remove(id: number): Promise<void> {
    const existingPost = await this.postRepository.findOneBy({ id });
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    await this.apiService.delete(`/posts/${id}`);
    await this.postRepository.delete(id);

    // Remove the post from cache
    const cacheKey = `post_${id}`;
    await this.cacheManager.del(cacheKey);

    // Update the all_posts cache
    const cachedAllPosts = await this.cacheManager.get<Post[]>('all_posts');
    if (cachedAllPosts) {
      const updatedPosts = cachedAllPosts.filter((post) => post.id !== id);
      await this.cacheManager.set('all_posts', updatedPosts, 60000); // Cache for 1 minute
    }

    this.logger.debug(`Removed post with ID ${id} and updated cache`);
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

  async customCompare(arr1: Post[], arr2: Post[]): Promise<boolean> {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i].title !== arr2[i].title || arr1[i].body !== arr2[i].body) {
        return false;
      }
    }

    return true;
  }
}
