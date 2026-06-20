import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { Lock, Mail, Eye, EyeOff, Utensils } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();
    const loginGlobal = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await apiClient.post('/identity/login', {
                email,
                password
            });

            const token = response.data.token || response.data.accessToken;

            if (token) {
                loginGlobal(token);
                navigate('/pos');
            } else {
                setError('Serwer nie zwrócił klucza autoryzacji.');
            }
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Nie udało się połączyć z serwerem. Sprawdź backend.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
                
                {/* Nagłówek i Logo systemu */}
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Utensils className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
                        PosRestaurant
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Zaloguj się do systemu obsługi kelnerskiej
                    </p>
                </div>

                {/* Komunikat o błędzie */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Formularz logowania */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        
                        {/* Pole Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Adres E-mail
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-600 rounded-xl bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                                    placeholder="kelner@restauracja.pl"
                                />
                            </div>
                        </div>

                        {/* Pole Hasło */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Hasło dostępu
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-600 rounded-xl bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Przycisk akcji */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
                        >
                            {isLoading ? 'Uwierzytelnianie...' : 'Zaloguj się'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}