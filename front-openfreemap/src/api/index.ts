import axios from 'axios';
import store from '@/store/index';

export const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_DOMAIN + '/api',
});

export function getAuthConfig(): any {
  return {
    Authorization: `Bearer ${store.getters.getToken}`,
  };
}