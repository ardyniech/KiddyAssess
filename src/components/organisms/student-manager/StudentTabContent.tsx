import React from 'react';
import { Menu, Users } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StudentManagerNavigation } from './StudentManagerNavigation';
import { StudentListSection } from './StudentListSection';
import { Plus } from 'lucide-react';
import { Student } from '../../../types';

interface StudentTabContentProps {
    activeTab: 'navigation' | 'students';
    setActiveTab: (tab: 'navigation' | 'students') => void;
    currentView: any;
    setView: (view: any) => void;
    onClose: () => void;
    onOpenSettings: () => void;
    search: string;
    setSearch: (s: string) => void;
    rombelFilter: string;
    setRombelFilter: (r: string) => void;
    availableRombels: string[];
    filteredStudents: Student[];
    getStudentProgress: (sid: string) => number;
    activeStudentId?: string;
    onSelectStudent: (s: Student) => void;
    startEdit: (student: Student, e: React.MouseEvent) => void;
    setStudentToDelete: (s: Student | null) => void;
    isReadOnly: boolean;
    setEditingStudent: (s: Student | null) => void;
    setFormData: (data: any) => void;
    setIsAdding: (adding: boolean) => void;
}

export const StudentTabContent = ({
    activeTab,
    setActiveTab,
    currentView,
    setView,
    onClose,
    onOpenSettings,
    search,
    setSearch,
    rombelFilter,
    setRombelFilter,
    availableRombels,
    filteredStudents,
    getStudentProgress,
    activeStudentId,
    onSelectStudent,
    startEdit,
    setStudentToDelete,
    isReadOnly,
    setEditingStudent,
    setFormData,
    setIsAdding
}: StudentTabContentProps) => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex gap-1 shrink-0">
                <button 
                    onClick={() => setActiveTab('navigation')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border",
                        activeTab === 'navigation' ? "bg-indigo-600 border-indigo-700 text-white shadow" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-500"
                    )}
                >
                    <Menu size={12} />
                    Menu Modules
                </button>
                <button 
                    onClick={() => setActiveTab('students')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border",
                        activeTab === 'students' ? "bg-indigo-600 border-indigo-700 text-white shadow" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-500"
                    )}
                >
                    <Users size={12} />
                    Student List
                </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {activeTab === 'navigation' ? (
                    <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
                        <StudentManagerNavigation currentView={currentView} setView={setView} onClose={onClose} onOpenSettings={onOpenSettings} />
                        <div className="p-8 flex flex-col items-center justify-center opacity-5 select-none pointer-events-none mt-auto">
                            <div className="text-[32px] font-black italic tracking-tighter leading-none mb-1">KIDDY</div>
                            <div className="w-16 h-[2px] bg-indigo-600 mb-2" />
                            <div className="text-[8px] font-bold tracking-[0.5em] uppercase">ASSESS SYSTEM</div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                        <StudentListSection 
                            search={search}
                            setSearch={setSearch}
                            rombelFilter={rombelFilter}
                            setRombelFilter={setRombelFilter}
                            availableRombels={availableRombels}
                            filteredStudents={filteredStudents}
                            getStudentProgress={getStudentProgress}
                            activeStudentId={activeStudentId}
                            onSelectStudent={onSelectStudent}
                            onEditStudent={startEdit}
                            onDeleteRequest={setStudentToDelete}
                        />
                        
                        {!isReadOnly && (
                            <div className="p-3 bg-slate-50 border-t border-slate-100 shrink-0">
                                <button 
                                    onClick={() => {
                                        setEditingStudent(null);
                                        setFormData({ name: "", kelompok: "A1", semester: "1", semesterType: "Ganjil", photoUrl: "", nisn: "", height: 0, weight: 0 });
                                        setIsAdding(true);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-100 cursor-pointer"
                                >
                                    <Plus size={14} />
                                    Add New Student Record
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
