import { makeAutoObservable } from 'mobx';
import { Socket } from 'socket.io-client';
import { IActiveUser } from '../types/IActiveUser';

class ActiveUsersStore {
  users: IActiveUser[] = [];
  socket: Socket | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get currentClientId(): string | undefined {
    return this.socket?.id;
  }

  updatesUsers(u: IActiveUser[]) {
    this.users = u;
  }
}

export const activeUsersStore = new ActiveUsersStore();
