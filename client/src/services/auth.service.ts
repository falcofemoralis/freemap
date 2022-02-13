import { axiosInstance } from './index';
import { AxiosError } from 'axios';
import { errorStore } from '../store/error.store';

export default class AuthService {
    private static API_URL = '/auth';

    /**
     * Регистрация нового пользователя
     * @returns token
     */
    static async register(username: string, email: string, password: string): Promise<string> {
        const createUserDto = { username, password, email };

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
}
