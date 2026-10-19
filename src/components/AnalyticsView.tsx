import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Award, 
  Target,
  Layers,
  Sparkles,
  ArrowUpRight,
  FolderKanban,
  UserCheck,
  BookOpen,
  CalendarCheck,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2
} from 'lucide-react';
import { 
  Docket, 
  YearlyTask, 
  YearlyTaskQuarter, 
  YearlyTaskStatus, 
  Priority,
  DOCKET_STATUS_CONFIG, 
  PRIORITY_CONFIG,
  DEFAULT_CATEGORIES,
  DEFAULT_DEPARTMENTS
} from '../types';

interface AnalyticsViewProps {
  dockets: Docket[];
  yearlyTasks?: YearlyTask[];
  onSaveYearlyTask?: (task: YearlyTask) => void;
  onDeleteYearlyTask?: (taskId: string) => void;
  onOpenDocketDetail?: (docket: Docket) => void;
  onNavigateToYearly?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  dockets, 
  yearlyTasks = [], 
  onSaveYearlyTask,
  onDeleteYearlyTask,
  onOpenDocketDetail,
  onNavigateToYearly 
}) => {
  const totalDockets = dockets.length;
  
  // Total steps & completion
  let totalStepsCount = 0;
  let completedStepsCount = 0;
  let overdueStepsCount = 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const nowMs = new Date(todayStr).getTime();

  dockets.forEach((d) => {
    d.steps.forEach((s) => {
      totalStepsCount++;
      if (s.status === 'completed') {
        completedStepsCount++;
      } else if (s.dueDate && new Date(s.dueDate).getTime() < nowMs) {
        overdueStepsCount++;
      }
    });
  });

  const overallStepProgress = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0;
  const onTimeRate = totalStepsCount > 0 ? Math.max(0, Math.round(((totalStepsCount - overdueStepsCount) / totalStepsCount) * 100)) : 100;

  // Status breakdown
  const statusCounts = {
    pending: dockets.filter((d) => d.status === 'pending').length,
    in_progress: dockets.filter((d) => d.status === 'in_progress').length,
    review: dockets.filter((d) => d.status === 'review').length,
    completed: dockets.filter((d) => d.status === 'completed').length,
    delayed: dockets.filter((d) => d.status === 'delayed').length,
  };

  // Category breakdown
  const categoryMap: Record<string, { total: number; completed: number }> = {};
  dockets.forEach((d) => {
    const cat = d.category || 'Khác';
    if (!categoryMap[cat]) categoryMap[cat] = { total: 0, completed: 0 };
    categoryMap[cat].total++;
    if (d.status === 'completed') categoryMap[cat].completed++;
  });
  const categoriesList = Object.entries(categoryMap).sort((a, b) => b[1].total - a[1].total);

  // External Coordination Contacts (Reference notes for solo workspace)
  const collaboratorNotesMap = useMemo(() => {
    const map: Record<string, { count: number; dockets: string[] }> = {};
    dockets.forEach((d) => {
      d.collaborators.forEach((c) => {
        const name = c.trim();
        if (!name) return;
        if (!map[name]) map[name] = { count: 0, dockets: [] };
        map[name].count++;
        if (!map[name].dockets.includes(d.code)) map[name].dockets.push(d.code);
      });
      d.steps.forEach((s) => {
        if (s.assignee && s.assignee !== d.leadAssignee && !s.assignee.includes('Tôi')) {
          const name = s.assignee.trim();
          if (!map[name]) map[name] = { count: 0, dockets: [] };
          map[name].count++;
          if (!map[name].dockets.includes(d.code)) map[name].dockets.push(d.code);
        }
      });
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [dockets]);

  // Yearly Plan / Strategic targets progress calculation
  const currentYear = 2026;
  const tasksThisYear = yearlyTasks.filter((t) => t.year === currentYear);
  const totalYearlyGoals = tasksThisYear.length;
  const completedYearlyGoals = tasksThisYear.filter((t) => t.status === 'completed').length;
  const inProgressYearlyGoals = tasksThisYear.filter((t) => t.status === 'in_progress').length;
  const delayedYearlyGoals = tasksThisYear.filter((t) => t.status === 'delayed').length;

  const averageYearlyProgress = totalYearlyGoals > 0 
    ? Math.round(tasksThisYear.reduce((acc, t) => acc + (t.progress || 0), 0) / totalYearlyGoals)
    : 0;

  // Quarter progress breakdown
  const quartersData = useMemo(() => {
    const qList: { id: string; label: string; count: number; completed: number; avgProg: number }[] = [
      { id: 'q1', label: 'Quý 1 (Q1)', count: 0, completed: 0, avgProg: 0 },
      { id: 'q2', label: 'Quý 2 (Q2)', count: 0, completed: 0, avgProg: 0 },
      { id: 'q3', label: 'Quý 3 (Q3)', count: 0, completed: 0, avgProg: 0 },
      { id: 'q4', label: 'Quý 4 (Q4)', count: 0, completed: 0, avgProg: 0 },
      { id: 'all_year', label: 'Cả năm', count: 0, completed: 0, avgProg: 0 },
    ];

    qList.forEach((q) => {
      const qTasks = tasksThisYear.filter((t) => t.quarter === q.id);
      q.count = qTasks.length;
      q.completed = qTasks.filter((t) => t.status === 'completed').length;
      q.avgProg = q.count > 0 ? Math.round(qTasks.reduce((acc, c) => acc + (c.progress || 0), 0) / q.count) : 0;
    });

    return qList;
  }, [tasksThisYear]);

  // INLINE FORM STATE TO INPUT YEARLY GOALS (Mục lớn để nhập liệu chỉ tiêu giao đầu năm)
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [goalCode, setGoalCode] = useState(`NV-2026-0${tasksThisYear.length + 1}`);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalQuarter, setGoalQuarter] = useState<YearlyTaskQuarter>('q1');
  const [goalCategory, setGoalCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [goalMetric, setGoalMetric] = useState('');
  const [goalNotes, setGoalNotes] = useState('');
  const [goalProgress, setGoalProgress] = useState(0);

  const handleSaveNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) {
      alert('Vui lòng nhập tên công việc lớn / chỉ tiêu');
      return;
    }

    const newTask: YearlyTask = {
      id: `yt-${Date.now()}`,
      year: 2026,
      code: goalCode.trim().toUpperCase() || `NV-2026-0${tasksThisYear.length + 1}`,
      title: goalTitle.trim(),
      description: goalNotes.trim(),
      category: goalCategory,
      quarter: goalQuarter,
      leadDepartment: DEFAULT_DEPARTMENTS[0],
      leadPerson: 'Tôi (Cá nhân)',
      priority: 'high',
      status: goalProgress >= 100 ? 'completed' : goalProgress > 0 ? 'in_progress' : 'planning',
      progress: goalProgress,
      targetMetric: goalMetric.trim() || undefined,
      linkedDocketIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onSaveYearlyTask) {
      onSaveYearlyTask(newTask);
    }

    // Reset form
    setGoalTitle('');
    setGoalMetric('');
    setGoalNotes('');
    setGoalProgress(0);
    setGoalCode(`NV-2026-0${tasksThisYear.length + 2}`);
    setShowAddGoalForm(false);
  };

  // Quick adjust progress
  const handleQuickAdjust = (task: YearlyTask, delta: number) => {
    if (!onSaveYearlyTask) return;
    const newProg = Math.min(100, Math.max(0, (task.progress || 0) + delta));
    const newStatus: YearlyTaskStatus = newProg === 100 ? 'completed' : newProg > 0 ? 'in_progress' : task.status;
    onSaveYearlyTask({
      ...task,
      progress: newProg,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  // Donut chart calculations
  const donutData = [
    { label: 'Đang xử lý', count: statusCounts.in_progress, color: '#3B82F6' },
    { label: 'Thẩm định', count: statusCounts.review, color: '#818CF8' },
    { label: 'Hoàn thành', count: statusCounts.completed, color: '#10B981' },
    { label: 'Chờ tiếp nhận', count: statusCounts.pending, color: '#64748B' },
    { label: 'Trễ hạn', count: statusCounts.delayed, color: '#EF4444' },
  ].filter((item) => item.count > 0);

  const totalStatusSum = donutData.reduce((acc, curr) => acc + curr.count, 0) || 1;

  let accumulatedAngle = 0;
  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  // Workload timeline
  const workloadTimeline = [
    { period: 'Tháng 6', created: 3, done: 3 },
    { period: 'Tháng 7', created: 4, done: 4 },
    { period: 'Tháng 8', created: 6, done: 5 },
    { period: 'Tháng 9', created: 7, done: 6 },
    { period: 'Tháng 10 (Hiện tại)', created: dockets.length, done: statusCounts.completed },
  ];
  const maxBarValue = Math.max(...workloadTimeline.map((w) => Math.max(w.created, w.done)), 8);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Biểu đồ & Thống kê Phân tích
            </h1>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-0.5 rounded-md font-semibold badge-3d">
              Cá nhân tôi
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Đo lường tiến độ hoàn thành so với mục tiêu năm được giao từ đầu năm, phân rã công việc và sổ tay phối hợp.
          </p>
        </div>

        <button
          onClick={() => setShowAddGoalForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl transition-all shadow-md badge-3d shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Nhập liệu chỉ tiêu năm 2026</span>
        </button>
      </div>

      {/* 3D Elevated KPI Cards (Nổi khối như Bàn làm việc hôm nay) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tổng hồ sơ */}
        <div className="card-3d-interactive p-4 md:p-5 rounded-2xl relative overflow-hidden group transition-all duration-200 select-none border-slate-800/90 hover:border-blue-500/60 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(59,130,246,0.25)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Tổng hồ sơ quản lý
              </span>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-white drop-shadow-sm mt-1">
                {totalDockets}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{statusCounts.completed} hồ sơ hoàn tất</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center group-hover:scale-105 shadow-[0_0_15px_rgba(59,130,246,0.25)] transition-transform shrink-0">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500" />
        </div>

        {/* KPI 2: Quy trình nhiệm vụ con */}
        <div className="card-3d-interactive p-4 md:p-5 rounded-2xl relative overflow-hidden group transition-all duration-200 select-none border-slate-800/90 hover:border-emerald-500/60 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(16,185,129,0.25)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Tiến độ quy trình
              </span>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-emerald-400 drop-shadow-sm mt-1">
                {overallStepProgress}%
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium pt-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{completedStepsCount} / {totalStepsCount} bước con</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center group-hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-transform shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-400" />
        </div>

        {/* KPI 3: TIẾN ĐỘ CÔNG VIỆC NĂM SO VỚI MỤC TIÊU NĂM */}
        <div className="card-3d-interactive p-4 md:p-5 rounded-2xl relative overflow-hidden group transition-all duration-200 select-none border-amber-500/40 bg-gradient-to-b from-slate-900 to-amber-950/30 hover:border-amber-400/80 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(245,158,11,0.3)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <span>Mục tiêu năm 2026</span>
                <span className="px-1.5 py-0.2 text-[10px] font-mono bg-amber-500 text-slate-950 font-black rounded-md">KPI</span>
              </span>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-amber-400 drop-shadow-sm mt-1">
                {averageYearlyProgress}%
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-200 font-medium pt-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Đạt {completedYearlyGoals} / {totalYearlyGoals} chỉ tiêu</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/25 border border-amber-500/50 text-amber-400 flex items-center justify-center group-hover:scale-105 shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-transform shrink-0">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
        </div>

        {/* KPI 4: Đúng hạn cá nhân */}
        <div className="card-3d-interactive p-4 md:p-5 rounded-2xl relative overflow-hidden group transition-all duration-200 select-none border-slate-800/90 hover:border-indigo-500/60 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(99,102,241,0.25)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Chỉ số đúng hạn
              </span>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-indigo-400 drop-shadow-sm mt-1">
                {onTimeRate}%
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-300 font-medium pt-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{overdueStepsCount > 0 ? `${overdueStepsCount} bước trễ` : '100% trong hạn'}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center group-hover:scale-105 shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-transform shrink-0">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
        </div>
      </div>

      {/* MỤC LỚN: TIẾN ĐỘ CÔNG VIỆC NĂM (HOÀN THÀNH TIẾN ĐỘ SO VỚI MỤC TIÊU NĂM) & NHẬP LIỆU CHỈ TIÊU ĐẦU NĂM */}
      <div className="card-3d p-5 sm:p-6 rounded-2xl space-y-6 border-blue-900/50 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-2xl">
        {/* Header of Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-md badge-3d">
              <Target className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Tiến độ Công việc Năm & Hoàn thành Mục tiêu Giao Đầu Năm (2026)
                </h2>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-800 px-2.5 py-0.5 rounded-lg badge-3d">
                  Đạt {averageYearlyProgress}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Khu vực chuyên biệt quản trị chỉ tiêu, nhiệm vụ lớn được cấp trên giao từ đầu năm.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddGoalForm(!showAddGoalForm)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md badge-3d cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddGoalForm ? 'Đóng form nhập' : 'Nhập chỉ tiêu mới'}</span>
            </button>

            {onNavigateToYearly && (
              <button
                onClick={onNavigateToYearly}
                className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 cursor-pointer flex items-center gap-1"
                title="Mở giao diện chi tiết phân kỳ theo Quý"
              >
                <span>Xem thẻ Quý</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            )}
          </div>
        </div>

        {/* Master Progress 3D Gauge */}
        <div className="space-y-2 p-4 bg-slate-950/80 border border-slate-800 rounded-xl inner-groove">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-300 flex items-center gap-2">
              <span className="font-bold text-white">Tiến độ Lũy kế Toàn năm:</span>
              <strong className="text-cyan-300 font-mono text-sm">{averageYearlyProgress}%</strong>
            </span>
            <span className="text-slate-400 font-mono text-xs">
              Hoàn thành: <strong className="text-emerald-400">{completedYearlyGoals}</strong> | Đang làm:{' '}
              <strong className="text-blue-400">{inProgressYearlyGoals}</strong> | Chậm:{' '}
              <strong className="text-rose-400">{delayedYearlyGoals}</strong>
            </span>
          </div>

          {/* Master Gauge */}
          <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 transition-all duration-700 shadow-sm"
              style={{ width: `${Math.min(100, Math.max(averageYearlyProgress, 2))}%` }}
            />
          </div>
        </div>

        {/* Breakdown by Quarters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quartersData.map((q) => (
            <div
              key={q.id}
              className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-xl space-y-2 hover:border-slate-700 transition-all badge-3d"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{q.label}</span>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {q.avgProg}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all"
                  style={{ width: `${q.avgProg}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 font-mono">
                <span>{q.count} chỉ tiêu</span>
                <span className="text-emerald-400 font-semibold">{q.completed} xong</span>
              </div>
            </div>
          ))}
        </div>

        {/* INLINE FORM: NHẬP LIỆU CHỈ TIÊU & CÔNG VIỆC LỚN GIAO ĐẦU NĂM */}
        {showAddGoalForm && (
          <form
            onSubmit={handleSaveNewGoal}
            className="p-4 sm:p-5 bg-slate-950 border-2 border-blue-600/70 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  Biểu mẫu Nhập Chỉ tiêu & Công việc Lớn Giao Đầu Năm 2026
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddGoalForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              {/* Code */}
              <div className="md:col-span-3">
                <label className="block text-slate-300 font-semibold mb-1">
                  Mã chỉ tiêu <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={goalCode}
                  onChange={(e) => setGoalCode(e.target.value)}
                  placeholder="NV-2026-07"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold focus:border-cyan-500 focus:outline-hidden"
                  required
                />
              </div>

              {/* Title */}
              <div className="md:col-span-6">
                <label className="block text-slate-300 font-semibold mb-1">
                  Tên công việc lớn / Mục tiêu giao đầu năm <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="VD: Triển khai Trung tâm Giám sát điều hành thông minh IOC..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold focus:border-cyan-500 focus:outline-hidden"
                  required
                />
              </div>

              {/* Quarter */}
              <div className="md:col-span-3">
                <label className="block text-slate-300 font-semibold mb-1">
                  Kỳ hạn hoàn thành
                </label>
                <select
                  value={goalQuarter}
                  onChange={(e) => setGoalQuarter(e.target.value as YearlyTaskQuarter)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="q1">Quý I</option>
                  <option value="q2">Quý II</option>
                  <option value="q3">Quý III</option>
                  <option value="q4">Quý IV</option>
                  <option value="all_year">Cả năm</option>
                </select>
              </div>

              {/* Metric KPI */}
              <div className="md:col-span-6">
                <label className="block text-slate-300 font-semibold mb-1">
                  Chỉ tiêu định lượng & Sản phẩm đầu ra (KPI)
                </label>
                <input
                  type="text"
                  value={goalMetric}
                  onChange={(e) => setGoalMetric(e.target.value)}
                  placeholder="VD: Ban hành 03 văn bản, nghiệm thu 100% trước 30/11..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              {/* Category */}
              <div className="md:col-span-3">
                <label className="block text-slate-300 font-semibold mb-1">
                  Lĩnh vực
                </label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-hidden cursor-pointer"
                >
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Progress */}
              <div className="md:col-span-3">
                <label className="block text-slate-300 font-semibold mb-1">
                  Tiến độ hiện tại: <span className="text-cyan-400 font-mono font-bold">{goalProgress}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={goalProgress}
                  onChange={(e) => setGoalProgress(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-400 cursor-pointer mt-2"
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-12">
                <label className="block text-slate-300 font-semibold mb-1">
                  Người / Đơn vị phối hợp & Ghi chú để nhớ
                </label>
                <input
                  type="text"
                  value={goalNotes}
                  onChange={(e) => setGoalNotes(e.target.value)}
                  placeholder="Ghi chú người phối hợp hoặc văn bản giao chỉ tiêu..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddGoalForm(false)}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md badge-3d flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Lưu chỉ tiêu vào hệ thống</span>
              </button>
            </div>
          </form>
        )}

        {/* DANH SÁCH CÁC CHỈ TIÊU & CÔNG VIỆC LỚN NĂM 2026 (TACTILE 3D CARDS) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Danh mục Chỉ tiêu Năm 2026 ({tasksThisYear.length} nhiệm vụ)</span>
            <span className="text-[11px] font-normal text-slate-500 lowercase">
              (Bấm + / - để cập nhật nhanh tiến độ hoàn thành)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {tasksThisYear.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl space-y-3 transition-all badge-3d shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-0.5 rounded-lg badge-3d">
                        {task.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                        {task.quarter.toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        task.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : task.status === 'delayed'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-blue-950 text-blue-300 border-blue-800'
                      }`}>
                        {task.status === 'completed' ? 'Đã đạt' : task.status === 'delayed' ? 'Chậm' : 'Đang làm'}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white mt-2 leading-snug line-clamp-2">
                      {task.title}
                    </h4>
                  </div>

                  {onDeleteYearlyTask && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Xóa chỉ tiêu ${task.code}?`)) {
                          onDeleteYearlyTask(task.id);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer shrink-0"
                      title="Xóa chỉ tiêu này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {task.targetMetric && (
                  <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 line-clamp-2">
                    <strong className="text-slate-300">KPI:</strong> {task.targetMetric}
                  </div>
                )}

                {/* Interactive Progress Adjustment */}
                <div className="inner-groove p-2.5 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Tiến độ thực tế:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-cyan-300 tabular-nums">
                        {task.progress}%
                      </span>
                      {/* Fast adjust buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(task, -5)}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs"
                          title="Giảm 5%"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjust(task, 5)}
                          className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs"
                          title="Tăng 5%"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row: 3D Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Donut Status Distribution */}
        <div className="card-3d p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Phân bổ Trạng thái Hồ sơ
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tỷ trọng trạng thái xử lý hiện thời
              </p>
            </div>
            <PieChart className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            {/* SVG Donut */}
            <div className="relative w-40 h-40 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-slate-800/80"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {donutData.map((item, idx) => {
                  const strokeDasharray = `${(item.count / totalStatusSum) * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedAngle;
                  accumulatedAngle += (item.count / totalStatusSum) * circumference;

                  return (
                    <circle
                      key={idx}
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke={item.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      fill="transparent"
                      className="transition-all duration-500 hover:opacity-90"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold font-mono tabular-nums text-white leading-none">
                  {totalDockets}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-1">
                  Hồ sơ
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs flex-1">
              {donutData.map((item, idx) => {
                const percent = Math.round((item.count / totalStatusSum) * 100);
                return (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300 font-medium">{item.label}</span>
                    </div>
                    <div className="font-mono tabular-nums text-slate-400">
                      <strong className="text-white font-semibold">{item.count}</strong> ({percent}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 2: Workload & Progression Bar Chart */}
        <div className="card-3d p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Khối lượng Tiếp nhận & Đã hoàn thành
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Đối chiếu xu hướng tiếp nhận và tỷ lệ kết thúc theo chu kỳ
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
            {workloadTimeline.map((item, idx) => {
              const createdHeight = (item.created / maxBarValue) * 100;
              const doneHeight = (item.done / maxBarValue) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-32">
                    {/* Bar Created */}
                    <div
                      className="w-3.5 bg-blue-900/80 border border-blue-700/60 rounded-t-xs transition-all duration-300 group-hover:bg-blue-800"
                      style={{ height: `${createdHeight}%` }}
                      title={`Tiếp nhận: ${item.created} hồ sơ`}
                    />
                    {/* Bar Done */}
                    <div
                      className="w-3.5 bg-cyan-400 rounded-t-xs transition-all duration-300 group-hover:bg-cyan-300 shadow-xs"
                      style={{ height: `${doneHeight}%` }}
                      title={`Đã hoàn thành: ${item.done} hồ sơ`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-full text-center">
                    {item.period.split(' ')[0]} {item.period.split(' ')[1]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-900/80 border border-blue-700/60 rounded-xs" />
              <span>Hồ sơ tiếp nhận</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-cyan-400 rounded-xs shadow-xs" />
              <span>Đã hoàn thành</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Category Breakdown and Personal Coordination Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card-3d p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Phân bổ theo Lĩnh vực công tác
            </h3>
            <span className="text-xs text-slate-400">{categoriesList.length} lĩnh vực</span>
          </div>

          <div className="space-y-3">
            {categoriesList.map(([cat, data], idx) => {
              const percent = totalDockets > 0 ? Math.round((data.total / totalDockets) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cat}</span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {data.total} hồ sơ ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Solo Workspace: Ghi chú Đầu mối Phối hợp Bên ngoài */}
        <div className="card-3d p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Sổ tay Ghi chú Phối hợp Bên ngoài
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Nhật ký lưu danh sách các cá nhân/đơn vị bên ngoài bạn thường phối hợp
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-md font-semibold badge-3d">
              Ghi nhớ cá nhân
            </span>
          </div>

          {collaboratorNotesMap.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              Chưa có ghi chú phối hợp nào. Khi tạo hồ sơ, bạn có thể ghi chú thêm người phối hợp để lưu tại đây.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto custom-mini-scrollbar pr-1">
              {collaboratorNotesMap.map(([name, data], idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Hồ sơ liên quan: <span className="font-mono text-cyan-300">{data.dockets.slice(0, 3).join(', ')}{data.dockets.length > 3 ? '...' : ''}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-slate-300 bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded-lg font-medium">
                      {data.count} lần phối hợp
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
