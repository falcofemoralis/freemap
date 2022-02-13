// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AxiosError } from 'axios';
import { makeAutoObservable } from 'mobx';
import AuthService from '../services/auth.service';
import { errorStore } from './error.store';

const TOKEN_ITEM = 'token';

class AuthStore {
    token: string | null = null;

    constructor() {
        makeAutoObservable(this);
        this.token = localStorage.getItem(TOKEN_ITEM);
    }

    public async tryRegister(username: string, email: string, password: string) {
        this.setToken(await AuthService.register(username, email, password));
    }

    public async tryLogin(email: string, password: string) {
        this.setToken(await AuthService.login(email, password));
    }

    private setToken(token: string) {
        localStorage.setItem(TOKEN_ITEM, token);
        this.token = token;
    }

    public clearToken() {
        localStorage.removeItem('token');
        this.token = null;
    }

    get isAuth(): boolean {
        return this.token != null && this.token.trim() != '';
    }
}

export const authStore = new AuthStore();
