import { useState, useEffect } from 'react';
import { apiClient } from '../../../../api/client';
import { FolderTree, Plus, Trash2, Edit2, Search } from 'lucide-react';

interface CatItem { id: string; name: string; description: string; }

export default function CategoriesSubTab({ restaurantId }: { restaurantId: string }) {
    const [cats, setCats] = useState<CatItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [addName, setAddName] = useState('');
    const [addDesc, setAddDesc] = useState('');

    const [editingCat, setEditingCat] = useState<CatItem | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');

    const fetchCats = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get<any[]>('/categories');
            const norm: CatItem[] = res.data.map(c => ({ id: c.id || c.Id || '', name: c.name || c.Name || 'Brak', description: c.description || c.Description || '' }));
            setCats(norm);
        } catch (err) { console.error("Błąd kategorii"); } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchCats(); }, [restaurantId]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault(); if (!addName.trim()) return;
        try {
            await apiClient.post('/categories', { name: addName.trim(), description: addDesc.trim() });
            await fetchCats(); setAddName(''); setAddDesc(''); setIsAddOpen(false);
        } catch (err) { alert("Błąd tworzenia kategorii"); }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!editingCat) return;
        try {
            await apiClient.put(`/categories/${editingCat.id}`, { name: editName.trim(), description: editDesc.trim() });
            setCats(prev => prev.map(c => c.id === editingCat.id ? { ...c, name: editName.trim(), description: editDesc.trim() } : c));
            setEditingCat(null);
        } catch (err) { alert("Błąd edycji"); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Usunąć kategorię "${name}"?`)) return;
        try {
            await apiClient.delete(`/categories/${id}`);
            setCats(prev => prev.filter(c => c.id !== id));
        } catch (err) { alert("Odmowa: Kategoria posiada przypisane dania w karcie menu."); }
    };

    const filtered = cats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj kategorii..." className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500" /></div>
                <button onClick={() => setIsAddOpen(true)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20"><Plus className="h-4 w-4 inline mr-1" /> Dodaj kategorię</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-3 h-24 bg-slate-800/40 rounded-3xl animate-pulse"></div>
                ) : (
                    filtered.map(c => (
                        <div key={c.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-xl flex flex-col justify-between h-36">
                            <div><span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 inline-block mb-2"><FolderTree className="h-4 w-4" /></span> <h3 className="font-bold text-white text-base">{c.name}</h3><p className="text-xs text-slate-400 mt-1 line-clamp-1">{c.description || 'Brak opisu'}</p></div>
                            <div className="pt-3 border-t border-slate-700/60 flex justify-end gap-1"><button onClick={() => { setEditingCat(c); setEditName(c.name); setEditDesc(c.description); }} className="p-1.5 text-slate-400 hover:text-white bg-slate-700/50 rounded-lg"><Edit2 className="h-3 w-3" /></button><button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-700/50 rounded-lg"><Trash2 className="h-3 w-3" /></button></div>
                        </div>
                    ))
                )}
            </div>

            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"><div className="bg-slate-800 border border-slate-700 rounded-3xl p-7 max-w-sm w-full space-y-4"><h3 className="font-bold text-white">Nowa sekcja menu</h3><form onSubmit={handleAdd} className="space-y-3"><input type="text" required autoFocus value={addName} onChange={e => setAddName(e.target.value)} placeholder="Nazwa wyświetlana..." className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold" /><textarea rows={2} value={addDesc} onChange={e => setAddDesc(e.target.value)} placeholder="Opis roboczy..." className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white" /><div className="flex gap-2"><button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl text-xs font-bold">Anuluj</button><button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">Utwórz</button></div></form></div></div>
            )}

            {editingCat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"><div className="bg-slate-800 border border-slate-700 rounded-3xl p-7 max-w-sm w-full space-y-4"><h3 className="font-bold text-white">Edytuj kategorię</h3><form onSubmit={handleEdit} className="space-y-3"><input type="text" required value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold" /><textarea rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white" /><div className="flex gap-2"><button type="button" onClick={() => setEditingCat(null)} className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl text-xs font-bold">Anuluj</button><button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">Zapisz</button></div></form></div></div>
            )}
        </div>
    );
}