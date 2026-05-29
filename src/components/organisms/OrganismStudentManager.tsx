import React, { useState } from "react";
import { AtomText } from "../atoms/CommonAtoms";
import { Student } from "../../types";
import { Plus, X, Menu, Users, GraduationCap, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StudentManagerNavigation } from "./student-manager/StudentManagerNavigation";
import { StudentListSection } from "./student-manager/StudentListSection";
import { StudentUpsertForm } from "./student-manager/StudentUpsertForm";
import { DeleteConfirmationDialog } from "./student-manager/DeleteConfirmationDialog";
import { cn } from "../../lib/utils";
import { usePermissions } from "../../context/PermissionContext";

interface OrganismStudentManagerProps {
  students: Student[];
  getStudentProgress: (sid: string) => number;
  onAddStudent: (student: Omit<Student, "id">) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onSelectStudent: (student: Student) => void;
  activeStudentId?: string;
  onClose: () => void;
  setView: (view: any) => void;
  onOpenSettings: () => void;
  currentView: any;
  initialIsAdding?: boolean;
}

export function OrganismStudentManager({ 
  students, 
  getStudentProgress, 
  onAddStudent, 
  onUpdateStudent, 
  onDeleteStudent, 
  onSelectStudent, 
  activeStudentId, 
  onClose, 
  setView, 
  onOpenSettings, 
  currentView, 
  initialIsAdding = false 
}: OrganismStudentManagerProps) {
  const { userRole } = usePermissions();
  const isReadOnly = userRole === 'SUPER_USER'; // Only SUPER_USER (Yayasan) is read only for student records now. ADMIN can edit.

  const [isAdding, setIsAdding] = useState(initialIsAdding);

  React.useEffect(() => {
    setIsAdding(initialIsAdding);
  }, [initialIsAdding]);
  const [activeTab, setActiveTab] = useState<'navigation' | 'students'>('navigation');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState("");
  const [rombelFilter, setRombelFilter] = useState("ALL");
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Omit<Student, "id" | "updatedAt">>({ 
    name: "", kelompok: "A1", semester: "1", semesterType: "Ganjil", photoUrl: "", nisn: "", height: 0, weight: 0 
  });

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesRombel = rombelFilter === "ALL" || s.kelompok === rombelFilter;
    return matchesSearch && matchesRombel;
  });

  const availableRombels = Array.from(new Set(students.map(s => s.kelompok))).filter(Boolean);

  const startEdit = (student: Student, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setEditingStudent(student);
    setFormData({ 
      name: student.name, 
      kelompok: student.kelompok, 
      semester: student.semester, 
      semesterType: student.semesterType, 
      photoUrl: student.photoUrl || "", 
      nisn: student.nisn || "", 
      height: student.height || 0, 
      weight: student.weight || 0 
    });
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      if (editingStudent) {
        onUpdateStudent({ ...editingStudent, ...formData });
      } else {
        onAddStudent(formData);
      }
      setIsAdding(false); 
      setEditingStudent(null); 
      setFormData({ name: "", kelompok: "A1", semester: "1", semesterType: "Ganjil", photoUrl: "", nisn: "", height: 0, weight: 0 });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-[var(--border-subtle)] w-full overflow-hidden shadow-2xl relative">
      <header className="p-3.5 border-b border-black/5 flex justify-between items-center bg-slate-50 shrink-0">
        <div className="flex items-center gap-2">
            <div className="bg-indigo-600 w-2.5 h-2.5 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-black">Workspace Control</span>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer"><X size={14} className="text-slate-500" /></button>
      </header>

      {/* Conditionally Render Add / Edit Form, or Navigation & Swap List tab */}
      {isAdding ? (
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0 bg-slate-50/40">
           <button 
             onClick={() => { setIsAdding(false); setEditingStudent(null); }}
             className="flex items-center gap-2 p-4 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-black transition-colors text-left"
           >
             <ChevronLeft size={14} /> Back to Drawer
           </button>
           <StudentUpsertForm 
             editingStudent={editingStudent} 
             formData={formData} 
             setFormData={setFormData} 
             onSubmit={handleSubmit} 
             onCancel={() => { setIsAdding(false); setEditingStudent(null); }} 
           />
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Segment Toggle Buttons */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex gap-1 shrink-0">
             <button 
               onClick={() => setActiveTab('navigation')}
               className={cn(
                 "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                 activeTab === 'navigation' ? "bg-black text-white shadow" : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-500"
               )}
             >
               <Menu size={12} />
               Menu Modules
             </button>
             <button 
               onClick={() => setActiveTab('students')}
               className={cn(
                 "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                 activeTab === 'students' ? "bg-black text-white shadow" : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-500"
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
                   {/* DNA Layout Accent */}
                    <div className="p-8 flex flex-col items-center justify-center opacity-5 select-none pointer-events-none mt-auto">
                      <div className="text-[32px] font-black italic tracking-tighter leading-none mb-1">KIDDY</div>
                      <div className="w-16 h-[2px] bg-black mb-2" />
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
                      onSelectStudent={(s) => {
                        onSelectStudent(s);
                        onClose();
                      }}
                      onEditStudent={startEdit}
                      onDeleteRequest={(s) => setStudentToDelete(s)}
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
      )}
      
      <footer className="p-3.5 bg-slate-50 border-t border-black/5 shrink-0">
        <div className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">
          Professional Report Management System
        </div>
      </footer>

      {/* Student Delete Confirmation Overlays */}
      <AnimatePresence>
        {studentToDelete && (
          <DeleteConfirmationDialog 
            student={studentToDelete}
            onConfirm={() => {
              onDeleteStudent(studentToDelete.id);
              setStudentToDelete(null);
            }}
            onCancel={() => setStudentToDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
