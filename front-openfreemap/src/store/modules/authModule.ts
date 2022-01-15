import { Actions, Getters, Module, Mutations } from 'vuex-smart-module';
import { axiosInstance } from '@/api';
import { UserDto } from '../../../../shared/dto/auth/user.dto';
import { User } from '@/types/User';

const TOKEN_ITEM = 'token';

// https://github.com/ktsn/vuex-smart-module
class AuthState {
  token: string | null = localStorage.getItem(TOKEN_ITEM);
}

class AuthGetters extends Getters<AuthState> {
  get getToken(): string | null {
    return this.state.token;
  }

  get isTokenValid(): boolean {
    return (this.state.token != null && this.state.token.trim() != '');
  }
}

class AuthMutations extends Mutations<AuthState> {
  setToken(token: string) {
    localStorage.setItem(TOKEN_ITEM, token);
    this.state.token = token;
  }
}

class AuthActions extends Actions<AuthState,
  AuthGetters,
  AuthMutations,
  AuthActions> {

  async register(createdUser: User) {
    if (createdUser.login && createdUser.password) {
      const userDto: UserDto = {
        login: createdUser.login,
        password: createdUser.password
      };
      const res = await axiosInstance.post('/auth/register/', userDto);

      this.commit('setToken', res.data.accessToken);
    }
  }

  async login(createdUser: User) {
    if (createdUser.login && createdUser.password) {
      const userDto: UserDto = {
        login: createdUser.login,
        password: createdUser.password
      };
      const res = await axiosInstance.post('/auth/login/', userDto);

      this.commit('setToken', res.data.accessToken);
    }
  }
}

export const authModule = new Module({
  namespaced: false,
  state: AuthState,
  getters: AuthGetters,
  mutations: AuthMutations,
  actions: AuthActions
});
