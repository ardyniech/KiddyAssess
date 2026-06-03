import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Aspect } from '../../../types';
import { DashboardKPIMatrix } from './DashboardKPIMatrix';
import { DashboardAnalytics } from './DashboardAnalytics';
import { TeacherTopWelcomePanel } from './teacher-dashboard/TeacherTopWelcomePanel';
import { TeacherActionGrid } from './teacher-dashboard/TeacherActionGrid';
import { TeacherKPIStatusBoard } from './teacher-dashboard/TeacherKPIStatusBoard';
import { TeacherClassroomMetrics } from './teacher-dashboard/TeacherClassroomMetrics';
import { TeacherDirectory } from './teacher-dashboard/TeacherDirectory';
import { TeacherPermissionGuide } from './teacher-dashboard/TeacherPermissionGuide';

interface TeacherDashboardProps {
    students: Student[];
    assessments?: Record<string, any>;
    aspects?: Aspect[];
    onSelectStudent: (student: Student) => void;
    setView?: (view: string) => void;
    events?: any[];
    tasks?: any[];
}

export const TeacherDashboard = ({ 
    students = [], 
    assessments = {}, 
    aspects = [], 
    onSelectStudent, 
    setView,
    events = [],
    tasks = []
}: TeacherDashboardProps) => {
    const upcomingEventsCount = events.filter(e => new Date(e.date) >= new Date()).length;
    const pendingTasksCount = tasks.filter(t => t.status !== 'DONE').length;
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showKPIMatrix, setShowKPIMatrix] = useState(false);
    const itemsPerPage = 6;

    const aspectsList = aspects.length > 0 ? aspects : [
        { id: 'nilai_agama_moral', name: 'Nilai Agama dan Moral', indicators: Array(15).fill({}) },
        { id: 'fisik_motorik', name: 'Fisik Motorik', indicators: Array(15).fill({}) },
        { id: 'kognitif', name: 'Kognitif', indicators: Array(15).fill({}) }
    ];

    const totalIndicators = useMemo(() => aspectsList.reduce((acc, aspect) => acc + (aspect.indicators?.length || 0), 0), [aspectsList]);

    const getStudentStats = (studentId: string) => {
        const studentAssess = assessments[studentId] || {};
        let filledCount = 0;
        aspectsList.forEach(aspect => {
            const aspectScores = studentAssess[aspect.id] || {};
            const activeIds = aspect.indicators?.map(i => i.id) || [];
            filledCount += activeIds.length > 0 ? Object.keys(aspectScores).filter(k => activeIds.includes(k)).length : Object.keys(aspectScores).length;
        });
        return { percent: totalIndicators > 0 ? Math.min(100, Math.round((filledCount / totalIndicators) * 100)) : 0 };
    };

    const filteredStudents = useMemo(() => {
        if (!searchQuery) return students;
        return students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.kelompok && s.kelompok.toLowerCase().includes(searchQuery.toLowerCase())));
    }, [students, searchQuery]);

    React.useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    const metrics = useMemo(() => {
        let fully = 0, prog = 0, not = 0;
        students.forEach(s => {
            const { percent } = getStudentStats(s.id);
            if (percent === 100) fully++; else if (percent > 0) prog++; else not++;
        });
        return { fullyAssessed: fully, inProgress: prog, notAssessed: not };
    }, [students, assessments, aspectsList, totalIndicators]);

    const analyticsData = useMemo(() => {
        const aspectMetricsLocal = aspectsList.map(a => {
            let completed = 0;
            let possible = students.length * (a.indicators?.length || 0);
            students.forEach(s => {
                if (assessments[s.id] && assessments[s.id][a.id]) {
                   completed += Object.keys(assessments[s.id][a.id]).length;
                }
            });
            return {
                id: a.id,
                fullName: a.name,
                completionRate: possible > 0 ? Math.min(100, Math.round((completed / possible) * 100)) : 0
            };
        });

        const scoreCountsResult = { BB: 0, MB: 0, BSH: 0, BSB: 0 };
        let total = 0;
        const distData = aspectsList.map(a => {
            const data = { name: a.name.length > 8 ? a.name.substring(0, 8) + '...' : a.name, BB: 0, MB: 0, BSH: 0, BSB: 0 };
            students.forEach(s => {
               if (assessments[s.id] && assessments[s.id][a.id]) {
                   const scores = assessments[s.id][a.id];
                   Object.values(scores).forEach((val: any) => {
                       let scaleVal = typeof val === 'string' ? val : val?.scale;
                       if (scaleVal && ['BB', 'MB', 'BSH', 'BSB'].includes(scaleVal)) {
                           scoreCountsResult[scaleVal as keyof typeof scoreCountsResult]++;
                           data[scaleVal as keyof typeof data]++;
                           total++;
                       }
                   });
               }
            });
            return data;
        });
        return { aspectMetricsLocal, scoreCountsResult, total, distData };
    }, [students, aspectsList, assessments]);

    const paginatedStudents = useMemo(() => filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredStudents, currentPage]);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const handleSelectAction = (student: Student, targetView: string) => {
        onSelectStudent(student);
        if (setView) setView(targetView);
    };

    return (
        <div className="flex-1 flex flex-col bg-[#FDFDFD] font-sans">
            <TeacherTopWelcomePanel searchQuery={searchQuery} setSearchQuery={setSearchQuery} setView={setView} />
            
            <main className="flex-1 p-5 max-w-7xl w-full mx-auto space-y-4">
                <TeacherActionGrid pendingTasksCount={pendingTasksCount} upcomingEventsCount={upcomingEventsCount} setView={setView} />
                <TeacherKPIStatusBoard studentCount={students.length} fullyAssessed={metrics.fullyAssessed} />
                <TeacherClassroomMetrics studentCount={students.length} fullyAssessed={metrics.fullyAssessed} inProgress={metrics.inProgress} notAssessed={metrics.notAssessed} />
                
                <div className="flex justify-end mb-2">
                    <button 
                        onClick={() => setShowKPIMatrix(!showKPIMatrix)}
                        className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    >
                        {showKPIMatrix ? "Sembunyikan KPI Matrix & Analitik" : "Tampilkan KPI Matrix & Analitik"}
                    </button>
                </div>

                <AnimatePresence>
                    {showKPIMatrix && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mb-6"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                                <div className="lg:col-span-2">
                                    <DashboardKPIMatrix students={students} aspects={aspectsList} assessments={assessments} />
                                </div>
                                <div className="lg:col-span-1 border border-slate-100 rounded-3xl bg-white flex flex-col p-4 shadow-sm h-full">
                                    <DashboardAnalytics 
                                        aspectMetrics={analyticsData.aspectMetricsLocal}
                                        scoreCounts={analyticsData.scoreCountsResult}
                                        totalScoresSubmitted={analyticsData.total}
                                        schoolProfile={null}
                                        distributionChartData={analyticsData.distData}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <TeacherDirectory 
                    students={paginatedStudents} 
                    filteredStudentsLength={filteredStudents.length}
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    setCurrentPage={setCurrentPage} 
                    getStudentStats={getStudentStats} 
                    itemsPerPage={itemsPerPage} 
                    handleSelectAction={handleSelectAction} 
                />
                <TeacherPermissionGuide />
            </main>
        </div>
    );
};;
