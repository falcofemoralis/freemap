import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UserDto } from '../../dto/auth/user.dto';
import { RegisterUserDto } from '../../dto/auth/registerUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  /**
   * Валидация пользователя по его логину и паролю
   * @param login - логин пользователя
   * @param pass - пароль пользователя
   * @returns {User | null} - пользователь без поля хеша пароля.
   */
  async validateUser(login: string, pass: string): Promise<UserDocument | null> {
    const user: UserDocument = await this.userModel.findOne({ login }).exec();

    if (user && (await compare(pass, user.passwordHash))) {
      return user;
    }

    return null;
  }

  /**
   * Создание токена пользователя.
   * @param {UserDocument} user - найденный пользователь из базы данных
   * @returns {String} - сгенерированный токен
   */
  async createToken(user: UserDocument): Promise<string> {
    const payload: UserDto = { id: user.id, login: user.login, avatar: user.avatar, email: user.email };

    return this.jwtService.sign(payload);
  }

  /**
   * Получение данных из токена
   * @param payload - payload токена
   * @returns {UserDto} - пользователь
   */
  async getTokenPayload(payload: any): Promise<UserDto> {
    const { iat, exp, ...res } = payload;

    return res;
  }

  /**
   * Регистрация нового пользователя в базе данных
   * @param {RegisterUserDto} registerUserDto - веденные данные пользовател
   * @returns {UserDocument} - пользователь
   */
  async register(registerUserDto: RegisterUserDto): Promise<UserDocument> {
    const passwordHash = await hash(registerUserDto.password, 10); //salt or round

    const newUser = new this.userModel({
      login: registerUserDto.login,
      passwordHash: passwordHash,
      email: registerUserDto.email,
    });

    return newUser.save();
  }

  /**
   * Сохранение имени файла аватара пользователя в базе данных
   * @param id - id пользователя
   * @param avatar - имя файла аватара
   */
  async updateUserAvatar(id: string, avatar: string): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, { avatar });
  }

  /**
   * Получение пользователя по id
   * @param id - id пользователя
   * @returns {UserDocument | null} - найденный пользователь
   */
  async getUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  /**
   * Получение пользователя по логину
   * @param login - логин пользователя
   * @returns {UserDocument | null} - найденный пользователь
   */
  async getUserByLogin(login: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ login });
  }

  /**
   * Получение пользователя по email
   * @param email - email пользователя
   * @returns {UserDocument | null} - найденный пользователь
   */
  async getUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }
}
