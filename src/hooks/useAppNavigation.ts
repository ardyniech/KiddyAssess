import { useState } from 'react';

export function useAppNavigation() {
  const [view, setView] = useState<string>("dashboard");
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [activeAspectIndex, setActiveAspectIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navigateToStudent = (studentOrId: string | any) => {
    const id = typeof studentOrId === 'object' && studentOrId !== null ? studentOrId.id : studentOrId;
    setActiveStudentId(id);
    setView("assessment");
    setIsSidebarOpen(false);
  };

  const navigateToModule = (mid: string, requiresStudent?: boolean) => {
    if (!requiresStudent) {
      setActiveStudentId(null);
    }
    setView(mid);
    setIsSidebarOpen(false);
  };

  const backToDashboard = () => {
    setActiveStudentId(null);
    setView("dashboard");
  };

  const backToStudents = () => {
    setActiveStudentId(null);
    setView("students");
  };

  return { 
    view, setView, 
    activeStudentId, setActiveStudentId, 
    activeAspectIndex, setActiveAspectIndex,
    isSidebarOpen, setIsSidebarOpen,
    isSettingsOpen, setIsSettingsOpen,
    navigateToStudent, navigateToModule, backToDashboard, backToStudents
  };
}
