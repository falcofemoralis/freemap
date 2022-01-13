import { Injectable } from '@nestjs/common';
import { UserService } from './modules/user/user.service';
import { User } from './modules/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {
  }

  async validateUser(login: string, pass: string): Promise<User | null> {
    const user = await this.userService.findByLogin(login);

    if (user && user.password === pass) {
      const { password, ...secureUser } = user;
      return secureUser;
    }

    return null;
  }

  async login(user: User) {
    const payload = { id: user.id };

    return {
      accessToken: this.jwtService.sign(payload)
    };
  }

  async getUser(id: number): Promise<User> {
    return this.userService.findById(id);
  }
}
