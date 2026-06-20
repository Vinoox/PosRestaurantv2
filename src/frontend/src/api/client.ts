import axios, { type InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:5050/api', 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Wprowadzamy jawne typowanie parametru wejściowego config
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token');
    
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});