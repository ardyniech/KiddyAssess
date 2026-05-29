import React from 'react';
import { Monitor, Sun, Moon, Zap, Palette, Layout } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../lib/utils';
import { AppTheme } from '../../../context/ThemeContext';
import { SchoolProfile } from '../../../types';
import { MoleculeSettingsSection, MoleculeSettingItem, MoleculeToggleButton } from '../../molecules/SettingsMolecules';

interface SettingsVisualTabProps {
    theme: AppTheme;
    updateTheme: (updates: Partial<AppTheme>) => void;
    schoolProfile: SchoolProfile | null;
    setSchoolProfile: React.Dispatch<React.SetStateAction<SchoolProfile | null>>;
}

export const SettingsVisualTab: React.FC<SettingsVisualTabProps> = ({ 
    theme, 
    updateTheme, 
    schoolProfile, 
    setSchoolProfile 
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl space-y-8"
        >
            <MoleculeSettingsSection title="Global Branding" subtitle="Warna utama untuk tombol & aksen aplikasi">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <MoleculeSettingItem label="Glassmorphism FX" description="Efek kaca transparan pada card" icon={<Zap size={14}/>}>
                        <MoleculeToggleButton 
                            active={schoolProfile?.cardGlassmorphism !== false} 
                            onClick={() => setSchoolProfile(p => p ? ({ ...p, cardGlassmorphism: !p.cardGlassmorphism }) : null)} 
                        />
                    </MoleculeSettingItem>

                    <MoleculeSettingItem label="Card Surface Color" description="Warna dasar kontainer card" icon={<Palette size={14}/>}>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl border border-black/5">
                                {['#ffffff', '#f8fafc', '#f1f5f9', '#fff7ed', '#f0fdf4'].map(c => (
                                    <motion.button 
                                        key={c}
                                        layout
                                        onClick={() => setSchoolProfile(p => p ? ({ ...p, cardBackgroundColor: c }) : null)}
                                        className={cn(
                                            "w-6 h-6 rounded-lg transition-all border",
                                            (schoolProfile?.cardBackgroundColor || '#ffffff') === c ? "ring-2 ring-sky-500 scale-110" : "opacity-40 hover:opacity-100"
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                            <input 
                                type="color" 
                                value={schoolProfile?.cardBackgroundColor || '#ffffff'} 
                                onChange={e => setSchoolProfile(p => p ? ({ ...p, cardBackgroundColor: e.target.value }) : null)}
                                className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer border border-slate-200 p-0"
                            />
                        </div>
                    </MoleculeSettingItem>

                    <MoleculeSettingItem label="Accent Primary" description="Warna tema utama" icon={<Palette size={16}/>}>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl border border-black/5">
                                {['#000000', '#38bdf8', '#6366f1', '#f43f5e', '#10b981'].map(c => (
                                    <motion.button 
                                        key={c}
                                        layout
                                        onClick={() => {
                                            updateTheme({ primaryColor: c });
                                            setSchoolProfile(p => p ? ({ ...p, accentColor: c }) : null);
                                        }}
                                        className={cn(
                                            "w-6 h-6 rounded-lg transition-all",
                                            (schoolProfile?.accentColor || theme.primaryColor) === c ? "ring-2 ring-slate-400 scale-110 shadow-lg shadow-black/20" : "opacity-40 hover:opacity-100"
                                        )}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </MoleculeSettingItem>

                    <MoleculeSettingItem label="Atomic Border Radius" description="Kelengkungan sudut elemen" icon={<Layout size={14}/>}>
                        <select 
                            value={schoolProfile?.borderRadius || 'large'}
                            onChange={e => setSchoolProfile(p => p ? ({ ...p, borderRadius: e.target.value as any }) : null)}
                            className="bg-slate-100 border-none rounded-lg px-3 py-1.5 text-[9px] font-black uppercase text-slate-800 outline-none cursor-pointer"
                        >
                            <option value="none">None (Sharp)</option>
                            <option value="small">Small (8px)</option>
                            <option value="medium">Medium (16px)</option>
                            <option value="large">Large (24px)</option>
                            <option value="full">Hyper (Full)</option>
                        </select>
                    </MoleculeSettingItem>
                </div>
            </MoleculeSettingsSection>

            <MoleculeSettingsSection title="Background & FX" subtitle="Kontrol kedalaman interface">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <MoleculeSettingItem label="Dynamic Gradient" description="Warna latar belakang">
                        <div className="flex gap-2">
                            <input type="color" value={theme.gradients.from} onChange={e => updateTheme({ gradients: { ...theme.gradients, from: e.target.value } })} className="w-6 h-6 rounded-md cursor-pointer" title="Start" />
                            <input type="color" value={theme.gradients.via} onChange={e => updateTheme({ gradients: { ...theme.gradients, via: e.target.value } })} className="w-6 h-6 rounded-md cursor-pointer" title="Mid" />
                            <input type="color" value={theme.gradients.to} onChange={e => updateTheme({ gradients: { ...theme.gradients, to: e.target.value } })} className="w-6 h-6 rounded-md cursor-pointer" title="End" />
                        </div>
                    </MoleculeSettingItem>

                    <MoleculeSettingItem label="Glass Transparency" description="Intensitas kaca blur">
                        <div className="flex items-center gap-3 w-32">
                            <input 
                                type="range" min="0" max="64" step="4" 
                                value={theme.layout.cardBlur} 
                                onChange={e => updateTheme({ layout: { ...theme.layout, cardBlur: parseInt(e.target.value) } })}
                                className="flex-1 accent-sky-500"
                            />
                            <span className="text-[9px] font-black w-6">{theme.layout.cardBlur}</span>
                        </div>
                    </MoleculeSettingItem>

                    <MoleculeSettingItem label="Opacity" description="Kepadatan warna card">
                        <div className="flex items-center gap-3 w-32">
                            <input 
                                type="range" min="0.1" max="1" step="0.05" 
                                value={theme.layout.cardOpacity} 
                                onChange={e => updateTheme({ layout: { ...theme.layout, cardOpacity: parseFloat(e.target.value) } })}
                                className="flex-1 accent-sky-500"
                            />
                            <span className="text-[9px] font-black w-6">{Math.round(theme.layout.cardOpacity * 100)}%</span>
                        </div>
                    </MoleculeSettingItem>

                    <div className="md:col-span-2">
                        <MoleculeSettingItem label="UI Border Radius" description="Kelengkungan sudut elemen">
                            <div className="flex gap-1.5 p-1 bg-slate-50 rounded-xl border border-black/5">
                                {['0.75rem', '1.5rem', '2.5rem', '3.5rem'].map((r, idx) => (
                                    <motion.button 
                                        key={r}
                                        layout
                                        onClick={() => updateTheme({ borderRadius: r })}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all",
                                            theme.borderRadius === r ? "bg-white shadow-sm text-sky-500" : "text-slate-400"
                                        )}
                                    >
                                        {idx === 0 ? "S" : idx === 1 ? "M" : idx === 2 ? "L" : "XL"}
                                    </motion.button>
                                ))}
                            </div>
                        </MoleculeSettingItem>
                    </div>
                </div>
            </MoleculeSettingsSection>

            <MoleculeSettingsSection title="Typography Control" subtitle="Kenyamanan membaca">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <MoleculeSettingItem label="Font Family" description="Karakter tipografi">
                            <select 
                                value={theme.fontFamily}
                                onChange={e => updateTheme({ fontFamily: e.target.value })}
                                className="bg-slate-100 dark:bg-white/5 border-none rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-widest"
                            >
                            <option value='"Plus Jakarta Sans", sans-serif'>Jakarta</option>
                            <option value='"Inter", sans-serif'>Inter</option>
                            <option value='"Outfit", sans-serif'>Outfit</option>
                        </select>
                    </MoleculeSettingItem>

                    <MoleculeSettingItem label="System Font Scale" description="Ukuran dasar teks">
                        <div className="flex items-center gap-3 w-32">
                            <input 
                                type="range" min="12" max="22" step="1" 
                                value={theme.systemFontSize} 
                                onChange={e => updateTheme({ systemFontSize: parseInt(e.target.value) })}
                                className="flex-1 accent-sky-500"
                            />
                            <span className="text-[11px] font-black w-6">{theme.systemFontSize}</span>
                        </div>
                    </MoleculeSettingItem>
                </div>
            </MoleculeSettingsSection>
        </motion.div>
    );
};
