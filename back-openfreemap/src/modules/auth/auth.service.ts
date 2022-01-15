import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from 'shared/dto/auth/user.dto';
import { compare, hash } from 'bcrypt';
import { UserDataDto } from 'shared/dto/auth/userdata.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {
  }

  async validateUser(login: string, pass: string): Promise<User | null> {
    const user: User = await this.userRepository.findOne({ login });

    if (user && (await compare(pass, user.passwordHash))) {
      const { passwordHash, ...secureUser } = user;
      return secureUser;
    }

    return null;
  }

  async login(user: User) {
    const payload: UserDataDto = { id: user.id, login: user.login };

    return {
      accessToken: this.jwtService.sign(payload)
    };
  }

  async register(userDto: UserDto): Promise<User> {
    return await this.userRepository.save({
      login: userDto.login,
      passwordHash: await hash(userDto.password, 10) //salt or round
    });
  }

  async getUser(id: number): Promise<User> {
    return this.userRepository.findOne({ id });
  }
}
