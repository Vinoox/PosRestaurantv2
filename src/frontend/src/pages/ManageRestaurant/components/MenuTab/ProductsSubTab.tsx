import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../../api/client';
import { Utensils, Plus, Trash2, Edit2, Search, X, RefreshCw, DollarSign, Power, ChefHat } from 'lucide-react';

interface ProductIngredientItem {
    ingredientId: string;
    ingredientName: string;
    unit: string;
    quantityUsed: number;
}

interface ProductItem {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    categoryName: string;
    isAvailable: boolean;
    ingredients: ProductIngredientItem[]; // Receptura dania
}

interface LookupItem { id: string; name: string; unit?: string; }

interface ProductsSubTabProps { restaurantId: string; }

export default function ProductsSubTab({ restaurantId }: ProductsSubTabProps) {
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [categories, setCategories] = useState<LookupItem[]>([]);
    const [availableIngredients, setAvailableIngredients] = useState<LookupItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filtry
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

    // Kreator Receptury (Stan roboczy dla Modali)
    const [recipeDraft, setRecipeDraft] = useState<ProductIngredientItem[]>([]);
    const [selectedIngId, setSelectedIngId] = useState('');
    const [ingQtyInput, setIngQtyInput] = useState('');

    // Modal Dodawania
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [addName, setAddName] = useState('');
    const [addDesc, setAddDesc] = useState('');
    const [addPrice, setAddPrice] = useState('');
    const [addCatId, setAddCatId] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Modal Edycji
    const [editingProd, setEditingProd] = useState<ProductItem | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editCatId, setEditCatId] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchAllMenuVectors = async () => {
        setIsLoading(true);
        try {
            // Pobieramy 3 potężne wektory domenowe naraz
            const [pRes, cRes, iRes] = await Promise.all([
                apiClient.get<any[]>('/products'),
                apiClient.get<any[]>('/categories'),
                apiClient.get<any[]>('/ingredients')
            ]);

            const normCats: LookupItem[] = cRes.data.map(c => ({ id: c.id || c.Id, name: c.name || c.Name }));
            const normIngs: LookupItem[] = iRes.data.map(i => ({ id: i.id || i.Id, name: i.name || i.Name, unit: i.unit || i.Unit || 'szt' }));

            setCategories(normCats);
            setAvailableIngredients(normIngs);

            const normProds: ProductItem[] = pRes.data.map(p => {
                const cId = p.categoryId || p.CategoryId || '';
                const matchCat = normCats.find(c => c.id === cId);
                
                // Mapowanie receptur złączeniowych C# -> React
                const rawIngs = Array.isArray(p.ingredients || p.Ingredients) ? (p.ingredients || p.Ingredients) : [];
                const mappedRecipe: ProductIngredientItem[] = rawIngs.map((ri: any) => ({
                    ingredientId: ri.ingredientId || ri.IngredientId,
                    ingredientName: ri.ingredientName || ri.IngredientName || 'Surowiec',
                    unit: ri.unit || ri.Unit || 'szt',
                    quantityUsed: parseFloat(ri.quantityUsed ?? ri.QuantityUsed ?? '0')
                }));

                return {
                    id: p.id || p.Id || '',
                    name: p.name || p.Name || 'Brak',
                    description: p.description || p.Description || '',
                    price: parseFloat(p.price || p.Price || '0'),
                    categoryId: cId,
                    categoryName: matchCat ? matchCat.name : 'Inne',
                    isAvailable: p.isAvailable ?? p.IsAvailable ?? true,
                    ingredients: mappedRecipe
                };
            });

            setProducts(normProds);
            if (normCats.length > 0) setAddCatId(normCats[0].id);
            if (normIngs.length > 0) setSelectedIngId(normIngs[0].id);
        } catch (err) {
            console.error("Błąd ładowania silnika menu:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAllMenuVectors(); }, [restaurantId]);

    // Inicjalizacja modala edycji wraz z kopią jego receptury
    useEffect(() => {
        if (editingProd) {
            setEditName(editingProd.name);
            setEditDesc(editingProd.description);
            setEditPrice(editingProd.price.toString());
            setEditCatId(editingProd.categoryId);
            setRecipeDraft([...editingProd.ingredients]); // Kopia receptury do draftu
        }
    }, [editingProd]);

    // --- LOGIKA KREATORA RECEPTUR ---
    const handleAddIngToRecipeDraft = () => {
        const q = parseFloat(ingQtyInput);
        if (!selectedIngId || isNaN(q) || q <= 0) return;

        const target = availableIngredients.find(ai => ai.id === selectedIngId);
        if (!target) return;

        setRecipeDraft(prev => {
            const exists = prev.find(item => item.ingredientId === selectedIngId);
            if (exists) {
                return prev.map(item => item.ingredientId === selectedIngId ? { ...item, quantityUsed: item.quantityUsed + q } : item);
            }
            return [...prev, {
                ingredientId: target.id,
                ingredientName: target.name,
                unit: target.unit || 'szt',
                quantityUsed: q
            }];
        });
        setIngQtyInput('');
    };

    const handleRemoveIngFromDraft = (ingId: string) => {
        setRecipeDraft(prev => prev.filter(item => item.ingredientId !== ingId));
    };

    // Surowce, których jeszcze nie ma w roboczym drafcie (żeby nie duplikować w select)
    const ingredientsAvailableToAdd = availableIngredients.filter(ai => !recipeDraft.some(rd => rd.ingredientId === ai.id));

    // --- ZAPISY (POST / PUT) ---
    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); const pParsed = parseFloat(addPrice);
        if (!addName.trim() || isNaN(pParsed) || !addCatId) return;

        setIsAdding(true);
        try {
            await apiClient.post('/products', {
                name: addName.trim(),
                description: addDesc.trim(),
                price: pParsed,
                categoryId: addCatId,
                // Przekazujemy zbudowaną recepturę w formacie camelCase!
                ingredients: recipeDraft.map(rd => ({
                    ingredientId: rd.ingredientId,
                    quantityUsed: rd.quantityUsed
                }))
            });

            await fetchAllMenuVectors();
            setAddName(''); setAddDesc(''); setAddPrice(''); setIsAddOpen(false);
        } catch (err) { alert("Błąd zapisu potrawy."); } finally { setIsAdding(false); }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!editingProd) return; const pParsed = parseFloat(editPrice); if (isNaN(pParsed)) return;

        setIsSavingEdit(true);
        try {
            await apiClient.put(`/products/${editingProd.id}`, {
                name: editName.trim(),
                description: editDesc.trim(),
                price: pParsed,
                categoryId: editCatId,
                isAvailable: editingProd.isAvailable,
                ingredients: recipeDraft.map(rd => ({
                    ingredientId: rd.ingredientId,
                    quantityUsed: rd.quantityUsed
                }))
            });

            await fetchAllMenuVectors(); setEditingProd(null);
        } catch (err) { alert("Błąd aktualizacji potrawy."); } finally { setIsSavingEdit(false); }
    };

    const handleToggle86 = async (item: ProductItem) => {
        const next = !item.isAvailable; setTogglingId(item.id);
        setProducts(prev => prev.map(p => p.id === item.id ? { ...p, isAvailable: next } : p));
        try {
            await apiClient.put(`/products/${item.id}`, { ...item, isAvailable: next, ingredients: item.ingredients });
        } catch (err) {
            setProducts(prev => prev.map(p => p.id === item.id ? { ...p, isAvailable: item.isAvailable } : p));
            alert("Błąd synchronizacji 86'd z kasą POS.");
        } finally { setTogglingId(null); }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Wycofać danie "${name}" ze sprzedaży?`)) return;
        try { await apiClient.delete(`/products/${id}`); setProducts(prev => prev.filter(p => p.id !== id)); } catch (err) { alert("Błąd usuwania"); }
    };

    const filtered = products.filter(p => (selectedCategoryFilter === 'ALL' || p.categoryId === selectedCategoryFilter) && p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-6 font-sans">
            
            {/* TOOLBAR */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Szukaj potrawy..." className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-medium" />
                    </div>
                    <select value={selectedCategoryFilter} onChange={e => setSelectedCategoryFilter(e.target.value)} className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500 sm:w-56 cursor-pointer">
                        <option value="ALL">Kategoria: Wszystkie</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-auto">
                    <button onClick={fetchAllMenuVectors} className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
                    </button>
                    <button
                        onClick={() => {
                            if (categories.length === 0) { alert("Najpierw utwórz kategorię w zakładce obok!"); return; }
                            setRecipeDraft([]); // Reset draftu przed otwarciem
                            if (availableIngredients.length > 0) setSelectedIngId(availableIngredients[0].id);
                            setIsAddOpen(true);
                        }}
                        className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/10 flex items-center gap-2 transition-all uppercase tracking-wider"
                    >
                        <Plus className="h-4 w-4 stroke-[3]" />
                        <span>Dodaj do karty</span>
                    </button>
                </div>
            </div>

            {/* SIATKA DAŃ (Z PODGLĄDEM RECEPTURY) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {isLoading ? (
                    [1, 2, 3].map(n => <div key={n} className="bg-slate-800 border border-slate-700/60 rounded-3xl p-6 h-52 animate-pulse"></div>)
                ) : filtered.length === 0 ? (
                    <div className="col-span-full p-16 text-center text-slate-500 text-sm bg-slate-800/30 rounded-3xl border border-slate-700/50">Brak dań spełniających kryteria.</div>
                ) : (
                    filtered.map(item => {
                        const isSoldOut = !item.isAvailable;
                        const ingCount = item.ingredients.length;

                        return (
                            <div key={item.id} className={`bg-slate-800 border rounded-3xl p-6 flex flex-col justify-between transition-all shadow-xl relative overflow-hidden ${isSoldOut ? 'border-red-500/40 bg-slate-800/60 opacity-75' : 'border-slate-700 hover:border-slate-500'}`}>
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-amber-400 border border-slate-700">{item.categoryName}</span>
                                        <button onClick={() => handleToggle86(item)} disabled={togglingId === item.id} className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider border transition-all ${isSoldOut ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-red-500 hover:text-red-400'}`}>
                                            <Power className="h-3 w-3 inline mr-1" /> {isSoldOut ? '86\'d (BRAK)' : 'W SPRZEDAŻY'}
                                        </button>
                                    </div>

                                    <div className="my-2 space-y-1">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <h3 className={`text-lg font-extrabold leading-tight ${isSoldOut ? 'line-through text-slate-400' : 'text-white'}`}>{item.name}</h3>
                                            <span className="text-sm font-black font-mono text-emerald-400 shrink-0">{item.price.toFixed(2)} zł</span>
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-2">{item.description || <span className="italic text-slate-600">Brak opisu...</span>}</p>
                                    </div>

                                    {/* PIĘKNY PODGLĄD SKŁADNIKÓW ERP */}
                                    <div className="mt-3 pt-3 border-t border-slate-700/40">
                                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 flex items-center gap-1 mb-1.5">
                                            <ChefHat className="h-3 w-3 text-amber-500" /> Receptura ({ingCount} surowców):
                                        </span>
                                        <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto pr-1">
                                            {ingCount === 0 ? <span className="text-[11px] text-slate-600 italic font-mono">Danie niezwiązane z magazynem (Brak normy)</span> : (
                                                item.ingredients.map(ing => (
                                                    <span key={ing.ingredientId} className="px-2 py-0.5 bg-slate-900/90 text-slate-300 font-mono text-[10px] rounded-md border border-slate-700/60">
                                                        {ing.ingredientName}: <strong className="text-amber-400">{ing.quantityUsed}</strong>{ing.unit.toLowerCase()}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 mt-4 border-t border-slate-700/60 flex justify-between items-center text-[10px] font-mono text-slate-500">
                                    <span>REF: {item.id.substring(0,6)}</span>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => { setEditingProd(item); if (ingredientsAvailableToAdd.length > 0) setSelectedIngId(ingredientsAvailableToAdd[0].id); }} className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                                        <button onClick={() => handleDelete(item.id, item.name)} className="p-2 bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* MODAL DODAWANIA WRAZ Z KREATOREM RECEPTURY */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto relative">
                        <button onClick={() => setIsAddOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X className="h-6 w-6" /></button>
                        <div><h3 className="text-xl font-bold text-white flex items-center gap-2"><Utensils className="h-5 w-5 text-amber-400" /> Karta Dań i Receptura</h3></div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div><label className="block text-xs font-semibold text-slate-300 mb-1">Nazwa potrawy *</label><input type="text" required autoFocus value={addName} onChange={e => setAddName(e.target.value)} placeholder="np. Penne Bolognese" className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-500" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Cena brutto (zł) *</label><div className="relative"><DollarSign className="absolute left-3 top-3 h-3.5 w-3.5 text-emerald-400" /><input type="number" step="0.01" min="0" required value={addPrice} onChange={e => setAddPrice(e.target.value)} placeholder="38.50" className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500" /></div></div>
                                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Kategoria *</label><select value={addCatId} onChange={e => setAddCatId(e.target.value)} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-amber-500">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                            </div>
                            <div><label className="block text-xs font-semibold text-slate-300 mb-1">Opis dla kelnera / Alergeny</label><textarea rows={2} value={addDesc} onChange={e => setAddDesc(e.target.value)} className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500" /></div>

                            {/* --- SEKCJA DYNAMICZNEJ RECEPTURY --- */}
                            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700/80 space-y-3">
                                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5"><ChefHat className="h-4 w-4" /> Normatyw surowcowy (Receptura)</span>
                                
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <select value={selectedIngId} onChange={e => setSelectedIngId(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-semibold">
                                        {ingredientsAvailableToAdd.length === 0 ? <option value="">-- Brak wolnych surowców --</option> : (
                                            ingredientsAvailableToAdd.map(ai => <option key={ai.id} value={ai.id}>{ai.name} ({ai.unit})</option>)
                                        )}
                                    </select>
                                    <input type="number" step="0.01" min="0" value={ingQtyInput} onChange={e => setIngQtyInput(e.target.value)} placeholder="Zużycie" className="w-24 bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold text-xs rounded-xl px-3 py-2 text-right focus:outline-none focus:border-amber-500" />
                                    <button type="button" onClick={handleAddIngToRecipeDraft} disabled={!selectedIngId || !ingQtyInput} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shrink-0">+ Wepnij</button>
                                </div>

                                <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                                    {recipeDraft.length === 0 ? <p className="text-[11px] text-slate-500 italic text-center py-2">Brak przypisanych składników. Danie nie będzie pomniejszać magazynu.</p> : (
                                        recipeDraft.map(rd => (
                                            <div key={rd.ingredientId} className="flex justify-between items-center px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700 text-xs">
                                                <span className="font-bold text-slate-200">{rd.ingredientName}</span>
                                                <div className="flex items-center gap-3 font-mono"><span className="text-amber-400 font-bold">{rd.quantityUsed} <small className="font-sans text-slate-400">{rd.unit.toLowerCase()}</small></span> <button type="button" onClick={() => handleRemoveIngFromDraft(rd.ingredientId)} className="text-slate-500 hover:text-red-400 font-bold"><Trash2 className="h-3.5 w-3.5" /></button></div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2"><button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 bg-slate-700 text-white rounded-xl text-xs font-bold">Anuluj</button><button type="submit" disabled={isAdding} className="flex-1 py-3 bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20">Zapisz danie i normę</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDYCJI (Z EDYTOR RECEPTURY) */}
            {editingProd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto relative">
                        <button onClick={() => setEditingProd(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X className="h-6 w-6" /></button>
                        <div><h3 className="text-xl font-bold text-white flex items-center gap-2"><Edit2 className="h-5 w-5 text-amber-400" /> Edytuj Danie i Normę</h3></div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div><label className="block text-xs font-semibold text-slate-300 mb-1">Nazwa potrawy *</label><input type="text" required value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-500" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Cena brutto (zł) *</label><input type="number" step="0.01" min="0" required value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500" /></div>
                                <div><label className="block text-xs font-semibold text-slate-300 mb-1">Kategoria *</label><select value={editCatId} onChange={e => setEditCatId(e.target.value)} className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-amber-500">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                            </div>
                            <div><label className="block text-xs font-semibold text-slate-300 mb-1">Opis dania</label><textarea rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500" /></div>

                            {/* --- SEKCJA DYNAMICZNEJ RECEPTURY --- */}
                            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700/80 space-y-3">
                                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5"><ChefHat className="h-4 w-4" /> Normatyw surowcowy (Receptura)</span>
                                
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <select value={selectedIngId} onChange={e => setSelectedIngId(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-semibold">
                                        {availableIngredients.map(ai => <option key={ai.id} value={ai.id}>{ai.name} ({ai.unit})</option>)}
                                    </select>
                                    <input type="number" step="0.01" min="0" value={ingQtyInput} onChange={e => setIngQtyInput(e.target.value)} placeholder="Zużycie" className="w-24 bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold text-xs rounded-xl px-3 py-2 text-right focus:outline-none focus:border-amber-500" />
                                    <button type="button" onClick={handleAddIngToRecipeDraft} disabled={!selectedIngId || !ingQtyInput} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shrink-0">+ Wepnij</button>
                                </div>

                                <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                                    {recipeDraft.length === 0 ? <p className="text-[11px] text-slate-500 italic text-center py-2">Brak przypisanych składników.</p> : (
                                        recipeDraft.map(rd => (
                                            <div key={rd.ingredientId} className="flex justify-between items-center px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700 text-xs">
                                                <span className="font-bold text-slate-200">{rd.ingredientName}</span>
                                                <div className="flex items-center gap-3 font-mono"><span className="text-amber-400 font-bold">{rd.quantityUsed} <small className="font-sans text-slate-400">{rd.unit.toLowerCase()}</small></span> <button type="button" onClick={() => handleRemoveIngFromDraft(rd.ingredientId)} className="text-slate-500 hover:text-red-400 font-bold"><Trash2 className="h-3.5 w-3.5" /></button></div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2"><button type="button" onClick={() => setEditingProd(null)} className="flex-1 py-3 bg-slate-700 text-white rounded-xl text-xs font-bold">Anuluj</button><button type="submit" disabled={isSavingEdit} className="flex-1 py-3 bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20">Aktualizuj danie i normę</button></div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}