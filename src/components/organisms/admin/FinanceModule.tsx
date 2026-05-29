import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
    Wallet, 
    Plus, 
    Search, 
    TrendingUp, 
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    DollarSign,
    Calendar as CalendarIcon,
    Clock
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button, Card, Badge, SectionHeader } from '../../atoms/UIPrimitives';
import { useAdminData } from '../../../hooks/useAdminData';
import { Student } from '../../../types';

interface Transaction {
    id: string;
    studentName: string;
    amount: number;
    type: 'Income' | 'Expense';
    category: 'Tuition' | 'Facility' | 'Supplies' | 'Payroll' | 'Utility';
    status: 'Paid' | 'Pending' | 'Overdue';
    date: string;
}

export const FinanceModule = ({ students = [] }: { students?: Student[] }) => {
    const defaultTransactions: Transaction[] = [
        { id: 'tx_smp_1', studentName: 'Andhika Pratama', amount: 350000, type: 'Income', category: 'Tuition', status: 'Paid', date: '2026-05-25' },
        { id: 'tx_smp_2', studentName: 'Siti Aminah', amount: 350000, type: 'Income', category: 'Tuition', status: 'Pending', date: '2026-05-28' },
        { id: 'tx_smp_3', studentName: 'Rizky Fauzi', amount: 350000, type: 'Income', category: 'Tuition', status: 'Overdue', date: '2026-05-01' },
        { id: '1', studentName: 'Rani Wijaya', amount: 250000, type: 'Income', category: 'Tuition', status: 'Paid', date: '2026-05-20' },
        { id: '2', studentName: 'Budi Hartono', amount: 250000, type: 'Income', category: 'Tuition', status: 'Pending', date: '2026-05-22' },
        { id: '3', studentName: 'Suplai Umum', amount: 1500000, type: 'Expense', category: 'Supplies', status: 'Paid', date: '2026-05-18' },
        { id: '5', studentName: 'Tagihan Listrik', amount: 1200000, type: 'Expense', category: 'Utility', status: 'Paid', date: '2026-05-15' },
    ];
    
    const [transactions, setTransactions] = useAdminData<Transaction[]>('admin_finance', defaultTransactions);

    const handleAddFake = () => {
        const types: ('Income' | 'Expense')[] = ['Income', 'Expense'];
        const isInc = Math.random() > 0.4;
        const newTx: Transaction = {
            id: crypto.randomUUID(),
            studentName: isInc ? 'Siswa Baru ' + Math.floor(Math.random() * 999) : 'Pembelian Aset',
            amount: Math.floor(Math.random() * 2000000) + 100000,
            type: isInc ? 'Income' : 'Expense',
            category: isInc ? 'Tuition' : 'Supplies',
            status: Math.random() > 0.5 ? 'Paid' : 'Pending',
            date: new Date().toISOString().split('T')[0]
        };
        setTransactions([newTx, ...transactions]);
    };

    const handleSetor = (txId: string) => {
        setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'Paid', date: new Date().toISOString().split('T')[0] } : t));
    };

    const handleGenerateBilling = () => {
        const confirm = window.confirm(`Generate tagihan SPP bulan ini untuk ${students.length > 0 ? students.length : 'semua'} siswa?`);
        if (!confirm) return;
        
        // Default SPP amounts if not specified
        const DEFAULT_SMP_SPP = 350000;
        const DEFAULT_TK_SPP = 250000;

        const studentsToBill = students.length > 0 ? students.map(s => ({
            name: s.name,
            amount: s.kelompok?.toLowerCase().includes('smp') ? DEFAULT_SMP_SPP : DEFAULT_TK_SPP
        })) : [
            { name: 'Andhika Pratama', amount: 350000 },
            { name: 'Siti Aminah', amount: 350000 },
            { name: 'Rizky Fauzi', amount: 350000 },
            { name: 'Rani Wijaya', amount: 250000 },
            { name: 'Budi Hartono', amount: 250000 }
        ];

        const newBills: Transaction[] = studentsToBill.map((s, idx) => ({
            id: `bill_${Date.now()}_${idx}_${s.name.replace(/\s/g, '_')}`,
            studentName: s.name,
            amount: s.amount,
            type: 'Income',
            category: 'Tuition',
            status: 'Pending',
            date: new Date().toISOString().split('T')[0]
        }));

        setTransactions([...newBills, ...transactions]);
    };

    const incomeSum = transactions.filter(t => t.type === 'Income' && t.status === 'Paid').reduce((a, b) => a + b.amount, 0);
    const expenseSum = transactions.filter(t => t.type === 'Expense' && t.status === 'Paid').reduce((a, b) => a + b.amount, 0);
    const balance = incomeSum - expenseSum;
    const pendingCount = transactions.filter(t => t.status === 'Pending').length;

    const formatCurrency = (val: number) => {
        if (Math.abs(val) >= 1000000) {
            return `Rp ${(val / 1000000).toFixed(1)}M`;
        }
        return `Rp ${(val / 1000).toFixed(0)}K`;
    };

    const stats = [
        { label: 'Pemasukan', value: formatCurrency(incomeSum), trend: '+12%', icon: ArrowUpRight, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Pengeluaran', value: formatCurrency(expenseSum), trend: '+2%', icon: ArrowDownLeft, color: 'text-rose-500', bg: 'bg-rose-50' },
        { label: 'Saldo', value: formatCurrency(balance), trend: 'Stabil', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'Tertunda', value: `${pendingCount} item`, trend: 'Tinggi', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    const getStatusVariant = (status: Transaction['status']): any => {
        switch (status) {
            case 'Paid': return 'success';
            case 'Pending': return 'warning';
            case 'Overdue': return 'error';
            default: return 'default';
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50/50 min-h-0 overflow-y-auto">
            {/* Header */}
            <header className="px-5 md:px-8 py-6 md:py-8 border-b border-black/5 bg-white shrink-0">
                <SectionHeader 
                    title="Pusat Keuangan" 
                    subtitle="Buku Besar Institusi V2.4" 
                    icon={Wallet}
                    actions={
                        <>
                            <Button variant="outline" icon={<DollarSign size={14} />} onClick={handleGenerateBilling} className="cursor-pointer">Tagihan</Button>
                            <Button variant="dark" icon={<Plus size={14} />} onClick={handleAddFake} className="cursor-pointer">Setor / Catat</Button>
                        </>
                    }
                />
            </header>

            {/* Scrollable Content */}
            <main className="flex-1 p-5 space-y-6 md:space-y-8 max-w-[1600px] w-full mx-auto">
                {/* Stats Dashboard */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, idx) => (
                        <Card key={stat.label} padding={false} className="p-5 flex flex-col group relative overflow-hidden select-none">
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                                    <stat.icon size={18} />
                                </div>
                                <Badge variant={stat.label === 'Expenses' ? 'error' : 'success'} className="ml-2">{stat.trend}</Badge>
                            </div>
                            <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    {/* Transaction List */}
                    <div className="lg:col-span-8">
                        <Card padding={false} className="overflow-hidden flex flex-col h-full">
                            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/30">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Arus Transaksi</h3>
                                <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-3 py-1.5 w-full sm:w-64 shadow-sm group focus-within:border-indigo-500 transition-all">
                                    <Search className="text-slate-300" size={14} />
                                    <input type="text" placeholder="Cari entri..." className="bg-transparent border-none outline-none text-[10px] font-bold w-full uppercase tracking-widest placeholder:text-slate-300" />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50">
                                        <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                            <th className="px-6 py-4">Transaksi</th>
                                            <th className="px-6 py-4">Kategori</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Jumlah</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 tracking-tight">{tx.studentName}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                                                            <CalendarIcon size={10} /> {tx.date}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <Badge>{tx.category === 'Tuition' ? 'SPP' : tx.category === 'Facility' ? 'Fasilitas' : tx.category === 'Supplies' ? 'Alat Tulis' : tx.category === 'Payroll' ? 'Gaji' : 'Utilitas'}</Badge>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <Badge variant={getStatusVariant(tx.status)}>{tx.status === 'Paid' ? 'Lunas' : tx.status === 'Pending' ? 'Tertunda' : 'Jatuh Tempo'}</Badge>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <span className={cn("text-sm font-black tracking-tight", tx.type === 'Income' ? 'text-emerald-600' : 'text-slate-900')}>
                                                        {tx.type === 'Income' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    {tx.status !== 'Paid' ? (
                                                        <Button 
                                                            size="sm" 
                                                            variant="success" 
                                                            onClick={() => handleSetor(tx.id)}
                                                            className="text-[9px] px-2 py-1 h-auto font-black uppercase tracking-widest whitespace-nowrap"
                                                        >
                                                            Setor
                                                        </Button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setTransactions(transactions.filter(t => t.id !== tx.id))}
                                                            className="w-9 h-9 rounded-xl hover:bg-rose-50 focus:bg-rose-50 transition-all flex items-center justify-center text-slate-300 hover:text-rose-600"
                                                        >
                                                            <CreditCard size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Meta Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="bg-slate-900 border-none text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                            <div className="relative z-10 flex flex-col">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-8">Ringkasan Eksekutif</h4>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pengumpulan Uang Sekolah</div>
                                            <div className="text-3xl font-black tracking-tighter">85.4%</div>
                                        </div>
                                        <TrendingUp size={32} className="text-emerald-500 opacity-20" />
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '85.4%' }} className="h-full bg-indigo-500" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Tagihan Aktif</div>
                                            <div className="text-xl font-black text-rose-400 tracking-tighter">Rp {transactions.filter(t => t.status !== 'Paid' && t.type === 'Income').reduce((a,b) => a + b.amount, 0).toLocaleString('id-ID')}</div>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Setoran Hari Ini</div>
                                            <div className="text-xl font-black text-emerald-400 tracking-tighter">Rp {transactions.filter(t => t.status === 'Paid' && t.date === new Date().toISOString().split('T')[0]).reduce((a,b) => a + b.amount, 0).toLocaleString('id-ID')}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 mt-6 pt-6 border-t border-white/5">
                                        <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Monitoring Per Cabang</h5>
                                        {[
                                            { label: 'Cabang SMP (7A, 8B, 9C)', progress: 65, color: 'bg-indigo-500' },
                                            { label: 'Cabang TK (B1, B2)', progress: 92, color: 'bg-emerald-500' }
                                        ].map(item => (
                                            <div key={item.label} className="space-y-1.5">
                                                <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                                    <span>{item.label}</span>
                                                    <span>{item.progress}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div className={cn("h-full", item.color)} style={{ width: `${item.progress}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button fullWidth variant="dark" className="bg-white/10 border border-white/10 hover:bg-white hover:text-black">Jalankan Laporan Audit</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};
