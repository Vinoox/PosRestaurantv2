import { type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ManageRestaurantPage from './pages/ManageRestaurant/ManageRestaurantPage';
import PosPage from './pages/PosPage';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const GuestOnlyRoute = ({ children }: { children: ReactNode }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    return !isAuthenticated ? <>{children}</> : <Navigate to="/home" replace />;
};

export default function App() {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
                
                <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
                <Route path="/register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />
                
                <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/restaurants/:restaurantId/manage" element={<ProtectedRoute><ManageRestaurantPage /></ProtectedRoute>} />
                <Route path="/pos" element={<ProtectedRoute><PosPage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

                <Route path="*" element={
                    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white font-sans">
                        <span className="text-xs font-mono text-amber-400 px-3 py-1 bg-amber-400/10 rounded-full border border-amber-400/20 mb-3 font-bold">404</span>
                        <h1 className="text-3xl font-bold">Taki stolik nie istnieje</h1>
                        <a href="/" className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all">Wróć do recepcji</a>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    );
}