import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, WifiOff } from 'lucide-react';
import { useActiveOrders } from './hooks/useActiveOrders';
import { ORDER_STATUS } from './constants';

import KanbanColumn from './components/KanbanColumn';
import MenuColumn from './components/MenuColumn';
import ReceiptColumn from './components/ReceiptColumn';

export default function PosPageOrchestrator() {
    const navigate = useNavigate();
    const { orders, isLoading, error, refreshNow } = useActiveOrders(3000); 
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const activeOrder = useMemo(() => {
        return orders.find(o => o.id === selectedOrderId) || null;
    }, [orders, selectedOrderId]);

    const openOrders = useMemo(() => orders.filter(o => o.status === ORDER_STATUS.Open), [orders]);
    const inPrepOrders = useMemo(() => orders.filter(o => o.status === ORDER_STATUS.InPreparation), [orders]);

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
            <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex justify-between items-center shrink-0 shadow-md">
                <button 
                    onClick={() => navigate('/home')} 
                    className="h-12 px-6 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-200 flex items-center gap-3 font-bold transition-all"
                >
                    <ArrowLeft className="h-6 w-6" /> Zmień lokal
                </button>
                
                <div className="flex items-center gap-4">
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-xl font-bold animate-pulse">
                            <WifiOff className="h-5 w-5" /> Offline
                        </div>
                    )}
                    <div className="font-mono text-xl text-emerald-400 font-black tracking-widest uppercase">
                        Terminal W-POS
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-[30%] min-w-[350px] border-r border-slate-800 bg-slate-900/50 flex flex-col">
                    <KanbanColumn 
                        openOrders={openOrders}
                        inPrepOrders={inPrepOrders}
                        selectedOrderId={selectedOrderId}
                        onSelectOrder={(id: string) => setSelectedOrderId(id)}
                        isLoading={isLoading}
                    />
                </div>

                <div className="flex-1 bg-slate-950/40 flex flex-col relative shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]">
                    <MenuColumn 
                        activeOrder={activeOrder} 
                        onRefreshData={refreshNow}
                    />
                </div>

                <div className="w-[30%] min-w-[400px] border-l border-slate-800 bg-slate-900 flex flex-col z-10 shadow-2xl">
                    <ReceiptColumn 
                        activeOrder={activeOrder} 
                        onOrderProcessed={() => {
                            setSelectedOrderId(null);
                            refreshNow();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}