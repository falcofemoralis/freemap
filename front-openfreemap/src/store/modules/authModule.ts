import { Actions, Getters, Module, Mutations } from 'vuex-smart-module';
import store from '@/store';

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
  SET_TOKEN(token: string) {
    localStorage.setItem(TOKEN_ITEM, token);
    this.state.token = token;
  }
}

class AuthActions extends Actions<AuthState,
  AuthGetters,
  AuthMutations,
  AuthActions> {

  setToken(token: string) {
    store.commit('SET_TOKEN', token);
  }
}

export const authModule = new Module({
  namespaced: false,
  state: AuthState,
  getters: AuthGetters,
  mutations: AuthMutations,
  actions: AuthActions
});
