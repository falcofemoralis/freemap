import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_DOMAIN + '/api'
})