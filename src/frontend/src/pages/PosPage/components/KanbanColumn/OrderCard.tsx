import type { PosOrder } from '../../types';
import { ORDER_STATUS } from '../../constants';
import { Clock, Hash, Utensils, Trash2 } from 'lucide-react';

interface OrderCardProps {
    order: PosOrder;
    isSelected: boolean;
    onClick: () => void;
    onCancelOrder: (id: string) => void;
}

export default function OrderCard({ order, isSelected, onClick, onCancelOrder }: OrderCardProps) {
    const isPrep = order.status === ORDER_STATUS.InPreparation;
    
    return (
        <button 
            onClick={onClick}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 relative overflow-hidden flex flex-col gap-3
                ${isSelected 
                    ? 'bg-emerald-900/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-slate-800 border-slate-700 hover:border-slate-500 hover:bg-slate-750'
                }`}
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${isPrep ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {isPrep ? <Utensils className="h-5 w-5" /> : <Hash className="h-5 w-5" />}
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400">Rachunek</div>
                        <div className="font-mono text-white font-black">{order.orderNumber}</div>
                    </div>
                </div>
                
                {order.tableNumber && (
                    <div className="bg-slate-900 px-3 py-1 rounded-lg border border-slate-700 flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Stolik</span>
                        <span className="text-emerald-400 font-black font-mono text-lg leading-none">{order.tableNumber}</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-end mt-2 pt-3 border-t border-slate-700/50">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-emerald-400">
                        {order.totalAmount.toFixed(2)} zł
                    </span>
                    {/* PRZYCISK USUWANIA (KOSZ) */}
                    <div 
                        onClick={(e) => {
                            e.stopPropagation(); // Blokuje zaznaczenie karty przy kliknięciu w kosz
                            if(window.confirm("Na pewno usunąć ten rachunek?")) onCancelOrder(order.id);
                        }}
                        className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Usuń/Anuluj zamówienie"
                    >
                        <Trash2 className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </button>
    );
}