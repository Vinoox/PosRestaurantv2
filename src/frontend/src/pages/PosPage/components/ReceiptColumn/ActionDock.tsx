import { useState } from 'react';
import type { PosOrder } from '../../types';
import { ORDER_STATUS } from '../../constants';
import { usePosActions } from '../../hooks/usePosActions';
import { MapPin, CreditCard, CheckCircle2 } from 'lucide-react';

interface ActionDockProps {
    order: PosOrder;
    onSuccess: () => void;
}

export default function ActionDock({ order, onSuccess }: ActionDockProps) {
    const { assignTable, payForOrder, completeOrder, isProcessing } = usePosActions(onSuccess);
    const [tableInput, setTableInput] = useState<string>('');

    if (order.status === ORDER_STATUS.Open) {
        return (
            <div className="p-6 bg-slate-800 border-t border-slate-700 flex flex-col gap-4">
                <input 
                    type="number"
                    value={tableInput}
                    onChange={e => setTableInput(e.target.value)}
                    placeholder="Wpisz numer stolika..."
                    className="w-full bg-slate-900 border border-slate-600 rounded-2xl px-6 py-5 text-white font-mono font-black text-center text-xl focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
                <button 
                    disabled={!tableInput || isProcessing}
                    onClick={() => assignTable(order.id, Number(tableInput))}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-colors text-sm"
                >
                    <MapPin className="h-5 w-5" /> Przypisz Stolik
                </button>
            </div>
        );
    }

    if (order.status === ORDER_STATUS.InPreparation) {
        return (
            <div className="p-6 bg-slate-800 border-t border-slate-700 grid grid-cols-2 gap-4">
                <button 
                    disabled={isProcessing}
                    onClick={() => payForOrder(order.id)}
                    className="py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                    <CreditCard className="h-6 w-6" />
                    <span className="text-xs">Opłać</span>
                </button>
                <button 
                    disabled={isProcessing}
                    onClick={() => completeOrder(order.id)}
                    className="py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-xs">Zamknij Rachunek</span>
                </button>
            </div>
        );
    }

    return null;
}