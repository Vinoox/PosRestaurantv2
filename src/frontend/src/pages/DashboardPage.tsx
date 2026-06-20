import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { 
    DollarSign, 
    TrendingUp, 
    ShoppingBag, 
    RefreshCw, 
    ArrowLeft, 
    Calendar, 
    Clock, 
    FileText,
    Receipt
} from 'lucide-react';

// --- INTERFEJSY MODELI (DTO) ---
interface Transaction {
    orderId: string;
    restaurantId: string;
    totalAmount: number;
    paidAt: string;
}

interface ReportResponse {
    date: string;
    totalOrders: number;
    totalRevenue: number;
    transactions: Transaction[];
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    // --- STANY ---
    const [report, setReport] = useState<ReportResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // --- POBIERANIE DANYCH Z ANALYTICS.API ---
    const fetchReportData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<ReportResponse>('/reports/daily-revenue');
            setReport(response.data);
        } catch (err: any) {
            console.error("Błąd pobierania raportu:", err);
            if (err.response && err.response.status === 403) {
                setError("Brak uprawnień menedżerskich do przeglądania tego raportu.");
            } else {
                setError("Nie udało się połączyć z modułem analitycznym. Upewnij się, że Analytics.API i MongoDB działają.");
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchReportData(true);
    };

    // --- OBLICZENIA POMOCNICZE ---
    const averageOrderValue = report && report.totalOrders > 0 
        ? report.totalRevenue / report.totalOrders 
        : 0;

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
            
            {/* --- GÓRNY PASEK NAWIGACJI --- */}
            <header className="bg-slate-800 border-b border-slate-700 px-8 py-5 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/pos')}
                        className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all text-slate-300 flex items-center gap-2 text-sm"
                        title="Powrót do panelu kelnera"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Tryb Kelnera</span>
                    </button>
                    <div className="h-6 w-px bg-slate-700"></div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-indigo-400" />
                        <h1 className="text-xl font-bold tracking-tight text-white">Dashboard Menedżera</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all text-indigo-400 flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>{isRefreshing ? 'Odświeżanie...' : 'Odśwież dane'}</span>
                    </button>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="text-sm font-semibold text-slate-400 hover:text-red-400 transition-colors"
                    >
                        Wyloguj
                    </button>
                </div>
            </header>

            {/* --- GŁÓWNA ZAWARTOŚĆ --- */}
            <main className="flex-1 p-8 max-w-7xl w-full mx-auto space-y-8 overflow-y-auto">
                
                {/* Obsługa Błędów */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-center text-sm shadow-inner">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-96 text-slate-400 gap-4">
                        <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
                        <p className="text-sm font-medium">Agregowanie danych z bazy MongoDB...</p>
                    </div>
                ) : (
                    <>
                        {/* --- KAFELKI KPI (KLUCZOWE WSKAŹNIKI) --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Przychód */}
                            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/60 shadow-xl flex items-center justify-between">
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                                        Utarg Dzisiejszy
                                    </span>
                                    <span className="text-3xl font-black text-emerald-400 block tracking-tight">
                                        {report?.totalRevenue.toFixed(2)} <span className="text-lg font-normal text-emerald-500">PLN</span>
                                    </span>
                                </div>
                                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                            </div>

                            {/* Liczba zamówień */}
                            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/60 shadow-xl flex items-center justify-between">
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                                        Zrealizowane Rachunki
                                    </span>
                                    <span className="text-3xl font-black text-indigo-400 block tracking-tight">
                                        {report?.totalOrders} <span className="text-lg font-normal text-indigo-500">szt.</span>
                                    </span>
                                </div>
                                <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
                                    <ShoppingBag className="h-6 w-6" />
                                </div>
                            </div>

                            {/* Średnia wartość rachunku (AOV) */}
                            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/60 shadow-xl flex items-center justify-between">
                                <div className="space-y-2">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                                        Średni Rachunek (AOV)
                                    </span>
                                    <span className="text-3xl font-black text-amber-400 block tracking-tight">
                                        {averageOrderValue.toFixed(2)} <span className="text-lg font-normal text-amber-500">PLN</span>
                                    </span>
                                </div>
                                <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
                                    <FileText className="h-6 w-6" />
                                </div>
                            </div>

                        </div>

                        {/* --- TABELA HISTORII TRANSAKCJI --- */}
                        <div className="bg-slate-800 rounded-2xl border border-slate-700/60 shadow-xl overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
                                <div className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-indigo-400" />
                                    <h2 className="font-bold text-white text-base">Rejestr Ostatnich Płatności</h2>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700/60">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Raport z dnia: <strong>{report?.date}</strong></span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                {report?.transactions.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500 text-sm">
                                        Brak zarejestrowanych płatności na dzisiejszy dzień.
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-700 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/30">
                                                <th className="px-6 py-4">Identyfikator Zamówienia</th>
                                                <th className="px-6 py-4">Godzina Płatności</th>
                                                <th className="px-6 py-4 text-right">Kwota Rachunku</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/60 text-sm">
                                            {report?.transactions.map((tx) => (
                                                <tr key={tx.orderId} className="hover:bg-slate-700/20 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                                                        {tx.orderId}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                                                            {formatTime(tx.paidAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-white">
                                                        {tx.totalAmount.toFixed(2)} zł
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}