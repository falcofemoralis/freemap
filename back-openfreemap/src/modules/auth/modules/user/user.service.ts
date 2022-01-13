import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {
  }

  async findByLogin(login: string): Promise<User | undefined> {
    return this.userRepository.findOne({ login: login });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ id: id });
  }
}
