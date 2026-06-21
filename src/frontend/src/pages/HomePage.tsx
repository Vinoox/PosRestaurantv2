import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
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
    userRole?: string | null;
    roleName?: string | null;
}

const extractJwt = (responseBody: any): string | null => {
    if (!responseBody) return null;
    
    // 1. Gdy C# zwraca surowy tekst (jak przy zwykłym /login)
    if (typeof responseBody === 'string' && responseBody.startsWith('eyJ')) {
        return responseBody;
    }

    // 2. Gdy C# zwraca obiekt JSON (np. { Token: "...", AccessToken: "..." })
    if (typeof responseBody === 'object') {
        // Sprawdzamy najpierw klasyczne warianty nazewnicze
        const t = responseBody.token || responseBody.Token || responseBody.accessToken || responseBody.AccessToken || responseBody.jwt;
        if (t && typeof t === 'string' && t.startsWith('eyJ')) return t;

        // Brutalna siła: przeszukujemy wszystkie wartości w obiekcie w poszukiwaniu "eyJ"
        const foundProp = Object.values(responseBody).find(val => typeof val === 'string' && val.startsWith('eyJ'));
        if (foundProp) return foundProp as string;
    }

    return null;
};

export default function HomePage() {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    // --- STANY GŁÓWNE ---
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- STANY MODALA TWORZENIA RESTAURACJI ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newRestName, setNewRestName] = useState('');
    const [newRestAddress, setNewRestAddress] = useState('');
    const [newRestTaxId, setNewRestTaxId] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    // Pobieranie danych startowych
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [userResponse, restaurantsResponse] = await Promise.all([
                    apiClient.get<UserProfile>('/users/me'),
                    apiClient.get<Restaurant[]>('/restaurants')
                ]);

                setProfile(userResponse.data);
                setRestaurants(restaurantsResponse.data);
            } catch (err) {
                console.error("Błąd pobierania danych:", err);
                setError("Nie udało się załadować pulpitu. Sprawdź połączenie z serwerem.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

// --- NAWIGACJA: TRYB KASY (POS) ---
    const handleSelectRestaurant = async (restaurantId: string) => {
        try {
            const res = await apiClient.post('/auth/select-restaurant', { restaurantId });
            console.log("C# payload (POS):", res.data);

            const scopedToken = extractJwt(res.data);

            if (scopedToken) {
                useAuthStore.getState().login(scopedToken);
                navigate('/pos');
            } else {
                alert("Błąd: Serwer potwierdził wejście, ale nie wygenerował klucza sesji.");
            }
        } catch (err) {
            console.error("Błąd wejścia do POS:", err);
            alert("Odmowa dostępu do kasy POS.");
        }
    };

    // --- NAWIGACJA: TRYB MANAGERA (ZARZĄDZANIE) ---
    const handleManageRestaurant = async (e: React.MouseEvent, restaurantId: string) => {
        e.stopPropagation(); // Blokada propagacji kliknięcia w dół do kafelka POS
        
        try {
            const res = await apiClient.post('/auth/select-restaurant', { restaurantId });
            console.log("C# payload (Manage):", res.data);

            const scopedToken = extractJwt(res.data);

            if (scopedToken) {
                useAuthStore.getState().login(scopedToken);
                navigate(`/restaurants/${restaurantId}/manage`);
            } else {
                // Jeśli serwer zwróci coś dziwnego, wyrzuci to do konsoli w czytelnej formie
                throw new Error(`Brak Scoped JWT. C# zwróciło dokładnie to: ${JSON.stringify(res.data)}`);
            }
        } catch (err: any) {
            console.error("Błąd przełączania kontekstu na managera:", err);
            alert(err.response?.data?.detail || "Odmowa dostępu: Brak uprawnień menedżerskich w tym lokalu.");
        }
    };

    // Obsługa formularza w Modalu
    const handleCreateRestaurantSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError(null);

        if (!newRestName.trim()) {
            setModalError("Nazwa lokalu jest wymagana.");
            return;
        }

        setIsCreating(true);

        try {
            await apiClient.post('/restaurants', {
                name: newRestName.trim(),
                address: newRestAddress.trim() || null,
                taxId: newRestTaxId.trim() || null
            });

            const refreshedList = await apiClient.get<Restaurant[]>('/restaurants');
            setRestaurants(refreshedList.data);

            setNewRestName('');
            setNewRestAddress('');
            setNewRestTaxId('');
            setIsCreateModalOpen(false);

        } catch (err: any) {
            console.error("Błąd tworzenia restauracji:", err);
            setModalError(err.response?.data?.detail || "Nie udało się utworzyć lokalu. Sprawdź dane.");
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-emerald-500 animate-pulse font-semibold text-lg tracking-wide">
                    Wczytywanie pulpitu roboczego...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 relative font-sans">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* --- WIZYTÓWKA UŻYTKOWNIKA --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                            <User className="h-10 w-10" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Witaj, {profile?.firstName} {profile?.lastName}!
                            </h1>
                            <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    {profile?.email}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-700/50 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-xl transition-all font-medium border border-transparent hover:border-red-500/30 active:scale-95"
                    >
                        <LogOut className="h-4 w-4" />
                        Wyloguj się
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {/* --- SIATKA RESTAURACJI --- */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-indigo-400" />
                            Wybierz lokal roboczy
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {restaurants.map((restaurant) => {
                            const rawRole = restaurant.role || restaurant.userRole || restaurant.roleName || 'Pracownik';
                            const displayRole = rawRole.toUpperCase();
                            
                            // Weryfikacja uprawnień zarządczych
                            const isManager = displayRole.includes('MANAGER') || displayRole.includes('ADMIN') || displayRole.includes('LOCALADMIN');

                            let badgeStyle = 'bg-slate-700/80 text-slate-300 border-slate-600';
                            if (displayRole.includes('MANAGER') || displayRole.includes('ADMIN')) {
                                badgeStyle = 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-amber-500/10';
                            } else if (displayRole.includes('KELNER') || displayRole.includes('WAITER')) {
                                badgeStyle = 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 shadow-indigo-500/10';
                            } else if (displayRole.includes('KIEROWNIK') || displayRole.includes('CHEF')) {
                                badgeStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10';
                            }

                            return (
                                <div 
                                    key={restaurant.id}
                                    onClick={() => handleSelectRestaurant(restaurant.id)}
                                    className="group bg-slate-800 border border-slate-700 rounded-3xl p-6 cursor-pointer hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col h-full relative overflow-hidden active:scale-[0.98]"
                                >
                                    {/* --- GÓRNY PASEK: PRZYCISK MANAGERA ORAZ ODZNAKA ROLI --- */}
                                    <div className="absolute top-5 right-5 flex items-center gap-2 z-10">
                                        {isManager && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleManageRestaurant(e, restaurant.id)}
                                                className="p-1.5 bg-slate-700/80 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-full border border-slate-600 hover:border-amber-500/40 transition-all shadow-sm group/btn"
                                                title="Zarządzaj lokalem (Panel Managera)"
                                            >
                                                <Settings className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-90" />
                                            </button>
                                        )}
                                        <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase border shadow-sm backdrop-blur-md transition-transform duration-200 group-hover:scale-105 ${badgeStyle}`}>
                                            {displayRole}
                                        </span>
                                    </div>

                                    {/* Zwiększony padding pr-36 uodparnia nagłówek na kolizję z ikoną i odznaką */}
                                    <h3 className="text-xl font-bold text-white mb-3 pr-36 line-clamp-2 leading-tight">
                                        {restaurant.name}
                                    </h3>
                                    
                                    {restaurant.address && (
                                        <div className="flex items-start gap-2 text-sm text-slate-400 mt-2">
                                            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-slate-500" />
                                            <span className="line-clamp-2">{restaurant.address}</span>
                                        </div>
                                    )}
                                    
                                    <div className="mt-auto pt-6 flex items-center justify-between text-xs text-slate-500 font-mono">
                                        <span>{restaurant.taxId ? `NIP: ${restaurant.taxId}` : 'Brak NIP'}</span>
                                        <div className="flex items-center gap-1 text-indigo-400 font-sans font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span>Kasa POS</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Kafelek Akcji: Dodaj nową restaurację */}
                        <div 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-3xl p-6 cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all flex flex-col items-center justify-center text-center min-h-[200px] group active:scale-[0.98]"
                        >
                            <div className="h-14 w-14 rounded-full bg-slate-700 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors mb-4">
                                <Plus className="h-6 w-6 text-slate-400 group-hover:text-emerald-400" />
                            </div>
                            <h3 className="text-base font-bold text-slate-300 group-hover:text-emerald-400 transition-colors">
                                Zarejestruj nowy lokal
                            </h3>
                            <p className="text-sm text-slate-500 mt-2 max-w-[200px]">
                                Utwórz nową instancję kasy
                            </p>
                        </div>

                    </div>
                </div>

            </div>

            {/* --- MODAL TWORZENIA LOKALU --- */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative space-y-6">
                        
                        <button 
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-emerald-400" />
                                Nowa Restauracja
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Wprowadź podstawowe dane lokalu.
                            </p>
                        </div>

                        {modalError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
                                {modalError}
                            </div>
                        )}

                        <form onSubmit={handleCreateRestaurantSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Nazwa lokalu <span className="text-emerald-400">*</span>
                                </label>
                                <input 
                                    type="text" required
                                    value={newRestName} onChange={e => setNewRestName(e.target.value)}
                                    placeholder="np. PosRestaurant Central"
                                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Adres fizyczny (opcjonalnie)
                                </label>
                                <input 
                                    type="text"
                                    value={newRestAddress} onChange={e => setNewRestAddress(e.target.value)}
                                    placeholder="np. ul. Grunwaldzka 42, Wrocław"
                                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Numer NIP (opcjonalnie)
                                </label>
                                <input 
                                    type="text"
                                    value={newRestTaxId} onChange={e => setNewRestTaxId(e.target.value)}
                                    placeholder="np. 8971234567"
                                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit" disabled={isCreating}
                                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-emerald-600/20"
                                >
                                    {isCreating ? 'Tworzenie...' : 'Zarejestruj lokal'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}