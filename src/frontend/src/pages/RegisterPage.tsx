import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Lock, Mail, User, Eye, EyeOff, Utensils, Shield, Star } from 'lucide-react';

export default function RegisterPage() {
    const navigate = useNavigate();

    // 1. Prawidłowo wyeksportowane i zadeklarowane stany formularza
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Stan wyboru roli roboczej
    const [selectedRole, setSelectedRole] = useState<'Default' | 'Premium' | 'Admin'>('Default');
    
    // 2. Naprawiony stan showPassword (widoczność znaków hasła)
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Podane hasła nie są identyczne.');
            return;
        }

        setIsLoading(true);

        try {
            await apiClient.post('/auth/register', {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                password,
                confirmPassword,
                role: selectedRole
            });

            navigate('/login', { 
                state: { message: `Konto z uprawnieniami [${selectedRole}] zostało utworzone! Możesz się zalogować.` } 
            });
        } catch (err: any) {
            if (err.response?.data?.title) {
                setError(err.response.data.title);
            } else if (err.response?.data?.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Nie udało się zarejestrować. Sprawdź poprawność wprowadzonych danych.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8 font-sans">
            <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
                
                <div className="text-center">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Utensils className="h-7 w-7" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
                        Dołącz do personelu
                    </h2>
                    <p className="mt-2 text-xs text-slate-400 font-mono">
                        Rejestracja w klastrze tożsamości
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    
                    {/* WYBÓR ROLI */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-2">Wybierz rolę (Tryb testowy)</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button" onClick={() => setSelectedRole('Default')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    selectedRole === 'Default' 
                                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10 font-bold' 
                                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <User className="h-5 w-5 mb-1" />
                                <span className="text-xs">Default</span>
                            </button>

                            <button
                                type="button" onClick={() => setSelectedRole('Premium')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    selectedRole === 'Premium' 
                                    ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/10 font-bold' 
                                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <Star className="h-5 w-5 mb-1" />
                                <span className="text-xs">Premium</span>
                            </button>

                            <button
                                type="button" onClick={() => setSelectedRole('Admin')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    selectedRole === 'Admin' 
                                    ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-md shadow-amber-500/10 font-bold' 
                                    : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <Shield className="h-5 w-5 mb-1" />
                                <span className="text-xs">Admin</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Imię</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><User className="h-4 w-4" /></div>
                                <input
                                    type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                                    placeholder="Jan"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Nazwisko</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><User className="h-4 w-4" /></div>
                                <input
                                    type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                                    placeholder="Kowalski"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Adres E-mail</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Mail className="h-4 w-4" /></div>
                            <input
                                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                className="block w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                                placeholder="jan@restauracja.pl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Hasło</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Lock className="h-4 w-4" /></div>
                                <input
                                    type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                                    className="block w-full pl-9 pr-8 py-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-white">
                                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Powtórz Hasło</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500"><Lock className="h-4 w-4" /></div>
                                <input
                                    type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-9 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit" disabled={isLoading}
                        className="w-full py-3 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 mt-2"
                    >
                        {isLoading ? 'Rejestrowanie...' : 'Utwórz konto'}
                    </button>
                    
                    <div className="text-center pt-2">
                        <Link to="/login" className="text-xs text-emerald-400 hover:underline font-medium transition-colors">
                            Masz już konto? Zaloguj się.
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}