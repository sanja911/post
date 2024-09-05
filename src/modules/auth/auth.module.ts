import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [
    forwardRef(() => UserModule), // Use forwardRef to avoid circular dependency
    PassportModule,
    JwtModule.register({
      secret: '3def3faad7a7f7c52fe19f90', // In production, use environment variable
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, JwtStrategy, AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}
