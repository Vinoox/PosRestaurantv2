import { useState, useMemo } from 'react';
import type { PosOrder } from '../../types';
import { FULFILLMENT_LABELS } from '../../constants';
import OrderCard from './OrderCard';
import { Loader2, PlusCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface KanbanColumnProps {
    orders: PosOrder[];
    selectedOrderId: string | null;
    onSelectOrder: (id: string) => void;
    onCreateNewOrder: () => void;
    onCancelOrder: (id: string) => void; // <-- NAPRAWIONE (Błąd 2)
    isLoading: boolean;
    isProcessing: boolean;
}

export default function KanbanColumn({ 
    orders, 
    selectedOrderId, 
    onSelectOrder, 
    onCreateNewOrder,
    onCancelOrder, // <-- Odebranie z propsów
    isLoading,
    isProcessing
}: KanbanColumnProps) {
    
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        'Unassigned': true,
        'DineIn': true,
        'Takeaway': true,
        'Delivery': true,
        'Services': true
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const groupedOrders = useMemo(() => {
        return {
            'Unassigned': orders.filter(o => !o.fulfillmentType || o.fulfillmentType === 'Unassigned'),
            'DineIn': orders.filter(o => o.fulfillmentType === 'DineIn'),
            'Takeaway': orders.filter(o => o.fulfillmentType === 'Takeaway'),
            'Delivery': orders.filter(o => o.fulfillmentType === 'Delivery'),
            'Services': orders.filter(o => o.fulfillmentType === 'Services'),
        };
    }, [orders]);

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-900/50">
            <div className="p-4 border-b border-slate-800 shrink-0 bg-slate-900/80 backdrop-blur-sm z-10">
                <button 
                    onClick={onCreateNewOrder}
                    disabled={isProcessing}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_10px_20px_-10px_rgba(16,185,129,0.4)] active:scale-95"
                >
                    {isProcessing ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <PlusCircle className="h-6 w-6" />
                    )}
                    Nowy Rachunek
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                {isLoading && orders.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 mt-10">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                        <span className="font-mono text-xs font-bold uppercase tracking-widest">Wczytywanie...</span>
                    </div>
                ) : (
                    Object.entries(groupedOrders).map(([typeKey, sectionOrders]) => {
                        const isExpanded = expandedSections[typeKey];
                        const label = FULFILLMENT_LABELS[typeKey] || typeKey;

                        return (
                            <div key={typeKey} className="flex flex-col">
                                <button 
                                    onClick={() => toggleSection(typeKey)}
                                    className="flex items-center justify-between w-full p-2 text-left hover:bg-slate-800/50 rounded-lg transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-slate-400 group-hover:text-white transition-colors">
                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                                            - {label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-mono font-bold ${sectionOrders.length > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                                            {sectionOrders.length}
                                        </span>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="mt-2 space-y-2 pl-2 pr-1">
                                        {sectionOrders.map(order => (
                                            <OrderCard 
                                                key={order.id} 
                                                order={order} 
                                                isSelected={selectedOrderId === order.id} 
                                                onClick={() => onSelectOrder(order.id)} 
                                                onCancelOrder={onCancelOrder}
                                            />
                                        ))}
                                        {sectionOrders.length === 0 && (
                                            <div className="py-3 px-4 border border-dashed border-slate-800/50 rounded-xl text-center text-slate-700 text-[10px] font-mono uppercase">
                                                Brak zamówień
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}