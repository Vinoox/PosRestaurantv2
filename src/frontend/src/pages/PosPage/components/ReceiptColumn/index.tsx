import { useMemo } from 'react';
import type { PosOrder } from '../../types';
import { usePosActions } from '../../hooks/usePosActions';
import OrderLineItem from './OrderLineItem';
import FulfillmentDock from './FulfillmentDock';
import { Receipt, ShoppingCart, CheckCircle2 } from 'lucide-react';

interface ReceiptColumnProps {
    activeOrder: PosOrder | null;
    onOrderProcessed: () => void;
}

export default function ReceiptColumn({ activeOrder, onOrderProcessed }: ReceiptColumnProps) {
    const { updateItemQuantity, removeItemFromOrder, completeOrder, isProcessing } = usePosActions(onOrderProcessed);

    const liveTotalAmount = useMemo(() => {
        if (!activeOrder) return 0;
        return activeOrder.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    }, [activeOrder]);

    if (!activeOrder) {
        return (
            <div className="h-full bg-slate-900 border-l border-slate-800 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-950 flex items-center justify-center mb-4 shadow-inner border border-slate-800/80">
                    <ShoppingCart className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="font-bold text-white text-lg mb-1">Rachunek nieaktywny</h3>
                <p className="text-xs font-mono max-w-xs text-slate-400">
                    Kliknij dowolne zamówienie na tablicy po lewej stronie, aby otworzyć podgląd paragonu.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-900 justify-between">
            
            {/* 1. NAGŁÓWEK PARAGONU */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0 shadow-md">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Paragon Roboczy</span>
                    </div>
                    <div className="font-mono text-xl font-black text-white mt-0.5">
                        {activeOrder.orderNumber}
                    </div>
                </div>
                {activeOrder.tableNumber && (
                    <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center flex-col shadow-inner">
                        <span className="text-[8px] text-slate-500 uppercase font-black leading-none">Stół</span>
                        <span className="text-emerald-400 font-mono font-black text-lg leading-none mt-1">
                            {activeOrder.tableNumber}
                        </span>
                    </div>
                )}
            </div>

            {/* 2. STRUMIEŃ POZYCJI */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {activeOrder.items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                        <Receipt className="h-12 w-12 opacity-15" />
                        <span className="text-[11px] font-mono font-bold">Rachunek nie posiada potraw</span>
                    </div>
                ) : (
                    activeOrder.items.map(item => (
                        <OrderLineItem 
                            key={item.id} item={item} isProcessing={isProcessing}
                            onUpdateQuantity={(newQty) => updateItemQuantity(activeOrder.id, item.id, newQty)}
                            onRemove={() => removeItemFromOrder(activeOrder.id, item.id)}
                        />
                    ))
                )}
            </div>

            {/* 3. PODSUMOWANIE KWOTOWE */}
            <div className="shrink-0 bg-slate-950/90 border-t border-slate-800 p-5 flex justify-between items-baseline shadow-2xl z-10">
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Suma:</span>
                <span className="font-mono text-3xl font-black text-emerald-400 tracking-tight">
                    {liveTotalAmount.toFixed(2)} <small className="text-sm font-sans text-emerald-500">zł</small>
                </span>
            </div>

            {/* 4. DOCK REALIZACJI (zawsze ma przycisk ZAPISZ w sobie) */}
            <div className="shrink-0">
                <FulfillmentDock order={activeOrder} onSuccess={onOrderProcessed} />
            </div>

            {/* 5. ODDZIELONA SEKCJA: GIGANTYCZNY PRZYCISK ZAKOŃCZ */}
            <div className="p-4 bg-slate-950 border-t-2 border-slate-900 shrink-0">
                <button
                    disabled={isProcessing}
                    onClick={() => completeOrder(activeOrder.id)}
                    className="w-full py-5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 active:scale-[0.98] disabled:opacity-50 text-white font-black rounded-2xl tracking-[0.2em] text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-3"
                >
                    <CheckCircle2 className="w-7 h-7" />
                    $ ZAKOŃCZ $
                </button>
            </div>

        </div>
    );
}