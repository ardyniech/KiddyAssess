import React from "react";
import { AtomScaleButton } from "../atoms/AtomScaleButton";
import { AtomInput, AtomText } from "../atoms/CommonAtoms";
import { AssessmentScale } from "../../types";
import { User, GraduationCap, Calendar } from "lucide-react";
import { cn } from "../../lib/utils";

interface MoleculeScaleSelectorProps {
  currentValue?: AssessmentScale;
  onSelect: (value: AssessmentScale) => void;
}

export function MoleculeScaleSelector({ currentValue, onSelect }: MoleculeScaleSelectorProps) {
  const options: AssessmentScale[] = ["BB", "MB", "BSH", "BSB"];
  
  return (
    <div className="flex gap-2 w-full mt-2">
      {options.map((opt) => (
        <AtomScaleButton
          key={opt}
          label={opt}
          variant={opt}
          active={currentValue === opt}
          onClick={() => onSelect(opt)}
        />
      ))}
    </div>
  );
}

interface MoleculeStudentCardProps {
  name: string;
  studentClass: string;
  semester: string;
  photoUrl?: string;
  progress: number;
  active?: boolean;
  onClick: () => void;
}

export function MoleculeStudentCard({ name, studentClass, semester, photoUrl, progress, active, onClick }: MoleculeStudentCardProps) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2.5 rounded-xl border transition-all duration-500 cursor-pointer flex items-center gap-3",
        active 
          ? "bg-sky-500 border-sky-400 shadow-lg shadow-sky-500/20" 
          : "glass-card opacity-80 hover:opacity-100 hover:bg-black/5"
      )}
    >
      <div className={cn(
        "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white font-black text-xs md:text-sm shrink-0 shadow-inner overflow-hidden relative",
        active ? "bg-white/20" : "bg-sky-500 shadow-lg shadow-sky-500/20"
      )}>
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center">
             <User size={14} className="md:w-4 md:h-4 opacity-40 mb-[-2px]" />
             <span>{initials || "??"}</span>
          </div>
        )}
      </div>
      
      <div className="grow overflow-hidden">
        <div className={cn(
          "text-sm md:text-lg font-black truncate",
          active ? "text-white" : "text-slate-800 dark:text-white"
        )}>{name}</div>
        <div className={cn(
          "text-[10px] md:text-xs uppercase tracking-wider font-bold",
          active ? "text-white/70" : "text-slate-500"
        )}>
          {active && "Aktif • "} Kelas {studentClass}
        </div>
      </div>
    </div>
  );
}

interface MoleculeFormInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function MoleculeFormInput({ label, value, onChange, placeholder, icon }: MoleculeFormInputProps) {
  return (
    <div className="relative">
      <AtomInput
        label={label}
        value={value}
        onChange={onChange as any} // Cast to avoid strict input event mismatch if any
        placeholder={placeholder}
        className={cn(icon ? "pl-11" : "")}
      />
      {icon && (
        <div className="absolute left-4 top-9 text-slate-400 dark:text-white/40">
          {icon}
        </div>
      )}
    </div>
  );
}
