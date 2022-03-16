// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AxiosError } from 'axios';
import { errorStore } from '../store/error.store';
import { ILvl } from '../types/ILvl';
import { axiosInstance, headers } from './index';

export default class UsersService {
  private static API_URL = '/users';

  static async getUserExp(): Promise<ILvl> {
    try {
      const { data } = await axiosInstance.get<ILvl>(`${this.API_URL}/profile/user/experience`, { headers: headers() });
      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }
}
