import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'shared/dto/auth/user.dto';
import { compare, hash } from 'bcrypt';
import { EnteredUserDataDto } from 'shared/dto/auth/enteredUserData.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  /**
   * Поиск пользователя в базе данных
   * @param login - логин пользователя
   * @param pass - пароль пользователя
   * @returns {User | null} - пользователь без поля хеша пароля.
   */
  async validateUser(login: string, pass: string): Promise<UserDocument | null> {
    const user: UserDocument = await this.userModel.findOne({ login }).exec();

    if (user && (await compare(pass, user.passwordHash))) {
      delete user.passwordHash;
      return user;
    }

    return null;
  }

  /**
   * Создание payload токена.
   * @param user - найденный пользователь из базы данных (UserEntity)
   * @returns {String} - сгенерированный токен
   */
  async createToken(user: UserDocument): Promise<string> {
    const payload: UserDto = { id: user.id, login: user.login, avatar: user.avatar, email: user.email };

    return this.jwtService.sign(payload);
  }

  /**
   * Получение данных из payload токена
   * @param payload - payload токена
   * @returns {UserDto} - пользователь
   */
  async getTokenPayload(payload: any): Promise<UserDto> {
    const { iat, exp, ...res } = payload;

    return res;
  }

  /**
   * Регистрация нового пользователя в базе данных
   * @param enteredUserDataDto - веденные данные пользовател
   * @returns {UserDocument} - пользователь
   */
  async register(enteredUserDataDto: EnteredUserDataDto): Promise<UserDocument> {
    const passwordHash = await hash(enteredUserDataDto.password, 10); //salt or round

    const newUser = new this.userModel({
      login: enteredUserDataDto.login,
      passwordHash: passwordHash,
      email: enteredUserDataDto.email,
    });

    return newUser.save();
  }

  /**
   * Сохранение имени файла аватара пользователя в базе данных
   * @param id - id пользователя
   * @param avatarFileName - имя файла аватара
   */
  async updateUserAvatar(id: string, avatarFileName: string): Promise<UserDocument> {
    return this.userModel.findByIdAndUpdate(id, { avatar: avatarFileName });
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
