import { useState } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { extractJwt } from '../utils/jwt';
import { Lock, Mail, Eye, EyeOff, Utensils } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const loginGlobal = useAuthStore((state) => state.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(searchParams.get('expired') ? 'Sesja wygasła. Zaloguj się ponownie.' : null);
    const [isLoading, setIsLoading] = useState(false);

    const successMessage = location.state?.message;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const token = extractJwt(response.data);

            if (token) {
                loginGlobal(token);
                navigate('/home');
            } else {
                setError('Błąd struktury klucza sesji. Sprawdź konsolę F12.');
                console.error("Payload C#:", response.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || err.response?.data?.title || 'Nieprawidłowy e-mail lub hasło.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 font-sans">
            <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
                <div className="text-center">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Utensils className="h-7 w-7" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">PosRestaurant</h2>
                    <p className="mt-2 text-xs text-slate-400 font-mono">Platforma Zarządzania Gastronomią</p>
                </div>

                {successMessage && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs text-center font-bold">{successMessage}</div>}
                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs text-center font-bold">{error}</div>}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Adres E-mail</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><Mail className="h-4 w-4" /></div>
                                <input
                                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                                    placeholder="kelner@restauracja.pl"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Hasło dostępu</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500"><Lock className="h-4 w-4" /></div>
                                <input
                                    type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border border-slate-700 rounded-xl bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50">
                        {isLoading ? 'Uwierzytelnianie...' : 'Zaloguj się'}
                    </button>

                    <div className="text-center pt-4 border-t border-slate-700/60">
                        <p className="text-xs text-slate-400">Nie masz jeszcze konta? <Link to="/register" className="font-bold text-emerald-400 hover:text-emerald-300">Zarejestruj się.</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
}