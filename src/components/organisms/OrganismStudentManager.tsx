import React, { useState } from "react";
import { AtomText, AtomBadge } from "../atoms/CommonAtoms";
import { MoleculeStudentCard, MoleculeFormInput } from "../molecules/Molecules";
import { Student } from "../../types";
import { Plus, X, Search, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OrganismStudentManagerProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, "id">) => void;
  onSelectStudent: (student: Student) => void;
  activeStudentId?: string;
  onClose: () => void;
}

export function OrganismStudentManager({ students, onAddStudent, onSelectStudent, activeStudentId, onClose }: OrganismStudentManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", class: "", semester: "1" });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.class) {
      onAddStudent(formData);
      setFormData({ name: "", class: "", semester: "1" });
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-card border-r w-full overflow-hidden">
      <div className="p-4 md:p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/5 dark:bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-400 w-2 h-2 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          <AtomText variant="h3" className="font-display tracking-tight text-sm md:text-base text-slate-900 dark:text-white uppercase font-black">Student List</AtomText>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all group lg:hidden">
          <X className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {!isAdding ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex-1 flex flex-col overflow-hidden p-2 md:p-3"
            >
              <div className="text-[10px] md:text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-2 px-1">Murid Aktif</div>
              <div className="relative mb-3 shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari Murid..."
                  className="w-full bg-black/5 dark:bg-slate-950/40 border border-black/10 dark:border-cyan-500/20 rounded-lg pl-10 pr-3 py-2.5 text-xs md:text-sm font-bold text-main focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-muted/60"
                />
              </div>

              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {filteredStudents.map((student) => (
                    <motion.div
                      key={student.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <MoleculeStudentCard
                        name={student.name}
                        studentClass={student.class}
                        semester={student.semester}
                        progress={0} 
                        active={activeStudentId === student.id}
                        onClick={() => onSelectStudent(student)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 opacity-20">
                    <Users className="mx-auto w-6 h-6 mb-2" />
                    <AtomText variant="caption" className="text-[8px]">Belum ada murid</AtomText>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 p-4 md:p-6 flex flex-col justify-center"
            >
              <div className="text-[9px] font-bold text-cyan-500 uppercase tracking-[0.2em] mb-4 text-center font-black">Tambah Murid Baru</div>
              <form onSubmit={handleSubmit} className="space-y-3 glass-panel p-4 md:p-5 rounded-2xl dark:neon-cyan bg-white/50 dark:bg-slate-900/60">
                <MoleculeFormInput 
                  label="Nama Murid" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Rayyan Al-Fatih"
                />
                <div className="grid grid-cols-2 gap-3">
                  <MoleculeFormInput 
                    label="Kelas" 
                    value={formData.class} 
                    onChange={e => setFormData({ ...formData, class: e.target.value })}
                    placeholder="B1"
                  />
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[9px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest ml-1">Semester</label>
                    <select 
                      value={formData.semester} 
                      onChange={e => setFormData({ ...formData, semester: e.target.value })}
                      className="bg-black/5 dark:bg-slate-950/40 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-[11px] text-main focus:outline-none appearance-none"
                    >
                      <option value="1" className="bg-slate-100 dark:bg-slate-800">1</option>
                      <option value="2" className="bg-slate-100 dark:bg-slate-800">2</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-3">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-2 text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors uppercase"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-[10px] font-black text-white shadow-lg shadow-cyan-500/20 transition-all uppercase tracking-widest"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 md:p-6 bg-black/5 dark:bg-white/5 border-t border-black/5 dark:border-white/5 shrink-0">
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-dashed border-black/20 dark:border-white/20 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group transition-all"
          >
            <Plus className="inline w-3 h-3 mr-2 group-hover:rotate-90 transition-transform" />
            Add New Student
          </button>
        )}
      </div>
    </div>
  );
}
