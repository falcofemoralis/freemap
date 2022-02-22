// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { makeAutoObservable } from 'mobx';
import AuthService from '../services/auth.service';
import { IUser } from './../types/IUser';

const TOKEN_ITEM = 'token';

class AuthStore {
    token: string | null = null;
    user: IUser | null;

    constructor() {
        makeAutoObservable(this, {}, { deep: true });
        this.token = localStorage.getItem(TOKEN_ITEM);
    }

    public async tryRegister(username: string, email: string, password: string, isMailing: boolean, userColor: string) {
        const token = await AuthService.register(username, email, password, isMailing, userColor);
        this.setToken(token);
    }

    public async tryLogin(email: string, password: string) {
        const token = await AuthService.login(email, password);
        this.setToken(token);
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

    public async getUserProfile() {
        const user = await AuthService.getUserProfile();
        console.log(user);

        this.user = user;
    }

    public async updateUserAvatar(file: File) {
        const filename = await AuthService.updateUserAvatar(file);
        if (this.user) this.user.userAvatar = filename;
    }

    public logOut() {
        this.clearToken();
    }
}

export const authStore = new AuthStore();
