import { AxiosError } from 'axios';
import { errorStore } from '../store/error.store';
import { IUser } from '../types/IUser';
import { axiosInstance, headers } from './index';

export default class AuthService {
  private static API_URL = '/auth';

  /**
   * Sign up
   * @returns token
   */
  static async register(username: string, email: string, password: string, isMailing: boolean): Promise<string> {
    const createUserDto = { username, password, email, isMailing };

    try {
      const { data } = await axiosInstance.post<string>(`${AuthService.API_URL}/register`, createUserDto);
      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }

  /**
   * Sign in
   * @returns token
   */
  static async login(email: string, password: string): Promise<string> {
    const loginUserDto = { email, password };

    try {
      const { data } = await axiosInstance.post<string>(`${AuthService.API_URL}/login`, loginUserDto);
      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }

  /**
   * Sign in via google
   * @param tokenId
   * @returns token
   */
  static async googleLogin(tokenId: string) {
    try {
      const { data } = await axiosInstance.post<string>(`${AuthService.API_URL}/google`, { tokenId });
      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }

  /**
   * Get user profile
   * @returns user
   */
  static async getUserProfile(): Promise<IUser> {
    try {
      const { data } = await axiosInstance.get<IUser>(`${AuthService.API_URL}/profile/user`, { headers: headers() });
      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }

  /**
   * Send new user avatar
   * @param file
   * @returns image uri
   */
  static async updateUserAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const { data } = await axiosInstance.put<string>(`${AuthService.API_URL}/profile/user/avatar`, formData, {
        headers: headers()
      });
      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }
}
