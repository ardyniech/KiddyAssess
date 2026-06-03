import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, Sparkles, School, Cloud, Settings as SettingsIcon, FileText, 
  Activity, Clock, Book, Save, X, PenTool
} from 'lucide-react';
import { useAppTheme } from '../../context/ThemeContext';
import { AtomText } from '../atoms/CommonAtoms';
import { getSchoolProfile, saveSchoolProfile } from '../../services/settingsService';
import { getReportSettings, saveReportSettings } from '../../services/reportSettingsService';
import { SchoolProfile, Aspect, ReportSettings } from '../../types';
import { db } from '../../lib/db';
import { cn } from '../../lib/utils';
import { CustomConfirmModal } from '../molecules/CustomDialog';

// Import New Tab Components
import { SettingsVisualTab } from './settings/SettingsVisualTab';
import { SettingsPedagogyTab } from './settings/SettingsPedagogyTab';
import { SettingsIdentityTab } from './settings/SettingsIdentityTab';
import { SettingsSignatureTab } from './settings/SettingsSignatureTab';
import { SettingsSyncTab } from './settings/SettingsSyncTab';
import { SettingsAdvanceTab } from './settings/SettingsAdvanceTab';

// Import Shared Molecules
import { MoleculeTabButton } from '../molecules/SettingsMolecules';

