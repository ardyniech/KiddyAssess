import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Users, 
    Plus, 
    Search, 
    Mail, 
    Phone, 
    MoreVertical, 
    GraduationCap, 
    ShieldCheck, 
    IdCard,
    Filter
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button, Card, Badge, SectionHeader } from '../../atoms/UIPrimitives';
import { useAdminData } from '../../../hooks/useAdminData';
import { usePermissions } from '../../../context/PermissionContext';

interface StaffMember {
    id: string;
    name: string;
    role: 'Teacher' | 'Admin' | 'Staff' | 'Principal';
    email: string;
    phone: string;
    status: 'Active' | 'On Leave' | 'Inactive';
    joinDate: string;
    avatar?: string;
}

export const StaffModule = () => {
    const defaultStaff: StaffMember[] = [
        { id: '1', name: 'Siti Aminah, S.Pd', role: 'Teacher', email: 'siti.aminah@kiddy.edu', phone: '0812-3456-7890', status: 'Active', joinDate: '2022-08-15' },
        { id: '2', name: 'Budi Santoso', role: 'Principal', email: 'budi.s@kiddy.edu', phone: '0812-3456-7891', status: 'Active', joinDate: '2020-01-10' },
        { id: '3', name: 'Lia Kusuma', role: 'Admin', email: 'lia.k@kiddy.edu', phone: '0812-3456-7892', status: 'Active', joinDate: '2021-06-20' },
        { id: '4', name: 'Andi Wijaya, M.Pd', role: 'Teacher', email: 'andi.w@kiddy.edu', phone: '0812-3456-7893', status: 'On Leave', joinDate: '2023-01-05' },
    ];
    const [staff, setStaff, isLoaded] = useAdminData<StaffMember[]>('admin_staff', defaultStaff);

    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const { canPerformAction } = usePermissions();
    const canEditStaff = canPerformAction('edit_staff');
    
    // Quick add logic
    const handleAddFake = () => {
        if (!canEditStaff) return;
        const newStaff: StaffMember = {
            id: crypto.randomUUID(),
            name: 'Guru Baru ' + Math.floor(Math.random() * 1000),
            role: 'Teacher',
            email: 'baru@kiddy.edu',
            phone: '0812-0000-0000',
            status: 'Active',
            joinDate: new Date().toISOString().split('T')[0]
        };
        setStaff([...staff, newStaff]);
    };

    const filteredStaff = staff.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusVariant = (status: StaffMember['status']): any => {
        switch (status) {
            case 'Active': return 'success';
            case 'On Leave': return 'warning';
            case 'Inactive': return 'error';
            default: return 'default';
        }
    };

    const getRoleIcon = (role: StaffMember['role']) => {
        switch (role) {
            case 'Principal': return <ShieldCheck size={12} />;
            case 'Teacher': return <GraduationCap size={12} />;
            case 'Admin': return <IdCard size={12} />;
            default: return <Users size={12} />;
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50/50 min-h-0 overflow-y-auto">
            {/* Header */}
            <header className="px-5 md:px-8 py-6 md:py-8 border-b border-black/5 bg-white shrink-0">
                <SectionHeader 
                    title="Direktori Staf" 
                    subtitle="Manajemen Personil & Pendidik" 
                    icon={Users}
                    actions={
                        <>
                            <Button variant="outline" icon={<Filter size={14} />} className="cursor-pointer">Saring</Button>
                            <Button variant="dark" icon={<Plus size={14} />} onClick={handleAddFake} className="cursor-pointer">Tambah Personil</Button>
                        </>
                    }
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={18} />
                        <input 
                            type="text"
                            placeholder="CARI BERDASARKAN NAMA ATAU PERAN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 md:h-14 pl-12 pr-6 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-indigo-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-6 sm:gap-8 bg-white/50 p-2 rounded-2xl border border-slate-100 self-start sm:self-center ml-auto sm:ml-0 shrink-0">
                        <div className="text-center border-r border-slate-200 pr-6 sm:pr-8 pl-3 sm:pl-4">
                            <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter">{staff.length}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Staf</div>
                        </div>
                        <div className="text-center pr-3 sm:pr-4">
                            <div className="text-lg sm:text-xl font-black text-emerald-600 tracking-tighter">{staff.filter(s => s.status === 'Active').length}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Aktif</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Row */}
            <main className="flex-1 p-5 md:p-8 custom-scrollbar">
                <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredStaff.map((member, idx) => (
                            <motion.div
                                key={member.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card padding={false} className="p-6 h-full flex flex-col group hover:border-indigo-600 transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <Badge variant={member.status === 'Active' ? 'success' : 'warning'} className="px-3 py-1 ring-4 ring-slate-50">
                                            {member.status === 'Active' ? 'Aktif' : member.status === 'On Leave' ? 'Cuti' : 'Nonaktif'}
                                        </Badge>
                                        <button 
                                            onClick={() => canEditStaff && setStaff(staff.filter(s => s.id !== member.id))}
                                            className="w-9 h-9 rounded-xl hover:bg-rose-50 flex items-center justify-center text-slate-300 hover:text-rose-600 transition-all"
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>

                                    <div className="flex flex-col items-center text-center flex-1">
                                        <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-4 border-white shadow-2xl flex items-center justify-center text-slate-200 mb-6 group-hover:scale-110 transition-transform overflow-hidden relative group-hover:shadow-indigo-500/10">
                                            {member.avatar ? (
                                                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Users size={32} />
                                            )}
                                        </div>

                                        <h3 className="text-lg font-black text-slate-900 tracking-tighter mb-2 line-clamp-1 uppercase">{member.name}</h3>
                                        
                                        <Badge variant="indigo" className="mb-6 py-1.5 px-4 flex items-center gap-2 border-none">
                                            {getRoleIcon(member.role)}
                                            {member.role === 'Teacher' ? 'Wali Kelas' : member.role === 'Principal' ? 'Kepala Sekolah' : member.role === 'Admin' ? 'TU / Admin' : 'Staf'}
                                        </Badge>

                                        <div className="w-full space-y-3 pt-6 border-t border-slate-50">
                                            <div className="flex items-center gap-4 text-slate-400 group-hover:text-black transition-colors">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                                    <Mail size={14} className="text-indigo-400" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-tight truncate">{member.email}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-slate-400 group-hover:text-black transition-colors">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                                    <Phone size={14} className="text-emerald-400" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{member.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-50 w-full flex justify-between items-center bg-slate-50/50 -mx-6 -mb-6 px-6 py-4 rounded-b-3xl">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bergabung</span>
                                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-[0.1em]">{new Date(member.joinDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })}</span>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {/* Add Placeholder */}
                    <motion.button 
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddFake}
                        className="bg-white/40 border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 flex flex-col items-center justify-center text-slate-300 hover:border-indigo-500 hover:text-indigo-500 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group min-h-[250px] sm:min-h-[350px]"
                    >
                        <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-current flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] leading-none">Tambah Staf</span>
                    </motion.button>
                </div>
            </main>
        </div>
    );
};
