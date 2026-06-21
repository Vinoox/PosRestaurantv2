import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { extractJwt } from '../utils/jwt';
import { User, Building2, Plus, LogOut, MapPin, ChevronRight, ShieldCheck, X, Settings } from 'lucide-react';

interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface Restaurant {
    id: string;
    name: string;
    address: string | null;
    taxId: string | null;
    role?: string | null;
}

export default function HomePage() {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newRestName, setNewRestName] = useState('');
    const [newRestAddress, setNewRestAddress] = useState('');
    const [newRestTaxId, setNewRestTaxId] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [userResponse, restaurantsResponse] = await Promise.all([
                    apiClient.get<UserProfile>('/users/me'),
                    apiClient.get<any[]>('/restaurants')
                ]);

                setProfile(userResponse.data);
                
                // ACL Guard dla listy lokali
                const normalizedRests: Restaurant[] = restaurantsResponse.data.map(r => ({
                    id: r.id || r.Id || '',
                    name: r.name || r.Name || 'Lokal nienazwany',
                    address: r.address || r.Address || null,
                    taxId: r.taxId || r.TaxId || null,
                    role: r.role || r.userRole || r.roleName || r.Role || 'Pracownik'
                }));

                setRestaurants(normalizedRests);
            } catch (err) {
                console.error("Błąd pobierania pulpitu:", err);
                setError("Błąd autoryzacji: Nie udało się połączyć z usługą tożsamości.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleSelectRestaurant = async (restaurantId: string) => {
        try {
            const res = await apiClient.post('/auth/select-restaurant', { restaurantId });
            const scopedToken = extractJwt(res.data);
            if (scopedToken) {
                useAuthStore.getState().login(scopedToken);
                navigate('/pos');
            } else {
                alert("Błąd: Serwer potwierdził wejście, ale nie wygenerował klucza sesji.");
            }
        } catch (err) {
            alert("Odmowa dostępu do kasy POS.");
        }
    };

    const handleManageRestaurant = async (e: React.MouseEvent, restaurantId: string) => {
        e.stopPropagation();
        try {
            const res = await apiClient.post('/auth/select-restaurant', { restaurantId });
            const scopedToken = extractJwt(res.data);
            if (scopedToken) {
                useAuthStore.getState().login(scopedToken);
                navigate(`/restaurants/${restaurantId}/manage`);
            } else {
                throw new Error("Brak Scoped JWT.");
            }
        } catch (err: any) {
            alert(err.response?.data?.detail || "Odmowa dostępu: Brak uprawnień menedżerskich w tym lokalu.");
        }
    };

    const handleCreateRestaurantSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);
        if (!newRestName.trim()) return;

        setIsCreating(true);
        try {
            await apiClient.post('/restaurants', {
                name: newRestName.trim(),
                address: newRestAddress.trim() || null,
                taxId: newRestTaxId.trim() || null
            });

            window.location.reload(); // Najzdrowszy reset po utworzeniu dzierżawy
        } catch (err: any) {
            setModalError(err.response?.data?.detail || "Nie udało się zarejestrować lokalu.");
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400 font-mono text-sm animate-pulse">Ładowanie profilu dzierżawy...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* WIZYTÓWKA */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Witaj, {profile?.firstName} {profile?.lastName}!</h1>
                            <span className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> {profile?.email}</span>
                        </div>
                    </div>
                    <button onClick={() => { logout(); navigate('/login'); }} className="px-5 py-2.5 bg-slate-700/50 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-500/30">
                        <LogOut className="h-3.5 w-3.5 inline mr-1.5" /> Wyloguj się
                    </button>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-bold">{error}</div>}

                {/* SIATKA LOKALI */}
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Building2 className="h-5 w-5 text-indigo-400" /> Wybierz punkt kasowy</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {restaurants.map((rest) => {
                            const roleUpper = (rest.role || '').toUpperCase();
                            const isManager = roleUpper.includes('MANAGER') || roleUpper.includes('ADMIN');

                            return (
                                <div 
                                    key={rest.id} onClick={() => handleSelectRestaurant(rest.id)}
                                    className="bg-slate-800 border border-slate-700 rounded-3xl p-6 cursor-pointer hover:border-emerald-500 hover:shadow-2xl transition-all flex flex-col justify-between h-52 relative overflow-hidden group"
                                >
                                    <div className="absolute top-5 right-5 flex items-center gap-1.5 z-10">
                                        {isManager && (
                                            <button
                                                type="button" onClick={(e) => handleManageRestaurant(e, rest.id)}
                                                className="p-2 bg-slate-700 hover:bg-amber-500 text-slate-300 hover:text-slate-950 rounded-full transition-all shadow-md"
                                                title="Zarządzaj (ERP)"
                                            >
                                                <Settings className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-slate-900 text-emerald-400 border border-slate-700">
                                            {rest.role}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-white pr-28 line-clamp-2 leading-snug">{rest.name}</h3>
                                        {rest.address && <p className="text-xs text-slate-400 mt-2 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500 mt-0.5" /> {rest.address}</p>}
                                    </div>

                                    <div className="pt-4 border-t border-slate-700/60 flex justify-between items-center text-xs font-mono text-slate-500">
                                        <span>{rest.taxId ? `NIP: ${rest.taxId}` : 'POS Ready'}</span>
                                        <span className="text-emerald-400 font-sans font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">Kasa POS <ChevronRight className="h-3.5 w-3.5" /></span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* DODAJ */}
                        <div onClick={() => setIsCreateModalOpen(true)} className="bg-slate-800/40 border-2 border-dashed border-slate-700 rounded-3xl p-6 cursor-pointer hover:border-emerald-500 transition-all flex flex-col items-center justify-center text-center h-52 group">
                            <div className="h-12 w-12 rounded-full bg-slate-700 group-hover:bg-emerald-500/20 flex items-center justify-center mb-3 transition-colors"><Plus className="h-6 w-6 text-slate-400 group-hover:text-emerald-400" /></div>
                            <span className="font-bold text-sm text-slate-300 group-hover:text-emerald-400">Nowy punkt gastronomiczny</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL TWORZENIA */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-7 space-y-5 shadow-2xl relative">
                        <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Building2 className="h-5 w-5 text-emerald-400" /> Rejestracja Lokalu</h3>
                        {modalError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center font-bold">{modalError}</div>}
                        <form onSubmit={handleCreateRestaurantSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Nazwa lokalu *</label>
                                <input type="text" required value={newRestName} onChange={e => setNewRestName(e.target.value)} placeholder="np. Trattoria Bella" className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Adres fizyczny</label>
                                <input type="text" value={newRestAddress} onChange={e => setNewRestAddress(e.target.value)} placeholder="Rynek 12, Wrocław" className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">NIP roboczy</label>
                                <input type="text" value={newRestTaxId} onChange={e => setNewRestTaxId(e.target.value)} placeholder="8971122334" className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 bg-slate-700 text-slate-200 rounded-xl text-xs font-bold">Anuluj</button>
                                <button type="submit" disabled={isCreating} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20">Zapisz lokal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}