import { GoogleUserDto } from './dto/google-user.dto';
import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcrypt';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/modules/auth/dto/create-user.dto';
import { LoginUserDto } from 'src/modules/auth/dto/login-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { UserPayload } from './guards/jwt-auth.guard';
import { materialColor } from './misc/MaterialColorGenerator';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, @InjectModel(User.name) private userModel: Model<UserDocument>, private usersService: UsersService) {}

  /**
   * Валидация пользователя по его логину и паролю
   * @param email - email пользователя
   * @param password - пароль пользователя
   * @returns {User | null} - пользователь без поля хеша пароля.
   */
  async login(loginUserDto: LoginUserDto): Promise<User | null> {
    const user = await this.usersService.findUserByEmail(loginUserDto.email);

    if (user && (await compare(loginUserDto.password, user.passwordHash))) {
      return user;
    }

    return null;
  }

  /**
   * Регистрация нового пользователя в базе данных
   * @param {CreateUserDto} user - веденные данные пользователя
   * @returns {User} - пользователь
   */
  async register(userDto: CreateUserDto): Promise<User> {
    const passwordHash = await hash(userDto.password, 10); //salt or round
    const newUser = new this.userModel({ ...userDto, passwordHash, userColor: materialColor() });
    return newUser.save();
  }

  async registerAsGoogleUser(userDto: GoogleUserDto): Promise<User> {
    const newUser = new this.userModel({ ...userDto, isMailing: true, userColor: materialColor() });
    return newUser.save();
  }

  async updateAsGoogleUser(user: User, googleUserDto: GoogleUserDto): Promise<User> {
    return this.userModel.findOneAndUpdate({ _id: user.id }, googleUserDto, { new: true });
  }

  /**
   * Создание токена пользователя.
   * @param {User} user - найденный пользователь из базы данных
   * @returns {String} - сгенерированный токен
   */
  async createToken(user: User): Promise<string> {
    const payload: UserPayload = { id: user.id, username: user.username, email: user.email };
    return this.jwtService.sign(payload);
  }

  /**
   * Получение данных из токена
   * @param payload - payload токена
   * @returns {UserDto} - пользователь
   */
  async getTokenPayload(payload: any): Promise<UserPayload> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { iat, exp, ...res } = payload;
    return res;
  }

  async updateUserAvatar(id: string, userAvatar: string): Promise<User> {
    return this.userModel.findOneAndUpdate({ _id: id }, { userAvatar }, { new: true });
  }
}
