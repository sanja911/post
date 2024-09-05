import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { PostsModule } from './modules/posts/posts.module';
// import { CommentsModule } from './modules/comments/comments.module';
import { databaseConfig } from './config/database.config';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from './modules/users/users.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule } from './modules/auth/auth.module';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*/*.graphql'],
      playground: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    CacheModule.register({
      isGlobal: true,
      ttl: 60, // seconds
      max: 100, // maximum number of items in cache
    }),
    PostsModule,
    UserModule,
    AuthModule,
    CommentsModule,
  ],
})
export class AppModule {}
