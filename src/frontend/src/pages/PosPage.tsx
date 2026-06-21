import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Coffee, LogOut, Receipt, ArrowLeft, BarChart3 } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    isAvailable: boolean;
}

interface CartItem {
    product: Product;
    quantity: number;
}

export default function PosPage() {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [tableNumber, setTableNumber] = useState<number | ''>('');
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiClient.get<any[]>('/products');
                // ACL Guard z weryfikacją stanu 86'd
                const normalized: Product[] = response.data.map(p => ({
                    id: p.id || p.Id || '',
                    name: p.name || p.Name || 'Brak nazwy',
                    price: parseFloat(p.price || p.Price || '0'),
                    description: p.description || p.Description || '',
                    isAvailable: p.isAvailable ?? p.IsAvailable ?? true
                }));
                setProducts(normalized);
            } catch (err) {
                setError('Nie udało się pobrać menu. Sprawdź połączenie z Catalog API.');
            } finally {
                setIsLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    const addToCart = (product: Product) => {
        // STRAŻNIK: Nie nabijesz na kasę dania wyłączonego przez kuchnię!
        if (!product.isAvailable) {
            alert("Odmowa: To danie zostało oznaczone przez kuchnię jako WYPRZEDANE (86'd)!");
            return;
        }

        setCart((prev) => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
    };

    const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.product.id !== productId));
    const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (!tableNumber || cart.length === 0) return;
        setIsCheckingOut(true); setError(null);

        try {
            const orderRes = await apiClient.post('/orders', { tableNumber: Number(tableNumber) });
            const orderId = orderRes.data?.id || orderRes.data;

            for (const item of cart) {
                await apiClient.post(`/orders/${orderId}/items`, { productId: item.product.id, quantity: item.quantity });
            }

            await apiClient.put(`/orders/${orderId}/pay`);
            alert("Rachunek opłacony i zamknięty!");
            setCart([]); setTableNumber('');
        } catch (err) {
            alert("Błąd komunikacji z Ordering API.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
            
            {/* LEWA STRONA: MENU */}
            <div className="flex-1 flex flex-col h-full bg-slate-950/40">
                <header className="bg-slate-800 border-b border-slate-700 px-8 py-5 flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/home')} className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 flex items-center gap-2 text-xs font-bold transition-all"><ArrowLeft className="h-4 w-4" /> Zmień lokal</button>
                        <div className="h-6 w-px bg-slate-700"></div>
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg"><Coffee className="h-6 w-6" /> <span>Terminal POS</span></div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/dashboard')} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"><BarChart3 className="h-4 w-4" /> Raport Dnia</button>
                        <button onClick={() => { logout(); navigate('/login'); }} className="p-2.5 text-slate-400 hover:text-red-400 rounded-xl text-xs font-bold"><LogOut className="h-4 w-4" /></button>
                    </div>
                </header>

                <div className="p-8 flex-1 overflow-y-auto">
                    {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold mb-6">{error}</div>}
                    
                    {isLoadingProducts ? (
                        <div className="flex items-center justify-center h-full text-slate-500 font-mono text-xs">Synchronizacja bazy towarowej...</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products.map((prod) => {
                                const is86 = !prod.isAvailable;
                                return (
                                    <button
                                        key={prod.id} onClick={() => addToCart(prod)}
                                        className={`p-5 rounded-3xl border text-left flex flex-col justify-between h-36 transition-all relative overflow-hidden active:scale-95 ${
                                            is86 ? 'bg-slate-900/40 border-red-500/30 opacity-60 cursor-not-allowed' : 'bg-slate-800 border-slate-700 hover:border-emerald-500 hover:shadow-xl'
                                        }`}
                                    >
                                        <h3 className={`font-bold text-sm leading-tight ${is86 ? 'line-through text-slate-500' : 'text-white'}`}>{prod.name}</h3>
                                        <div className="mt-auto pt-2 flex justify-between items-end">
                                            <span className={`font-mono font-extrabold text-xs ${is86 ? 'text-slate-600' : 'text-emerald-400'}`}>{prod.price.toFixed(2)} zł</span>
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-wider ${is86 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                {is86 ? 'BRAK' : '+ DODAJ'}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* PRAWA STRONA: RACHUNEK */}
            <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col z-10 shadow-2xl">
                <div className="p-6 border-b border-slate-700/80 bg-slate-800/50">
                    <div className="flex items-center gap-2 font-bold text-white mb-4"><ShoppingCart className="h-5 w-5 text-emerald-400" /> Otwarte zamówienie</div>
                    <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">Stolik docelowy *</label>
                        <input
                            type="number" min="1" value={tableNumber} onChange={e => setTableNumber(e.target.value ? Number(e.target.value) : '')}
                            placeholder="NR STOLIKA"
                            className="w-full bg-slate-900 border border-slate-600 rounded-2xl px-4 py-3 text-white font-mono font-black text-center text-lg focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 font-mono text-xs"><Receipt className="h-10 w-10 opacity-20" /> Koszyk kelnerski pusty</div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.product.id} className="bg-slate-900/60 border border-slate-700 rounded-2xl p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-xs text-white">{item.product.name}</span>
                                    <span className="font-mono font-bold text-xs text-emerald-400">{(item.product.price * item.quantity).toFixed(2)} zł</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-xl p-1">
                                        <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1 text-slate-400 hover:text-white"><Minus className="h-3 w-3" /></button>
                                        <span className="font-mono font-bold text-xs w-5 text-center text-white">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1 text-slate-400 hover:text-white"><Plus className="h-3 w-3" /></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.product.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-slate-800/90 border-t border-slate-700 space-y-4">
                    <div className="flex justify-between items-baseline"><span className="text-xs text-slate-400 uppercase font-bold">Do zapłaty</span> <span className="text-3xl font-black font-mono text-emerald-400">{totalAmount.toFixed(2)} zł</span></div>
                    <button
                        onClick={handleCheckout} disabled={isCheckingOut || cart.length === 0 || !tableNumber}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-40 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                    >
                        <CreditCard className="h-4 w-4" /> {isCheckingOut ? 'Fiskalizowanie...' : 'Zamknij i opłać'}
                    </button>
                </div>
            </div>

        </div>
    );
}