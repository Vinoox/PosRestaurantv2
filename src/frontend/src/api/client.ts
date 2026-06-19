import axios from 'axios';

// Tworzymy głównego klienta HTTP. 
// baseURL wskazuje na nasz YARP API Gateway!
export const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: funkcja, która odpala się PRZED każdym wysłaniem zapytania
apiClient.interceptors.request.use((config) => {
    // Pobieramy token z pamięci przeglądarki (Local Storage)
    const token = localStorage.getItem('jwt_token');
    
    // Jeśli mamy token, doklejamy go do nagłówka Authorization
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});