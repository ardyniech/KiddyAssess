import React from 'react';
import { Sparkles, Zap, Check, Activity } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { SchoolProfile } from '../../../types';
import { MoleculeSettingsSection, MoleculeSettingItem, MoleculeToggleButton } from '../../molecules/SettingsMolecules';

interface SettingsPedagogyTabProps {
    schoolProfile: SchoolProfile | null;
    setSchoolProfile: React.Dispatch<React.SetStateAction<SchoolProfile | null>>;
}

export const SettingsPedagogyTab: React.FC<SettingsPedagogyTabProps> = ({ 
    schoolProfile, 
    setSchoolProfile 
}) => {
    return (
        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <MoleculeSettingsSection title="Pedagogy & AI Engine" subtitle="Konfigurasi asisten naratif pintar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <MoleculeSettingItem label="Engine Narasi" description="Aktifkan bantuan AI Smart Narrative" icon={<Sparkles size={14}/>}>
                         <MoleculeToggleButton 
                            active={schoolProfile?.useAINarrative !== false} 
                            onClick={() => setSchoolProfile(p => p ? ({ ...p, useAINarrative: !p.useAINarrative }) : null)} 
                         />
                     </MoleculeSettingItem>

                     <MoleculeSettingItem label="Narrative Style" description="Karakter output AI" icon={<Zap size={14}/>}>
                         <select 
                            value={schoolProfile?.aiTone || 'Formal & Profesional'}
                            onChange={e => setSchoolProfile(p => p ? ({ ...p, aiTone: e.target.value }) : null)}
                            className="bg-slate-100 dark:bg-white/5 border-none rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-tight"
                         >
                             <option>Edukatif & Motivasi</option>
                             <option>Formal & Profesional</option>
                             <option>Ramah & Interaktif</option>
                             <option>To the Point (Singkat)</option>
                         </select>
                     </MoleculeSettingItem>

                     <MoleculeSettingItem label="Auto-Correction" description="Koreksi otomatis tanda baca" icon={<Check size={14}/>}>
                         <MoleculeToggleButton 
                            active={schoolProfile?.autoCorrect !== false} 
                            onClick={() => setSchoolProfile(p => p ? ({ ...p, autoCorrect: !p.autoCorrect }) : null)} 
                         />
                     </MoleculeSettingItem>

                     <MoleculeSettingItem label="AI Sensitivity" description="Kedalaman narasi" icon={<Activity size={14}/>}>
                         <select 
                             value={schoolProfile?.aiSensitivity || 'Standard Balanced'}
                             onChange={e => setSchoolProfile(p => p ? ({ ...p, aiSensitivity: e.target.value }) : null)}
                             className="bg-slate-100 dark:bg-white/5 border-none rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-tight outline-none cursor-pointer"
                         >
                             <option>Standard Balanced</option>
                             <option>High Detail Flow</option>
                             <option>Minimalist Summary</option>
                         </select>
                     </MoleculeSettingItem>
                </div>
             </MoleculeSettingsSection>

            <MoleculeSettingsSection title="Assessment Scale Tuning" subtitle="Konfigurasi label & warna nilai">
                <div className="space-y-3">
                    {(['BB', 'MB', 'BSH', 'BSB'] as const).map(key => (
                        <div key={key} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800/20 rounded-xl border border-slate-200 dark:border-white/5">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm", schoolProfile?.scaleColors?.[key] || "bg-slate-400")}>
                                {key}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex gap-2">
                                    <input 
                                        type="text"
                                        value={schoolProfile?.scaleLabels?.[key] || ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setSchoolProfile(p => p ? ({
                                                ...p,
                                                scaleLabels: { ...p.scaleLabels, [key]: val } as any
                                            }) : null);
                                        }}
                                        placeholder={`Label for ${key}`}
                                        className="flex-1 bg-slate-100 dark:bg-white/5 border-none rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white"
                                    />
                                    <input 
                                        type="color"
                                        value={schoolProfile?.scaleColors?.[key] || '#94a3b8'}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setSchoolProfile(p => p ? ({
                                                ...p,
                                                scaleColors: { ...p.scaleColors, [key]: val } as any
                                            }) : null);
                                        }}
                                        className="w-10 h-8 rounded-lg overflow-hidden cursor-pointer border-none p-0"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </MoleculeSettingsSection>
        </div>
    );
};
