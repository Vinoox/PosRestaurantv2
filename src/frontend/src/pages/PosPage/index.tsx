import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, WifiOff } from 'lucide-react';
import { useActiveOrders } from './hooks/useActiveOrders';
import { usePosActions } from './hooks/usePosActions';

import KanbanColumn from './components/KanbanColumn';
import MenuColumn from './components/MenuColumn';
import ReceiptColumn from './components/ReceiptColumn';

export default function PosPageOrchestrator() {
    const navigate = useNavigate();
    const { orders, isLoading, error, refreshNow } = useActiveOrders(3000); 
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const { createNewOrder, cancelOrder, isProcessing } = usePosActions(refreshNow);

    const activeOrder = useMemo(() => {
        return orders.find(o => o.id === selectedOrderId) || null;
    }, [orders, selectedOrderId]);

    const handleCreateNewOrder = async () => {
        const newOrderId = await createNewOrder();
        if (newOrderId) setSelectedOrderId(newOrderId);
    };

    const handleCancelOrder = async (id: string) => {
        await cancelOrder(id);
        if (selectedOrderId === id) setSelectedOrderId(null);
    };

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
                <div className="w-[22%] min-w-[300px] border-r border-slate-800 bg-slate-900/50 flex flex-col relative">
                    <KanbanColumn 
                        orders={orders}
                        selectedOrderId={selectedOrderId}
                        onSelectOrder={(id: string) => setSelectedOrderId(id)}
                        onCreateNewOrder={handleCreateNewOrder}
                        onCancelOrder={handleCancelOrder}
                        isLoading={isLoading}
                        isProcessing={isProcessing}
                    />
                </div>

                <div className="flex-1 bg-slate-950/40 flex flex-col relative shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]">
                    <MenuColumn activeOrder={activeOrder} onRefreshData={refreshNow} />
                </div>

                <div className="w-[24%] min-w-[340px] border-l border-slate-800 bg-slate-900 flex flex-col z-10 shadow-2xl">
                    {/* NAPRAWA: Rozbicie akcji na samo odświeżanie i jawne czyszczenie zaznaczenia */}
                    <ReceiptColumn 
                        activeOrder={activeOrder} 
                        onRefreshData={refreshNow}
                        onClearSelection={() => setSelectedOrderId(null)}
                    />
                </div>
            </div>
        </div>
    );
}