import type { OrderItem } from '../../types';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface OrderLineItemProps {
    item: OrderItem;
    isProcessing: boolean;
    onUpdateQuantity: (newQty: number) => void;
    onRemove: () => void;
}

export default function OrderLineItem({ item, isProcessing, onUpdateQuantity, onRemove }: OrderLineItemProps) {
    const totalPrice = item.unitPrice * item.quantity;

    return (
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 flex flex-col gap-3 hover:border-slate-500 transition-colors shadow-sm">
            {/* Górny wiersz: Nazwa i Cena Łączna potrawy */}
            <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-sm text-white leading-snug">{item.productName}</span>
                <span className="font-mono font-black text-sm text-emerald-400 shrink-0">
                    {totalPrice.toFixed(2)} zł
                </span>
            </div>

            {/* Dolny wiersz: Cena jednostkowa + Kontrolery Fat Finger */}
            <div className="flex justify-between items-center pt-1 border-t border-slate-700/50 text-xs">
                <span className="font-mono text-slate-400 text-[11px]">
                    {item.unitPrice.toFixed(2)} zł/szt
                </span>

                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700">
                    {/* Przycisk Minus */}
                    <button 
                        onClick={() => onUpdateQuantity(item.quantity - 1)}
                        disabled={isProcessing || item.quantity <= 1}
                        className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 disabled:opacity-30 flex items-center justify-center text-white font-bold transition-transform"
                        title="Zmniejsz ilość"
                    >
                        <Minus className="w-4 h-4" />
                    </button>

                    {/* Ilość */}
                    <span className="font-mono font-black text-sm w-8 text-center text-white">
                        {item.quantity}
                    </span>

                    {/* Przycisk Plus */}
                    <button 
                        onClick={() => onUpdateQuantity(item.quantity + 1)}
                        disabled={isProcessing}
                        className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 flex items-center justify-center text-white font-bold transition-transform"
                        title="Zwiększ ilość"
                    >
                        <Plus className="w-4 h-4" />
                    </button>

                    {/* Przycisk Usuń całkowicie */}
                    <button 
                        onClick={onRemove}
                        disabled={isProcessing}
                        className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 active:scale-90 text-red-400 flex items-center justify-center ml-1.5 transition-all"
                        title="Usuń pozycję"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}