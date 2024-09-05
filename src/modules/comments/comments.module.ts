import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comments.entity';
import { CommentsService } from './comments.service';
import { CommentsResolver } from './comments.resolver';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    CacheModule.register(),
    PostsModule,
  ],
  providers: [CommentsService, CommentsResolver],
  exports: [CommentsService],
})
export class CommentsModule {}
