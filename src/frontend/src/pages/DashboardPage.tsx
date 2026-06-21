import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { DollarSign, TrendingUp, ShoppingBag, RefreshCw, ArrowLeft, Clock, Receipt, FileText } from 'lucide-react';

interface Transaction {
    orderId: string;
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

    const [report, setReport] = useState<ReportResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchReportData = async (silent = false) => {
        if (!silent) setIsLoading(true); setError(null);
        try {
            const res = await apiClient.get<any>('/reports/daily-revenue');
            const d = res.data;
            
            // ACL Normalizacja silnika MongoDB / C#
            const normalized: ReportResponse = {
                date: d.date || d.Date || new Date().toISOString().split('T')[0],
                totalOrders: parseInt(d.totalOrders ?? d.TotalOrders ?? '0'),
                totalRevenue: parseFloat(d.totalRevenue ?? d.TotalRevenue ?? '0'),
                transactions: (d.transactions || d.Transactions || []).map((t: any) => ({
                    orderId: t.orderId || t.OrderId || 'REF-N/A',
                    totalAmount: parseFloat(t.totalAmount ?? t.TotalAmount ?? '0'),
                    paidAt: t.paidAt || t.PaidAt || new Date().toISOString()
                }))
            };

            setReport(normalized);
        } catch (err: any) {
            setError(err.response?.status === 403 ? "Odmowa: Raport wymaga uprawnień Menedżera." : "Błąd Analytics API lub silnika MongoDB.");
        } finally {
            setIsLoading(false); setIsRefreshing(false);
        }
    };

    useEffect(() => { fetchReportData(); }, []);

    const aov = report && report.totalOrders > 0 ? report.totalRevenue / report.totalOrders : 0;
    const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
            <header className="bg-slate-800 border-b border-slate-700 px-8 py-5 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/pos')} className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 flex items-center gap-2 text-xs font-bold transition-all"><ArrowLeft className="h-4 w-4" /> Kasa POS</button>
                    <div className="h-6 w-px bg-slate-700"></div>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg"><TrendingUp className="h-6 w-6" /> <span>Puls Finansowy Lokalu</span></div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => { setIsRefreshing(true); fetchReportData(true); }} disabled={isRefreshing} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-indigo-400 text-xs font-bold flex items-center gap-2">
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> Odśwież utarg
                    </button>
                    <button onClick={() => { logout(); navigate('/login'); }} className="p-2.5 text-slate-400 hover:text-red-400 rounded-xl text-xs font-bold">Wyloguj</button>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-6xl w-full mx-auto space-y-8">
                {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold text-center">{error}</div>}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-80 text-slate-500 font-mono text-xs gap-3"><RefreshCw className="h-6 w-6 animate-spin text-indigo-500" /> Pobieranie wektorów z bazy MongoDB...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl flex justify-between items-center">
                                <div><span className="text-[10px] font-mono font-bold uppercase text-slate-400">Utarg brutto</span> <h3 className="text-3xl font-black font-mono text-emerald-400 mt-1">{report?.totalRevenue.toFixed(2)} <span className="text-sm font-sans text-emerald-500">PLN</span></h3></div>
                                <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20"><DollarSign className="h-6 w-6" /></div>
                            </div>
                            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl flex justify-between items-center">
                                <div><span className="text-[10px] font-mono font-bold uppercase text-slate-400">Rachunki zamknięte</span> <h3 className="text-3xl font-black font-mono text-indigo-400 mt-1">{report?.totalOrders} <span className="text-sm font-sans text-indigo-500">szt.</span></h3></div>
                                <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20"><ShoppingBag className="h-6 w-6" /></div>
                            </div>
                            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl flex justify-between items-center">
                                <div><span className="text-[10px] font-mono font-bold uppercase text-slate-400">Średni koszyk (AOV)</span> <h3 className="text-3xl font-black font-mono text-amber-400 mt-1">{aov.toFixed(2)} <span className="text-sm font-sans text-amber-500">PLN</span></h3></div>
                                <div className="p-4 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20"><FileText className="h-6 w-6" /></div>
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
                            <div className="px-7 py-5 border-b border-slate-700/80 flex justify-between items-center bg-slate-800/60">
                                <span className="font-bold text-white text-sm flex items-center gap-2"><Receipt className="h-4 w-4 text-indigo-400" /> Dziennik Transakcji Kasowych</span>
                                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">Data: {report?.date}</span>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-700 text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-900/40">
                                        <th className="p-4 pl-7">ID Transakcji</th>
                                        <th className="p-4">Fiskalizacja</th>
                                        <th className="p-4 pr-7 text-right">Kwota rachunku</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50 text-xs font-mono">
                                    {report?.transactions.map(tx => (
                                        <tr key={tx.orderId} className="hover:bg-slate-700/30">
                                            <td className="p-4 pl-7 text-slate-300 font-bold">{tx.orderId}</td>
                                            <td className="p-4 text-slate-400"><Clock className="h-3 w-3 inline mr-1 text-slate-500" /> {formatTime(tx.paidAt)}</td>
                                            <td className="p-4 pr-7 text-right text-emerald-400 font-bold">{tx.totalAmount.toFixed(2)} zł</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}