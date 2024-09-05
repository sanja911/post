import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { UserResolver } from './users.resolver';
import { User } from './users.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule), // Use forwardRef to avoid circular dependency
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
