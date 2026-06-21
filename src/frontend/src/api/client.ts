import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';

export const apiClient = axios.create({
    baseURL: 'http://localhost:5050/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Strażnik wygasłych sesji: Automatyczne wylogowanie przy błędzie 401
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('jwt_token');
            window.location.href = '/login?expired=1';
        }
        return Promise.reject(error);
    }
);