import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { 
    Users, Plus, Trash2, Search, AlertTriangle, Check, X, UserCheck, RefreshCw, Shield 
} from 'lucide-react';

// --- INTERFEJSY KONTRAKTÓW ---
interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roleId: string;
    roleName?: string;
    role?: string;
}

interface RestaurantRole {
    id: string;
    name: string;
}

interface EmployeesTabProps {
    restaurantId: string;
}

export default function EmployeesTab({ restaurantId }: EmployeesTabProps) {

    // --- STANY ---
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [roles, setRoles] = useState<RestaurantRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Stany Modala Zatrudniania
    const [isHireModalOpen, setIsHireModalOpen] = useState(false);
    const [newEmpEmail, setNewEmpEmail] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [isHiring, setIsHiring] = useState(false);
    const [hireError, setHireError] = useState<string | null>(null);

    // Stany Modala Zwalniania (Zabezpieczenie Guard)
    const [firingEmployee, setFiringEmployee] = useState<Employee | null>(null);
    const [confirmEmailInput, setConfirmEmailInput] = useState('');
    const [isFiring, setIsFiring] = useState(false);

    // Stan optymistycznej blokady wiersza
    const [updatingEmpId, setUpdatingEmpId] = useState<string | null>(null);

    // --- POBIERANIE DANYCH (Z ACL - Warstwą Antykorupcyjną) ---
    const fetchStaffAndRoles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [empRes, rolesRes] = await Promise.all([
                apiClient.get<any[]>(`/restaurants/${restaurantId}/employees`),
                apiClient.get<any[]>(`/restaurants/${restaurantId}/roles`)
            ]);

            // NORMALIZACJA PRACOWNIKÓW: Mapujemy wielkie litery z C# na małe w TS
            const normalizedEmployees: Employee[] = empRes.data.map(e => ({
                ...e,
                id: e.id || e.Id || e.employeeId || e.EmployeeId || e.userId || e.UserId || '',
                firstName: e.firstName || e.FirstName || '',
                lastName: e.lastName || e.LastName || '',
                email: e.email || e.Email || '',
                roleId: e.roleId || e.RoleId || e.restaurantRoleId || e.RestaurantRoleId || ''
            }));

            // NORMALIZACJA RÓL
            const normalizedRoles: RestaurantRole[] = rolesRes.data.map(r => ({
                ...r,
                id: r.id || r.Id || '',
                name: r.name || r.Name || ''
            }));

            setEmployees(normalizedEmployees);
            setRoles(normalizedRoles);

            if (normalizedRoles.length > 0 && !selectedRoleId) {
                setSelectedRoleId(normalizedRoles[0].id);
            }
        } catch (err: any) {
            console.error("Błąd pobierania kadry:", err);
            setError("Nie udało się załadować listy personelu. Sprawdź uprawnienia.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffAndRoles();
    }, [restaurantId]);

    // --- ZATRUDNIANIE (POST AddEmployeeRequest) ---
    const handleHireSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setHireError(null);

        if (!newEmpEmail.trim() || !selectedRoleId) {
            setHireError("Podaj adres e-mail i wybierz stanowisko.");
            return;
        }

        setIsHiring(true);
        try {
            // Ciało zapytania ściśle odpowiada strukturze AddEmployeeRequest.cs
            await apiClient.post(`/restaurants/${restaurantId}/employees`, {
                employeeEmail: newEmpEmail.trim(),
                roleId: selectedRoleId
            });

            await fetchStaffAndRoles(); // Odświeżenie tabeli po sukcesie
            setNewEmpEmail('');
            setIsHireModalOpen(false);
        } catch (err: any) {
            console.error("Błąd zatrudniania:", err);
            setHireError(err.response?.data?.detail || err.response?.data?.title || "Nie udało się zatrudnić pracownika.");
        } finally {
            setIsHiring(false);
        }
    };

    // --- ZMIANA STANOWISKA (PUT ChangeEmployeeRoleRequest - Optimistic UI) ---
    const handleRoleChange = async (employeeId: string, newRoleId: string) => {
        const targetEmp = employees.find(e => e.id === employeeId);
        if (!targetEmp || targetEmp.roleId === newRoleId) return;

        const previousRoleId = targetEmp.roleId;
        setUpdatingEmpId(employeeId);

        // 1. Optimistic Update UI (Natychmiastowa zmiana w przeglądarce)
        setEmployees(prev => prev.map(emp => 
            emp.id === employeeId ? { ...emp, roleId: newRoleId } : emp
        ));

        try {
            await apiClient.put(`/restaurants/${restaurantId}/employees/${employeeId}/role`, {
                newRoleId: newRoleId,
                NewRoleId: newRoleId,
                roleId: newRoleId,
                RoleId: newRoleId
            });
        } catch (err) {
            console.error("Błąd aktualizacji roli, wycofywanie zmian:", err);
            // 2. Rollback w przypadku błędu serwera
            setEmployees(prev => prev.map(emp => 
                emp.id === employeeId ? { ...emp, roleId: previousRoleId } : emp
            ));
            alert("Nie udało się zmienić uprawnień pracownika.");
        } finally {
            setUpdatingEmpId(null);
        }
    };

    // --- ZWALNIANIE (DELETE) ---
    const handleFireSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firingEmployee || confirmEmailInput.trim().toLowerCase() !== firingEmployee.email.toLowerCase()) {
            return;
        }

        setIsFiring(true);
        try {
            await apiClient.delete(`/restaurants/${restaurantId}/employees/${firingEmployee.id}`);
            setEmployees(prev => prev.filter(emp => emp.id !== firingEmployee.id));
            setFiringEmployee(null);
            setConfirmEmailInput('');
        } catch (err) {
            console.error("Błąd zwalniania pracownika:", err);
            alert("Wystąpił błąd podczas usuwania dostępu pracownikowi.");
        } finally {
            setIsFiring(false);
        }
    };

    // Filtrowanie po wyszukiwarce
    const filteredEmployees = employees.filter(emp => 
        emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 font-sans">
            
            {/* --- GÓRNY PASEK ZAKŁADKI --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="h-6 w-6 text-emerald-400" />
                        Zarządzanie Personelem
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Zatrudniaj pracowników, przypisuj im stanowiska robocze i zarządzaj dostępem do kasy POS.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                        onClick={fetchStaffAndRoles}
                        className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors active:scale-95"
                        title="Odśwież kadrę"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
                    </button>
                    <button
                        onClick={() => { setIsHireModalOpen(true); setHireError(null); }}
                        className="flex-1 sm:flex-none px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Zatrudnij osobę</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* --- WYSZUKIWARKA --- */}
            <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Szukaj po imieniu, nazwisku lub adresie e-mail..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
            </div>

            {/* --- TABELA PRACOWNIKÓW --- */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                {isLoading ? (
                    /* SKELETON LOADER */
                    <div className="divide-y divide-slate-700/50">
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className="p-4 flex items-center justify-between animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-700"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-slate-700 rounded"></div>
                                        <div className="h-3 w-48 bg-slate-700/60 rounded"></div>
                                    </div>
                                </div>
                                <div className="h-9 w-36 bg-slate-700 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-sm">
                        Brak pracowników spełniających kryteria wyszukiwania.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/40">
                                    <th className="px-6 py-4">Pracownik</th>
                                    <th className="px-6 py-4">Adres E-mail</th>
                                    <th className="px-6 py-4">Stanowisko (RBAC)</th>
                                    <th className="px-6 py-4 text-right">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/60 text-sm">
                                {filteredEmployees.map(emp => {
                                    const isUpdating = updatingEmpId === emp.id;
                                    
                                    return (
                                        <tr key={emp.id} className={`hover:bg-slate-700/30 transition-colors ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs border border-emerald-500/20 shrink-0">
                                                    {emp.firstName?.[0] || 'U'}
                                                </div>
                                                <span className="line-clamp-1">{emp.firstName} {emp.lastName}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                                                {emp.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                {/* DROPDOWN DO SZYBKIEJ ZMIANY ROLI */}
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-indigo-400 shrink-0" />
                                                    <select
                                                        value={emp.roleId}
                                                        onChange={e => handleRoleChange(emp.id, e.target.value)}
                                                        disabled={isUpdating}
                                                        className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:cursor-wait font-semibold"
                                                    >
                                                        {roles.map(r => (
                                                            <option key={r.id} value={r.id}>
                                                                {r.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => { setFiringEmployee(emp); setConfirmEmailInput(''); }}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                                    title="Zwolnij pracownika"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ================================================== */}
            {/* --- MODAL ZATRUDNIANIA PRACOWNIKA (AddEmployee) --- */}
            {/* ================================================== */}
            {isHireModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative space-y-6">
                        <button 
                            onClick={() => setIsHireModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-emerald-400" />
                                Zatrudnij Nową Osobę
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Pracownik musi posiadać już zarejestrowane konto w systemie PosRestaurant.
                            </p>
                        </div>

                        {hireError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium">
                                {hireError}
                            </div>
                        )}

                        <form onSubmit={handleHireSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">
                                    Adres e-mail pracownika <span className="text-emerald-400">*</span>
                                </label>
                                <input
                                    type="email" required
                                    value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)}
                                    placeholder="np. jan.kelner@restauracja.pl"
                                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-2">
                                    Przypisz stanowisko <span className="text-emerald-400">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                                    {roles.map(role => {
                                        const isSelected = selectedRoleId === role.id;
                                        return (
                                            <button
                                                type="button"
                                                key={role.id}
                                                onClick={() => setSelectedRoleId(role.id)}
                                                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all min-h-[60px] ${
                                                    isSelected 
                                                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                                                }`}
                                            >
                                                <span className="text-xs font-bold leading-tight">{role.name}</span>
                                                {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400 self-end mt-1" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button" onClick={() => setIsHireModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-colors min-h-[44px]"
                                >
                                    Anuluj
                                </button>
                                <button
                                    type="submit" disabled={isHiring || !selectedRoleId}
                                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20 min-h-[44px]"
                                >
                                    {isHiring ? 'Weryfikacja...' : 'Zatrudnij do lokalu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================= */}
            {/* --- MODAL ZWALNIANIA (GUARD: Wymóg wpisania e-maila) --- */}
            {/* ======================================================= */}
            {firingEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative space-y-6">
                        <div className="mx-auto h-14 w-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
                            <AlertTriangle className="h-7 w-7" />
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-white">Zwolnienie Pracownika</h3>
                            <p className="text-xs text-slate-300">
                                Czy na pewno chcesz odebrać dostęp do kasy POS pracownikowi <strong className="text-red-400">{firingEmployee.firstName} {firingEmployee.lastName}</strong>?
                            </p>
                        </div>

                        <form onSubmit={handleFireSubmit} className="space-y-4">
                            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700/80 space-y-2 text-center">
                                <span className="block text-xs text-slate-400">Aby potwierdzić, przepisz jego adres e-mail:</span>
                                <span className="block text-xs font-mono font-bold text-white select-all bg-slate-800 py-1 px-2 rounded border border-slate-700">
                                    {firingEmployee.email}
                                </span>
                                <input
                                    type="text" required autoFocus
                                    value={confirmEmailInput} onChange={e => setConfirmEmailInput(e.target.value)}
                                    placeholder="przepisz e-mail..."
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-center text-white focus:outline-none focus:border-red-500 font-mono mt-2"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button" onClick={() => setFiringEmployee(null)}
                                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-colors min-h-[44px]"
                                >
                                    Wycofaj się
                                </button>
                                <button
                                    type="submit" 
                                    disabled={isFiring || confirmEmailInput.trim().toLowerCase() !== firingEmployee.email.toLowerCase()}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-red-600/20 min-h-[44px]"
                                >
                                    {isFiring ? 'Usuwanie...' : 'Definitywnie zwolnij'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}