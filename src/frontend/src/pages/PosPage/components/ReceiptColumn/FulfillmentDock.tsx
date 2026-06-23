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

// Mock stolików
const MOCK_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// Mock Kierowców (Do podpięcia pod backend w przyszłości)
const MOCK_DRIVERS = [
    { id: 'driver-1', name: 'Maciej (Skoda)' },
    { id: 'driver-2', name: 'Anna (Rower)' },
    { id: 'driver-3', name: 'Jan (Hulajnoga)' }
];

// GLOBALNY CACHE: Zapamiętuje dane wpisane w formularze pomiędzy zmianami rachunków
const formDraftCache: Record<string, any> = {};

export default function FulfillmentDock({ order, onSuccess }: FulfillmentDockProps) {
    const { updateFulfillment, isProcessing } = usePosActions(onSuccess);

    const [selectedTab, setSelectedTab] = useState<FulfillmentType>('DineIn');
    const [tableNum, setTableNum] = useState<number | null>(null);
    const [street, setStreet] = useState('');
    const [building, setBuilding] = useState('');
    const [apartment, setApartment] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [provider, setProvider] = useState('');
    const [pickupCode, setPickupCode] = useState('');
    const [driverId, setDriverId] = useState('');

    // Wczytywanie z Cache lub API po zmianie zamówienia
    useEffect(() => {
        const draft = formDraftCache[order.id] || {};
        setSelectedTab(draft.selectedTab || order.fulfillmentType || 'DineIn');
        setTableNum(draft.tableNum !== undefined ? draft.tableNum : order.tableNumber);
        
        // Pola formularzy - wczytanie z pamięci podręcznej (jeśli kelner już coś wpisał)
        setStreet(draft.street || '');
        setBuilding(draft.building || '');
        setApartment(draft.apartment || '');
        setCity(draft.city || '');
        setPhone(draft.phone || '');
        setProvider(draft.provider || '');
        setPickupCode(draft.pickupCode || '');
        setDriverId(draft.driverId || '');
    }, [order.id, order.fulfillmentType, order.tableNumber]);

    // Zapisywanie do Cache w locie po każdej zmianie literki
    useEffect(() => {
        formDraftCache[order.id] = {
            selectedTab, tableNum, street, building, apartment, city, phone, provider, pickupCode, driverId
        };
    }, [order.id, selectedTab, tableNum, street, building, apartment, city, phone, provider, pickupCode, driverId]);

    const handleSaveFulfillment = async () => {
        await updateFulfillment(order.id, {
            fulfillmentType: selectedTab,
            tableNumber: selectedTab === 'DineIn' ? tableNum : null,
            street, buildingNumber: building, apartmentNumber: apartment, city, phoneNumber: phone,
            providerName: provider, pickupCode: pickupCode,
            driverEmployeeId: driverId || null
        });
    };

    return (
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-4 relative">
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

            <div className="min-h-[100px]">
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

                {selectedTab === 'Takeaway' && (
                    <div className="animate-in fade-in space-y-2">
                        <input type="text" placeholder="Imię klienta (opcjonalnie)..." className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-indigo-500 outline-none" />
                        <input type="time" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-indigo-400 font-mono focus:border-indigo-500 outline-none" />
                    </div>
                )}

                {selectedTab === 'Delivery' && (
                    <div className="animate-in fade-in space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <input type="text" placeholder="Ulica" value={street} onChange={e=>setStreet(e.target.value)} className="col-span-3 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                            <input type="text" placeholder="Budynek" value={building} onChange={e=>setBuilding(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                            <input type="text" placeholder="Lokal" value={apartment} onChange={e=>setApartment(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                            <input type="text" placeholder="Miasto" value={city} onChange={e=>setCity(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                        </div>
                        <input type="tel" placeholder="Telefon kontaktowy" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-indigo-400 font-mono focus:border-indigo-500 outline-none" />
                        
                        {/* Selector Kierowcy */}
                        <select 
                            value={driverId} onChange={e=>setDriverId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 outline-none mt-1"
                        >
                            <option value="">Wybierz kierowcę (opcjonalnie)...</option>
                            {MOCK_DRIVERS.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {selectedTab === 'Services' && (
                    <div className="animate-in fade-in space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            {SERVICE_PROVIDERS.map(prov => {
                                const isSel = provider === prov.id;
                                return (
                                    <button
                                        key={prov.id} onClick={() => setProvider(prov.id)}
                                        className={`py-3 rounded-xl font-black text-xs transition-all active:scale-95 border-2 ${prov.bg} ${prov.text}
                                            ${isSel ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105' : 'border-transparent opacity-50 hover:opacity-90'}`}
                                    >
                                        {prov.id}
                                    </button>
                                );
                            })}
                        </div>
                        <input 
                            type="text" placeholder="Kod odbioru np. '67P'" value={pickupCode} onChange={e=>setPickupCode(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-400 font-black font-mono focus:border-amber-500 outline-none text-center tracking-widest uppercase" 
                        />
                    </div>
                )}

                {selectedTab === 'Unassigned' && (
                    <div className="h-full flex items-center justify-center py-6 text-slate-600 text-xs font-mono font-bold uppercase tracking-widest">
                        Brak formy realizacji
                    </div>
                )}
            </div>

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