export const OrganismAppSettings: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { theme, updateTheme, resetTheme } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'visual' | 'pedagogy' | 'identity' | 'signature' | 'sync' | 'advance'>('visual');
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [reportSettings, setReportSettings] = useState<ReportSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dbStats, setDbStats] = useState({ students: 0, assessments: 0, photos: 0 });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    getSchoolProfile().then(setSchoolProfile);
    getReportSettings().then(setReportSettings);
    loadStats();
  }, []);

  const loadStats = async () => {
    const s = await db.students.count();
    const a = await db.assessments.get('current');
    const p = await db.photos.count();
    setDbStats({ 
        students: s, 
        assessments: a ? Object.keys(a.data).length : 0, 
        photos: p 
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    if (schoolProfile) {
      const updated = { ...schoolProfile, updatedAt: Date.now() };
      await saveSchoolProfile(updated);
      if (updated.enableCloudSync) {
        try {
            const { syncService } = await import('../../lib/firebaseService');
            await syncService.saveSettings(updated);
        } catch (err) { console.error("Cloud settings sync failed:", err); }
      }
    }
    if (reportSettings) await saveReportSettings(reportSettings);
    window.dispatchEvent(new CustomEvent('app-settings-updated'));
    setTimeout(() => setIsSaving(false), 800);
  };

  const exportData = async () => {
    const students = await db.students.toArray();
    const assessments = await db.assessments.get('current');
    const settings = await db.settings.toArray();
    const downloadData = { app: 'KiddyAssess Pro', version: '3.0', exportDate: new Date().toISOString(), payload: { students, assessments: assessments?.data || {}, settings } };
    const blob = new Blob([JSON.stringify(downloadData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KA_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const clearData = async () => {
    setShowClearConfirm(true);
  };

  const executeClearData = async () => {
    await db.students.clear();
    await db.assessments.clear();
    await db.photos.clear();
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-50 relative font-mono transition-colors duration-500 w-full h-full">
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-4 md:p-6 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-900 rounded-xl shadow-lg text-white"><SettingsIcon size={16} /></div>
                    <AtomText variant="h2" className="text-sm font-black tracking-widest leading-none uppercase text-slate-900">Pengaturan Platform</AtomText>
                </div>
            </div>
            <div className="flex-1 p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible custom-scrollbar">
                <MoleculeTabButton active={activeTab === 'visual'} onClick={() => setActiveTab('visual')} icon={<Palette size={18} />} label="Gaya Visual" desc="Warna & Tampilan" />
                <MoleculeTabButton active={activeTab === 'pedagogy'} onClick={() => setActiveTab('pedagogy')} icon={<Sparkles size={18} />} label="Fitur & AI" desc="Utilitas Guru" />
                <MoleculeTabButton active={activeTab === 'identity'} onClick={() => setActiveTab('identity')} icon={<School size={18} />} label="Profil Sekolah" desc="Identitas Resmi" />
                <MoleculeTabButton active={activeTab === 'signature'} onClick={() => setActiveTab('signature')} icon={<PenTool size={18} />} label="Ttd & Stempel" desc="Atur Stempel Resmi" />
                <MoleculeTabButton active={activeTab === 'sync'} onClick={() => setActiveTab('sync')} icon={<Cloud size={18} />} label="Cadangan Cloud" desc="Penyimpanan Data" />
                <MoleculeTabButton active={activeTab === 'advance'} onClick={() => setActiveTab('advance')} icon={<Activity size={18} />} label="Admin Sistem" desc="Alat Database" />
            </div>
            <div className="p-6 border-t border-slate-200 hidden md:block mt-auto">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-2"><Clock size={16} className="text-slate-400" /><span className="text-[10px] font-black uppercase text-slate-400">Pembaruan</span></div>
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tighter">Perubahan disimpan secara manual.</p>
                </div>
            </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
            <header className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-200 bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] z-10">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
                    {activeTab === 'visual' && "Tampilan & Visual"} {activeTab === 'pedagogy' && "AI & Pelaporan"} {activeTab === 'identity' && "Profil Sekolah"} {activeTab === 'signature' && "Ttd & Stempel Resmi"} {activeTab === 'sync' && "Cloud Sync"} {activeTab === 'advance' && "System Admin"}
                </h2>
                {onClose && (
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
                        <X size={16} />
                    </button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                <div className="max-w-4xl mx-auto h-full">
                    {activeTab === 'visual' && <SettingsVisualTab theme={theme} updateTheme={updateTheme} schoolProfile={schoolProfile} setSchoolProfile={setSchoolProfile} />}
                    {activeTab === 'pedagogy' && <SettingsPedagogyTab schoolProfile={schoolProfile} setSchoolProfile={setSchoolProfile} />}
                    {activeTab === 'identity' && schoolProfile && <SettingsIdentityTab schoolProfile={schoolProfile} setSchoolProfile={setSchoolProfile} />}
                    {activeTab === 'signature' && schoolProfile && <SettingsSignatureTab schoolProfile={schoolProfile} setSchoolProfile={setSchoolProfile} />}
                    {activeTab === 'sync' && <SettingsSyncTab schoolProfile={schoolProfile} setSchoolProfile={setSchoolProfile} dbStats={dbStats} />}
                    {activeTab === 'advance' && <SettingsAdvanceTab dbStats={dbStats} exportData={exportData} importData={() => alert('Feature coming soon')} clearDb={clearData} resetVisuals={resetTheme} />}
                </div>
            </div>

             <footer className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pengaturan Terkonfigurasi</span></div>
                <div className="flex gap-3">
                    {onClose && <button onClick={onClose} className="px-6 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-slate-900 transition-all">Batal</button>}
                    <button onClick={handleSaveProfile} disabled={isSaving} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10 disabled:opacity-50">
                        {isSaving ? <Activity size={14} className="animate-spin" /> : <Save size={14} />}
                        {isSaving ? "Menyimpan..." : "Simpan Konfigurasi"}
                    </button>
                </div>
            </footer>
        </main>

        <CustomConfirmModal 
          isOpen={showClearConfirm}
          title="PURGE DATA KRITIKAL"
          message="Apakah Anda yakin ingin menghapus seluruh data siswa, nilai rapor, penugasan, dan foto portofolio perkembangan dari perangkat ini? Tindakan pembersihan ini berskala permanen dan tidak dapat dibatalkan!"
          confirmText="Hapus Seluruh Data"
          cancelText="Batal"
          variant="danger"
          onConfirm={executeClearData}
          onCancel={() => setShowClearConfirm(false)}
        />
    </div>
  );
};
