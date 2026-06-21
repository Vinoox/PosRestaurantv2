import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../../api/client';
import { Carrot, Plus, Trash2, Edit2, Search, RefreshCw, X, Scale } from 'lucide-react';

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

    // Modal Dodawania
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [addName, setAddName] = useState('');
    const [addUnit, setAddUnit] = useState('Kg');
    const [addStock, setAddStock] = useState('0');

    // Modal Edycji (wraz ze stanem magazynowym!)
    const [editingIng, setEditingIng] = useState<IngredientItem | null>(null);
    const [editName, setEditName] = useState('');
    const [editUnit, setEditUnit] = useState('Kg');
    const [editStock, setEditStock] = useState('0');

    const fetchIngredients = async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get<any[]>('/ingredients');
            const norm: IngredientItem[] = res.data.map(i => ({
                id: i.id || i.Id || '',
                name: i.name || i.Name || 'Brak nazwy',
                unit: i.unit || i.Unit || 'Szt',
                // ACL: Wyłapujemy zarówno stare StockQuantity jak i initialStock
                stock: parseFloat(i.stockQuantity ?? i.StockQuantity ?? i.stock ?? i.Stock ?? i.initialStock ?? '0')
            }));
            setIngredients(norm);
        } catch (err) {
            console.error("Błąd pobierania surowców:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIngredients();
    }, [restaurantId]);

    // Wypełnienie modala edycji danymi klikniętego wiersza
    useEffect(() => {
        if (editingIng) {
            setEditName(editingIng.name);
            setEditUnit(editingIng.unit);
            setEditStock(editingIng.stock.toString());
        }
    }, [editingIng]);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const stockParsed = parseFloat(addStock);
        if (!addName.trim() || isNaN(stockParsed)) return;

        try {
            await apiClient.post('/ingredients', {
                name: addName.trim(),
                unit: addUnit,
                initialStock: stockParsed
            });
            await fetchIngredients();
            setAddName(''); setAddStock('0'); setIsAddOpen(false);
        } catch (err) {
            alert("Błąd zapisu surowca.");
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingIng) return;
        const stockParsed = parseFloat(editStock);
        if (isNaN(stockParsed)) return;

        try {
            // Kontrakt C# oczekuje: string Name, Unit Unit, decimal StockQuantity
            await apiClient.put(`/ingredients/${editingIng.id}`, {
                name: editName.trim(),
                unit: editUnit,
                stockQuantity: stockParsed
            });

            setIngredients(prev => prev.map(i => 
                i.id === editingIng.id ? { ...i, name: editName.trim(), unit: editUnit, stock: stockParsed } : i
            ));
            setEditingIng(null);
        } catch (err) {
            alert("Błąd aktualizacji stanu magazynowego.");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Usunąć surowiec "${name}" z magazynu?`)) return;

        try {
            await apiClient.delete(`/ingredients/${id}`);
            setIngredients(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            alert("Odmowa: Składnik jest powiązany z recepturą potrawy.");
        }
    };

    const filtered = ingredients.filter(i => 
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
                        placeholder="Szukaj w magazynie..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button onClick={fetchIngredients} className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all uppercase tracking-wider"
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
                            <th className="p-4 pr-6 text-right">Korekta stanu</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 text-xs">
                        {isLoading ? (
                            [1, 2, 3].map(n => (
                                <tr key={n} className="animate-pulse bg-slate-800/40">
                                    <td className="p-4 pl-6"><div className="h-4 w-32 bg-slate-700 rounded"></div></td>
                                    <td className="p-4"><div className="h-4 w-12 bg-slate-700 rounded"></div></td>
                                    <td className="p-4 text-right"><div className="h-4 w-16 bg-slate-700 rounded ml-auto"></div></td>
                                    <td className="p-4 pr-6"><div className="h-6 w-12 bg-slate-700 rounded-lg ml-auto"></div></td>
                                </tr>
                            ))
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={4} className="p-16 text-center text-slate-500 italic text-sm">Magazyn pusty.</td></tr>
                        ) : (
                            filtered.map(ing => (
                                <tr key={ing.id} className="hover:bg-slate-700/30 transition-colors group">
                                    <td className="p-4 pl-6 font-bold text-white flex items-center gap-2">
                                        <Carrot className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <span>{ing.name}</span>
                                    </td>
                                    <td className="p-4 font-mono font-bold text-slate-400">{ing.unit}</td>
                                    <td className="p-4 text-right font-mono font-extrabold text-emerald-400 text-sm">
                                        {ing.stock.toFixed(2)} <span className="text-xs font-normal text-slate-500">{ing.unit.toLowerCase()}</span>
                                    </td>
                                    <td className="p-4 pr-6 text-right">
                                        <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingIng(ing)}
                                                className="px-3 py-1.5 bg-slate-700/60 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-bold rounded-xl transition-all flex items-center gap-1.5 text-[11px]"
                                                title="Edytuj stan i parametry"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                                <span>Zmień stan</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ing.id, ing.name)}
                                                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                                title="Usuń surowiec"
                                            >
                                                <Trash2 className="h-4 w-4" />
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
                        <button onClick={() => setIsAddOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Carrot className="h-4 w-4 text-emerald-400" /> Nowy Surowiec</h3>
                        <form onSubmit={handleAddSubmit} className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Nazwa w magazynie *</label>
                                <input type="text" required autoFocus value={addName} onChange={e => setAddName(e.target.value)} placeholder="np. Mąka typ 00" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Jednostka</label>
                                    <select value={addUnit} onChange={e => setAddUnit(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500">
                                        <option value="Kg">Kilogram (kg)</option>
                                        <option value="G">Gram (g)</option>
                                        <option value="L">Litr (l)</option>
                                        <option value="Ml">Mililitr (ml)</option>
                                        <option value="Szt">Sztuka (szt)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Ilość startowa</label>
                                    <input type="number" step="0.01" min="0" value={addStock} onChange={e => setAddStock(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold text-xs rounded-xl px-3 py-2 text-right focus:outline-none focus:border-emerald-500" />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl text-xs font-bold">Anuluj</button><button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold">Zapisz</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDYCJI (Z KOREKTĄ STANU) */}
            {editingIng && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-7 max-w-sm w-full space-y-4 shadow-2xl relative">
                        <button onClick={() => setEditingIng(null)} className="absolute top-5 right-5 text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Scale className="h-4 w-4 text-amber-400" /> Korekta Surowca</h3>
                        <form onSubmit={handleEditSubmit} className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Nazwa surowca *</label>
                                <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Jednostka miary</label>
                                    <select value={editUnit} onChange={e => setEditUnit(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-500">
                                        <option value="Kg">Kilogram (kg)</option>
                                        <option value="G">Gram (g)</option>
                                        <option value="L">Litr (l)</option>
                                        <option value="Ml">Mililitr (ml)</option>
                                        <option value="Szt">Sztuka (szt)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-amber-400 mb-1">Fizyczny stan *</label>
                                    <input type="number" step="0.01" min="0" required value={editStock} onChange={e => setEditStock(e.target.value)} className="w-full bg-slate-950 border border-amber-500/50 text-amber-400 font-mono font-extrabold text-xs rounded-xl px-3 py-2 text-right focus:outline-none focus:border-amber-500 shadow-inner" />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2"><button type="button" onClick={() => setEditingIng(null)} className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl text-xs font-bold">Anuluj</button><button type="submit" className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20">Zapisz korektę</button></div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}