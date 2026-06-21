import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { 
    Users, Plus, Trash2, Search, AlertTriangle, X, UserCheck, RefreshCw, Shield 
} from 'lucide-react';

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
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [roles, setRoles] = useState<RestaurantRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Stany modala zatrudniania
    const [isHireModalOpen, setIsHireModalOpen] = useState(false);
    const [newEmpEmail, setNewEmpEmail] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [isHiring, setIsHiring] = useState(false);
    const [hireError, setHireError] = useState<string | null>(null);

    // Stany modala zwalniania
    const [firingEmployee, setFiringEmployee] = useState<Employee | null>(null);
    const [confirmEmailInput, setConfirmEmailInput] = useState('');
    const [isFiring, setIsFiring] = useState(false);

    const [updatingEmpId, setUpdatingEmpId] = useState<string | null>(null);

    const fetchStaffAndRoles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [empRes, rolesRes] = await Promise.all([
                apiClient.get<any[]>(`/restaurants/${restaurantId}/employees`),
                apiClient.get<any[]>(`/restaurants/${restaurantId}/roles`)
            ]);

            const normalizedRoles: RestaurantRole[] = rolesRes.data.map(r => ({
                id: r.id || r.Id || '',
                name: r.name || r.Name || ''
            }));

            const normalizedEmployees: Employee[] = empRes.data.map(e => ({
                id: e.id || e.Id || e.employeeId || e.EmployeeId || e.userId || e.UserId || '',
                firstName: e.firstName || e.FirstName || '',
                lastName: e.lastName || e.LastName || '',
                email: e.email || e.Email || '',
                roleId: e.roleId || e.RoleId || e.restaurantRoleId || e.RestaurantRoleId || ''
            }));

            setRoles(normalizedRoles);
            setEmployees(normalizedEmployees);

            if (normalizedRoles.length > 0) {
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

    const handleHireSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setHireError(null);

        if (!newEmpEmail.trim() || !selectedRoleId) {
            setHireError("Podaj adres e-mail i wybierz stanowisko.");
            return;
        }

        setIsHiring(true);
        try {
            await apiClient.post(`/restaurants/${restaurantId}/employees`, {
                employeeEmail: newEmpEmail.trim(),
                roleId: selectedRoleId
            });

            await fetchStaffAndRoles();
            setNewEmpEmail('');
            setIsHireModalOpen(false);
        } catch (err: any) {
            console.error("Błąd zatrudniania:", err);
            setHireError(err.response?.data?.detail || err.response?.data?.title || "Nie udało się zatrudnić pracownika.");
        } finally {
            setIsHiring(false);
        }
    };

    const handleRoleChange = async (employeeId: string, newRoleId: string) => {
        const targetEmp = employees.find(e => e.id === employeeId);
        if (!targetEmp || targetEmp.roleId === newRoleId) return;

        const previousRoleId = targetEmp.roleId;
        setUpdatingEmpId(employeeId);

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
            console.error("Błąd zmiany roli:", err);
            setEmployees(prev => prev.map(emp => 
                emp.id === employeeId ? { ...emp, roleId: previousRoleId } : emp
            ));
            alert("Nie udało się zapisać zmiany uprawnień.");
        } finally {
            setUpdatingEmpId(null);
        }
    };

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

    const filteredEmployees = employees.filter(emp => 
        emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 font-sans">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
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
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-wider"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Zatrudnij osobę</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold text-center">
                    {error}
                </div>
            )}

            <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                <input
                    type="text"
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Szukaj po imieniu, nazwisku lub adresie e-mail..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-900/40">
                            <th className="p-4 pl-6">Pracownik</th>
                            <th className="p-4">Adres E-mail</th>
                            <th className="p-4">Stanowisko (RBAC)</th>
                            <th className="p-4 pr-6 text-right">Zwolnienie</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 text-xs">
                        {isLoading ? (
                            [1, 2, 3].map(n => (
                                <tr key={n} className="animate-pulse">
                                    <td className="p-4 pl-6"><div className="h-4 w-32 bg-slate-700 rounded"></div></td>
                                    <td className="p-4"><div className="h-4 w-40 bg-slate-700 rounded"></div></td>
                                    <td className="p-4"><div className="h-7 w-28 bg-slate-700 rounded-lg"></div></td>
                                    <td className="p-4 pr-6 text-right"><div className="h-6 w-6 bg-slate-700 rounded-lg ml-auto"></div></td>
                                </tr>
                            ))
                        ) : filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-slate-500 italic">
                                    Brak personelu.
                                </td>
                            </tr>
                        ) : (
                            filteredEmployees.map(emp => {
                                const isUpdating = updatingEmpId === emp.id;
                                return (
                                    <tr key={emp.id} className={`hover:bg-slate-700/30 transition-colors ${isUpdating ? 'opacity-50' : ''}`}>
                                        <td className="p-4 pl-6 font-bold text-white flex items-center gap-2.5">
                                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg font-mono text-[11px]">
                                                {emp.firstName?.[0] || 'U'}
                                            </span>
                                            <span>{emp.firstName} {emp.lastName}</span>
                                        </td>
                                        <td className="p-4 font-mono text-slate-300">{emp.email}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                                {/* PRAWIDŁOWY ZAPIS BEZ <{...}> */}
                                                <select
                                                    value={emp.roleId}
                                                    onChange={e => handleRoleChange(emp.id, e.target.value)}
                                                    disabled={isUpdating}
                                                    className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                                                >
                                                    {roles.map(r => (
                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <button
                                                onClick={() => { setFiringEmployee(emp); setConfirmEmailInput(''); }}
                                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Zwolnij pracownika"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL ZATRUDNIANIA */}
            {isHireModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-sm w-full p-7 space-y-4 shadow-2xl relative">
                        <button onClick={() => setIsHireModalOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-emerald-400" /> Zatrudnij do lokalu
                        </h3>
                        {hireError && <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center font-semibold">{hireError}</div>}
                        <form onSubmit={handleHireSubmit} className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">E-mail kandydata *</label>
                                <input
                                    type="email" required value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)}
                                    placeholder="np. jan@restauracja.pl"
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Stanowisko *</label>
                                {/* PRAWIDŁOWY ZAPIS BEZ <{...}> */}
                                <select
                                    value={selectedRoleId} onChange={e => setSelectedRoleId(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                                >
                                    {roles.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setIsHireModalOpen(false)} className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl text-xs font-bold">Anuluj</button>
                                <button type="submit" disabled={isHiring || !selectedRoleId} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20">Zatrudnij</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL ZWALNIANIA */}
            {firingEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-sm w-full p-7 space-y-4 shadow-2xl text-center relative">
                        <AlertTriangle className="h-8 w-8 text-red-400 mx-auto animate-bounce" />
                        <div>
                            <h3 className="text-lg font-bold text-white">Zwolnienie pracownika</h3>
                            <p className="text-xs text-slate-300 mt-1">Przepisz e-mail <strong className="text-white font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">{firingEmployee.email}</strong> aby potwierdzić.</p>
                        </div>
                        <form onSubmit={handleFireSubmit} className="space-y-3">
                            <input
                                type="text" required autoFocus value={confirmEmailInput} onChange={e => setConfirmEmailInput(e.target.value)}
                                placeholder="przepisz e-mail..."
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-center text-white font-mono focus:outline-none focus:border-red-500"
                            />
                            <div className="flex gap-2 pt-1">
                                <button type="button" onClick={() => setFiringEmployee(null)} className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl text-xs font-bold">Anuluj</button>
                                <button type="submit" disabled={isFiring || confirmEmailInput.trim().toLowerCase() !== firingEmployee.email.toLowerCase()} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/20 disabled:opacity-40">Zwolnij</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}