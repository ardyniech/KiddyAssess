import React from 'react';
import { 
    Users, 
    BookOpen, 
    Wallet, 
    Package, 
    Calendar,
    LayoutDashboard,
    Sparkles, 
    FileText, 
    Eye, 
    Settings2,
    CheckCircle2,
    ShieldCheck,
    ClipboardList,
    Trophy
} from 'lucide-react';
import { AppModule } from '../types';

import { OrganismDashboard } from '../components/organisms/OrganismDashboard';
import { OrganismStudentPage } from '../components/organisms/student-manager/OrganismStudentPage';
import { OrganismAssessmentHub } from '../components/organisms/OrganismAssessmentHub';
import { OrganismReportGenerator } from '../components/organisms/reports/OrganismReportGenerator';
import { OrganismAppSettings } from '../components/organisms/OrganismAppSettings';
import { AttendanceModule } from '../components/organisms/attendance/AttendanceModule';
import { CompareStudentsModule } from '../components/organisms/CompareStudentsModule';
import { TeacherRewardsModule } from '../components/organisms/rewards/TeacherRewardsModule';

import { StaffModule } from '../components/organisms/admin/StaffModule';
import { FinanceModule } from '../components/organisms/admin/FinanceModule';
import { InventoryModule } from '../components/organisms/admin/InventoryModule';
import { AccessControlModule } from '../components/organisms/admin/AccessControlModule';
import { CalendarModule } from '../components/organisms/admin/CalendarModule';
import { KanbanModule } from '../components/organisms/KanbanModule';

// Framework for Admin Modules (Placeholders for expansion)
const AdminPlaceholder = ({ title, desc }: { title: string, desc: string }) => (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50">
        <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center text-slate-300 mb-6">
            <Settings2 size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">{title}</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{desc}</p>
        <div className="mt-8 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest">
            Pengembangan Modul Sedang Berlangsung
        </div>
    </div>
);

export const APP_MODULES: AppModule[] = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        icon: LayoutDashboard,
        category: 'core',
        component: OrganismDashboard,
        showInSidebar: true,
        order: 1
    },
    {
        id: 'students',
        name: 'Daftar Siswa',
        icon: Users,
        category: 'core',
        component: OrganismStudentPage,
        showInSidebar: true,
        requiredRoles: ['MASTER', 'SUPER_USER', 'ADMIN', 'TEACHER'],
        order: 2
    },
    {
        id: 'attendance',
        name: 'Absensi',
        icon: ClipboardList,
        category: 'core',
        component: AttendanceModule,
        showInSidebar: true,
        requiredRoles: ['MASTER', 'SUPER_USER', 'ADMIN', 'TEACHER', 'OPERATOR'],
        order: 2.5
    },
    {
        id: 'staff',
        name: 'Data Guru',
        icon: BookOpen,
        category: 'admin',
        component: StaffModule,
        showInSidebar: true,
        requiredRoles: ['MASTER', 'SUPER_USER', 'ADMIN'],
        order: 3
    },
    {
        id: 'assessment',
        name: 'Isi Nilai',
        icon: FileText,
        category: 'assessment',
        component: OrganismAssessmentHub,
        requiresStudent: true,
        showInSidebar: true,
        requiredRoles: ['MASTER', 'SUPER_USER', 'ADMIN', 'TEACHER'],
        order: 4
    },
    {
        id: 'generator',
        name: 'Narasi AI',
        icon: Sparkles,
        category: 'assessment',
        component: OrganismReportGenerator,
        requiresStudent: true,
        showInSidebar: true,
        requiredRoles: ['MASTER', 'SUPER_USER', 'ADMIN', 'TEACHER'],
        order: 5
    },
    {
        id: 'compare',
        name: 'Bandingkan',
        icon: Eye,
        category: 'assessment',
        component: CompareStudentsModule,
        showInSidebar: true,
        requiredRoles: ['MASTER', 'SUPER_USER', 'ADMIN', 'TEACHER'],
        order: 6
    },
    {
        id: 'finance',
        name: 'Keuangan',
        icon: Wallet,
        category: 'admin',
        component: FinanceModule,
        showInSidebar: true,
        requiredRoles: ['MASTER', 'SUPER_USER', 'ADMIN'],
        order: 8
    },
    {
        id: 'inventory',
        name: 'Inventaris',
        icon: Package,
        category: 'admin',
        component: InventoryModule,
        showInSidebar: true,
        requiredRoles: ['MASTER', 'SUPER_USER', 'ADMIN', 'OPERATOR'],
        order: 9
    },
    {
        id: 'access-control',
        name: 'Hak Akses',
        icon: ShieldCheck,
        category: 'admin',
        component: AccessControlModule,
        showInSidebar: true,
        requiredRoles: ['MASTER', 'SUPER_USER'],
        order: 10
    },
    {
        id: 'calendar',
        name: 'Kalender Kerja',
        icon: Calendar,
        category: 'admin',
        component: CalendarModule,
        showInSidebar: true,
        requiredRoles: ['MASTER', 'SUPER_USER', 'ADMIN', 'TEACHER', 'OPERATOR'],
        order: 11
    },
    {
        id: 'kanban',
        name: 'E-Kanban',
        icon: ClipboardList,
        category: 'core',
        component: KanbanModule,
        showInSidebar: true,
        requiredRoles: ['MASTER', 'SUPER_USER', 'ADMIN', 'TEACHER', 'OPERATOR'],
        order: 12
    },
    {
        id: 'rewards',
        name: 'Reward Guru',
        icon: Trophy,
        category: 'utility',
        component: TeacherRewardsModule,
        showInSidebar: true,
        requiredRoles: ['MASTER', 'SUPER_USER', 'ADMIN', 'TEACHER'],
        order: 13
    },
    {
        id: 'settings',
        name: 'Pengaturan App',
        icon: Settings2,
        category: 'utility',
        component: OrganismAppSettings,
        showInSidebar: false,
        requiredRoles: ['MASTER', 'SUPER_USER', 'ADMIN']
    }
];

export const getModuleById = (id: string) => APP_MODULES.find(m => m.id === id);
export const getSidebarModules = () => APP_MODULES.filter(m => m.showInSidebar).sort((a, b) => (a.order || 0) - (b.order || 0));
