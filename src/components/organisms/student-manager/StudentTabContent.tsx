import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Menu, Users, UploadCloud, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { StudentManagerNavigation } from './StudentManagerNavigation';
import { StudentListSection } from './StudentListSection';
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
    onAddStudentsBatch?: (students: Omit<Student, "id">[]) => void;
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
    setIsAdding,
    onAddStudentsBatch
}: StudentTabContentProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onAddStudentsBatch) return;

        setIsImporting(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const batch: Omit<Student, "id">[] = results.data.map((row: any) => ({
                        name: row.Nama || row.name || row.NAMA || "Tanpa Nama",
                        nisn: row.NISN || row.nisn || "",
                        kelompok: row.Kelompok || row.kelompok || row.Kelas || "A1",
                        semester: row.Semester || row.semester || "1",
                        semesterType: row.TipeSemester || row.semesterType || "Ganjil",
                        height: parseInt(row.Tinggi || row.height || '0', 10) || 0,
                        weight: parseInt(row.Berat || row.weight || '0', 10) || 0,
                        photoUrl: row.URLFoto || row.photoUrl || ""
                    }));
                    if (batch.length > 0) {
                        onAddStudentsBatch(batch);
                    }
                } catch (err) {
                    console.error("Failed to parse CSV", err);
                } finally {
                    setIsImporting(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }
            },
            error: (err) => {
                console.error("Error reading CSV", err);
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        });
    };

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
                            <div className="p-3 bg-slate-50 border-t border-slate-100 shrink-0 flex flex-col gap-2">
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
                                
                                {onAddStudentsBatch && (
                                    <>
                                        <input 
                                            type="file" 
                                            accept=".csv" 
                                            className="hidden" 
                                            ref={fileInputRef} 
                                            onChange={handleFileUpload} 
                                        />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isImporting}
                                            className={cn(
                                                "w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm cursor-pointer",
                                                isImporting ? "bg-slate-100 border-slate-200 text-slate-400" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                            )}
                                        >
                                            <UploadCloud size={14} />
                                            {isImporting ? "Mengimpor..." : "Batch Import CSV"}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
