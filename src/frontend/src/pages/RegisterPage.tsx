import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Lock, Mail, User, Eye, EyeOff, Utensils, Shield, Star } from 'lucide-react';

export default function RegisterPage() {
    const navigate = useNavigate();

    // Stany formularza
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // NOWY STAN: Wybór roli (domyślnie 'Default')
    const [selectedRole, setSelectedRole] = useState<'Default' | 'Premium' | 'Admin'>('Default');
    
    // Stany UI
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Hasła nie są identyczne.');
            return;
        }

        setIsLoading(true);

        try {
            await apiClient.post('/auth/register', {
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                role: selectedRole // Przekazujemy rolę wybraną z kafelków
            });

            navigate('/login', { state: { message: `Konto z rolą ${selectedRole} zostało utworzone! Możesz się zalogować.` } });
        } catch (err: any) {
            if (err.response?.data?.title) {
                setError(err.response.data.title);
            } else if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Nie udało się zarejestrować. Sprawdź poprawność danych.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8">
            <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
                
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Utensils className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
                        Dołącz do nas
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Zarejestruj nowe konto w systemie
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    
                    {/* --- WYBÓR ROLI (KAFELKI) --- */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Wybierz rolę (Tryb testowy)</label>
                        <div className="grid grid-cols-3 gap-3">
                            {/* Kafelek Default */}
                            <button
                                type="button"
                                onClick={() => setSelectedRole('Default')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    selectedRole === 'Default' 
                                    ? 'bg-slate-700 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10' 
                                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <User className="h-5 w-5 mb-1" />
                                <span className="text-xs font-semibold">Default</span>
                            </button>

                            {/* Kafelek Premium */}
                            <button
                                type="button"
                                onClick={() => setSelectedRole('Premium')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    selectedRole === 'Premium' 
                                    ? 'bg-slate-700 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/10' 
                                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <Star className="h-5 w-5 mb-1" />
                                <span className="text-xs font-semibold">Premium</span>
                            </button>

                            {/* Kafelek Admin */}
                            <button
                                type="button"
                                onClick={() => setSelectedRole('Admin')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    selectedRole === 'Admin' 
                                    ? 'bg-slate-700 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10' 
                                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <Shield className="h-5 w-5 mb-1" />
                                <span className="text-xs font-semibold">Admin</span>
                            </button>
                        </div>
                    </div>
                    {/* --------------------------- */}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Imię</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-600 rounded-xl bg-slate-900 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                    placeholder="Jan"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Nazwisko</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-600 rounded-xl bg-slate-900 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                    placeholder="Kowalski"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Adres E-mail</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-slate-600 rounded-xl bg-slate-900 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                placeholder="jan.kowalski@restauracja.pl"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Hasło</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-2.5 border border-slate-600 rounded-xl bg-slate-900 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                placeholder="••••••••"
                            />
                            <button
                                type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Powtórz Hasło</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full pl-10 pr-10 py-2.5 border border-slate-600 rounded-xl bg-slate-900 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit" disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Tworzenie konta...' : 'Zarejestruj się'}
                    </button>
                    
                    <div className="text-center mt-4">
                        <Link to="/login" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                            Masz już konto? Zaloguj się.
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}