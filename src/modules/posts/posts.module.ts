import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './posts.entity';
import { PostRepository } from './posts.repository';
import { ApiService } from '../../shared/http/api.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Post, PostRepository])],
  controllers: [PostsController],
  providers: [PostsService, ApiService],
  exports: [PostsService],
})
export class PostsModule {}
