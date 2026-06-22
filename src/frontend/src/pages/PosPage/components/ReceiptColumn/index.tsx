import type { PosOrder } from '../../types';
import ActionDock from './ActionDock';
import { Receipt } from 'lucide-react';

interface ReceiptColumnProps {
    activeOrder: PosOrder | null;
    onOrderProcessed: () => void;
}

export default function ReceiptColumn({ activeOrder, onOrderProcessed }: ReceiptColumnProps) {
    if (!activeOrder) {
        return <div className="h-full bg-slate-900 border-l border-slate-800"></div>;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 bg-slate-800 border-b border-slate-700 flex justify-between items-center shrink-0">
                <div>
                    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Rachunek Bieżący</h3>
                    <div className="font-mono text-xl font-black text-white">{activeOrder.orderNumber}</div>
                </div>
                {activeOrder.tableNumber && (
                    <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center flex-col">
                        <span className="text-[9px] text-slate-500 uppercase font-bold leading-none">Stół</span>
                        <span className="text-emerald-400 font-mono font-black text-lg leading-none mt-0.5">{activeOrder.tableNumber}</span>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {activeOrder.items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                        <Receipt className="h-12 w-12 opacity-20" />
                        <span className="text-xs font-mono font-bold">Rachunek jest pusty</span>
                    </div>
                ) : (
                    activeOrder.items.map(item => (
                        <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-xs text-slate-300">
                                    {item.quantity}x
                                </div>
                                <span className="font-bold text-sm text-slate-200">{item.productName}</span>
                            </div>
                            <span className="font-mono font-black text-sm text-emerald-400">
                                {(item.unitPrice * item.quantity).toFixed(2)}
                            </span>
                        </div>
                    ))
                )}
            </div>

            <div className="shrink-0 bg-slate-800 border-t border-slate-700 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
                <div className="p-6 flex justify-between items-end">
                    <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Suma brutto</span>
                    <span className="font-mono text-3xl font-black text-emerald-400">
                        {activeOrder.totalAmount.toFixed(2)} zł
                    </span>
                </div>
                <ActionDock order={activeOrder} onSuccess={onOrderProcessed} />
            </div>
        </div>
    );
}