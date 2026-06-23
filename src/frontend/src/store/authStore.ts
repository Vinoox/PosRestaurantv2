import { create } from 'zustand';

interface AuthState {
    token: string | null;
    userId: string | null;
    isAuthenticated: boolean;
    setAuth: (token: string, userId: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('jwt_token'),
    userId: localStorage.getItem('user_id'),
    isAuthenticated: !!localStorage.getItem('jwt_token'),
    
    setAuth: (token: string, userId: string) => {
        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user_id', userId);
        set({ token, userId, isAuthenticated: true });
    },
    
    logout: () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_id');
        set({ token: null, userId: null, isAuthenticated: false });
    }
}));