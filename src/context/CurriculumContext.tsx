import React, { createContext, useContext, useEffect, useState } from 'react';
import { Aspect } from '../types';
import { getCurriculum } from '../services/curriculumService';

interface CurriculumContextType {
  aspects: Aspect[];
  loading: boolean;
  refreshCurriculum: () => void;
}

const CurriculumContext = createContext<CurriculumContextType>({
  aspects: [],
  loading: true,
  refreshCurriculum: () => {},
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

  useEffect(() => {
    load();
  }, []);

  return (
    <CurriculumContext.Provider value={{ aspects, loading, refreshCurriculum: load }}>
      {children}
    </CurriculumContext.Provider>
  );
};

export const useCurriculum = () => useContext(CurriculumContext);
