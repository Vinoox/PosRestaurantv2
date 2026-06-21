import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../../api/client';
import { Utensils, Plus, Trash2, Edit2, Search, X, RefreshCw, DollarSign, Power } from 'lucide-react';

interface ProductItem {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    categoryName: string;
    isAvailable: boolean;
}

interface CategoryLookup {
    id: string;
    name: string;
}

interface ProductsSubTabProps {
    restaurantId: string;
}

export default function ProductsSubTab({ restaurantId }: ProductsSubTabProps) {
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [categories, setCategories] = useState<CategoryLookup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtry
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

    // Modale
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addName, setAddName] = useState('');
    const [addDesc, setAddDesc] = useState('');
    const [addPrice, setAddPrice] = useState('');
    const [addCategoryId, setAddCategoryId] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const [editingProd, setEditingProd] = useState<ProductItem | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editCategoryId, setEditCategoryId] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [prodRes, catRes] = await Promise.all([
                apiClient.get<any[]>('/products'),
                apiClient.get<any[]>('/categories')
            ]);

            const normCats: CategoryLookup[] = catRes.data.map(c => ({
                id: c.id || c.Id || '',
                name: c.name || c.Name || ''
            }));
            setCategories(normCats);

            const normProds: ProductItem[] = prodRes.data.map(p => {
                const catId = p.categoryId || p.CategoryId || '';
                const matchingCat = normCats.find(c => c.id === catId);
                return {
                    id: p.id || p.Id || '',
                    name: p.name || p.Name || 'Brak nazwy',
                    description: p.description || p.Description || '',
                    price: parseFloat(p.price || p.Price || '0'),
                    categoryId: catId,
                    categoryName: matchingCat ? matchingCat.name : (p.categoryName || 'Inne'),
                    isAvailable: p.isAvailable ?? p.IsAvailable ?? true
                };
            });

            setProducts(normProds);
            if (normCats.length > 0) {
                setAddCategoryId(normCats[0].id);
            }
        } catch (err) {
            console.error("Błąd ładowania menu:", err);
            setError("Nie udało się załadować karty dań. Sprawdź połączenie z Catalog API.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [restaurantId]);

    useEffect(() => {
        if (editingProd) {
            setEditName(editingProd.name);
            setEditDesc(editingProd.description);
            setEditPrice(editingProd.price.toString());
            setEditCategoryId(editingProd.categoryId);
        }
    }, [editingProd]);

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedPrice = parseFloat(addPrice);
        if (!addName.trim() || isNaN(parsedPrice) || !addCategoryId) return;

        setIsAdding(true);
        try {
            await apiClient.post('/products', {
                name: addName.trim(),
                description: addDesc.trim(),
                price: parsedPrice,
                categoryId: addCategoryId,
                ingredients: []
            });

            await fetchData();
            setAddName(''); setAddDesc(''); setAddPrice('');
            setIsAddModalOpen(false);
        } catch (err: any) {
            console.error("Błąd dodawania produktu:", err);
            alert(err.response?.data?.detail || "Nie udało się zapisać dania.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProd) return;

        const parsedPrice = parseFloat(editPrice);
        if (!editName.trim() || isNaN(parsedPrice) || !editCategoryId) return;

        setIsSavingEdit(true);
        try {
            await apiClient.put(`/products/${editingProd.id}`, {
                name: editName.trim(),
                description: editDesc.trim(),
                price: parsedPrice,
                categoryId: editCategoryId,
                isAvailable: editingProd.isAvailable,
                ingredients: []
            });

            await fetchData();
            setEditingProd(null);
        } catch (err) {
            console.error("Błąd edycji dania:", err);
            alert("Nie udało się zapisać zmian.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleToggleAvailability = async (item: ProductItem) => {
        const nextState = !item.isAvailable;
        setTogglingId(item.id);

        setProducts(prev => prev.map(p => p.id === item.id ? { ...p, isAvailable: nextState } : p));

        try {
            await apiClient.put(`/products/${item.id}`, {
                ...item,
                isAvailable: nextState,
                IsAvailable: nextState,
                ingredients: []
            });
        } catch (err) {
            console.error("Błąd przełączania 86:", err);
            setProducts(prev => prev.map(p => p.id === item.id ? { ...p, isAvailable: item.isAvailable } : p));
            alert("Błąd synchronizacji z kasą POS.");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Czy na pewno wycofać danie "${name}" z menu?`)) return;

        try {
            await apiClient.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Błąd usuwania:", err);
            alert("Nie można wycofać dania. Prawdopodobnie widnieje na otwartych rachunkach.");
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesCat = selectedCategoryFilter === 'ALL' || p.categoryId === selectedCategoryFilter;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="space-y-6 font-sans">
            
            {/* TOOLBAR */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Szukaj potrawy lub składnika..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                        />
                    </div>
                    
                    {/* PRAWIDŁOWA SKŁADNIA JSX: {categories.map(...)} */}
                    <select
                        value={selectedCategoryFilter}
                        onChange={e => setSelectedCategoryFilter(e.target.value)}
                        className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500 sm:w-56 cursor-pointer"
                    >
                        <option value="ALL">Kategoria: Wszystkie</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-auto">
                    <button 
                        onClick={fetchData} 
                        className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors"
                        title="Odśwież menu"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
                    </button>
                    <button
                        onClick={() => {
                            if (categories.length === 0) {
                                alert("Najpierw musisz dodać chociaż jedną kategorię w zakładce obok!");
                                return;
                            }
                            setIsAddModalOpen(true);
                        }}
                        className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/10 flex items-center gap-2 transition-all active:scale-95 uppercase tracking-wider"
                    >
                        <Plus className="h-4 w-4 stroke-[3]" />
                        <span>Dodaj do karty</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold text-center">
                    {error}
                </div>
            )}

            {/* SIATKA PRODUKTÓW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map(n => (
                        <div key={n} className="bg-slate-800 border border-slate-700/60 rounded-3xl p-6 h-48 animate-pulse flex flex-col justify-between">
                            <div className="h-6 w-24 bg-slate-700 rounded-full"></div>
                            <div className="space-y-2">
                                <div className="h-5 w-3/4 bg-slate-700 rounded"></div>
                                <div className="h-4 w-1/4 bg-slate-700 rounded"></div>
                            </div>
                        </div>
                    ))
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full p-16 text-center text-slate-500 text-sm bg-slate-800/30 rounded-3xl border border-slate-700/50">
                        Brak potraw w tej kategorii.
                    </div>
                ) : (
                    filteredProducts.map(item => {
                        const isSoldOut = !item.isAvailable;
                        const isToggling = togglingId === item.id;

                        return (
                            <div 
                                key={item.id}
                                className={`bg-slate-800 border rounded-3xl p-6 flex flex-col justify-between transition-all shadow-xl relative overflow-hidden ${
                                    isSoldOut ? 'border-red-500/40 bg-slate-800/60 opacity-75' : 'border-slate-700 hover:border-slate-500'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-amber-400 border border-slate-700">
                                            {item.categoryName}
                                        </span>
                                        
                                        <button
                                            onClick={() => handleToggleAvailability(item)}
                                            disabled={isToggling}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider border transition-all shadow-sm ${
                                                isSoldOut 
                                                ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse hover:bg-red-500/25' 
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-red-500 hover:text-red-400'
                                            }`}
                                        >
                                            <Power className="h-3 w-3" />
                                            <span>{isSoldOut ? '86\'d (BRAK)' : 'W SPRZEDAŻY'}</span>
                                        </button>
                                    </div>

                                    <div className="my-2 space-y-1.5">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <h3 className={`text-lg font-extrabold leading-tight ${isSoldOut ? 'line-through text-slate-400' : 'text-white'}`}>
                                                {item.name}
                                            </h3>
                                            <span className="text-sm font-black font-mono text-emerald-400 shrink-0">
                                                {item.price.toFixed(2)} zł
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                            {item.description || <span className="italic text-slate-600">Brak opisu...</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 mt-4 border-t border-slate-700/60 flex justify-between items-center text-[10px] font-mono text-slate-500">
                                    <span>REF: {item.id.substring(0, 8)}</span>
                                    <div className="flex gap-1.5">
                                        <button 
                                            onClick={() => setEditingProd(item)} 
                                            className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
                                            title="Edytuj potrawę"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id, item.name)} 
                                            className="p-2 bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                                            title="Usuń z menu"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* MODAL DODAWANIA */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl relative">
                        <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
                            <X className="h-6 w-6" />
                        </button>
                        
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Utensils className="h-5 w-5 text-amber-400" /> 
                                Nowe Danie w Karcie
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Wprowadź pozycję do globalnego cennika klastra Catalog API.
                            </p>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Nazwa potrawy *</label>
                                <input 
                                    type="text" required autoFocus 
                                    value={addName} onChange={e => setAddName(e.target.value)} 
                                    placeholder="np. Tagliatelle al Ragù" 
                                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-bold" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Cena brutto (zł) *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 h-3.5 w-3.5 text-emerald-400" />
                                        <input 
                                            type="number" step="0.01" min="0" required 
                                            value={addPrice} onChange={e => setAddPrice(e.target.value)} 
                                            placeholder="38.50" 
                                            className="w-full pl-8 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Kategoria *</label>
                                    {/* PRAWIDŁOWA SKŁADNIA JSX: {categories.map(...)} */}
                                    <select 
                                        value={addCategoryId} onChange={e => setAddCategoryId(e.target.value)} 
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-amber-500"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Opis dania / Alergeny</label>
                                <textarea 
                                    rows={3} 
                                    value={addDesc} onChange={e => setAddDesc(e.target.value)} 
                                    placeholder="Składniki, informacja o glutenie, stopień ostrości..." 
                                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed" 
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
                                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                                >
                                    {isAdding ? 'Zapisywanie...' : 'Zapisz w karcie'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDYCJI */}
            {editingProd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 md:p-8 space-y-5 shadow-2xl relative">
                        <button onClick={() => setEditingProd(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
                            <X className="h-6 w-6" />
                        </button>

                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Edit2 className="h-5 w-5 text-amber-400" /> Edytuj Danie
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Aktualizacja parametrów w klastrze Catalog API.
                            </p>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Nazwa potrawy *</label>
                                <input 
                                    type="text" required 
                                    value={editName} onChange={e => setEditName(e.target.value)} 
                                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-bold" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Cena brutto (zł) *</label>
                                    <input 
                                        type="number" step="0.01" min="0" required 
                                        value={editPrice} onChange={e => setEditPrice(e.target.value)} 
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Kategoria *</label>
                                    {/* PRAWIDŁOWA SKŁADNIA JSX: {categories.map(...)} */}
                                    <select 
                                        value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)} 
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-amber-500"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Opis dania / Alergeny</label>
                                <textarea 
                                    rows={3} 
                                    value={editDesc} onChange={e => setEditDesc(e.target.value)} 
                                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed" 
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" onClick={() => setEditingProd(null)} 
                                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-colors"
                                >
                                    Anuluj
                                </button>
                                <button 
                                    type="submit" disabled={isSavingEdit} 
                                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                                >
                                    {isSavingEdit ? 'Zapisywanie...' : 'Zapisz zmiany'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}