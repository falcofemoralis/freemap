import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'login',
    });
  }

  /**
   * Валидация существования пользователя по его логину и паролю
   * @param login - логин пользователя
   * @param password - пароль пользователя
   * @returns {string} - объект пользователя базы данных без хеша пароля
   */
  async validate(login: string, password: string): Promise<UserDocument> {
    const user = await this.authService.validateUser(login, password);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
