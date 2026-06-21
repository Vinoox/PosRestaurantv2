import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { Shield, Plus, Trash2, Edit2, Check, X, AlertCircle, RefreshCw } from 'lucide-react';

interface RestaurantRole {
    id: string;
    name: string;
}

interface RolesTabProps {
    restaurantId: string;
}

export default function RolesTab({ restaurantId }: RolesTabProps) {
    // --- STANY ---
    const [roles, setRoles] = useState<RestaurantRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal dodawania nowej roli
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Inline Editing (Zmiana nazwy istniejącej roli)
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [editRoleNameInput, setEditRoleNameInput] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // --- POBIERANIE RÓL ---
    const fetchRoles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<RestaurantRole[]>(`/restaurants/${restaurantId}/roles`);
            setRoles(response.data);
        } catch (err) {
            console.error("Błąd pobierania ról roboczych:", err);
            setError("Nie udało się załadować listy stanowisk.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, [restaurantId]);

    // --- TWORZENIE ROLI (POST CreateRestaurantRoleRequest) ---
    const handleAddRoleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;

        setIsAdding(true);
        try {
            await apiClient.post(`/restaurants/${restaurantId}/roles`, {
                name: newRoleName.trim()
            });
            await fetchRoles(); // Przeładowanie listy po sukcesie
            setNewRoleName('');
            setIsAddModalOpen(false);
        } catch (err: any) {
            console.error("Błąd tworzenia stanowiska:", err);
            alert(err.response?.data?.detail || "Nie udało się utworzyć nowej roli.");
        } finally {
            setIsAdding(false);
        }
    };

    // --- ZMIANA NAZWY ROLI (PUT RenameRestaurantRoleRequest) ---
    const handleStartRename = (role: RestaurantRole) => {
        setEditingRoleId(role.id);
        setEditRoleNameInput(role.name);
    };

    const handleSaveRename = async (roleId: string) => {
        if (!editRoleNameInput.trim()) return;
        setIsSavingEdit(true);

        try {
            await apiClient.put(`/restaurants/${restaurantId}/roles/${roleId}`, {
                newName: editRoleNameInput.trim()
            });

            // Aktualizacja lokalnego stanu Reacta
            setRoles(prev => prev.map(r => r.id === roleId ? { ...r, name: editRoleNameInput.trim() } : r));
            setEditingRoleId(null);
        } catch (err) {
            console.error("Błąd zmiany nazwy:", err);
            alert("Nie udało się zapisać nowej nazwy stanowiska.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    // --- USUWANIE ROLI (DELETE) ---
    const handleDeleteRole = async (roleId: string, roleName: string) => {
        if (!confirm(`Czy definitywnie usunąć stanowisko "${roleName}"? Pracownicy przypisani do tej roli mogą stracić uprawnienia.`)) return;

        try {
            await apiClient.delete(`/restaurants/${restaurantId}/roles/${roleId}`);
            setRoles(prev => prev.filter(r => r.id !== roleId));
        } catch (err) {
            console.error("Błąd usuwania roli:", err);
            alert("Nie można usunąć tej roli. Prawdopodobnie są do niej wciąż przypisani aktywni pracownicy.");
        }
    };

    return (
        <div className="space-y-6 font-sans">
            
            {/* --- NAGŁÓWEK --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-400" />
                        Uprawnienia i Stanowiska (RBAC)
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Zarządzaj hierarchią ról w lokalu. Nazwy stanowisk determinują poziom dostępu do funkcji kasy POS.
                    </p>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                        onClick={fetchRoles}
                        className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors"
                        title="Odśwież"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Utwórz stanowisko</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* --- SIATKA KAFELKÓW RÓL --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {isLoading ? (
                    /* SKELETON */
                    [1, 2, 3].map(n => (
                        <div key={n} className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 h-28 animate-pulse flex flex-col justify-between">
                            <div className="h-5 w-32 bg-slate-700 rounded"></div>
                            <div className="flex gap-2 self-end">
                                <div className="h-8 w-8 bg-slate-700 rounded-lg"></div>
                                <div className="h-8 w-8 bg-slate-700 rounded-lg"></div>
                            </div>
                        </div>
                    ))
                ) : roles.length === 0 ? (
                    <div className="col-span-full p-12 text-center text-slate-500 text-sm bg-slate-800/40 rounded-2xl border border-slate-700/50">
                        Brak zdefiniowanych ról. Kliknij "Utwórz stanowisko" powyżej.
                    </div>
                ) : (
                    roles.map(role => {
                        const isEditingThis = editingRoleId === role.id;
                        const roleUpper = role.name.toUpperCase();
                        
                        // Strażnik: Chronimy role kluczowe przed usunięciem
                        const isProtected = roleUpper === 'MANAGER' || roleUpper === 'ADMIN' || roleUpper === 'DEFAULT' || roleUpper.includes('LOCALADMIN');

                        return (
                            <div 
                                key={role.id}
                                className={`bg-slate-800 border rounded-2xl p-5 transition-all flex flex-col justify-between min-h-[116px] shadow-lg ${
                                    isProtected ? 'border-indigo-500/30 bg-slate-800/90' : 'border-slate-700 hover:border-slate-500'
                                }`}
                            >
                                {/* WNĘTRZE KAFELKA: Tryb Edycji vs Tryb Podglądu */}
                                {isEditingThis ? (
                                    /* TRYB EDYCJI (INLINE) */
                                    <div className="space-y-3">
                                        <input
                                            type="text" required autoFocus
                                            value={editRoleNameInput}
                                            onChange={e => setEditRoleNameInput(e.target.value)}
                                            className="w-full px-3 py-1.5 bg-slate-900 border border-indigo-500 rounded-lg text-sm text-white focus:outline-none"
                                            placeholder="Nazwa stanowiska..."
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => setEditingRoleId(null)}
                                                className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                                                title="Anuluj"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleSaveRename(role.id)}
                                                disabled={isSavingEdit}
                                                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50"
                                                title="Zapisz"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* TRYB PODGLĄDU */
                                    <>
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                                                    {isProtected ? 'Rola Systemowa' : 'Rola Niestandardowa'}
                                                </span>
                                                <Shield className={`h-4 w-4 ${isProtected ? 'text-indigo-400' : 'text-slate-500'}`} />
                                            </div>
                                            <h3 className="text-lg font-extrabold text-white truncate pr-2">
                                                {role.name}
                                            </h3>
                                        </div>

                                        {/* DOLNY PASEK AKCJI */}
                                        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-700/60 text-xs">
                                            <span className="text-slate-500 font-mono text-[11px]">ID: {role.id.split('-')[0]}...</span>
                                            
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleStartRename(role)}
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                                    title="Zmień nazwę"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>

                                                {isProtected ? (
                                                    <span className="p-2 text-slate-600 cursor-not-allowed" title="Tej roli nie można usunąć">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDeleteRole(role.id, role.name)}
                                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Usuń stanowisko"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}

            </div>

            {/* --- MODAL TWORZENIA ROLI --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative space-y-5">
                        <button 
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Shield className="h-5 w-5 text-indigo-400" />
                                Nowe Stanowisko
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Wprowadź unikalną nazwę dla nowej roli w tym lokalu.
                            </p>
                        </div>

                        <form onSubmit={handleAddRoleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Nazwa stanowiska <span className="text-indigo-400">*</span>
                                </label>
                                <input
                                    type="text" required autoFocus
                                    value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
                                    placeholder="np. Starszy Barman"
                                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button" onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit" disabled={isAdding}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                                >
                                    {isAdding ? 'Zapisywanie...' : 'Utwórz rolę'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}