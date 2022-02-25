import { IUser } from './IUser';

export interface IComment {
    id: string;
    createdAt: number;
    text: string;
    user: IUser;
    replies: IComment[];
}
