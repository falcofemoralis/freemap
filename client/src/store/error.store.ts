import axios, { AxiosError } from 'axios';
import { makeAutoObservable } from 'mobx';
import { authStore } from './auth.store';

class ErrorStore {
  public message?: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  errorHandle(e: AxiosError | unknown) {
    if (axios.isAxiosError(e)) {
      const error = e as AxiosError<{ message: string }>;
      this.message = error.response?.data?.message;
      console.log(this.message);

      if (error.response?.status === 401) {
        authStore.clearToken();
      }
    } else {
      console.log('not axios error');
      console.log(e);
    }
  }
}

export const errorStore = new ErrorStore();
