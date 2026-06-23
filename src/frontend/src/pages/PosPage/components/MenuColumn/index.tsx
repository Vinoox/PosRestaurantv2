import { useState, useMemo, useRef } from 'react';
import type { PosOrder, PosProduct } from '../../types';
import { usePosMenu } from '../../hooks/usePosMenu';
import { usePosActions } from '../../hooks/usePosActions';
import { AlertCircle, LayoutGrid } from 'lucide-react';

interface MenuColumnProps {
    activeOrder: PosOrder | null;
    onRefreshData: () => void;
}

export default function MenuColumn({ activeOrder, onRefreshData }: MenuColumnProps) {
    const { products, categories } = usePosMenu();
    const { addProductToOrder, isProcessing } = usePosActions(onRefreshData);
    
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
            setToastMessage(null);
        }, 3000); 
    };

    const handleProductClick = async (productId: string, isAvailable: boolean) => {
        if (!activeOrder) {
            showToast("Najpierw wybierz lub stwórz rachunek!");
            return;
        }
        if (!isAvailable) {
            showToast("Ten produkt jest oznaczony jako wyprzedany (86'd)!");
            return;
        }
        await addProductToOrder(activeOrder.id, productId);
    };

    // DRY: Funkcja generująca kod pojedynczej karty potrawy
    const renderProductCard = (prod: PosProduct) => (
        <button
            key={prod.id}
            onClick={() => handleProductClick(prod.id, prod.isAvailable)}
            disabled={isProcessing}
            className={`p-4 min-h-[140px] rounded-3xl border flex flex-col justify-between transition-all active:scale-95 text-left
                ${!prod.isAvailable 
                    ? 'bg-slate-900/40 border-red-500/20 opacity-50' 
                    : !activeOrder 
                        ? 'bg-slate-800/80 border-slate-700 hover:border-amber-500/50' 
                        : 'bg-slate-800 border-slate-700 hover:border-emerald-500 hover:shadow-[0_10px_20px_-10px_rgba(16,185,129,0.3)]'
                }`}
        >
            <h3 className={`font-bold text-sm leading-tight ${!prod.isAvailable ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                {prod.name}
            </h3>
            <div className="mt-auto flex justify-between items-end w-full">
                <span className={`font-mono font-black text-sm ${!prod.isAvailable ? 'text-slate-600' : 'text-emerald-400'}`}>
                    {prod.price.toFixed(2)}
                </span>
                {!prod.isAvailable && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-md font-black">86'd</span>
                )}
            </div>
        </button>
    );

    const filteredProducts = useMemo(() => {
        if (selectedCategoryId === 'ALL') return products;
        return products.filter(p => p.categoryId === selectedCategoryId);
    }, [products, selectedCategoryId]);

    return (
        <div className="flex flex-col h-full relative">
            {toastMessage && (
                <div className="absolute bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-amber-500 text-slate-950 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold border-2 border-amber-400">
                        <AlertCircle className="h-6 w-6" />
                        {toastMessage}
                    </div>
                </div>
            )}

            {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-40 flex items-center justify-center">
                    <div className="bg-slate-800 px-6 py-3 rounded-xl border border-slate-700 shadow-xl font-mono text-emerald-400 text-sm font-bold animate-pulse">
                        Wysyłanie na kuchnię...
                    </div>
                </div>
            )}

            <div className="shrink-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4">
                <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                    <button
                        onClick={() => setSelectedCategoryId('ALL')}
                        className={`shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border-2 
                            ${selectedCategoryId === 'ALL' 
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                    >
                        <LayoutGrid className="h-4 w-4" /> Wszystkie
                    </button>

                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className={`shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all border-2
                                ${selectedCategoryId === cat.id 
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {selectedCategoryId === 'ALL' ? (
                    /* WIDOK ZGRUPOWANY PO KATEGORIACH (Gdy aktywna zakładka "Wszystkie") */
                    <div className="space-y-8 pb-20">
                        {categories.map(cat => {
                            const catProducts = products.filter(p => p.categoryId === cat.id);
                            if (catProducts.length === 0) return null; // Ukrywa puste sekcje

                            return (
                                <div key={cat.id} className="space-y-3">
                                    <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                                        <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                                            {cat.name} ({catProducts.length})
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {catProducts.map(prod => renderProductCard(prod))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Fallback dla potraw bez przypisanej kategorii */}
                        {products.filter(p => !categories.some(c => c.id === p.categoryId)).length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                                    <div className="h-2 w-2 rounded-full bg-slate-600"></div>
                                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Pozostałe
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {products.filter(p => !categories.some(c => c.id === p.categoryId)).map(prod => renderProductCard(prod))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* WIDOK PŁASKI DLA POJEDYNCZEJ KATEGORII */
                    filteredProducts.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">
                            Brak produktów w tej kategorii
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                            {filteredProducts.map(prod => renderProductCard(prod))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}