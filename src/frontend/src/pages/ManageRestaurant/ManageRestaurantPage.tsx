import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';

import EmployeesTab from './components/EmployeesTab';
import RolesTab from './components/RolesTab';
import MenuTabOrchestrator from './components/MenuTab'; // <--- Importuje folder MenuTab/index.tsx

import { Building2, Users, Shield, Utensils, ChevronLeft } from 'lucide-react';

interface RestaurantInfo { id: string; name: string; }
type TabType = 'employees' | 'roles' | 'menu' | 'analytics' | 'settings';

export default function ManageRestaurantPage() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<TabType>('menu'); // Domyślnie menu
    const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);

    useEffect(() => {
        if (restaurantId) {
            apiClient.get<any>(`/restaurants/${restaurantId}`)
                .then(res => setRestaurant({ id: res.data.id || res.data.Id, name: res.data.name || res.data.Name }))
                .catch(() => console.error("Błąd nagłówka ERP"));
        }
    }, [restaurantId]);

    if (!restaurantId) return <div className="p-12 text-red-400 font-mono text-xs">Błąd: Brak parametru :restaurantId w URL.</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
            
            {/* SIDEBAR */}
            <aside className="w-full md:w-64 bg-slate-800 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-700/80 space-y-4">
                    <button onClick={() => navigate('/home')} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"><ChevronLeft className="h-4 w-4" /> Wszystkie lokale</button>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30"><Building2 className="h-5 w-5" /></div>
                        <div className="overflow-hidden"><h1 className="font-extrabold text-white text-sm truncate">{restaurant?.name || 'Ładowanie...'}</h1><span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">ERP Admin</span></div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto flex md:block overflow-x-auto md:overflow-x-hidden">
                    <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${activeTab === 'menu' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-700/40 hover:text-white border border-transparent'}`}>
                        <Utensils className="h-4 w-4" /> <span>Karta Menu</span>
                    </button>
                    <button onClick={() => setActiveTab('employees')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${activeTab === 'employees' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-700/40 hover:text-white border border-transparent'}`}>
                        <Users className="h-4 w-4" /> <span>Kadry i Zespół</span>
                    </button>
                    <button onClick={() => setActiveTab('roles')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 ${activeTab === 'roles' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-700/40 hover:text-white border border-transparent'}`}>
                        <Shield className="h-4 w-4" /> <span>Stanowiska (RBAC)</span>
                    </button>
                </nav>
            </aside>

            {/* KONTENER ROBOCZY */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-6xl">
                {activeTab === 'menu' && <MenuTabOrchestrator restaurantId={restaurantId} />}
                {activeTab === 'employees' && <EmployeesTab restaurantId={restaurantId} />}
                {activeTab === 'roles' && <RolesTab restaurantId={restaurantId} />}
            </main>
        </div>
    );
}