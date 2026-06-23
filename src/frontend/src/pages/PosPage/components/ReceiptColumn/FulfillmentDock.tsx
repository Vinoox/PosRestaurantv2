import { useState, useEffect } from 'react';
import type { PosOrder, FulfillmentType } from '../../types';
import { usePosActions } from '../../hooks/usePosActions';
import { Utensils, ShoppingBag, Truck, Wrench, Ban, Save } from 'lucide-react';

interface FulfillmentDockProps {
    order: PosOrder;
    onSuccess: () => void;
}

const FULFILLMENT_OPTIONS: { key: FulfillmentType; label: string; icon: any }[] = [
    { key: 'DineIn', label: 'Na miejscu', icon: Utensils },
    { key: 'Takeaway', label: 'Odbiór', icon: ShoppingBag },
    { key: 'Delivery', label: 'Dostawa', icon: Truck },
    { key: 'Services', label: 'Usługa', icon: Wrench },
    { key: 'Unassigned', label: 'Brak', icon: Ban },
];

const SERVICE_PROVIDERS = [
    { id: 'Pyszne.Pl', bg: 'bg-[#FF8000]', text: 'text-white' },
    { id: 'UberEats', bg: 'bg-[#06C167]', text: 'text-white' },
    { id: 'Wolt', bg: 'bg-[#009DE0]', text: 'text-white' },
    { id: 'Glovo', bg: 'bg-[#FFC244]', text: 'text-slate-900' },
];

// Mock stolików (Docelowo z backendu GET /api/tables)
const MOCK_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function FulfillmentDock({ order, onSuccess }: FulfillmentDockProps) {
    const { updateFulfillment, isProcessing } = usePosActions(onSuccess);

    const [selectedTab, setSelectedTab] = useState<FulfillmentType>(order.fulfillmentType || 'DineIn');

    // Stany dla wszystkich pól
    const [tableNum, setTableNum] = useState<number | null>(order.tableNumber);
    const [street, setStreet] = useState('');
    const [building, setBuilding] = useState('');
    const [apartment, setApartment] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [provider, setProvider] = useState('');
    const [pickupCode, setPickupCode] = useState('');

    useEffect(() => {
        setSelectedTab(order.fulfillmentType || 'DineIn');
        setTableNum(order.tableNumber);
    }, [order.id, order.fulfillmentType, order.tableNumber]);

    const handleSaveFulfillment = async () => {
        await updateFulfillment(order.id, {
            fulfillmentType: selectedTab,
            tableNumber: selectedTab === 'DineIn' ? tableNum : null,
            // Pola dostawy własnej
            street, buildingNumber: building, apartmentNumber: apartment, city, phoneNumber: phone,
            // Pola usług zewnętrznych
            providerName: provider, pickupCode: pickupCode
        });
    };

    return (
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-4 relative">
            {/* Zakładki */}
            <div className="grid grid-cols-5 gap-1 bg-slate-900 p-1.5 rounded-2xl">
                {FULFILLMENT_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    const isSel = selectedTab === opt.key;
                    return (
                        <button
                            key={opt.key} onClick={() => setSelectedTab(opt.key)}
                            className={`py-2 flex flex-col items-center justify-center rounded-xl font-bold transition-all
                                ${isSel ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800 text-[10px]'}`}
                        >
                            <Icon className="w-4 h-4 mb-1" />
                            <span className="text-[9px] leading-none text-center">{opt.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Obszar roboczy dla wybranej metody */}
            <div className="min-h-[100px]">
                {/* 1. NA MIEJSCU (Kafelki stolików) */}
                {selectedTab === 'DineIn' && (
                    <div className="grid grid-cols-4 gap-2 animate-in fade-in">
                        {MOCK_TABLES.map(num => (
                            <button
                                key={num} onClick={() => setTableNum(num)}
                                className={`py-3 rounded-xl font-mono font-black text-lg border-2 transition-all
                                    ${tableNum === num ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                )}

                {/* 2. ODBIÓR OSOBISTY */}
                {selectedTab === 'Takeaway' && (
                    <div className="animate-in fade-in space-y-2">
                        <input type="text" placeholder="Imię klienta (opcjonalnie)..." className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-indigo-500 outline-none" />
                        <input type="time" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-indigo-400 font-mono focus:border-indigo-500 outline-none" />
                    </div>
                )}

                {/* 3. DOSTAWA (Rozszerzona) */}
                {selectedTab === 'Delivery' && (
                    <div className="animate-in fade-in space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <input type="text" placeholder="Ulica" value={street} onChange={e=>setStreet(e.target.value)} className="col-span-3 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                            <input type="text" placeholder="Budynek" value={building} onChange={e=>setBuilding(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                            <input type="text" placeholder="Lokal" value={apartment} onChange={e=>setApartment(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                            <input type="text" placeholder="Miasto" value={city} onChange={e=>setCity(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                        </div>
                        <input type="tel" placeholder="Telefon kontaktowy" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-indigo-400 font-mono focus:border-indigo-500 outline-none" />
                    </div>
                )}

                {/* 4. USŁUGA (Kafelki brandów) */}
                {selectedTab === 'Services' && (
                    <div className="animate-in fade-in space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            {SERVICE_PROVIDERS.map(prov => (
                                <button
                                    key={prov.id} onClick={() => setProvider(prov.id)}
                                    className={`py-3 rounded-xl font-black text-xs transition-transform active:scale-95 border-2
                                        ${provider === prov.id ? `${prov.bg} ${prov.text} border-white shadow-lg` : 'bg-slate-900 border-slate-700 text-slate-500 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
                                >
                                    {prov.id}
                                </button>
                            ))}
                        </div>
                        <input 
                            type="text" placeholder="Kod odbioru kuriera np. '67P'" value={pickupCode} onChange={e=>setPickupCode(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-400 font-black font-mono focus:border-amber-500 outline-none text-center tracking-widest uppercase" 
                        />
                    </div>
                )}

                {/* 5. BRAK */}
                {selectedTab === 'Unassigned' && (
                    <div className="h-full flex items-center justify-center py-6 text-slate-600 text-xs font-mono font-bold uppercase tracking-widest">
                        Brak formy realizacji
                    </div>
                )}
            </div>

            {/* STAŁY PRZYCISK ZAPISZ (Dotyczy tylko danych docka) */}
            <button
                disabled={isProcessing}
                onClick={handleSaveFulfillment}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] disabled:opacity-40 text-slate-300 font-bold rounded-xl uppercase tracking-widest text-[11px] border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
                <Save className="w-4 h-4" /> {isProcessing ? 'Przetwarzanie...' : 'Zapisz szczegóły wydania'}
            </button>
        </div>
    );
}