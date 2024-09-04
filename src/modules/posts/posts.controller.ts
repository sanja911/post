import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './posts.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postsService.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() postData: Partial<PostEntity>): Promise<PostEntity> {
    return this.postsService.create(postData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() postData: Partial<PostEntity>,
  ): Promise<PostEntity> {
    return this.postsService.update(+id, postData);
  }

  @Patch(':id')
  async partialUpdate(
    @Param('id') id: string,
    @Body() postData: Partial<PostEntity>,
  ): Promise<PostEntity> {
    return this.postsService.partialUpdate(+id, postData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.postsService.remove(+id);
  }

  @Get('cache/keys')
  async getCacheKeys(): Promise<string[]> {
    return this.postsService.getCacheKeys();
  }

  @Get('cache/:key')
  async getCacheValue(@Param('key') key: string): Promise<any> {
    return this.postsService.getCacheValue(key);
  }
}
