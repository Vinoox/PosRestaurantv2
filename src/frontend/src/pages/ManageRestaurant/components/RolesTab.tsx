import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { Shield, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface RoleItem { id: string; name: string; }

export default function RolesTab({ restaurantId }: { restaurantId: string }) {
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editInput, setEditInput] = useState('');

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get<any[]>(`/restaurants/${restaurantId}/roles`);
            // ACL Normalizacja
            const norm: RoleItem[] = res.data.map(r => ({ id: r.id || r.Id || '', name: r.name || r.Name || '' }));
            setRoles(norm);
        } catch (err) { console.error("Błąd ról"); } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchRoles(); }, [restaurantId]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault(); if (!newRoleName.trim()) return;
        try {
            await apiClient.post(`/restaurants/${restaurantId}/roles`, { name: newRoleName.trim() });
            await fetchRoles(); setNewRoleName(''); setIsAddModalOpen(false);
        } catch (err) { alert("Błąd zapisu roli."); }
    };

    const handleSaveEdit = async (roleId: string) => {
        if (!editInput.trim()) return;
        try {
            await apiClient.put(`/restaurants/${restaurantId}/roles/${roleId}`, { newName: editInput.trim(), NewName: editInput.trim() });
            setRoles(prev => prev.map(r => r.id === roleId ? { ...r, name: editInput.trim() } : r));
            setEditingId(null);
        } catch (err) { alert("Błąd edycji nazwy."); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Usunąć rolę "${name}"?`)) return;
        try {
            await apiClient.delete(`/restaurants/${restaurantId}/roles/${id}`);
            setRoles(prev => prev.filter(r => r.id !== id));
        } catch (err) { alert("Odmowa: Do roli wciąż przypisani są pracownicy."); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
                <div><h2 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="h-6 w-6 text-indigo-400" /> Poziomy Stanowisk (RBAC)</h2></div>
                <button onClick={() => setIsAddModalOpen(true)} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20"><Plus className="h-4 w-4 inline mr-1" /> Utwórz rolę</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-3 h-24 bg-slate-800/50 rounded-3xl animate-pulse"></div>
                ) : (
                    roles.map(r => {
                        const isProtected = ['MANAGER', 'ADMIN', 'DEFAULT'].includes(r.name.toUpperCase());
                        const isEditing = editingId === r.id;

                        return (
                            <div key={r.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-xl flex flex-col justify-between h-32">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <input type="text" autoFocus value={editInput} onChange={e => setEditInput(e.target.value)} className="w-full px-3 py-1.5 bg-slate-900 border border-indigo-500 rounded-xl text-xs text-white font-bold" />
                                        <div className="flex justify-end gap-1"><button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-700 text-white rounded-lg"><X className="h-3.5 w-3.5" /></button><button onClick={() => handleSaveEdit(r.id)} className="p-1.5 bg-emerald-600 text-white rounded-lg"><Check className="h-3.5 w-3.5" /></button></div>
                                    </div>
                                ) : (
                                    <>
                                        <div><span className="text-[9px] font-mono font-bold uppercase text-indigo-400 block mb-1">{isProtected ? 'Systemowa' : 'Własna'}</span> <h3 className="font-extrabold text-white text-base truncate">{r.name}</h3></div>
                                        <div className="pt-3 border-t border-slate-700/60 flex justify-between items-center"><span className="font-mono text-[10px] text-slate-500">ID: {r.id.substring(0,6)}</span> <div className="flex gap-1"><button onClick={() => { setEditingId(r.id); setEditInput(r.name); }} className="p-1.5 text-slate-400 hover:text-white bg-slate-700/50 rounded-lg"><Edit2 className="h-3 w-3" /></button> {!isProtected && <button onClick={() => handleDelete(r.id, r.name)} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-700/50 rounded-lg"><Trash2 className="h-3 w-3" /></button>}</div></div>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"><div className="bg-slate-800 border border-slate-700 rounded-3xl p-7 max-w-sm w-full space-y-4"><h3 className="font-bold text-white">Nowa nazwa stanowiska</h3><form onSubmit={handleAdd} className="space-y-3"><input type="text" required autoFocus value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="np. Barman" className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold" /><div className="flex gap-2"><button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl text-xs font-bold">Anuluj</button><button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">Zapisz</button></div></form></div></div>
            )}
        </div>
    );
}