import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_DOMAIN + '/api'
});

export function getConfig(token: string): any {
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
}