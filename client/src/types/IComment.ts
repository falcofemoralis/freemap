import { IUser } from './IUser';

export interface IComment {
    createdAt: number;
    text: string;
    user: IUser;
    id: string;
}
