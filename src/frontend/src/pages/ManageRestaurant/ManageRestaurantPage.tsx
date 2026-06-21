import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import EmployeesTab from './components/EmployeesTab';
import RolesTab from './components/RolesTab';
import MenuTab from './components/MenuTab';
import { 
    Building2, Users, Shield, Utensils, BarChart3, Settings, ChevronLeft 
} from 'lucide-react';

interface RestaurantInfo {
    id: string;
    name: string;
}

type TabType = 'employees' | 'roles' | 'menu' | 'analytics' | 'settings';

export default function ManageRestaurantPage() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<TabType>('employees');
    const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);

    useEffect(() => {
        if (restaurantId) {
            apiClient.get<RestaurantInfo>(`/restaurants/${restaurantId}`)
                .then(res => setRestaurant(res.data))
                .catch(err => console.error("Błąd pobierania nagłówka lokalu:", err));
        }
    }, [restaurantId]);

    if (!restaurantId) {
        return <div className="p-12 text-red-400">Brak identyfikatora restauracji w adresie URL.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
            
            {/* --- LEWA KOLUMNA: SIDEBAR (NAWIGACJA ZAKŁADEK) --- */}
            <aside className="w-full md:w-64 bg-slate-800 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col shrink-0">
                {/* Nagłówek i powrót */}
                <div className="p-6 border-b border-slate-700/80 space-y-4">
                    <button
                        onClick={() => navigate('/home')}
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Wszystkie lokale</span>
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                            <h1 className="font-extrabold text-white text-base truncate">
                                {restaurant ? restaurant.name : 'Ładowanie...'}
                            </h1>
                            <span className="text-xs text-emerald-400 font-mono font-semibold">ERP Admin</span>
                        </div>
                    </div>
                </div>

                {/* Lista Zakładek */}
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto flex md:block overflow-x-auto md:overflow-x-hidden">
                    <button
                        onClick={() => setActiveTab('employees')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 md:shrink ${
                            activeTab === 'employees'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        <span>Kadry i Zespół</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 md:shrink ${
                            activeTab === 'roles'
                            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
                        }`}
                    >
                        <Shield className="h-4 w-4" />
                        <span>Stanowiska (RBAC)</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 md:shrink ${
                            activeTab === 'menu'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/5'
                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
                        }`}
                    >
                        <Utensils className="h-4 w-4" />
                        <span>Karta Menu</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 md:shrink ${
                            activeTab === 'analytics'
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
                        }`}
                    >
                        <BarChart3 className="h-4 w-4" />
                        <span>Raporty i Puls</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 md:shrink ${
                            activeTab === 'settings'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-lg shadow-red-500/5'
                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
                        }`}
                    >
                        <Settings className="h-4 w-4" />
                        <span>Ustawienia Lokalu</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-700/80 text-center text-slate-500 text-[10px] hidden md:block font-mono">
                    PosRestaurant v2.4 • Core
                </div>
            </aside>

            {/* --- PRAWA KOLUMNA: GŁÓWNA TREŚĆ ZAKŁADKI --- */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-6xl">
                {activeTab === 'employees' && <EmployeesTab restaurantId={restaurantId} />}
                
                {activeTab === 'roles' && <RolesTab restaurantId={restaurantId} />}

                {activeTab === 'menu' && <MenuTab restaurantId={restaurantId} />}

                {activeTab === 'analytics' && (
                    <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-700 rounded-3xl space-y-3">
                        <BarChart3 className="h-10 w-10 text-cyan-400 mx-auto opacity-50" />
                        <h3 className="font-bold text-white">Analityka i Raporty Finansowe</h3>
                        <p className="text-xs max-w-sm mx-auto">Wkrótce połączymy to z mikroserwisem Analytics API i MongoDB.</p>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-700 rounded-3xl space-y-3">
                        <Settings className="h-10 w-10 text-red-400 mx-auto opacity-50" />
                        <h3 className="font-bold text-white">Ustawienia i Danger Zone</h3>
                        <p className="text-xs max-w-sm mx-auto">Wkrótce udostępnimy tu zmianę NIP, adresu oraz dezaktywację lokalu.</p>
                    </div>
                )}
            </main>

        </div>
    );
}