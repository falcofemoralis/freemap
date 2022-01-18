import { CreatedUser } from '@/types/CreatedUser';
import { axiosInstance, getAuthConfig } from '@/api/index';
import { UserDto } from '../../../shared/dto/auth/user.dto';
import { UserDataDto } from '../../../shared/dto/auth/userdata.dto';
import axios from 'axios';
import store from '@/store/index';

export class AuthService {
  static async login(createdUser: CreatedUser) {
    const userDto: UserDto = {
      login: createdUser.login,
      password: createdUser.password,
    };

    try {
      const res = await axiosInstance.post('/auth/login', userDto);
      await store.dispatch('setToken', res.data.accessToken);
      if (res.data.avatarPath) {
        await store.dispatch('setProfileAvatar', res.data.avatarPath);
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

  static async register(createdUser: CreatedUser) {
    const userDto: UserDto = {
      login: createdUser.login,
      password: createdUser.password,
      confirmPassword: createdUser.confirmPassword,
      email: createdUser.email,
    };

    try {
      const res = await axiosInstance.post('/auth/register', userDto);
      await store.dispatch('setToken', res.data.accessToken);

      if (createdUser.avatar) {
        const avatarPath = await this.addProfileAvatar(createdUser.avatar);
        await store.dispatch('setProfileAvatar', avatarPath);
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

  static async addProfileAvatar(file: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axiosInstance.post('/auth/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data', ...getAuthConfig() } });
    return res.data.avatarPath;
  }

  static getProfileAvatarUrl(name: string | null): string | null {
    if (name) {
      return `${axiosInstance.defaults.baseURL}/auth/avatar/${name}`;
    } else {
      return null;
    }
  }

  static async getProfileById(id: number): Promise<UserDataDto> {
    const res = await axiosInstance.get<UserDataDto>(`/auth/profile/${id}`);
    return res.data;
  }
}
