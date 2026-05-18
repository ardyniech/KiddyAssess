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
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-3xl border-r border-white/5 w-full">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-sky-400 w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
          <AtomText variant="h3" className="font-display tracking-tight">Student Management</AtomText>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all group lg:hidden">
          <X className="w-5 h-5 text-slate-500 group-hover:text-white" />
        </button>
      </div>

      <div className="p-6">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Daftar Murid Aktif</div>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Murid..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
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
            <div className="text-center py-12 opacity-30">
              <Users className="mx-auto w-8 h-8 mb-2" />
              <AtomText variant="caption">Belum ada murid</AtomText>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto p-6 bg-white/5 border-t border-white/5">
        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-[10px] font-black uppercase tracking-widest text-slate-400 group transition-all"
          >
            <Plus className="inline w-3 h-3 mr-2 group-hover:rotate-90 transition-transform" />
            Tambah Murid Baru
          </button>
        ) : (
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit} 
            className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/10"
          >
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
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Semester</label>
                <select 
                  value={formData.semester} 
                  onChange={e => setFormData({ ...formData, semester: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none appearance-none"
                >
                  <option value="1" className="bg-slate-900">1</option>
                  <option value="2" className="bg-slate-900">2</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit"
                className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 rounded-xl text-xs font-black text-white shadow-lg shadow-sky-500/20 transition-all uppercase tracking-widest"
              >
                Simpan
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
}
