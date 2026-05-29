import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
    Package, 
    Plus, 
    Search, 
    Layers, 
    Tag, 
    RefreshCcw,
    Truck,
    Box,
    ClipboardList,
    MoreVertical,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button, Card, Badge, SectionHeader } from '../../atoms/UIPrimitives';
import { useAdminData } from '../../../hooks/useAdminData';

interface InventoryItem {
    id: string;
    name: string;
    category: 'Educational' | 'Facility' | 'Logistics' | 'ICT';
    stock: number;
    unit: string;
    status: 'In Stock' | 'Low' | 'Empty';
    lastRestocked: string;
}

export const InventoryModule = () => {
    const defaultItems: InventoryItem[] = [
        { id: '1', name: 'Alat Peraga Balok', category: 'Educational', stock: 12, unit: 'Kotak', status: 'In Stock', lastRestocked: '2024-05-10' },
        { id: '2', name: 'Kertas HVS A4', category: 'Logistics', stock: 2, unit: 'Rim', status: 'Low', lastRestocked: '2024-05-15' },
        { id: '3', name: 'Cairan Pembersih', category: 'Facility', stock: 0, unit: 'Botol', status: 'Empty', lastRestocked: '2024-04-20' },
        { id: '4', name: 'Kursi Siswa', category: 'Facility', stock: 45, unit: 'Unit', status: 'In Stock', lastRestocked: '2023-12-01' },
        { id: '5', name: 'Tabel Guru', category: 'ICT', stock: 8, unit: 'Unit', status: 'In Stock', lastRestocked: '2024-01-20' },
    ];
    
    const [items, setItems] = useAdminData<InventoryItem[]>('admin_inventory', defaultItems);

    const handleAddFake = () => {
        const newItem: InventoryItem = {
            id: crypto.randomUUID(),
            name: 'Aset Baru ' + Math.floor(Math.random() * 999),
            category: 'Logistics',
            stock: Math.floor(Math.random() * 50) + 1,
            unit: 'Units',
            status: 'In Stock',
            lastRestocked: new Date().toISOString().split('T')[0]
        };
        setItems([newItem, ...items]);
    };

    const lowCount = items.filter(i => i.status === 'Low' || i.stock <= 5).length;

    const stats = [
        { label: 'Nilai Aset', value: 'Rp 82.5M', icon: Box, color: 'text-black', bg: 'bg-slate-50' },
        { label: 'Stok Menipis', value: `${lowCount} Unit`, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Pengadaan', value: '2 Aktif', icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'Status Audit', value: '98%', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    const getStatusVariant = (status: InventoryItem['status']): any => {
        switch (status) {
            case 'In Stock': return 'success';
            case 'Low': return 'warning';
            case 'Empty': return 'error';
            default: return 'default';
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50/50 min-h-0 overflow-y-auto">
            {/* Header */}
            <header className="px-5 md:px-8 py-6 md:py-8 border-b border-black/5 bg-white shrink-0">
                <SectionHeader 
                    title="Inventaris" 
                    subtitle="Jaringan Kontrol Aset" 
                    icon={Package}
                    actions={
                        <>
                            <Button variant="outline" icon={<ClipboardList size={14} />} className="cursor-pointer">Audit</Button>
                            <Button variant="dark" icon={<Plus size={14} />} onClick={handleAddFake} className="cursor-pointer">Tambah Stok</Button>
                        </>
                    }
                />
            </header>

            {/* List Content */}
            <main className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1600px] w-full mx-auto">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, idx) => (
                        <Card key={stat.label} padding={false} className="p-4 sm:p-5 flex flex-col group border-slate-100 select-none">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110", stat.bg, stat.color)}>
                                    <stat.icon size={18} />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6 md:space-y-8">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 relative w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={16} />
                            <input 
                                type="text"
                                placeholder="Cari repositori inventaris..."
                                className="w-full h-12 md:h-14 pl-12 pr-6 bg-white border border-slate-100 rounded-2xl text-[10px] md:text-xs font-black outline-none focus:border-indigo-500 shadow-sm transition-all uppercase tracking-widest placeholder:text-slate-300"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border border-slate-100 w-full md:w-auto">
                            <button className="px-4 py-2.5 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-black/10 cursor-pointer">Semua</button>
                            <button className="px-4 py-2.5 text-slate-400 hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer">Habis Pakai</button>
                            <button className="px-4 py-2.5 text-slate-400 hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer">Aset Tetap</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {items.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group"
                            >
                                <Card padding={false} className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-6 hover:border-black transition-all">
                                    <div className="flex items-center gap-5 flex-1">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-black group-hover:text-white transition-all shrink-0 shadow-inner">
                                            <Tag size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-sm md:text-md font-black text-slate-900 tracking-tight truncate uppercase">{item.name}</h3>
                                                <Badge>{item.category === 'Educational' ? 'Edukasi' : item.category === 'Facility' ? 'Fasilitas' : item.category === 'Logistics' ? 'Logistik' : 'TIK'}</Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                                                <span className="flex items-center gap-2"><Layers size={12} className="text-indigo-400" /> {item.stock} {item.unit}</span>
                                                <span className="flex items-center gap-2"><RefreshCcw size={12} className="text-emerald-400" /> {new Date(item.lastRestocked).toLocaleDateString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 sm:pl-8 sm:border-l sm:border-slate-50 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                                        <Badge variant={getStatusVariant(item.status)} className="px-4 py-1.5">{item.status === 'In Stock' ? 'Tersedia' : item.status === 'Low' ? 'Menipis' : 'Habis'}</Badge>
                                        <button 
                                            onClick={() => setItems(items.filter(i => i.id !== item.id))}
                                            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all flex items-center justify-center"
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};
