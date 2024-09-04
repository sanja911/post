import { EntityRepository, Repository } from 'typeorm';
import { Post } from './posts.entity';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {}
