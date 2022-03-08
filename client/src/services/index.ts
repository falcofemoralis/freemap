import axios from 'axios';
import { authStore } from '../store/auth.store';

export const axiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_SERVER_URL}/api`
});

export const headers = () => {
  return {
    Authorization: `Bearer ${authStore.token ?? ''}`
  };
};

export const MAP_SOCKET = `${process.env.REACT_APP_SERVER_URL}/map`;
