import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Coffee, LogOut, Receipt } from 'lucide-react';

// --- INTERFEJSY TYPÓW ---
interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
}

interface CartItem {
    product: Product;
    quantity: number;
}

export default function PosPage() {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    // --- STANY KOMPONENTU ---
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [tableNumber, setTableNumber] = useState<number | ''>('');
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- POBIERANIE DANYCH Z CATALOG.API ---
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiClient.get<Product[]>('/products');
                setProducts(response.data);
            } catch (err) {
                console.error("Błąd pobierania produktów:", err);
                setError('Nie udało się pobrać menu. Sprawdź połączenie z serwerem.');
            } finally {
                setIsLoadingProducts(false);
            }
        };

        fetchProducts();
    }, []);

    // --- LOGIKA KOSZYKA ---
    const addToCart = (product: Product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item.product.id === product.id);
            if (existingItem) {
                return prevCart.map(item => 
                    item.product.id === product.id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            }
            return [...prevCart, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prevCart) => {
            return prevCart.map(item => {
                if (item.product.id === productId) {
                    const newQuantity = item.quantity + delta;
                    return { ...item, quantity: Math.max(1, newQuantity) };
                }
                return item;
            });
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // --- LOGIKA WYSYŁANIA ZAMÓWIENIA (ORDERING.API) ---
    const handleCheckout = async () => {
        if (!tableNumber) {
            alert("Podaj numer stolika!");
            return;
        }

        if (cart.length === 0) {
            alert("Koszyk jest pusty!");
            return;
        }

        setIsCheckingOut(true);
        setError(null);

        try {
            const orderResponse = await apiClient.post('/orders', {
                tableNumber: Number(tableNumber)
            });
            
            const orderId = orderResponse.data.id || orderResponse.data;

            for (const item of cart) {
                await apiClient.post(`/orders/${orderId}/items`, {
                    productId: item.product.id,
                    quantity: item.quantity
                });
            }

            await apiClient.put(`/orders/${orderId}/pay`);

            alert("Zamówienie zrealizowane i opłacone pomyślnie!");
            setCart([]);
            setTableNumber('');
            
        } catch (err: any) {
            console.error("Błąd podczas finalizacji zamówienia:", err);
            setError('Wystąpił problem podczas przetwarzania zamówienia.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-800">
            
            {/* --- LEWA STRONA: MENU (Katalog Produktów) --- */}
            <div className="flex-1 flex flex-col h-full">
                {/* Górny pasek */}
                <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
                        <Coffee className="h-6 w-6" />
                        <span>Katalog Menu</span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors text-sm font-medium"
                    >
                        <LogOut className="h-4 w-4" />
                        Wyloguj
                    </button>
                </header>

                {/* Siatka produktów */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {error && (
                        <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    {isLoadingProducts ? (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            Ładowanie menu z serwera...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all text-left flex flex-col h-32 active:scale-95"
                                >
                                    <h3 className="font-semibold text-slate-800 line-clamp-2 leading-tight">
                                        {product.name}
                                    </h3>
                                    <div className="mt-auto pt-2 flex justify-between items-end">
                                        <span className="font-bold text-emerald-600">
                                            {product.price.toFixed(2)} PLN
                                        </span>
                                        <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
                                            <Plus className="h-4 w-4" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- PRAWA STRONA: KOSZYK (Rachunek) --- */}
            <div className="w-96 bg-white shadow-2xl flex flex-col border-l border-slate-200 z-10">
                
                {/* Nagłówek Koszyka */}
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2 font-bold text-lg text-slate-800 mb-4">
                        <ShoppingCart className="h-5 w-5 text-emerald-500" />
                        Obecne Zamówienie
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Numer Stolika
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value ? Number(e.target.value) : '')}
                            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-bold"
                            placeholder="np. 12"
                        />
                    </div>
                </div>

                {/* Lista Pozycji */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Receipt className="h-12 w-12 opacity-20" />
                            <p className="text-sm">Brak pozycji na rachunku</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.product.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <span className="font-semibold text-sm pr-4 line-clamp-2">
                                        {item.product.name}
                                    </span>
                                    <span className="font-bold text-slate-700 whitespace-nowrap">
                                        {(item.product.price * item.quantity).toFixed(2)} zł
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1">
                                        <button 
                                            onClick={() => updateQuantity(item.product.id, -1)}
                                            className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.product.id, 1)}
                                            className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.product.id)}
                                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sekcja Podsumowania i Płatności */}
                <div className="p-6 bg-slate-50 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-slate-500 font-medium">Suma całkowita</span>
                        <span className="text-3xl font-extrabold text-emerald-600">
                            {totalAmount.toFixed(2)} zł
                        </span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut || cart.length === 0}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        <CreditCard className="h-5 w-5" />
                        {isCheckingOut ? 'Przetwarzanie...' : 'Zrealizuj rachunek'}
                    </button>
                </div>
            </div>
        </div>
    );
}