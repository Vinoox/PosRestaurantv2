import type { PosOrder } from '../../types';
import { usePosMenu } from '../../hooks/usePosMenu';
import { usePosActions } from '../../hooks/usePosActions';
import { Ban } from 'lucide-react';

interface MenuColumnProps {
    activeOrder: PosOrder | null;
    onRefreshData: () => void;
}

export default function MenuColumn({ activeOrder, onRefreshData }: MenuColumnProps) {
    const { products } = usePosMenu();
    const { addProductToOrder, isProcessing } = usePosActions(onRefreshData);

    const handleProductClick = async (productId: string, isAvailable: boolean) => {
        if (!activeOrder) return;
        if (!isAvailable) {
            alert("Odmowa: Produkt oznaczony jako wyprzedany!");
            return;
        }
        await addProductToOrder(activeOrder.id, productId);
    };

    if (!activeOrder) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center h-full">
                <div className="w-24 h-24 mb-6 rounded-full bg-slate-800 flex items-center justify-center shadow-inner">
                    <Ban className="h-10 w-10 text-slate-600" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Brak wybranego rachunku</h2>
                <p className="text-xs font-mono max-w-xs">Wybierz rachunek z lewej kolumny, aby modyfikować zamówienie lub procesować płatność.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
            {isProcessing && (
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="bg-slate-800 px-6 py-3 rounded-xl border border-slate-700 shadow-xl font-mono text-emerald-400 text-sm font-bold animate-pulse">
                        Synchronizacja...
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                {products.map(prod => (
                    <button
                        key={prod.id}
                        onClick={() => handleProductClick(prod.id, prod.isAvailable)}
                        disabled={!prod.isAvailable || isProcessing}
                        className={`p-4 min-h-[140px] rounded-3xl border flex flex-col justify-between transition-all active:scale-95 text-left
                            ${!prod.isAvailable 
                                ? 'bg-slate-900/40 border-red-500/20 opacity-50 cursor-not-allowed' 
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
                ))}
            </div>
        </div>
    );
}