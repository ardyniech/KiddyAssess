import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Lock, 
  Unlock, 
  ChevronRight, 
  ChevronLeft, 
  Tag, 
  Calendar,
  AlertTriangle,
  Users,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Award
} from 'lucide-react';
import { KanbanTask } from '../../types';
import { syncService } from '../../lib/firebaseService';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionContext';

export function KanbanModule({ tasks, setTasks }: { tasks: KanbanTask[], setTasks: React.Dispatch<React.SetStateAction<KanbanTask[]>> }) {
  const { user } = useAuth();
  const { userRole } = usePermissions();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Form Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newCategory, setNewCategory] = useState('Kurikulum');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Active column for mobile viewport view (tab control)
  // 'TODO' | 'IN_PROGRESS' | 'DONE'
  const [activeMobileColumn, setActiveMobileColumn] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');

  // Evaluate drag and move permissions
  // Authorized: ardy.syafii@gmail.com or MASTER or SUPER_USER
  const canMoveTask = React.useMemo(() => {
    return userRole === 'MASTER' || userRole === 'SUPER_USER' || user?.email === 'ardy.syafii@gmail.com';
  }, [userRole, user?.email]);

  // Create Task Action
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setFormSubmitting(true);
    try {
      const createdByDisplay = user?.displayName || user?.email?.split('@')[0] || 'Guru';
      
      const payload: KanbanTask = {
        id: crypto.randomUUID(),
        title: newTitle.trim(),
        description: newDescription.trim(),
        priority: newPriority,
        category: newCategory,
        status: 'TODO',
        createdBy: createdByDisplay,
        creatorRole: userRole,
        creatorEmail: user?.email || '',
        assignedTo: newAssignedTo.trim() || undefined,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await syncService.saveKanbanTask(payload);
      setTasks(prev => [payload, ...prev]);
      
      // Reset form variables
      setNewTitle('');
      setNewDescription('');
      setNewPriority('MEDIUM');
      setNewCategory('Kurikulum');
      setNewAssignedTo('');
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan tugas ke Firebase.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Move Task Action (Supports click interface for clean mobile UX)
  const handleMoveTaskStatus = async (task: KanbanTask, nextStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (!canMoveTask) {
      alert('Akses Ditolak: Hanya akun utama ardy.syafii@gmail.com atau peran MASTER/SUPER_USER yang dapat memindahkan status tugas.');
      return;
    }

    const updatedTask: KanbanTask = {
      ...task,
      status: nextStatus,
      updatedAt: Date.now()
    };

    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));

    try {
      await syncService.saveKanbanTask(updatedTask);
    } catch (err) {
      console.error(err);
      // Rollback on failure (simplified for this turn as we have global state)
      alert('Gagal memperbarui status tugas di server.');
    }
  };

  // Delete Task Action (Any role can delete their own, or Admin/Master can delete any)
  const handleDeleteTask = async (task: KanbanTask) => {
    const isCreator = task.creatorEmail === user?.email;
    const isAuthorizedRemover = canMoveTask || isCreator;

    if (!isAuthorizedRemover) {
      alert('Akses Ditolak: Anda hanya boleh menghapus tugas yang Anda buat sendiri.');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;

    // Optimistic Delete
    setTasks(prev => prev.filter(t => t.id !== task.id));

    try {
      await syncService.deleteKanbanTask(task.id);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus tugas dari server.');
    }
  };

  // Filter computation
  const filteredTasks = React.useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;

      return matchesSearch && matchesPriority && matchesCategory;
    });
  }, [tasks, searchQuery, priorityFilter, categoryFilter]);

  const todoTasks = filteredTasks.filter(t => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter(t => t.status === 'DONE');

  const categories = ['Kurikulum', 'Acara', 'Sarpras', 'Administrasi', 'Lainnya'];

  return (
    <div className="w-full h-full flex flex-col p-5 bg-slate-50 space-y-4">
      
      {/* HIGH CONTRAST PERMISSION GUIDE NOTE (standard mandate) */}
      <div id="guide-kanban-access" className="bg-amber-100 border-2 border-amber-400 p-3 rounded-xl flex items-start gap-2.5 shadow-sm">
        <AlertTriangle className="text-amber-800 shrink-0 mt-0.5" size={18} />
        <div className="text-[11px] leading-relaxed text-amber-900 font-bold">
          <span className="uppercase block font-black text-amber-950 tracking-wider mb-0.5">💡 INFO AKSES KOLABORATIF KANBAN</span>
          Semua Peran (<span className="underline">GURU, OPERATOR, KEPSEK</span> dll) bebas menambah kartu catatan tugas. 
          Namun, perpindahan kolom (Update Status) dibatasi khusus untuk Akun Pengawas Utas (<span className="underline font-black text-rose-900">MASTER / SUPER_USER</span> atau email <span className="underline">ardy.syafii@gmail.com</span>) untuk penjaminan mutu tata usaha sekolah.
        </div>
      </div>

      {/* Header Widget */}
      <div id="kanban-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">E-Kanban Sekolah</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Progres Aktivitas & Administrasi Ceria</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Permission Status Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 ${
            canMoveTask 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
          }`}>
            {canMoveTask ? (
              <>
                <Unlock size={12} className="text-emerald-700" />
                <span>PENGATUR STATUS: AKTIF</span>
              </>
            ) : (
              <>
                <Lock size={12} className="text-indigo-600" />
                <span>LIHAT & BUAT TUGAS SAJA</span>
              </>
            )}
          </div>

          <button
            id="btn-add-task-open"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wide shadow transition-all active:scale-95 touch-primary"
            style={{ minHeight: '44px' }}
          >
            <Plus size={16} />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Stats Quick Ribbon */}
      <div id="kanban-stats" className="grid grid-cols-3 gap-2">
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-2.5 flex items-center justify-between gap-1.5 shadow-xs">
          <div>
            <span className="text-[9px] font-bold text-indigo-700 uppercase block tracking-wider">Antrean</span>
            <span className="text-lg font-black text-slate-800 leading-none">{todoTasks.length}</span>
          </div>
          <ListTodo size={20} className="text-indigo-400 shrink-0" />
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between gap-1.5 shadow-xs">
          <div>
            <span className="text-[9px] font-bold text-amber-700 uppercase block tracking-wider">Diproses</span>
            <span className="text-lg font-black text-slate-800 leading-none">{inProgressTasks.length}</span>
          </div>
          <TrendingUp size={20} className="text-amber-400 shrink-0" />
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between gap-1.5 shadow-xs">
          <div>
            <span className="text-[9px] font-bold text-emerald-700 uppercase block tracking-wider">Selesai</span>
            <span className="text-lg font-black text-slate-800 leading-none">{doneTasks.length}</span>
          </div>
          <Award size={20} className="text-emerald-400 shrink-0" />
        </div>
      </div>

      {/* Search and Filters Ribbon */}
      <div id="kanban-filters" className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari tugas, deskripsi, atau pembuat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
            style={{ minHeight: '44px' }}
          />
          <Search size={14} className="absolute left-3 top-3.5 text-slate-400" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Priority filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider ml-1">Prioritas</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              style={{ minHeight: '40px' }}
            >
              <option value="ALL">SEMUA PRIORITAS</option>
              <option value="HIGH">❗ TINGGI (HIGH)</option>
              <option value="MEDIUM">🔸 SEDANG (MEDIUM)</option>
              <option value="LOW">🔹 RENDAH (LOW)</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider ml-1">Kategori</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              style={{ minHeight: '40px' }}
            >
              <option value="ALL">SEMUA KATEGORI</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider animate-pulse">Menghubungkan ke Firebase...</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3 text-rose-900 text-xs font-semibold leading-relaxed">
          {error}
        </div>
      )}

      {/* MOBILE ONLY COLUMN SWITCHER (Segment Control) */}
      <div id="mobile-column-tabs" className="flex sm:hidden p-1.5 bg-white border border-slate-200 rounded-2xl gap-1 shadow-sm">
        <button
          onClick={() => setActiveMobileColumn('TODO')}
          className={`flex-1 py-2 text-center rounded-xl text-xs font-black transition-all ${
            activeMobileColumn === 'TODO' 
              ? 'bg-indigo-600 text-white font-black' 
              : 'text-slate-600'
          }`}
          style={{ minHeight: '42px' }}
        >
          Antrean ({todoTasks.length})
        </button>
        <button
          onClick={() => setActiveMobileColumn('IN_PROGRESS')}
          className={`flex-1 py-2 text-center rounded-xl text-xs font-black transition-all ${
            activeMobileColumn === 'IN_PROGRESS' 
              ? 'bg-amber-500 text-white font-black' 
              : 'text-slate-600'
          }`}
          style={{ minHeight: '42px' }}
        >
          Proses ({inProgressTasks.length})
        </button>
        <button
          onClick={() => setActiveMobileColumn('DONE')}
          className={`flex-1 py-2 text-center rounded-xl text-xs font-black transition-all ${
            activeMobileColumn === 'DONE' 
              ? 'bg-emerald-600 text-white font-black' 
              : 'text-slate-600'
          }`}
          style={{ minHeight: '42px' }}
        >
          Selesai ({doneTasks.length})
        </button>
      </div>

      {/* BOARD WORKSPACE */}
      <div id="kanban-workspace" className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* COLUMN 1: TODO */}
        <div id="col-todo" className={`flex flex-col bg-slate-100 rounded-2xl border border-slate-200 p-2 space-y-2 ${
          activeMobileColumn === 'TODO' ? 'block' : 'hidden sm:flex'
        }`}>
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" />
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-tight">Antrean Tugas (TODO)</h2>
            </div>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-full">{todoTasks.length}</span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[480px]">
            {todoTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-[11px] font-semibold uppercase">Belum ada tugas</div>
            ) : (
              todoTasks.map(t => (
                <TaskCard key={t.id} task={t} canMove={canMoveTask} onMove={handleMoveTaskStatus} onDelete={handleDeleteTask} />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: IN_PROGRESS */}
        <div id="col-in-progress" className={`flex flex-col bg-slate-100 rounded-2xl border border-slate-200 p-2 space-y-2 ${
          activeMobileColumn === 'IN_PROGRESS' ? 'block' : 'hidden sm:flex'
        }`}>
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" />
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-tight">Sedang Proses (PROGRESS)</h2>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[480px]">
            {inProgressTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-[11px] font-semibold uppercase">Tidak ada proses aktif</div>
            ) : (
              inProgressTasks.map(t => (
                <TaskCard key={t.id} task={t} canMove={canMoveTask} onMove={handleMoveTaskStatus} onDelete={handleDeleteTask} />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: DONE */}
        <div id="col-done" className={`flex flex-col bg-slate-100 rounded-2xl border border-slate-200 p-2 space-y-2 ${
          activeMobileColumn === 'DONE' ? 'block' : 'hidden sm:flex'
        }`}>
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-tight">Selesai (DONE)</h2>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">{doneTasks.length}</span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[480px]">
            {doneTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-[11px] font-semibold uppercase">Belum ada tugas selesai</div>
            ) : (
              doneTasks.map(t => (
                <TaskCard key={t.id} task={t} canMove={canMoveTask} onMove={handleMoveTaskStatus} onDelete={handleDeleteTask} />
              ))
            )}
          </div>
        </div>

      </div>

      {/* ADD TASK MODAL POPOVER */}
      {isAddOpen && (
        <div id="modal-add-task-outer" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-indigo-200 rounded-3xl max-w-md w-full p-5 space-y-3 shadow-2xl relative">
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">📝 Tambah Tugas E-Kanban</h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Judul Aktivitas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Cetak Raport Semester Genap"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Deskripsi Lengkap *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Deskripsikan detail langkah pengerjaan..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Prioritas</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    style={{ minHeight: '44px' }}
                  >
                    <option value="LOW">🔹 RENDAH (LOW)</option>
                    <option value="MEDIUM">🔸 SEDANG (MEDIUM)</option>
                    <option value="HIGH">❗ TINGGI (HIGH)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    style={{ minHeight: '44px' }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Penanggung Jawab (Optional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Guru Kelas B1"
                  value={newAssignedTo}
                  onChange={(e) => setNewAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  style={{ minHeight: '44px' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                  style={{ minHeight: '44px' }}
                >
                  {formSubmitting ? 'Menyimpan...' : 'Simpan Tugas'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

// SINGLE CONCISE TASK CARD COMPONENT
interface TaskCardProps {
  key?: React.Key;
  task: KanbanTask;
  canMove: boolean;
  onMove: (task: KanbanTask, nextStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => Promise<void> | void;
  onDelete: (task: KanbanTask) => Promise<void> | void;
}

function TaskCard({ task, canMove, onMove, onDelete }: TaskCardProps) {
  // Priority tags design helper
  const priorityInfo = (() => {
    switch (task.priority) {
      case 'HIGH':
        return { bg: 'bg-rose-100 border-rose-300', text: 'text-rose-800', label: 'TINGGI' };
      case 'LOW':
        return { bg: 'bg-sky-100 border-sky-300', text: 'text-sky-800', label: 'RENDAH' };
      default:
        return { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', label: 'SEDANG' };
    }
  })();

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getDate()}/${d.getMonth()+1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border-2 border-slate-200 hover:border-indigo-400 p-3 rounded-2xl shadow-xs transition-all flex flex-col space-y-2">
      
      {/* Category Indicator & Delete */}
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-black tracking-widest uppercase px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md">
          🏷️ {task.category}
        </span>

        <button 
          onClick={() => onDelete(task)}
          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
          style={{ minHeight: '38px', minWidth: '38px' }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-black text-slate-900 leading-tight uppercase tracking-tight break-words">{task.title}</h4>
        <p className="text-[11px] text-slate-700 leading-normal line-clamp-3 break-words">{task.description}</p>
      </div>

      {/* Metadata & Priority row */}
      <div className="flex flex-wrap gap-1 items-center justify-between pt-1">
        
        {/* Priority Badge */}
        <span className={`text-[8px] font-black uppercase border px-1.5 py-0.5 rounded-md ${priorityInfo.bg} ${priorityInfo.text}`}>
          {priorityInfo.label}
        </span>

        {/* PIC details */}
        {task.assignedTo && (
          <span className="text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <Users size={10} className="text-slate-500" />
            PIC: {task.assignedTo}
          </span>
        )}

      </div>

      <div className="h-[1px] bg-slate-100" />

      {/* Footer log creators & movement */}
      <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold">
        <div className="flex flex-col">
          <span>Oleh: <span className="text-indigo-700 font-black">{task.createdBy}</span> ({task.creatorRole})</span>
          <span className="flex items-center gap-1 text-[8px] text-slate-400 mt-0.5">
            <Calendar size={8} /> {formatTime(task.createdAt)}
          </span>
        </div>

        {/* Status movement triggers */}
        <div className="flex items-center gap-1 justify-end">
          {canMove ? (
            <>
              {task.status !== 'TODO' && (
                <button
                  onClick={() => onMove(task, task.status === 'DONE' ? 'IN_PROGRESS' : 'TODO')}
                  title="Pindahkan Mundur"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 w-7 h-7 rounded-lg flex items-center justify-center border border-slate-300 cursor-pointer active:scale-90 transition-all touch-action"
                  style={{ minHeight: '36px', minWidth: '36px' }}
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              {task.status !== 'DONE' && (
                <button
                  onClick={() => onMove(task, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                  title="Pindahkan Maju"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer active:scale-90 transition-all touch-action"
                  style={{ minHeight: '36px', minWidth: '36px' }}
                >
                  <ChevronRight size={14} />
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-0.5 text-slate-400 font-black cursor-not-allowed text-[8px]" title="Akses terkunci">
              <Lock size={9} />
              <span>TERKUNCI</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
