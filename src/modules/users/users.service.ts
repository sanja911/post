import {
  Injectable,
  Inject,
  forwardRef,
  UseInterceptors,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserInput } from './users.input';
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcrypt';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  @UseInterceptors(CacheInterceptor)
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const { username, email, password } = createUserInput;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }
}
