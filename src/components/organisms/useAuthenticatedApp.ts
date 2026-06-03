import React from 'react';
import { AssessmentScale } from '../../types';
import { useCurriculum } from '../../context/CurriculumContext';
import { ASPECTS } from '../../constants';
import { APP_MODULES, getModuleById } from '../../registry/appModules';
import { usePermissions } from '../../context/PermissionContext';

export function useAuthenticatedApp(appData: any, navigation: any, showSplash: any) {
    const { aspects: curr } = useCurriculum();
    const aspects = curr.length > 0 ? curr : ASPECTS;
    const { students, setStudents, assessments, setAssessments, narratives, setNarratives, events, setEvents, tasks, setTasks, isLoaded, isSyncing, syncStatus, syncErrors, lastSaved, syncProgress, currentSyncItem, triggerSync } = appData;
    const { userRole } = usePermissions();
    const { view, setView, activeStudentId, setActiveStudentId, activeAspectIndex, setActiveAspectIndex, isSidebarOpen, setIsSidebarOpen, isSettingsOpen, setIsSettingsOpen, navigateToStudent, navigateToModule, backToDashboard, backToStudents, onNarrativesChange } = navigation;
    
    const [sidebarAddMode, setSidebarAddMode] = React.useState(false);
    const [roleSplash, setRoleSplash] = React.useState(false);
    const lastRoleRef = React.useRef(userRole);

    React.useEffect(() => {
        if (userRole && lastRoleRef.current !== userRole) {
            lastRoleRef.current = userRole;
            setRoleSplash(true);
            setView("dashboard");
            setActiveStudentId(null);
            const timer = setTimeout(() => {
                setRoleSplash(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [userRole, setActiveStudentId, setView]);

    const activeStudent = React.useMemo(() => 
        students.find((s: any) => s.id === activeStudentId),
    [students, activeStudentId]);
    
    const studentModules = APP_MODULES.filter(m => m.requiresStudent).sort((a, b) => (a.order || 0) - (b.order || 0));
    const processFlow: string[] = studentModules.map(m => m.id);
    
    const handleNext = () => {
        const currentIndex = processFlow.indexOf(view);
        if (currentIndex < processFlow.length - 1) {
            setView(processFlow[currentIndex + 1]);
        }
    };

    const handlePrev = () => {
        const currentIndex = processFlow.indexOf(view);
        if (currentIndex > 0) {
            setView(processFlow[currentIndex - 1]);
        } else if (currentIndex === 0) {
            backToStudents();
        }
    };

    const getProgress = (sid: string) => {
        const studentAssess = assessments[sid]; if (!studentAssess) return 0;
        let filled = 0, total = 0;
        aspects.forEach(a => {
            total += a.indicators.length;
            const indicatorsInAspect = a.indicators.map(i => i.id);
            const scoredInAspect = Object.keys(studentAssess[a.id] || {}).filter(key => indicatorsInAspect.includes(key));
            filled += scoredInAspect.length;
        });
        const progress = total > 0 ? (filled / total) * 100 : 0;
        return Math.min(100, progress);
    };

    const activeModule = getModuleById(view);

    const handleScoreChange = (indicatorId: string, score: AssessmentScale, aspectId?: string) => {
        if (!activeStudentId || !aspectId) return;
        setAssessments((prev: any) => ({
            ...prev,
            [activeStudentId]: {
                ...(prev[activeStudentId] || {}),
                [aspectId]: {
                    ...(prev[activeStudentId]?.[aspectId] || {}),
                    [indicatorId]: score
                }
            }
        }));
    };

    const moduleProps: any = {
        students,
        setStudents,
        assessments,
        setAssessments,
        narratives,
        setNarratives,
        aspects,
        activeStudentId,
        activeStudent,
        student: activeStudent,
        onSelectStudent: navigateToStudent,
        onViewStudents: () => navigateToModule("students", false),
        getStudentProgress: getProgress,
        onAddStudent: () => {
            setSidebarAddMode(true);
            setIsSidebarOpen(true);
        },
        onEditStudent: (s: any) => {
            setStudents((prev: any) => prev.map((old: any) => old.id === s.id ? s : old));
        },
        onDeleteStudent: (id: any) => setStudents((prev: any) => prev.filter((s: any) => s.id !== id)),
        setView: (v: string) => {
            const mod = getModuleById(v);
            navigateToModule(v, mod?.requiresStudent);
        },
        onOpenSettings: () => navigateToModule('settings', false),
        activeAspectIndex,
        onAspectChange: setActiveAspectIndex,
        scores: assessments[activeStudentId] || {},
        allScores: assessments[activeStudentId] || {},
        onScoreChange: handleScoreChange,
        savedNarratives: narratives[activeStudentId] || {},
        onNarrativesChange: (n: any) => setNarratives({...narratives, [activeStudentId]: n}),
        globalProgress: activeStudentId ? getProgress(activeStudentId) : 0,
        events,
        setEvents,
        tasks,
        setTasks,
    };

    return {
        moduleProps,
        isLoaded,
        roleSplash,
        userRole,
        isSidebarOpen,
        setIsSidebarOpen,
        sidebarAddMode,
        setSidebarAddMode,
        students,
        setStudents,
        getProgress,
        navigateToStudent,
        activeStudentId,
        view,
        setView,
        navigateToModule,
        activeStudent,
        handleNext,
        handlePrev,
        activeModule,
        isSyncing,
        syncProgress,
        currentSyncItem,
        triggerSync,
        lastSaved,
        backToStudents,
        backToDashboard,
    };
}
