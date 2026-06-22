import type { PosOrder } from '../../types';
import OrderCard from './OrderCard';
import { Loader2 } from 'lucide-react';

interface KanbanColumnProps {
    openOrders: PosOrder[];
    inPrepOrders: PosOrder[];
    selectedOrderId: string | null;
    onSelectOrder: (id: string) => void;
    isLoading: boolean;
}

export default function KanbanColumn({ openOrders, inPrepOrders, selectedOrderId, onSelectOrder, isLoading }: KanbanColumnProps) {
    
    if (isLoading && openOrders.length === 0 && inPrepOrders.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest">Wczytywanie...</span>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
            <section>
                <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">W przygotowaniu ({inPrepOrders.length})</h2>
                </div>
                <div className="space-y-3">
                    {inPrepOrders.map(order => (
                        <OrderCard 
                            key={order.id} 
                            order={order} 
                            isSelected={selectedOrderId === order.id} 
                            onClick={() => onSelectOrder(order.id)} 
                        />
                    ))}
                    {inPrepOrders.length === 0 && (
                        <div className="p-4 border border-dashed border-slate-700 rounded-2xl text-center text-slate-600 text-xs font-mono">Brak aktywnych wydań</div>
                    )}
                </div>
            </section>

            <section>
                <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Otwarte rachunki ({openOrders.length})</h2>
                </div>
                <div className="space-y-3">
                    {openOrders.map(order => (
                        <OrderCard 
                            key={order.id} 
                            order={order} 
                            isSelected={selectedOrderId === order.id} 
                            onClick={() => onSelectOrder(order.id)} 
                        />
                    ))}
                    {openOrders.length === 0 && (
                        <div className="p-4 border border-dashed border-slate-700 rounded-2xl text-center text-slate-600 text-xs font-mono">Brak nowych zamówień</div>
                    )}
                </div>
            </section>
        </div>
    );
}