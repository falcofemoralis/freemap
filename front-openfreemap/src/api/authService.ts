import { CreatedUser } from '@/types/CreatedUser';
import { axiosInstance } from '@/api/index';
import { UserDto } from '../../../shared/dto/auth/user.dto';
import axios from 'axios';
import store from '@/store/index';

export class AuthService {
  static async login(createdUser: CreatedUser) {
    const userDto: UserDto = {
      login: createdUser.login,
      password: createdUser.password
    };

    try {
      const res = await axiosInstance.post('/auth/login/', userDto);
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
    const formData = new FormData();
    formData.append('login', createdUser.login);
    formData.append('password', createdUser.password);
    formData.append('email', createdUser.email);
    if (createdUser.avatar) {
      formData.append('avatar', createdUser.avatar);
    }

    try {
      const res = await axiosInstance.post('/auth/register/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await store.dispatch('setToken', res.data.accessToken);
      if (res.data.avatarPath) {
        await store.dispatch('setProfileAvatar', res.data.avatarPath);
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status == 409) {
          throw new Error('Пользователь уже существует');
        }
      }

      throw e;
    }
  }

  static getProfileAvatarUrl(name?: string | null): string | null {
    console.log(name);
    if (name && name != undefined) {
      console.log('123');

      return `${axiosInstance.defaults.baseURL}/auth/profile-avatar/${name}`;
    } else {
      console.log('11');

      return null;
    }
  }
}
