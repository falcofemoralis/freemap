import { CreatedUser } from '@/types/CreatedUser';
import { axiosInstance, getAuthConfig } from '@/api/index';
import axios from 'axios';
import store from '@/store/index';
import { LoginUserDto } from '@/dto/auth/login-user.dto';
import { CredentialsDto } from '@/dto/auth/credentials.dto';
import { RegisterUserDto } from '@/dto/auth/register-user.dto';
import { UserDto } from '@/dto/auth/user.dto';

export class AuthService {
  /**
   * Авторизация пользователя
   * @param {CreatedUser} createdUser - веденные данные пользователя
   */
  static async login(createdUser: CreatedUser) {
    const loginUserDto: LoginUserDto = {
      login: createdUser.login,
      password: createdUser.password,
    };

    try {
      const credentials: CredentialsDto = (await axiosInstance.post('/auth/login', loginUserDto)).data;
      await store.dispatch('setToken', credentials.accessToken);

      if (credentials.profileAvatar) {
        await store.dispatch('setProfileAvatar', credentials.profileAvatar);
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status == 401) {
          throw new Error('Пользователь не найден');
        }
      }

      throw e;
    }
  }

  /**
   * Регистрация нового пользователя
   * @param {CreatedUser} createdUser - веденные данные пользователя
   */
  static async register(createdUser: CreatedUser) {
    const registerUserDto: RegisterUserDto = {
      login: createdUser.login,
      password: createdUser.password,
      email: createdUser.email,
    };

    try {
      const credentials: CredentialsDto = (await axiosInstance.post('/auth/register', registerUserDto)).data;
      await store.dispatch('setToken', credentials.accessToken);

      if (createdUser.avatar && credentials.accessToken) {
        credentials.profileAvatar = await this.addProfileAvatar(createdUser.avatar);
        await store.dispatch('setProfileAvatar', credentials.profileAvatar);
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status == 409) {
          throw new Error('Пользователь уже существует');
        } else if (e.response?.status == 406) {
          throw new Error('Пароли не совпадают');
        }
      }

      throw e;
    }
  }

  /**
   * Добавление аватара пользователю
   * @param {Blob} file - загруженный файл пользователя. (из input)
   */
  static async addProfileAvatar(file: Blob): Promise<string> {
    const formData = new FormData();

    formData.append('file', file);

    const res = await axiosInstance.post('/auth/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data', ...getAuthConfig() } });
    return res.data;
  }

  /**
   * Получение url к файлу аватара пользователя
   * @param {String} name
   * @returns {string} - сгенерированная ссылка к изображению аватара пользователя
   */
  static getProfileAvatarUrl(name: string): string {
    return `${axiosInstance.defaults.baseURL}/auth/profile/avatar/${name}`;
  }

  /**
   * Получение данных пользователя. (напр. id, логин, аватар)
   * @param id - id пользователя
   * @returns {UserDto} - данные про пользователя
   */
  static async getProfileById(id: string): Promise<UserDto> {
    const res = await axiosInstance.get<UserDto>(`/auth/profile/user/${id}`);
    return res.data;
  }
}
