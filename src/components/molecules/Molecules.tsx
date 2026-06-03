import React from "react";
import { AtomScaleButton } from "../atoms/AtomScaleButton";
import { AtomInput, AtomText } from "../atoms/CommonAtoms";
import { AssessmentScale } from "../../types";
import { User, GraduationCap, Calendar } from "lucide-react";
import { cn } from "../../lib/utils";
import { useSchoolProfile } from "../../context/SchoolProfileContext";

interface MoleculeScaleSelectorProps {
  currentValue?: AssessmentScale;
  onSelect: (value: AssessmentScale) => void;
}

export function MoleculeScaleSelector({ currentValue, onSelect }: MoleculeScaleSelectorProps) {
  const options: AssessmentScale[] = ["BB", "MB", "BSH", "BSB"];
  const { schoolProfile } = useSchoolProfile();
  
  return (
    <div className="flex justify-between gap-1 w-full">
      {options.map((opt) => (
        <div key={opt} className="flex-1">
          <AtomScaleButton
            label={opt}
            title={schoolProfile?.scaleLabels?.[opt] || opt}
            variant={opt}
            active={currentValue === opt}
            onClick={() => onSelect(opt)}
            customColor={schoolProfile?.scaleColors?.[opt]}
          />
        </div>
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
  
  // Choose a pastel accent based on name/index logic similar to TeacherDashboard
  const CHILD_STICKERS = ["🦁", "🐼", "🐨", "🦊", "🐰", "🐯", "🐱", "🐶", "🐵", "🐸", "🐤", "🦄", "🐙", "🐢", "🐧", "🦉"];
  const sticker = CHILD_STICKERS[name.length % CHILD_STICKERS.length];

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-3 shadow-sm",
        active 
          ? "bg-[#AEE6FF]/10 border-[#7EC8E3] ring-1 ring-[#7EC8E3] shadow-md" 
          : "bg-white border-black/5 hover:bg-slate-50 hover:border-slate-200"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-inner overflow-hidden relative",
        active ? "bg-[#7EC8E3]" : "bg-slate-50 border border-slate-100 text-slate-300"
      )}>
        {photoUrl ? (
          <img 
            src={photoUrl} 
            alt={name} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="flex flex-col items-center">
             <span className="text-xl select-none">{sticker}</span>
          </div>
        )}
      </div>
      
      <div className="grow overflow-hidden text-left">
        <div className={cn(
          "text-[11px] font-black truncate leading-tight mb-1",
          active ? "text-indigo-950" : "text-black"
        )}>{name}</div>
        
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  progress === 100 ? "bg-[#9EE493]" : progress > 0 ? "bg-[#FFE699]" : "bg-[#FFB3B3]"
                )} />
                <span className={cn(
                  "text-[8px] uppercase tracking-tight font-extrabold",
                  active ? "text-indigo-800" : "text-slate-400"
                )}>
                  {studentClass} • Smt {semester}
                </span>
            </div>
            <span className="text-[10px] font-black ml-auto opacity-40 tabular-nums">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
            <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                    width: `${progress}%`,
                    backgroundColor: progress === 100 ? '#9EE493' : progress > 0 ? '#FFE699' : '#FFB3B3'
                }}
            />
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
        onChange={onChange as any}
        placeholder={placeholder}
        className={cn(icon ? "pl-9" : "")}
      />
      {icon && (
        <div className="absolute left-3 top-7 text-slate-300">
          {React.cloneElement(icon as React.ReactElement, { size: 14 })}
        </div>
      )}
    </div>
  );
}
