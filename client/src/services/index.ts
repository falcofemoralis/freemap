import axios from 'axios';
import { authStore } from '../store/auth.store';

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:3001' + '/api'
});

export const headers = () => {
    return {
        Authorization: `Bearer ${authStore.token ?? ''}`
    };
};

export const headersJSON = () => {
    return {
        Authorization: `Bearer ${authStore.token ?? ''}`,
        'Content-Type': 'application/json'
    };
};
