import React, { useState } from 'react';
import { Student } from '../../../types';
import { PrincipalTopPanel } from './principal-dashboard/PrincipalTopPanel';
import { PrincipalKPIBoard } from './principal-dashboard/PrincipalKPIBoard';
import { PrincipalAnalysisBoard } from './principal-dashboard/PrincipalAnalysisBoard';
import { PrincipalNavigationGrid } from './principal-dashboard/PrincipalNavigationGrid';
import { PrincipalPermissionGuide } from './principal-dashboard/PrincipalPermissionGuide';

interface PrincipalDashboardProps {
    students: Student[];
    onViewStudents: () => void;
    setView?: (view: string) => void;
    events?: any[];
    tasks?: any[];
    aspects?: any[];
    assessments?: Record<string, any>;
}

export const PrincipalDashboard = ({ students = [], onViewStudents, setView, events = [], tasks = [], aspects = [], assessments = {} }: PrincipalDashboardProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('ALL');

    const totalStudents = students.length;
    const kelompokA = students.filter(s => s.kelompok && s.kelompok.toUpperCase().startsWith('A')).length;
    const kelompokB = students.filter(s => s.kelompok && s.kelompok.toUpperCase().startsWith('B')).length;
    
    const getAbsenteeRate = (student: Student) => {
        if (!student.attendanceLogs) return 0;
        const logs = Object.values(student.attendanceLogs);
        if (logs.length === 0) return 0;
        const absences = logs.filter(l => l === 'absent').length;
        return Math.round((absences / logs.length) * 100);
    };

    const chronicAbsentSiswa = students.filter(s => getAbsenteeRate(s) >= 15);
    const averageProgress = students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.height ? 60 : 25), 0) / students.length) : 0;
    const availableClasses = Array.from(new Set(students.map(s => s.kelompok))).filter(Boolean);

    const filteredList = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClass = classFilter === 'ALL' || s.kelompok === classFilter;
        return matchesSearch && matchesClass;
    });

    return (
        <div className="flex-1 flex flex-col bg-[#FDFDFD] font-sans">
            <PrincipalTopPanel />
            <main className="flex-1 p-5 max-w-7xl w-full mx-auto space-y-4">
                <PrincipalPermissionGuide />
                <PrincipalKPIBoard 
                    averageProgress={averageProgress}
                    kelompokA={kelompokA}
                    kelompokB={kelompokB}
                    chronicAbsentCount={chronicAbsentSiswa.length}
                    totalStudents={totalStudents}
                />
                <PrincipalAnalysisBoard 
                    classFilter={classFilter}
                    setClassFilter={setClassFilter}
                    availableClasses={availableClasses as string[]}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredList={filteredList}
                    chronicAbsentSiswa={chronicAbsentSiswa}
                    getAbsenteeRate={getAbsenteeRate}
                    setView={setView}
                    onViewStudents={onViewStudents}
                />
                <PrincipalNavigationGrid 
                    events={events}
                    tasks={tasks}
                    setView={setView}
                    onViewStudents={onViewStudents}
                />
            </main>
        </div>
    );
};
