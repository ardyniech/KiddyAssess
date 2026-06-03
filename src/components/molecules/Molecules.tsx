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
  
  // Choose a sticker for avatar placeholder
  const CHILD_STICKERS = ["🦁", "🐼", "🐨", "🦊", "🐰", "🐯", "🐱", "🐶", "🐵", "🐸", "🐤", "🦄", "🐙", "🐢", "🐧", "🦉"];
  const sticker = CHILD_STICKERS[name.length % CHILD_STICKERS.length];

  // Modern progress bar colors matching high-contrast targets
  const getProgressBg = (p: number) => {
    if (p === 100) return "bg-emerald-500";
    if (p > 50) return "bg-indigo-600";
    if (p > 0) return "bg-amber-500";
    return "bg-slate-200";
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-3 shadow-sm select-none",
        active 
          ? "bg-indigo-50/60 border-indigo-600 ring-2 ring-indigo-600 shadow-md font-bold scale-[1.01]" 
          : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-350 hover:shadow-md"
      )}
    >
      {/* Touch-safe min 40px avatar container */}
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-inner overflow-hidden relative transition-colors duration-300",
        active ? "bg-indigo-600 text-white" : "bg-slate-100 border border-slate-250 text-slate-500"
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
          "text-[11px] font-black truncate leading-tight mb-1 uppercase tracking-tight",
          active ? "text-indigo-950" : "text-slate-900"
        )}>{name}</div>
        
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  getProgressBg(progress)
                )} />
                <span className={cn(
                  "text-[8px] uppercase tracking-wider font-extrabold",
                  active ? "text-indigo-800" : "text-slate-650"
                )}>
                  {studentClass} • Smt {semester}
                </span>
            </div>
            <span className={cn(
              "text-[9px] font-bold ml-auto font-mono",
              active ? "text-indigo-900" : "text-slate-700"
            )}>{Math.round(progress)}%</span>
        </div>
        
        {/* Modern progress indicator track */}
        <div className="w-full h-1.5 bg-slate-100 border border-slate-200/40 rounded-full mt-2 overflow-hidden">
            <div 
                className={cn("h-full rounded-full transition-all duration-500", getProgressBg(progress))}
                style={{ width: `${progress}%` }}
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
