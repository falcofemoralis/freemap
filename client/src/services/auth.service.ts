import { AxiosError } from 'axios';
import { FileType } from '../constants/file.type';
import { errorStore } from '../store/error.store';
import { IUser } from '../types/IUser';
import { axiosInstance, headers } from './index';

export default class AuthService {
    private static API_URL = '/auth';

    /**
     * Регистрация нового пользователя
     * @returns token
     */
    static async register(username: string, email: string, password: string, isMailing: boolean, userColor: string): Promise<string> {
        const createUserDto = { username, password, email, isMailing, userColor };

        try {
            const { data } = await axiosInstance.post<string>(`${AuthService.API_URL}/register`, createUserDto);
            return data;
        } catch (e: AxiosError | unknown) {
            errorStore.errorHandle(e);
            throw e;
        }
    }

    /**
     * Авторизация пользователя
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

    static async getUserProfile(): Promise<IUser> {
        try {
            const { data } = await axiosInstance.get<IUser>(`${AuthService.API_URL}/profile/user`, { headers: headers() });
            return data;
        } catch (e: AxiosError | unknown) {
            errorStore.errorHandle(e);
            throw e;
        }
    }

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

    static getUserAvatar(avatar?: string, type?: FileType): string {
        if (!avatar) {
            return '';
        }
        return `${axiosInstance.defaults.baseURL}${AuthService.API_URL}/profile/avatar/${avatar}${type ? `?type=${type}` : ''}`;
    }
}
