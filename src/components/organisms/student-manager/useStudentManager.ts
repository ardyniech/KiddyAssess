import React, { useState, useMemo } from 'react';
import { Student } from '../../../types';

export function useStudentManager(
    initialIsAdding: boolean, 
    students: Student[], 
    onUpdateStudent: (s: Student) => void, 
    onAddStudent: (s: any) => void
) {
    const [isAdding, setIsAdding] = useState(initialIsAdding);
    const [activeTab, setActiveTab] = useState<'navigation' | 'students'>('navigation');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [search, setSearch] = useState("");
    const [rombelFilter, setRombelFilter] = useState("ALL");
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [formData, setFormData] = useState<Omit<Student, "id" | "updatedAt">>({ 
        name: "", kelompok: "A1", semester: "1", semesterType: "Ganjil", photoUrl: "", nisn: "", height: 0, weight: 0 
    });

    const filteredStudents = useMemo(() => students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
        const matchesRombel = rombelFilter === "ALL" || s.kelompok === rombelFilter;
        return matchesSearch && matchesRombel;
    }), [students, search, rombelFilter]);

    const availableRombels = useMemo(() => Array.from(new Set(students.map(s => s.kelompok))).filter(Boolean), [students]);

    const startEdit = (student: Student, e: React.MouseEvent) => {
        e.stopPropagation(); 
        setEditingStudent(student);
        setFormData({ 
            name: student.name, 
            kelompok: student.kelompok, 
            semester: student.semester, 
            semesterType: student.semesterType, 
            photoUrl: student.photoUrl || "", 
            nisn: student.nisn || "", 
            height: student.height || 0, 
            weight: student.weight || 0 
        });
        setIsAdding(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name) {
            if (editingStudent) {
                onUpdateStudent({ ...editingStudent, ...formData });
            } else {
                onAddStudent(formData);
            }
            setIsAdding(false); 
            setEditingStudent(null); 
            setFormData({ name: "", kelompok: "A1", semester: "1", semesterType: "Ganjil", photoUrl: "", nisn: "", height: 0, weight: 0 });
        }
    };

    return {
        isAdding, setIsAdding,
        activeTab, setActiveTab,
        editingStudent, setEditingStudent,
        search, setSearch,
        rombelFilter, setRombelFilter,
        studentToDelete, setStudentToDelete,
        formData, setFormData,
        filteredStudents, availableRombels,
        startEdit, handleSubmit
    };
}
