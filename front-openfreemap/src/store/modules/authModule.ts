import { Actions, Getters, Module, Mutations } from 'vuex-smart-module';

const TOKEN_ITEM = 'token';
const PROFILE_AVATAR = 'profile_avatar';

// https://github.com/ktsn/vuex-smart-module
class AuthState {
  token: string | null = localStorage.getItem(TOKEN_ITEM);
  profileAvatar: string | null = localStorage.getItem(PROFILE_AVATAR);
}

class AuthGetters extends Getters<AuthState> {
  get getToken(): string | null {
    return this.state.token;
  }

  get isTokenValid(): boolean {
    return (this.state.token != null && this.state.token.trim() != '');
  }

  get getProfileAvatar(): string | null {
    return this.state.profileAvatar;
  }
}

class AuthMutations extends Mutations<AuthState> {
  SET_TOKEN(token: string) {
    localStorage.setItem(TOKEN_ITEM, token);
    this.state.token = token;
  }

  SET_PROFILE_AVATAR(img: string) {
    localStorage.setItem(PROFILE_AVATAR, img);
    this.state.profileAvatar = img;
  }
}

class AuthActions extends Actions<AuthState,
  AuthGetters,
  AuthMutations,
  AuthActions> {

  setToken(token: string) {
    this.commit('SET_TOKEN', token);
  }

  setProfileAvatar(token: string) {
    this.commit('SET_PROFILE_AVATAR', token);
  }
}

export const authModule = new Module({
  namespaced: false,
  state: AuthState,
  getters: AuthGetters,
  mutations: AuthMutations,
  actions: AuthActions
});
