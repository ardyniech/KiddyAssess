import React, { createContext, useContext, useState, useEffect } from 'react';
import { SchoolProfile } from '../types';
import { getSchoolProfile, saveSchoolProfile } from '../services/settingsService';

interface SchoolProfileContextType {
  schoolProfile: SchoolProfile | null;
  updateSchoolProfile: (updates: Partial<SchoolProfile>) => Promise<void>;
  loading: boolean;
}

const SchoolProfileContext = createContext<SchoolProfileContextType | undefined>(undefined);

export const SchoolProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshProfile();
    
    // Listen for settings update events from the settings modal
    const handleUpdate = () => refreshProfile();
    window.addEventListener('app-settings-updated', handleUpdate);
    return () => window.removeEventListener('app-settings-updated', handleUpdate);
  }, []);

  const refreshProfile = async () => {
    setLoading(true);
    const profile = await getSchoolProfile();
    setSchoolProfile(profile);
    setLoading(false);
  };

  const updateSchoolProfile = async (updates: Partial<SchoolProfile>) => {
    if (!schoolProfile) return;
    const updated = { ...schoolProfile, ...updates, updatedAt: Date.now() };
    await saveSchoolProfile(updated);
    setSchoolProfile(updated);
    window.dispatchEvent(new CustomEvent('app-settings-updated'));
  };

  return (
    <SchoolProfileContext.Provider value={{ schoolProfile, updateSchoolProfile, loading }}>
      {children}
    </SchoolProfileContext.Provider>
  );
};

export const useSchoolProfile = () => {
  const context = useContext(SchoolProfileContext);
  if (!context) throw new Error('useSchoolProfile must be used within SchoolProfileProvider');
  return context;
};
