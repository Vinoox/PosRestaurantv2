import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../../api/client';
import { Carrot, Plus, Trash2, Edit2, Search, RefreshCw, X } from 'lucide-react';

interface IngredientItem {
    id: string;
    name: string;
    unit: string;
    stock: number;
}

interface IngredientsSubTabProps {
    restaurantId: string;
}

export default function IngredientsSubTab({ restaurantId }: IngredientsSubTabProps) {
    const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [addName, setAddName] = useState('');
    const [addUnit, setAddUnit] = useState('kg');
    const [addStock, setAddStock] = useState('0');

    const [editingIng, setEditingIng] = useState<IngredientItem | null>(null);
    const [editName, setEditName] = useState('');
    const [editUnit, setEditUnit] = useState('kg');

    const fetchIngredients = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get<any[]>('/ingredients');
            const norm: IngredientItem[] = res.data.map(i => ({
                id: i.id || i.Id || '',
                name: i.name || i.Name || 'Brak nazwy',
                unit: i.unit || i.Unit || 'szt',
                stock: parseFloat(i.stock ?? i.Stock ?? i.initialStock ?? i.InitialStock ?? '0')
            }));
            setIngredients(norm);
        } catch (err) {
            console.error("Błąd pobierania składników:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIngredients();
    }, [restaurantId]);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const st = parseFloat(addStock);
        if (!addName.trim() || isNaN(st)) return;

        try {
            await apiClient.post('/ingredients', {
                name: addName.trim(),
                unit: addUnit,
                initialStock: st
            });
            await fetchIngredients();
            setAddName(''); setAddStock('0'); setIsAddOpen(false);
        } catch (err) {
            alert("Błąd zapisu surowca w magazynie.");
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingIng) return;

        try {
            await apiClient.put(`/ingredients/${editingIng.id}`, {
                name: editName.trim(),
                unit: editUnit
            });
            setIngredients(prev => prev.map(i => 
                i.id === editingIng.id ? { ...i, name: editName.trim(), unit: editUnit } : i
            ));
            setEditingIng(null);
        } catch (err) {
            alert("Błąd aktualizacji parametrów surowca.");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Usunąć surowiec "${name}" z magazynu?`)) return;

        try {
            await apiClient.delete(`/ingredients/${id}`);
            setIngredients(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            alert("Odmowa: Składnik jest twardo powiązany z recepturą aktywnego dania.");
        }
    };

    const filteredIngredients = ingredients.filter(i => 
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 font-sans">
            
            {/* TOOLBAR */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Szukaj w magazynie surowców..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* 1. Odczyt stanu isLoading w przycisku odświeżania */}
                    <button
                        onClick={fetchIngredients}
                        className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors active:scale-95"
                        title="Odśwież magazyn"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95 uppercase tracking-wider"
                    >
                        <Plus className="h-4 w-4 stroke-[3]" />
                        <span>Przyjmij towar</span>
                    </button>
                </div>
            </div>

            {/* TABELA SKŁADNIKÓW */}
            <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-900/40">
                            <th className="p-4 pl-6">Surowiec</th>
                            <th className="p-4">Jednostka</th>
                            <th className="p-4 text-right">Stan Magazynu</th>
                            <th className="p-4 pr-6 text-right">Akcje</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 text-xs">
                        {/* 2. Odczyt stanu isLoading w szkielecie ładowania */}
                        {isLoading ? (
                            [1, 2, 3].map(n => (
                                <tr key={n} className="animate-pulse bg-slate-800/40">
                                    <td className="p-4 pl-6"><div className="h-4 w-32 bg-slate-700 rounded"></div></td>
                                    <td className="p-4"><div className="h-4 w-12 bg-slate-700 rounded"></div></td>
                                    <td className="p-4 text-right"><div className="h-4 w-16 bg-slate-700 rounded ml-auto"></div></td>
                                    <td className="p-4 pr-6"><div className="h-6 w-12 bg-slate-700 rounded-lg ml-auto"></div></td>
                                </tr>
                            ))
                        ) : filteredIngredients.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-16 text-center text-slate-500 italic text-sm">
                                    Magazyn surowców jest pusty. Kliknij "Przyjmij towar" powyżej.
                                </td>
                            </tr>
                        ) : (
                            filteredIngredients.map(ing => (
                                <tr key={ing.id} className="hover:bg-slate-700/30 transition-colors group">
                                    <td className="p-4 pl-6 font-bold text-white">{ing.name}</td>
                                    <td className="p-4 font-mono text-slate-400">{ing.unit}</td>
                                    <td className="p-4 text-right font-mono font-bold text-emerald-400">
                                        {ing.stock.toFixed(2)}
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setEditingIng(ing); setEditName(ing.name); setEditUnit(ing.unit); }}
                                                className="p-1.5 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                                                title="Edytuj jednostkę"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ing.id, ing.name)}
                                                className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-700/50 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Usuń surowiec"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL DODAWANIA */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-7 max-w-sm w-full space-y-4 shadow-2xl relative">
                        <button onClick={() => setIsAddOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Carrot className="h-4 w-4 text-emerald-400" /> Nowy Surowiec
                        </h3>
                        <form onSubmit={handleAddSubmit} className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Nazwa w magazynie *</label>
                                <input
                                    type="text" required autoFocus value={addName} onChange={e => setAddName(e.target.value)}
                                    placeholder="np. Mąka typ 00"
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Jednostka</label>
                                    <select
                                        value={addUnit} onChange={e => setAddUnit(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                                    >
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="l">Litr (l)</option>
                                        <option value="szt">Sztuka (szt)</option>
                                        <option value="g">Gram (g)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Ilość startowa</label>
                                    <input
                                        type="number" step="0.01" min="0" value={addStock} onChange={e => setAddStock(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold text-xs rounded-xl px-3 py-2 text-right focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors">Anuluj</button>
                                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all">Zapisz</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDYCJI */}
            {editingIng && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-7 max-w-sm w-full space-y-4 shadow-2xl relative">
                        <button onClick={() => setEditingIng(null)} className="absolute top-5 right-5 text-slate-400 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Carrot className="h-4 w-4 text-emerald-400" /> Edytuj Parametry
                        </h3>
                        <form onSubmit={handleEditSubmit} className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Nazwa w magazynie *</label>
                                <input
                                    type="text" required value={editName} onChange={e => setEditName(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Jednostka miary</label>
                                <select
                                    value={editUnit} onChange={e => setEditUnit(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                                >
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="l">Litr (l)</option>
                                    <option value="szt">Sztuka (szt)</option>
                                    <option value="g">Gram (g)</option>
                                </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setEditingIng(null)} className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors">Anuluj</button>
                                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all">Aktualizuj</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}