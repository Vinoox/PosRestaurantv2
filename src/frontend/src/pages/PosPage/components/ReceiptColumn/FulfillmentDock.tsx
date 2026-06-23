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

const MOCK_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const MOCK_DRIVERS = [
    { id: 'driver-1', name: 'Maciej (Skoda)' },
    { id: 'driver-2', name: 'Anna (Rower)' },
    { id: 'driver-3', name: 'Jan (Hulajnoga)' }
];

// JEDYNE ŹRÓDŁO PRAWDY: Pamięć RAM przeglądarki niezależna od cyklu życia Reacta
interface OrderFormState {
    selectedTab: FulfillmentType;
    tableNum: number | null;
    takeawayName: string;
    takeawayTime: string;
    street: string;
    building: string;
    apartment: string;
    city: string;
    phone: string;
    driverId: string;
    provider: string;
    pickupCode: string;
}

const globalFulfillmentStore: Record<string, OrderFormState> = {};

function getInitialFormState(order: PosOrder): OrderFormState {
    return {
        selectedTab: order.fulfillmentType || 'DineIn',
        tableNum: order.tableNumber,
        takeawayName: '',
        takeawayTime: '',
        street: '',
        building: '',
        apartment: '',
        city: '',
        phone: '',
        driverId: '',
        provider: '',
        pickupCode: ''
    };
}

export default function FulfillmentDock({ order, onSuccess }: FulfillmentDockProps) {
    const { updateFulfillment, isProcessing } = usePosActions(onSuccess);

    // 1. Zabezpieczenie inicjalizacji slotu dla danego rachunku
    if (!globalFulfillmentStore[order.id]) {
        globalFulfillmentStore[order.id] = getInitialFormState(order);
    }

    // 2. Stan lokalny to wyłącznie wskaźnik na globalny magazyn
    const [formData, setFormData] = useState<OrderFormState>(() => globalFulfillmentStore[order.id]);

    // 3. Gdy skaczesz po rachunkach, przepinamy wskaźnik na właściwy slot w pamięci
    useEffect(() => {
        if (!globalFulfillmentStore[order.id]) {
            globalFulfillmentStore[order.id] = getInitialFormState(order);
        } else {
            // Nadpisz tylko metodę z bazy, jeśli ktoś zmienił ją zdalnie, ale ZOSTAW wpisany tekst!
            if (order.fulfillmentType && order.fulfillmentType !== globalFulfillmentStore[order.id].selectedTab) {
                globalFulfillmentStore[order.id].selectedTab = order.fulfillmentType;
            }
        }
        setFormData(globalFulfillmentStore[order.id]);
    }, [order.id, order.fulfillmentType]);

    // 4. Uniwersalna funkcja aktualizująca JEDNOCZEŚNIE stan Reacta i globalny Cache
    const updateField = <K extends keyof OrderFormState>(field: K, value: OrderFormState[K]) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            globalFulfillmentStore[order.id] = next; // Synchronous SSOT commit!
            return next;
        });
    };

    const handleSaveFulfillment = async () => {
        await updateFulfillment(order.id, {
            fulfillmentType: formData.selectedTab,
            tableNumber: formData.selectedTab === 'DineIn' ? formData.tableNum : null,
            customerName: formData.takeawayName || null,
            street: formData.street,
            buildingNumber: formData.building,
            apartmentNumber: formData.apartment,
            city: formData.city,
            phoneNumber: formData.phone,
            providerName: formData.provider,
            pickupCode: formData.pickupCode,
            driverEmployeeId: formData.driverId || null
        });
    };

    return (
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-4 relative">
            {/* Zakładki */}
            <div className="grid grid-cols-5 gap-1 bg-slate-900 p-1.5 rounded-2xl">
                {FULFILLMENT_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    const isSel = formData.selectedTab === opt.key;
                    return (
                        <button
                            key={opt.key} onClick={() => updateField('selectedTab', opt.key)}
                            className={`py-2 flex flex-col items-center justify-center rounded-xl font-bold transition-all
                                ${isSel ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800 text-[10px]'}`}
                        >
                            <Icon className="w-4 h-4 mb-1" />
                            <span className="text-[9px] leading-none text-center">{opt.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Obszar roboczy */}
            <div className="min-h-[100px]">
                
                {/* 1. NA MIEJSCU */}
                {formData.selectedTab === 'DineIn' && (
                    <div className="grid grid-cols-4 gap-2 animate-in fade-in">
                        {MOCK_TABLES.map(num => (
                            <button
                                key={num} onClick={() => updateField('tableNum', num)}
                                className={`py-3 rounded-xl font-mono font-black text-lg border-2 transition-all
                                    ${formData.tableNum === num ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                )}

                {/* 2. ODBIÓR */}
                {formData.selectedTab === 'Takeaway' && (
                    <div className="animate-in fade-in space-y-2">
                        <input 
                            type="text" placeholder="Imię klienta (opcjonalnie)..." 
                            value={formData.takeawayName} onChange={e => updateField('takeawayName', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-indigo-500 outline-none font-semibold" 
                        />
                        <input 
                            type="time" 
                            value={formData.takeawayTime} onChange={e => updateField('takeawayTime', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-indigo-400 font-mono focus:border-indigo-500 outline-none" 
                        />
                    </div>
                )}

                {/* 3. DOSTAWA WŁASNA */}
                {formData.selectedTab === 'Delivery' && (
                    <div className="animate-in fade-in space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <input type="text" placeholder="Ulica" value={formData.street} onChange={e=>updateField('street', e.target.value)} className="col-span-3 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-semibold" />
                            <input type="text" placeholder="Budynek" value={formData.building} onChange={e=>updateField('building', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono" />
                            <input type="text" placeholder="Lokal" value={formData.apartment} onChange={e=>updateField('apartment', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none font-mono" />
                            <input type="text" placeholder="Miasto" value={formData.city} onChange={e=>updateField('city', e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                        </div>
                        <input type="tel" placeholder="Telefon kontaktowy" value={formData.phone} onChange={e=>updateField('phone', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-indigo-400 font-mono focus:border-indigo-500 outline-none font-bold" />
                        
                        <select 
                            value={formData.driverId} onChange={e=>updateField('driverId', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 outline-none mt-1 font-semibold cursor-pointer"
                        >
                            <option value="">Wybierz kierowcę (opcjonalnie)...</option>
                            {MOCK_DRIVERS.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* 4. USŁUGA ZEWNĘTRZNA */}
                {formData.selectedTab === 'Services' && (
                    <div className="animate-in fade-in space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            {SERVICE_PROVIDERS.map(prov => {
                                const isSel = formData.provider === prov.id;
                                return (
                                    <button
                                        key={prov.id} onClick={() => updateField('provider', prov.id)}
                                        className={`py-3 rounded-xl font-black text-xs transition-all active:scale-95 border-2 ${prov.bg} ${prov.text}
                                            ${isSel ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.6)] scale-105 ring-2 ring-white' : 'border-transparent opacity-75 hover:opacity-100'}`}
                                    >
                                        {prov.id}
                                    </button>
                                );
                            })}
                        </div>
                        <input 
                            type="text" placeholder="Kod odbioru np. '67P'" value={formData.pickupCode} onChange={e=>updateField('pickupCode', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-400 font-black font-mono focus:border-amber-500 outline-none text-center tracking-widest uppercase" 
                        />
                    </div>
                )}

                {/* 5. BRAK */}
                {formData.selectedTab === 'Unassigned' && (
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