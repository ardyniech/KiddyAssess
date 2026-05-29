import React from 'react';
import { motion } from 'motion/react';
import { Student, StudentAssessment, Aspect } from "../../types";
import { ArrowRight, Users, BookOpen, Wallet, Package, Lock } from "lucide-react";
import { useSchoolProfile } from '../../context/SchoolProfileContext';
import { usePermissions } from '../../context/PermissionContext';
import { cn } from '../../lib/utils';

// Multi-Layer Dashboards
import { YayasanDashboard } from './dashboard/YayasanDashboard';
import { PrincipalDashboard } from './dashboard/PrincipalDashboard';
import { TeacherDashboard } from './dashboard/TeacherDashboard';
import { MasterDashboard } from './dashboard/MasterDashboard';
import { OperatorDashboard } from './dashboard/OperatorDashboard';

interface OrganismDashboardProps {
  students: Student[];
  assessments: Record<string, any>;
  aspects: Aspect[];
  onSelectStudent: (student: Student) => void;
  onViewStudents: () => void;
  setView?: (view: string) => void;
  events?: any[];
  tasks?: any[];
}

export function OrganismDashboard({ students, assessments, aspects, onSelectStudent, onViewStudents, setView, events = [], tasks = [] }: OrganismDashboardProps) {
  const { schoolProfile } = useSchoolProfile();
  const { userRole, discoveredUsers } = usePermissions();
  
  // Routing Dashboards based on Role
  if (userRole === 'MASTER') {
    return <MasterDashboard setView={setView} students={students} aspects={aspects} assessments={assessments} events={events} tasks={tasks} users={discoveredUsers} />;
  }

  if (userRole === 'SUPER_USER') {
    return <YayasanDashboard setView={setView} students={students} aspects={aspects} assessments={assessments} events={events} tasks={tasks} />;
  }

  if (userRole === 'ADMIN') {
    return <PrincipalDashboard students={students} onViewStudents={onViewStudents} setView={setView} aspects={aspects} assessments={assessments} events={events} tasks={tasks} />;
  }

  if (userRole === 'OPERATOR') {
    return <OperatorDashboard students={students} onViewStudents={onViewStudents} setView={setView} aspects={aspects} assessments={assessments} events={events} tasks={tasks} />;
  }

  if (userRole === 'TEACHER') {
    return (
      <TeacherDashboard 
        students={students} 
        assessments={assessments} 
        aspects={aspects} 
        onSelectStudent={(s) => onSelectStudent(s)} 
        setView={setView} 
        events={events}
        tasks={tasks}
      />
    );
  }

  // Fallback (should not be reached if all roles are handled above)
  return <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest bg-slate-50 flex-1">Memuat Antarmuka...</div>;
}
