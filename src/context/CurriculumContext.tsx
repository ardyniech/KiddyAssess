import React, { createContext, useContext, useEffect, useState } from 'react';
import { Aspect } from '../types';
import { getCurriculum, saveCurriculum } from '../services/curriculumService';

interface CurriculumContextType {
  aspects: Aspect[];
  loading: boolean;
  refreshCurriculum: () => void;
  updateAspects: (newAspects: Aspect[]) => Promise<void>;
}

const CurriculumContext = createContext<CurriculumContextType>({
  aspects: [],
  loading: true,
  refreshCurriculum: () => {},
  updateAspects: async () => {},
});

export const CurriculumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [aspects, setAspects] = useState<Aspect[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getCurriculum();
    setAspects(data);
    setLoading(false);
  };

  const updateAspects = async (newAspects: Aspect[]) => {
    await saveCurriculum(newAspects);
    setAspects(newAspects);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <CurriculumContext.Provider value={{ aspects, loading, refreshCurriculum: load, updateAspects }}>
      {children}
    </CurriculumContext.Provider>
  );
};

export const useCurriculum = () => useContext(CurriculumContext);
