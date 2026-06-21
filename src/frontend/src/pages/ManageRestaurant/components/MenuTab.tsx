import { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { 
    Utensils, Plus, Trash2, Edit2, Search, X, AlertCircle, RefreshCw, DollarSign, Tag, Power 
} from 'lucide-react';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    isAvailable: boolean;
}

interface MenuTabProps {
    restaurantId: string;
}

export default function MenuTab({ restaurantId }: MenuTabProps) {
    // --- STANY GŁÓWNE ---
    const [items, setItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stany filtrów
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    // Stany Modala Dodawania
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [isSavingAdd, setIsSavingAdd] = useState(false);

    // Stany Modala Edycji
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Blokada wiersza podczas przełączania "86"
    const [togglingItemId, setTogglingItemId] = useState<string | null>(null);

    // --- POBIERANIE MENU (Z klastra Catalog.API /products) ---
    const fetchMenu = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Przekazujemy ID restauracji jako parametr zapytania do mikroserwisu produktów
            const res = await apiClient.get<any[]>('/products');
            // ACL Normalizacja: uodparniamy TS na PascalCase vs camelCase z C#
            const normalized: MenuItem[] = res.data.map(item => ({
                id: item.id || item.Id || item.productId || item.ProductId || Math.random().toString(),
                name: item.name || item.Name || 'Brak nazwy',
                description: item.description || item.Description || '',
                price: parseFloat(item.price || item.Price || '0'),
                category: item.category || item.Category || item.categoryName || 'Inne',
                isAvailable: item.isAvailable ?? item.IsAvailable ?? true
            }));

            setItems(normalized);
        } catch (err) {
            console.error("Błąd pobierania menu:", err);
            setError("Nie udało się załadować karty dań. Sprawdź połączenie z Catalog API.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, [restaurantId]);

    // Automatyczne wypełnianie pól modala edycji
    useEffect(() => {
        if (editingItem) {
            setEditName(editingItem.name);
            setEditDesc(editingItem.description);
            setEditPrice(editingItem.price.toString());
            setEditCategory(editingItem.category);
        }
    }, [editingItem]);

    // Dynamiczna lista unikalnych kategorii
    const categories = ['ALL', ...Array.from(new Set(items.map(i => i.category)))];

    // --- TWORZENIE POZYCJI (POST /products) ---
    const handleAddItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsedPrice = parseFloat(newPrice);
        if (!newName.trim() || isNaN(parsedPrice)) return;

        setIsSavingAdd(true);
        try {
            // KLUCZOWE: Doklejamy restaurantId do obiektu dla Catalog.API
            await apiClient.post('/products', {
                restaurantId: restaurantId,
                name: newName.trim(),
                description: newDesc.trim(),
                price: parsedPrice,
                category: newCategory.trim() || 'Główna',
                isAvailable: true
            });

            await fetchMenu();
            setNewName(''); setNewDesc(''); setNewPrice(''); setNewCategory('');
            setIsAddModalOpen(false);
        } catch (err: any) {
            console.error("Błąd zapisu dania:", err);
            alert(err.response?.data?.detail || "Nie udało się dodać pozycji do menu.");
        } finally {
            setIsSavingAdd(false);
        }
    };

    // --- EDYCJA POZYCJI (PUT /products/{id}) ---
    const handleEditItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        const parsedPrice = parseFloat(editPrice);
        if (!editName.trim() || isNaN(parsedPrice)) return;

        setIsSavingEdit(true);
        try {
            const updatedPayload = {
                restaurantId: restaurantId,
                name: editName.trim(),
                description: editDesc.trim(),
                price: parsedPrice,
                category: editCategory.trim() || 'Główna',
                isAvailable: editingItem.isAvailable
            };

            await apiClient.put(`/products/${editingItem.id}`, updatedPayload);

            setItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...updatedPayload } : item));
            setEditingItem(null);
        } catch (err) {
            console.error("Błąd edycji dania:", err);
            alert("Nie udało się zapisać zmian w pozycji.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    // --- PRZEŁĄCZNIK "86 / WYPRZEDANE" (PUT /products/{id}) ---
    const handleToggleAvailability = async (item: MenuItem) => {
        const nextState = !item.isAvailable;
        setTogglingItemId(item.id);

        // Optimistic UI Update
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, isAvailable: nextState } : i));

        try {
            await apiClient.put(`/products/${item.id}`, {
                ...item,
                restaurantId: restaurantId,
                isAvailable: nextState,
                IsAvailable: nextState
            });
        } catch (err) {
            console.error("Błąd przełączania 86'd, wycofywanie stanu:", err);
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, isAvailable: item.isAvailable } : i));
            alert("Nie można zmienić stanu dostępności dania.");
        } finally {
            setTogglingItemId(null);
        }
    };

    // --- USUWANIE POZYCJI (DELETE /products/{id}) ---
    const handleDeleteItem = async (itemId: string, itemName: string) => {
        if (!confirm(`Czy na pewno wycofać z karty pozycję "${itemName}"?`)) return;

        try {
            await apiClient.delete(`/products/${itemId}`);
            setItems(prev => prev.filter(i => i.id !== itemId));
        } catch (err) {
            console.error("Błąd usuwania:", err);
            alert("Nie udało się usunąć pozycji. Prawdopodobnie widnieje na otwartych rachunkach.");
        }
    };

    // Filtrowanie z zabezpieczeniem null-pointera
    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'ALL' || item.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-6 font-sans">
            
            {/* GÓRNY BANER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Utensils className="h-6 w-6 text-amber-400" />
                        Cyfrowa Karta Dań (Menu)
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        Zarządzaj pozycjami w klastrze Catalog API. Wyłączenie dania natychmiastowo blokuje je na kasach POS.
                    </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                        onClick={fetchMenu}
                        className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl transition-colors active:scale-95"
                        title="Odśwież menu"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4 stroke-[3]" />
                        <span>Dodaj danie</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2 font-medium">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* TOOLBAR: WYSZUKIWARKA + PASEK KATEGORII */}
            <div className="space-y-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Szukaj w nazwach lub składnikach..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
                        <Tag className="h-3 w-3" /> Kategorie:
                    </span>
                    {categories.map(cat => {
                        const isSelected = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shrink-0 ${
                                    isSelected 
                                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 scale-105' 
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                                }`}
                            >
                                {cat === 'ALL' ? 'Wszystkie' : cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* SIATKA POZYCJI MENU (GRID) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map(n => (
                        <div key={n} className="bg-slate-800 border border-slate-700/60 rounded-3xl p-6 h-48 animate-pulse flex flex-col justify-between">
                            <div className="flex justify-between">
                                <div className="h-6 w-24 bg-slate-700 rounded-full"></div>
                                <div className="h-6 w-16 bg-slate-700 rounded-lg"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-5 w-44 bg-slate-700 rounded"></div>
                                <div className="h-3 w-full bg-slate-700/50 rounded"></div>
                            </div>
                            <div className="h-8 w-full bg-slate-700/80 rounded-xl mt-4"></div>
                        </div>
                    ))
                ) : filteredItems.length === 0 ? (
                    <div className="col-span-full p-16 text-center text-slate-500 text-sm bg-slate-800/30 rounded-3xl border border-slate-700/50">
                        Brak dań w tej kategorii.
                    </div>
                ) : (
                    filteredItems.map(item => {
                        const isSoldOut = !item.isAvailable;
                        const isTogglingThis = togglingItemId === item.id;

                        return (
                            <div 
                                key={item.id}
                                className={`bg-slate-800 border rounded-3xl p-6 flex flex-col justify-between transition-all relative overflow-hidden shadow-xl ${
                                    isSoldOut ? 'border-red-500/40 bg-slate-800/60 opacity-75' : 'border-slate-700 hover:border-slate-500'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900/80 text-amber-400 border border-slate-700">
                                        {item.category}
                                    </span>

                                    <button
                                        onClick={() => handleToggleAvailability(item)}
                                        disabled={isTogglingThis}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide transition-all border shadow-sm ${
                                            isSoldOut
                                            ? 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25 animate-pulse'
                                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                                        }`}
                                        title={isSoldOut ? 'Kliknij, aby przywrócić na kasy' : 'Kliknij, aby wycofać z kuchni (86)'}
                                    >
                                        <Power className="h-3 w-3" />
                                        <span>{isSoldOut ? 'WYPRZEDANE (86)' : 'DOSTĘPNE'}</span>
                                    </button>
                                </div>

                                <div className="my-2 space-y-1.5">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <h3 className={`text-lg font-extrabold text-white leading-tight ${isSoldOut ? 'line-through text-slate-400' : ''}`}>
                                            {item.name}
                                        </h3>
                                        <span className="text-base font-black font-mono text-emerald-400 shrink-0">
                                            {item.price.toFixed(2)} zł
                                        </span>
                                    </div>
                                    
                                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                        {item.description || <span className="italic text-slate-600">Brak opisu...</span>}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-700/60">
                                    <span className="text-[10px] font-mono text-slate-500">
                                        ID: {item.id.split('-')[0]}
                                    </span>
                                    
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setEditingItem(item)}
                                            className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
                                            title="Edytuj danie"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id, item.name)}
                                            className="p-2 bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                                            title="Usuń danie z cennika"
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
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative space-y-5">
                        <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
                            <X className="h-6 w-6" />
                        </button>

                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Utensils className="h-5 w-5 text-amber-400" /> Nowe Danie
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Wprowadź pozycję do globalnego cennika Catalog API.</p>
                        </div>

                        <form onSubmit={handleAddItemSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Nazwa dania *</label>
                                <input
                                    type="text" required autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                                    placeholder="np. Spaghetti Carbonara"
                                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Cena brutto (zł) *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3.5 h-3.5 w-3.5 text-emerald-400" />
                                        <input
                                            type="number" step="0.01" min="0" required value={newPrice} onChange={e => setNewPrice(e.target.value)}
                                            placeholder="38.50"
                                            className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Kategoria robocza *</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-3.5 h-3.5 w-3.5 text-amber-400" />
                                        <input
                                            type="text" required value={newCategory} onChange={e => setNewCategory(e.target.value)}
                                            placeholder="np. Makarony"
                                            className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 uppercase font-mono font-semibold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Opis składników</label>
                                <textarea
                                    rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)}
                                    placeholder="Guanciale, pecorino romano, żółtka, pieprz..."
                                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-colors">Anuluj</button>
                                <button type="submit" disabled={isSavingAdd} className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg shadow-amber-600/20 transition-all">Zapisz w karcie</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDYCJI */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative space-y-5">
                        <button onClick={() => setEditingItem(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
                            <X className="h-6 w-6" />
                        </button>

                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Edit2 className="h-5 w-5 text-amber-400" /> Edycja Dania
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Aktualizacja wybranej pozycji w klastrze Catalog.</p>
                        </div>

                        <form onSubmit={handleEditItemSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Nazwa dania *</label>
                                <input
                                    type="text" required value={editName} onChange={e => setEditName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Cena brutto (zł) *</label>
                                    <input
                                        type="number" step="0.01" min="0" required value={editPrice} onChange={e => setEditPrice(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Kategoria robocza *</label>
                                    <input
                                        type="text" required value={editCategory} onChange={e => setEditCategory(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 uppercase font-mono font-semibold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Opis składników</label>
                                <textarea
                                    rows={3} value={editDesc} onChange={e => setEditDesc(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-colors">Anuluj</button>
                                <button type="submit" disabled={isSavingEdit} className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all">Zapisz zmiany</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}