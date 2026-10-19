import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FolderKanban, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  Sparkles, 
  Layers, 
  Building2, 
  User, 
  TrendingUp, 
  ArrowUpRight, 
  X, 
  Check, 
  RotateCcw,
  ExternalLink,
  Milestone
} from 'lucide-react';
import { 
  YearlyTask, 
  YearlyTaskQuarter, 
  YearlyTaskStatus, 
  Docket, 
  Priority,
  YEARLY_TASK_QUARTERS, 
  YEARLY_TASK_STATUS_CONFIG, 
  PRIORITY_CONFIG,
  DEFAULT_CATEGORIES,
  DEFAULT_DEPARTMENTS
} from '../types';
import { exportYearlyTasksToCSV } from '../utils/storage';

interface YearlyTasksViewProps {
  yearlyTasks: YearlyTask[];
  dockets: Docket[];
  onSaveTask: (task: YearlyTask) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenDocketDetail: (docket: Docket) => void;
}

export const YearlyTasksView: React.FC<YearlyTasksViewProps> = ({
  yearlyTasks,
  dockets,
  onSaveTask,
  onDeleteTask,
  onOpenDocketDetail,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal create / edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<YearlyTask | null>(null);

  // Form states
  const [formYear, setFormYear] = useState<number>(2026);
  const [formCode, setFormCode] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>(DEFAULT_CATEGORIES[0]);
  const [formQuarter, setFormQuarter] = useState<YearlyTaskQuarter>('q1');
  const [formLeadDepartment, setFormLeadDepartment] = useState<string>(DEFAULT_DEPARTMENTS[0]);
  const [formLeadPerson, setFormLeadPerson] = useState<string>('Tôi (Cá nhân)');
  const [formPriority, setFormPriority] = useState<Priority>('high');
  const [formStatus, setFormStatus] = useState<YearlyTaskStatus>('in_progress');
  const [formProgress, setFormProgress] = useState<number>(0);
  const [formTargetMetric, setFormTargetMetric] = useState<string>('');
  const [formLinkedDocketIds, setFormLinkedDocketIds] = useState<string[]>([]);

  // Filter tasks for selected year
  const tasksForYear = useMemo(() => {
    return yearlyTasks.filter((t) => t.year === selectedYear);
  }, [yearlyTasks, selectedYear]);

  // Compute KPI metrics for current year
  const kpiStats = useMemo(() => {
    const total = tasksForYear.length;
    const completed = tasksForYear.filter((t) => t.status === 'completed').length;
    const inProgress = tasksForYear.filter((t) => t.status === 'in_progress').length;
    const delayed = tasksForYear.filter((t) => t.status === 'delayed').length;
    const planning = tasksForYear.filter((t) => t.status === 'planning').length;
    const avgProgress = total > 0 
      ? Math.round(tasksForYear.reduce((acc, curr) => acc + (curr.progress || 0), 0) / total) 
      : 0;

    // Total linked dockets
    const allLinkedIds = new Set(tasksForYear.flatMap((t) => t.linkedDocketIds || []));

    return {
      total,
      completed,
      inProgress,
      delayed,
      planning,
      avgProgress,
      totalLinkedDockets: allLinkedIds.size,
    };
  }, [tasksForYear]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasksForYear.filter((task) => {
      if (selectedQuarter !== 'all' && task.quarter !== selectedQuarter) return false;
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchCode = task.code.toLowerCase().includes(query);
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchLead = task.leadPerson.toLowerCase().includes(query);
        const matchMetric = (task.targetMetric || '').toLowerCase().includes(query);
        if (!matchCode && !matchTitle && !matchLead && !matchMetric) return false;
      }
      return true;
    });
  }, [tasksForYear, selectedQuarter, selectedCategory, selectedStatus, searchTerm]);

  // Open modal for new task
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormYear(selectedYear);
    // Auto generate code
    const existingNums = tasksForYear.map((t) => {
      const match = t.code.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    });
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    const nextCode = `NV-${selectedYear}-${String(maxNum + 1).padStart(2, '0')}`;

    setFormCode(nextCode);
    setFormTitle('');
    setFormDescription('');
    setFormCategory(DEFAULT_CATEGORIES[0]);
    setFormQuarter('q1');
    setFormLeadDepartment(DEFAULT_DEPARTMENTS[0]);
    setFormLeadPerson('Nguyễn Văn Thành');
    setFormPriority('high');
    setFormStatus('in_progress');
    setFormProgress(0);
    setFormTargetMetric('');
    setFormLinkedDocketIds([]);
    setIsModalOpen(true);
  };

  // Open modal for editing task
  const handleOpenEditModal = (task: YearlyTask) => {
    setEditingTask(task);
    setFormYear(task.year);
    setFormCode(task.code);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormCategory(task.category);
    setFormQuarter(task.quarter);
    setFormLeadDepartment(task.leadDepartment);
    setFormLeadPerson(task.leadPerson);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormProgress(task.progress);
    setFormTargetMetric(task.targetMetric || '');
    setFormLinkedDocketIds(task.linkedDocketIds || []);
    setIsModalOpen(true);
  };

  // Save task
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newTask: YearlyTask = {
      id: editingTask?.id || `yt-${Date.now()}`,
      year: formYear,
      code: formCode.trim() || `NV-${formYear}-01`,
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory,
      quarter: formQuarter,
      leadDepartment: formLeadDepartment,
      leadPerson: formLeadPerson.trim(),
      priority: formPriority,
      status: formStatus,
      progress: formProgress,
      targetMetric: formTargetMetric.trim(),
      linkedDocketIds: formLinkedDocketIds,
      createdAt: editingTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveTask(newTask);
    setIsModalOpen(false);
  };

  // Quick progress update
  const handleAdjustProgress = (task: YearlyTask, delta: number) => {
    const newProgress = Math.max(0, Math.min(100, task.progress + delta));
    const newStatus: YearlyTaskStatus = newProgress === 100 
      ? 'completed' 
      : task.status === 'completed' && newProgress < 100 
      ? 'in_progress' 
      : task.status;

    onSaveTask({
      ...task,
      progress: newProgress,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // Toggle docket linkage
  const handleToggleDocketLink = (task: YearlyTask, docketId: string) => {
    const isLinked = (task.linkedDocketIds || []).includes(docketId);
    const updatedIds = isLinked
      ? task.linkedDocketIds.filter((id) => id !== docketId)
      : [...(task.linkedDocketIds || []), docketId];

    onSaveTask({
      ...task,
      linkedDocketIds: updatedIds,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400/50">
              <Target className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Nhiệm vụ Trọng tâm Cả Năm</span>
              <span className="font-mono text-cyan-400 text-lg">({selectedYear})</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            Thiết lập và giám sát các chỉ tiêu chiến lược, mục tiêu nhiệm vụ tổng cả năm của cơ quan. Phân rã tiến độ theo từng Quý và liên kết trực tiếp với các hồ sơ công việc thực tế.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Year selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-2xs">
            {[2025, 2026, 2027].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedYear === yr
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Năm {yr}
              </button>
            ))}
          </div>

          <button
            onClick={() => exportYearlyTasksToCSV(tasksForYear, selectedYear)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Xuất bảng kế hoạch năm ra Excel (.csv)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all shadow-xs border border-blue-400/40 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm nhiệm vụ năm mới</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip (3D Elevated Slabs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Total */}
        <div className="card-3d p-3.5 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tổng mục tiêu</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white tabular-nums">
            {kpiStats.total}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Chỉ tiêu năm {selectedYear}
          </span>
        </div>

        {/* KPI 2: Avg Progress */}
        <div className="card-3d p-3.5 rounded-2xl space-y-1.5 border-cyan-500/30">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tiến độ chung</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300 tabular-nums">
            {kpiStats.avgProgress}%
          </div>
          <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" 
              style={{ width: `${kpiStats.avgProgress}%` }}
            />
          </div>
        </div>

        {/* KPI 3: In progress */}
        <div className="card-3d p-3.5 rounded-2xl space-y-1.5">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Đang triển khai</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-200 tabular-nums">
            {kpiStats.inProgress}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Nhiệm vụ đang chạy
          </span>
        </div>

        {/* KPI 4: Completed */}
        <div className="card-3d p-3.5 rounded-2xl space-y-1.5 border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Đạt chỉ tiêu</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300 tabular-nums">
            {kpiStats.completed}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Đã hoàn thành 100%
          </span>
        </div>

        {/* KPI 5: Delayed */}
        <div className="card-3d p-3.5 rounded-2xl space-y-1.5 border-rose-500/30">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Chậm tiến độ</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-300 tabular-nums">
            {kpiStats.delayed}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Cần đốc thúc khẩn
          </span>
        </div>

        {/* KPI 6: Linked Dockets */}
        <div className="card-3d p-3.5 rounded-2xl space-y-1.5 border-indigo-500/30">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Hồ sơ gắn liền</span>
            <FolderKanban className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black font-mono text-indigo-300 tabular-nums">
            {kpiStats.totalLinkedDockets}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Hồ sơ chi tiết đã gắn
          </span>
        </div>
      </div>

      {/* Quarter Navigation Filter Bar */}
      <div className="card-3d p-4 rounded-2xl space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Quarter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedQuarter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                selectedQuarter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Toàn bộ các Quý ({tasksForYear.length})
            </button>
            <button
              onClick={() => setSelectedQuarter('q1')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                selectedQuarter === 'q1'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Quý I ({tasksForYear.filter((t) => t.quarter === 'q1').length})
            </button>
            <button
              onClick={() => setSelectedQuarter('q2')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                selectedQuarter === 'q2'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Quý II ({tasksForYear.filter((t) => t.quarter === 'q2').length})
            </button>
            <button
              onClick={() => setSelectedQuarter('q3')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                selectedQuarter === 'q3'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Quý III ({tasksForYear.filter((t) => t.quarter === 'q3').length})
            </button>
            <button
              onClick={() => setSelectedQuarter('q4')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                selectedQuarter === 'q4'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Quý IV ({tasksForYear.filter((t) => t.quarter === 'q4').length})
            </button>
            <button
              onClick={() => setSelectedQuarter('all_year')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
                selectedQuarter === 'all_year'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Cả năm ({tasksForYear.filter((t) => t.quarter === 'all_year').length})
            </button>
          </div>

          {/* Quick search input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã, tên mục tiêu, cán bộ..."
              className="w-full pl-8 pr-3 py-1.5 text-xs inner-groove rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Secondary filters: Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Lĩnh vực công việc
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-xs inner-groove text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả lĩnh vực</option>
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Trạng thái thực hiện
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs inner-groove text-slate-200 rounded-xl focus:border-cyan-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="planning">Lập kế hoạch</option>
              <option value="in_progress">Đang triển khai</option>
              <option value="completed">Đạt chỉ tiêu</option>
              <option value="delayed">Chậm tiến độ</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedQuarter('all');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSearchTerm('');
              }}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Yearly Task List (3D Tactile Cards) */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center card-3d rounded-2xl space-y-3">
          <Milestone className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">
            Chưa có nhiệm vụ trọng tâm nào trong danh mục này
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Bạn có thể bấm &quot;Thêm nhiệm vụ năm mới&quot; để thiết lập mục tiêu chiến lược cho năm {selectedYear}.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-3 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm nhiệm vụ năm {selectedYear} ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredTasks.map((task) => {
            const quarterConf = YEARLY_TASK_QUARTERS[task.quarter] || YEARLY_TASK_QUARTERS.all_year;
            const statusConf = YEARLY_TASK_STATUS_CONFIG[task.status] || YEARLY_TASK_STATUS_CONFIG.in_progress;
            const prioConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.high;

            // Find matching dockets
            const linkedDocketsList = dockets.filter((d) => (task.linkedDocketIds || []).includes(d.id));

            return (
              <div
                key={task.id}
                className="card-3d-interactive p-5 rounded-2xl flex flex-col justify-between space-y-4 text-slate-200 relative overflow-hidden transition-all duration-300"
              >
                {/* Zone 1: Code + Quarter + Priority + Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-cyan-300 bg-cyan-950/90 border border-cyan-700/70 px-2.5 py-1 rounded-xl badge-3d tabular-nums">
                        {task.code}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border badge-3d ${quarterConf.bgClass} ${quarterConf.textClass} ${quarterConf.borderClass}`}>
                        {quarterConf.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border badge-3d ${
                        task.priority === 'urgent'
                          ? 'bg-rose-950 text-rose-300 border-rose-700/80'
                          : task.priority === 'high'
                          ? 'bg-amber-950 text-amber-300 border-amber-700/80'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {prioConf.label}
                      </span>

                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border badge-3d flex items-center gap-1.5 ${statusConf.bgClass} ${statusConf.textClass} ${statusConf.borderClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotClass}`} />
                        {statusConf.label}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-white leading-snug tracking-tight">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Target Metric / Deliverable highlight box */}
                  {task.targetMetric && (
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                      <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        <span>Chỉ tiêu định lượng & Sản phẩm đầu ra:</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200">
                        {task.targetMetric}
                      </div>
                    </div>
                  )}
                </div>

                {/* Zone 2: Lead Assignee & Department + Progress Meter */}
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="inner-groove p-2.5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Đơn vị chủ trì
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate block">
                        {task.leadDepartment}
                      </span>
                    </div>

                    <div className="inner-groove p-2.5 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Cán bộ phụ trách
                      </span>
                      <span className="text-xs font-bold text-white truncate block">
                        {task.leadPerson}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Progress Bar */}
                  <div className="inner-groove p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold">
                        Tiến độ mục tiêu năm:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-cyan-300 tabular-nums">
                          {task.progress}%
                        </span>
                        {/* Quick adjust buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjustProgress(task, -5)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center cursor-pointer"
                            title="Giảm 5%"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustProgress(task, 5)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center cursor-pointer"
                            title="Tăng 5%"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Zone 3: Linked Dockets (Hồ sơ thực tế gắn kết) */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
                        <span>Hồ sơ công việc trực thuộc ({linkedDocketsList.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(task)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        + Gắn thêm hồ sơ
                      </button>
                    </div>

                    {linkedDocketsList.length === 0 ? (
                      <div className="text-[11px] text-slate-500 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/70">
                        Chưa gắn hồ sơ nào. Bấm &quot;Gắn thêm hồ sơ&quot; để chọn các hồ sơ thuộc mục tiêu này.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto custom-mini-scrollbar pr-1">
                        {linkedDocketsList.map((docket) => (
                          <div
                            key={docket.id}
                            className="p-2 bg-slate-950/70 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between gap-2.5 transition-colors group"
                          >
                            <div 
                              onClick={() => onOpenDocketDetail(docket)}
                              className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                            >
                              <span className="font-mono text-[10px] font-bold text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
                                {docket.code}
                              </span>
                              <span className="text-xs font-semibold text-slate-300 group-hover:text-white truncate">
                                {docket.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                docket.status === 'completed'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                  : 'bg-blue-950 text-blue-300 border-blue-800'
                              }`}>
                                {docket.status === 'completed' ? 'Xong' : 'Đang xử lý'}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleToggleDocketLink(task, docket.id)}
                                title="Bỏ liên kết hồ sơ này khỏi nhiệm vụ năm"
                                className="text-slate-500 hover:text-rose-400 p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Zone 4: Card Bottom Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    Cập nhật: {new Date(task.updatedAt).toLocaleDateString('vi-VN')}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(task)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-cyan-400" />
                      <span>Sửa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Xóa nhiệm vụ trọng tâm ${task.code}?`)) {
                          onDeleteTask(task.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                      title="Xóa nhiệm vụ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create / Edit Yearly Task - 3D Blocks with Black Text */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div 
            id="yearly-task-modal"
            className="relative w-full max-w-2xl bg-[#e2e8f0] border-2 border-slate-400 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_3px_#94a3b8] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-black font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-400 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md border-2 border-blue-800">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-black">
                    {editingTask ? `Cập nhật Nhiệm vụ ${editingTask.code}` : `Thêm Nhiệm vụ Trọng tâm Năm ${formYear}`}
                  </h3>
                  <span className="text-xs text-slate-800 font-bold">
                    Kế hoạch chỉ tiêu & nhiệm vụ chiến lược toàn diện
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-700 hover:text-black rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body - 3D Blocks */}
            <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto bg-[#e2e8f0]">
              <div className="card-block-3d p-4 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  {/* Code */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                      Mã nhiệm vụ <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="NV-2026-01"
                      className="input-groove-3d w-full px-3 py-2 text-xs font-mono font-black rounded-xl"
                      required
                    />
                  </div>

                  {/* Quarter */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                      Kỳ hạn Quý <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={formQuarter}
                      onChange={(e) => setFormQuarter(e.target.value as YearlyTaskQuarter)}
                      className="input-groove-3d w-full px-3 py-2 text-xs font-black rounded-xl cursor-pointer"
                    >
                      <option value="q1">Quý I</option>
                      <option value="q2">Quý II</option>
                      <option value="q3">Quý III</option>
                      <option value="q4">Quý IV</option>
                      <option value="all_year">Cả năm</option>
                    </select>
                  </div>

                  {/* Year */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                      Năm kế hoạch
                    </label>
                    <select
                      value={formYear}
                      onChange={(e) => setFormYear(parseInt(e.target.value, 10))}
                      className="input-groove-3d w-full px-3 py-2 text-xs font-black rounded-xl cursor-pointer"
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                    Tên nhiệm vụ trọng tâm <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ví dụ: Triển khai Trung tâm Giám sát điều hành thông minh IOC..."
                    className="input-groove-3d w-full px-3 py-2 text-xs font-black rounded-xl placeholder:text-slate-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                    Mô tả mục tiêu chi tiết
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={2}
                    placeholder="Diễn giải phạm vi, giải pháp và kết quả dự kiến đạt được..."
                    className="input-groove-3d w-full px-3 py-2 text-xs font-bold rounded-xl resize-none placeholder:text-slate-500"
                  />
                </div>

                {/* Target Metric */}
                <div>
                  <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                    Chỉ tiêu định lượng & Sản phẩm đầu ra (KPI)
                  </label>
                  <input
                    type="text"
                    value={formTargetMetric}
                    onChange={(e) => setFormTargetMetric(e.target.value)}
                    placeholder="Ví dụ: Ban hành 03 văn bản quy phạm, nghiệm thu 100% gói thầu trước 30/11..."
                    className="input-groove-3d w-full px-3 py-2 text-xs font-black rounded-xl placeholder:text-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Department */}
                  <div>
                    <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                      Đơn vị chủ trì
                    </label>
                    <select
                      value={formLeadDepartment}
                      onChange={(e) => setFormLeadDepartment(e.target.value)}
                      className="input-groove-3d w-full px-3 py-2 text-xs font-black rounded-xl cursor-pointer"
                    >
                      {DEFAULT_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lead Assignee / Note */}
                  <div>
                    <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                      Người thực hiện chính / Đơn vị phối hợp (Ghi chú)
                    </label>
                    <input
                      type="text"
                      value={formLeadPerson}
                      onChange={(e) => setFormLeadPerson(e.target.value)}
                      placeholder="Tôi (Chính chủ) - phối hợp: ..."
                      className="input-groove-3d w-full px-3 py-2 text-xs font-black rounded-xl placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                      Độ ưu tiên
                    </label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as Priority)}
                      className="input-groove-3d w-full px-3 py-2 text-xs font-black rounded-xl cursor-pointer"
                    >
                      <option value="urgent" className="text-rose-700 font-black">Hỏa tốc / Trọng điểm</option>
                      <option value="high" className="text-amber-700 font-black">Ưu tiên cao</option>
                      <option value="medium" className="text-blue-700 font-black">Bình thường</option>
                      <option value="low" className="text-slate-700 font-black">Thấp</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as YearlyTaskStatus)}
                      className="input-groove-3d w-full px-3 py-2 text-xs font-black rounded-xl cursor-pointer"
                    >
                      <option value="planning">Lập kế hoạch</option>
                      <option value="in_progress">Đang triển khai</option>
                      <option value="completed">Đạt chỉ tiêu</option>
                      <option value="delayed">Chậm tiến độ</option>
                    </select>
                  </div>

                  {/* Progress */}
                  <div>
                    <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                      Tiến độ hoàn thành: <span className="font-mono text-blue-900 font-black">{formProgress}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formProgress}
                      onChange={(e) => setFormProgress(parseInt(e.target.value, 10))}
                      className="w-full mt-2 accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Linked Dockets Multi-Select Checkboxes */}
                <div className="pt-3 border-t-2 border-slate-300 space-y-2">
                  <label className="block text-xs font-black text-black uppercase tracking-wide">
                    Chọn hồ sơ công việc thực tế gắn với nhiệm vụ năm này:
                  </label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-mini-scrollbar pr-1 border-2 border-slate-400 rounded-xl p-2.5 bg-white">
                    {dockets.map((d) => {
                      const isChecked = formLinkedDocketIds.includes(d.id);
                      return (
                        <label
                          key={d.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked ? 'bg-blue-100 border-2 border-blue-500 text-black font-black' : 'hover:bg-slate-100 text-black font-bold'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormLinkedDocketIds([...formLinkedDocketIds, d.id]);
                              } else {
                                setFormLinkedDocketIds(formLinkedDocketIds.filter((id) => id !== d.id));
                              }
                            }}
                            className="rounded border-slate-400 text-blue-600 focus:ring-0 focus:outline-hidden"
                          />
                          <span className="font-mono text-xs font-black text-blue-900 shrink-0">
                            {d.code}
                          </span>
                          <span className="text-xs truncate flex-1">
                            {d.title}
                          </span>
                          <span className="text-[10px] text-slate-700 shrink-0 font-extrabold">
                            {d.category}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-400">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-black text-black bg-white hover:bg-slate-100 rounded-xl transition-all border-2 border-slate-400 shadow-[0_3px_0_#94a3b8] active:translate-y-0.5 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all border-2 border-blue-900 shadow-[0_4px_0_#1e3a8a] active:translate-y-0.5 cursor-pointer"
                >
                  {editingTask ? 'Lưu thay đổi' : 'Tạo nhiệm vụ năm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
