import { useState } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { extractJwt } from '../utils/jwt';
import { Lock, Mail, Eye, EyeOff, Utensils, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    
    // Pobieramy nową, poprawną funkcję setAuth ze store'a
    const setAuth = useAuthStore((state) => state.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(searchParams.get('expired') ? 'Sesja wygasła. Zaloguj się ponownie.' : null);
    const [isLoading, setIsLoading] = useState(false);

    const successMessage = location.state?.message;

    // Obsługa tradycyjnego logowania (E-mail + Hasło)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const response = await apiClient.post('/auth/login', { email, password });
            const token = extractJwt(response.data);
            
            // Pobieramy userId nadesłane z backendu (w zależności od struktury Twojego Dto)
            const userId = response.data?.userId || response.data?.Id || '';

            if (token) {
                // POPRAWKA: Używamy prawidłowej metody setAuth i przekazujemy token oraz userId
                setAuth(token, userId);
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

    // Obsługa logowania przez Google (OAuth 2.0)
    const handleGoogleSuccess = async (credentialResponse: any) => {
        setError(null);
        setIsLoading(true);
        
        try {
            const response = await apiClient.post('/auth/google', {
                idToken: credentialResponse.credential
            });
            
            const token = extractJwt(response.data);
            const userId = response.data?.userId || response.data?.Id || '';
            
            if (token) {
                setAuth(token, userId);
                navigate('/home');
            } else {
                setError('Błąd autoryzacji zewnętrznej Google.');
            }
        } catch (err: any) {
            console.error("Błąd logowania Google:", err);
            setError('Nie udało się zalogować przez Google. Upewnij się, że Twoje konto jest aktywne.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 font-sans">
            <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
                
                {/* ORYGINALNY NAGŁÓWEK STRONY */}
                <div className="text-center">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Utensils className="h-7 w-7" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">PosRestaurant</h2>
                    <p className="mt-2 text-xs text-slate-400 font-mono">Platforma Zarządzania Gastronomią</p>
                </div>

                {successMessage && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs text-center font-bold animate-in fade-in">{successMessage}</div>}
                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs text-center font-bold animate-in fade-in">{error}</div>}

                {/* FORMULARZ TRADYCYJNY */}
                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Adres E-mail</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <Mail className="h-4 w-4" />
                                </div>
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
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 border border-slate-700 rounded-xl bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                                    placeholder="••••••••"
                                />
                                {/* W PEŁNI PRZYWRÓCONY PODGLĄD HASŁA */}
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full py-3 px-4 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Uwierzytelnianie...</span>
                            </>
                        ) : 'Zaloguj się'}
                    </button>

                    <div className="text-center pt-4 border-t border-slate-700/60">
                        <p className="text-xs text-slate-400">
                            Nie masz jeszcze konta?{' '}
                            <Link to="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                                Zarejestruj się.
                            </Link>
                        </p>
                    </div>
                </form>

                {/* DYSKRETNY SEPARATOR DLA OAUTH 2.0 */}
                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-700/60"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">LUB</span>
                    <div className="flex-grow border-t border-slate-700/60"></div>
                </div>

                {/* BEZPIECZNY PRZYCISK GOOGLE IDEALNIE WPASOWANY W STYL */}
                <div className="flex justify-center mt-2 pointer-events-auto min-h-[40px]">
                    {isLoading ? (
                        <div className="h-10 bg-slate-900 rounded-xl w-full flex items-center justify-center border border-slate-700">
                             <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                        </div>
                    ) : (
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Logowanie Google zostało przerwane.')}
                            theme="filled_black"
                            shape="pill"
                            text="continue_with"
                        />
                    )}
                </div>

            </div>
        </div>
    );
}