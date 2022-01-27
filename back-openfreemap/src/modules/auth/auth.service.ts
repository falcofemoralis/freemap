import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserDto } from '../../dto/auth/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MongoRepository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
  ) {}

  /**
   * Валидация пользователя по его логину и паролю
   * @param login - логин пользователя
   * @param pass - пароль пользователя
   * @returns {User | null} - пользователь без поля хеша пароля.
   */
  async validateUser(login: string, pass: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ login });

    if (user && (await compare(pass, user.passwordHash))) {
      return user;
    }

    return null;
  }

  /**
   * Создание токена пользователя.
   * @param {User} user - найденный пользователь из базы данных
   * @returns {String} - сгенерированный токен
   */
  async createToken(user: User): Promise<string> {
    delete user.passwordHash;
    const payload: UserDto = { ...user };
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
   * @param {User} user - веденные данные пользовател
   * @returns {User} - пользователь
   */
  async register(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  /**
   * Сохранение имени файла аватара пользователя в базе данных
   * @param id - id пользователя
   * @param avatar - имя файла аватара
   */
  async updateUserAvatar(id: string, avatar: string) {
    await this.userRepository.update(id, { avatar });
  }

  /**
   * Получение пользователя по id
   * @param id - id пользователя
   * @returns {User | null} - найденный пользователь
   */
  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne(id);
  }

  /**
   * Получение пользователя по логину
   * @param login - логин пользователя
   * @returns {User | null} - найденный пользователь
   */
  async getUserByLogin(login: string): Promise<User | null> {
    return this.userRepository.findOne({ login });
  }

  /**
   * Получение пользователя по email
   * @param email - email пользователя
   * @returns {User | null} - найденный пользователь
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ email });
  }
}
