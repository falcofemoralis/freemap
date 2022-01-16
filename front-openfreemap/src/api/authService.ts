import { CreatedUser } from '@/types/CreatedUser';
import { axiosInstance } from '@/api/index';
import { UserDto } from '../../../shared/dto/auth/user.dto';
import axios from 'axios';

export class AuthService {
  static async login(createdUser: CreatedUser): Promise<string> {
    const userDto: UserDto = {
      login: createdUser.login,
      password: createdUser.password
    };

    try {
      const res = await axiosInstance.post('/auth/login/', userDto);
      return res.data.accessToken;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status == 401) {
          throw new Error('Пользователь не найден');
        }
      }

      throw e;
    }
  }

  static async register(createdUser: CreatedUser): Promise<string> {
    const userDto: UserDto = {
      login: createdUser.login,
      password: createdUser.password,
      email: createdUser.email
    };

    try {
      const res = await axiosInstance.post('/auth/register/', userDto);
      return res.data.accessToken;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status == 409) {
          throw new Error('Пользователь уже существует');
        }
      }

      throw e;
    }
  }
}
