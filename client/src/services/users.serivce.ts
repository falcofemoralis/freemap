import { ILvl } from '../types/ILvl';
import { axiosInstance, headers } from './index';

export default class UsersService {
    private static API_URL = '/users';

    static async getUserExp(): Promise<ILvl> {
        const { data } = await axiosInstance.get<ILvl>(`${this.API_URL}/profile/user/experience`, { headers: headers() });
        return data;
    }
}
