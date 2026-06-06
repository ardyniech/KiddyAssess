import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Student } from '../../../types';

export interface ColumnMap {
  name: string;
  kelompok: string;
  semester: string;
  semesterType: string;
  nisn: string;
  height: string;
  weight: string;
}

export function useCsvImporter(onAddStudentsBatch: (batch: Omit<Student, 'id'>[]) => void, onClose: () => void) {
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mapping, setMapping] = useState<ColumnMap>({
    name: '', kelompok: '', semester: '', semesterType: '', nisn: '', height: '', weight: ''
  });

  const reset = () => {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setStep(1);
    setMapping({ name: '', kelompok: '', semester: '', semesterType: '', nisn: '', height: '', weight: '' });
  };

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const keys = Object.keys(results.data[0]);
          setHeaders(keys);
          setRows(results.data);
          
          // Smart matchmaking
          const newMap = { ...mapping };
          keys.forEach((k) => {
            const kl = k.toLowerCase();
            if (kl.includes('nama') || kl.includes('name') || kl.includes('siswa')) newMap.name = k;
            else if (kl.includes('kelompok') || kl.includes('kelas') || kl.includes('rombel') || kl.includes('class')) newMap.kelompok = k;
            else if (kl.includes('nisn') || kl.includes('induk')) newMap.nisn = k;
            else if (kl.includes('semester')) newMap.semester = k;
            else if (kl.includes('tipe') || kl.includes('type')) newMap.semesterType = k;
            else if (kl.includes('tinggi') || kl.includes('height') || kl.includes('tb')) newMap.height = k;
            else if (kl.includes('berat') || kl.includes('weight') || kl.includes('bb')) newMap.weight = k;
          });
          setMapping(newMap);
          setStep(2);
        }
      }
    });
  };

  const handleUpdateMapping = (field: keyof ColumnMap, value: string) => {
    setMapping(prev => ({ ...prev, [field]: value }));
  };

  const generatePreviewData = (): Omit<Student, 'id'>[] => {
    return rows.map((row) => {
      const hStr = mapping.height ? row[mapping.height] : '';
      const wStr = mapping.weight ? row[mapping.weight] : '';
      const semTypeRaw = mapping.semesterType ? row[mapping.semesterType] : 'Ganjil';
      const semType: 'Ganjil' | 'Genap' = 
        (semTypeRaw && semTypeRaw.toLowerCase().includes('genap')) ? 'Genap' : 'Ganjil';

      return {
        name: mapping.name ? (row[mapping.name] || 'Siswa Baru') : 'Siswa Baru',
        kelompok: mapping.kelompok ? (row[mapping.kelompok] || 'A1') : 'A1',
        semester: mapping.semester ? String(row[mapping.semester] || '1') : '1',
        semesterType: semType,
        nisn: mapping.nisn ? String(row[mapping.nisn] || '') : '',
        height: parseInt(hStr, 10) || 0,
        weight: parseInt(wStr, 10) || 0,
        photoUrl: '',
        updatedAt: Date.now()
      };
    });
  };

  const downloadSampleTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nama,Kelompok,Semester,TipeSemester,NISN,Tinggi,Berat\n" +
      "Budi Santoso,A1,1,Ganjil,1234567890,110,18\n" +
      "Siti Aminah,B2,2,Genap,0987654321,114,20\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_impor_siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const executeImport = () => {
    const records = generatePreviewData();
    onAddStudentsBatch(records);
    onClose();
  };

  return {
    file, step, setStep, headers, mapping, handleFileChange, handleUpdateMapping,
    generatePreviewData, downloadSampleTemplate, executeImport, reset
  };
}
