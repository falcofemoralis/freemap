import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from 'shared/dto/auth/user.dto';
import { compare, hash } from 'bcrypt';
import { EnteredUserDataDto } from 'shared/dto/auth/enteredUserData.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Поиск пользователя в базе данных
   * @param login - логин пользователя
   * @param pass - пароль пользователя
   * @returns {User | null} - пользователь без поля хеша пароля.
   */
  async validateUser(login: string, pass: string): Promise<User | null> {
    const user: User = await this.userRepository.findOne({ login });

    if (user && (await compare(pass, user.passwordHash))) {
      const { passwordHash, ...secureUser } = user;
      return secureUser;
    }

    return null;
  }

  /**
   * Создание payload токена.
   * @param user - найденный пользователь из базы данных (UserEntity)
   * @returns {String} - сгенерированный токен
   */
  async createToken(user: User): Promise<string> {
    const payload: UserDto = { id: user.id, login: user.login, avatar: user.avatar, email: user.email };

    return this.jwtService.sign(payload);
  }

  /**
   * Получение данных из payload токена
   * @param payload - payload токена
   * @returns {UserDto} - пользователь
   */
  async getToken(payload: any): Promise<UserDto> {
    const { iat, exp, ...res } = payload;

    return res;
  }

  /**
   * Регистрация нового пользователя в базе данных
   * @param enteredUserDataDto - веденные данные пользовател
   * @returns {User} - пользователь
   */
  async register(enteredUserDataDto: EnteredUserDataDto): Promise<User> {
    const passwordHash = await hash(enteredUserDataDto.password, 10); //salt or round

    return await this.userRepository.save({
      login: enteredUserDataDto.login,
      passwordHash: passwordHash,
      email: enteredUserDataDto.email,
    });
  }

  /**
   * Сохранение имени файла аватара пользователя в базе данных
   * @param userId - id пользователя
   * @param avatarFileName - имя файла аватара
   */
  async updateUserAvatar(userId: number, avatarFileName: string) {
    const user = await this.getUserById(userId);
    user.avatar = avatarFileName;
    await this.userRepository.update(userId, user);
  }

  /**
   * Получение пользователя по id
   * @param id - id пользователя
   * @returns {User | null} - найденный пользователь
   */
  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ id });
  }

  /**
   * Получение пользователя по логину
   * @param login - логин пользователя
   * @returns {User | null} - найденный пользователь
   */
  async getUserByLogin(login: string): Promise<User | null> {
    return await this.userRepository.findOne({ login });
  }

  /**
   * Получение пользователя по email
   * @param email - email пользователя
   * @returns {User | null} - найденный пользователь
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ email });
  }
}
