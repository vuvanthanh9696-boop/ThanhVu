import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Award, 
  Users,
  Layers
} from 'lucide-react';
import { Docket, DOCKET_STATUS_CONFIG, PRIORITY_CONFIG } from '../types';

interface AnalyticsViewProps {
  dockets: Docket[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ dockets }) => {
  const totalDockets = dockets.length;
  
  // Total steps & completion
  let totalStepsCount = 0;
  let completedStepsCount = 0;
  let overdueStepsCount = 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const nowMs = new Date(todayStr).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

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

  // Assignee workload
  const assigneeMap: Record<string, { active: number; done: number; overdue: number }> = {};
  dockets.forEach((d) => {
    d.steps.forEach((s) => {
      const a = s.assignee || d.leadAssignee || 'Chưa gán';
      if (!assigneeMap[a]) assigneeMap[a] = { active: 0, done: 0, overdue: 0 };
      if (s.status === 'completed') {
        assigneeMap[a].done++;
      } else {
        assigneeMap[a].active++;
        if (s.dueDate && new Date(s.dueDate).getTime() < nowMs) {
          assigneeMap[a].overdue++;
        }
      }
    });
  });
  const assigneesList = Object.entries(assigneeMap).sort((a, b) => (b[1].active + b[1].done) - (a[1].active + a[1].done));

  // Donut chart calculations
  const donutData = [
    { label: 'Đang xử lý', count: statusCounts.in_progress, color: '#2563EB' },
    { label: 'Thẩm định', count: statusCounts.review, color: '#6366F1' },
    { label: 'Hoàn thành', count: statusCounts.completed, color: '#10B981' },
    { label: 'Chờ tiếp nhận', count: statusCounts.pending, color: '#94A3B8' },
    { label: 'Trễ hạn', count: statusCounts.delayed, color: '#EF4444' },
  ].filter((item) => item.count > 0);

  const totalStatusSum = donutData.reduce((acc, curr) => acc + curr.count, 0) || 1;

  // Compute SVG arcs
  let accumulatedAngle = 0;
  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  // Monthly dummy progression trend (sample months for workload curve)
  const workloadTimeline = [
    { period: 'Tháng 6', created: 3, done: 3 },
    { period: 'Tháng 7', created: 4, done: 4 },
    { period: 'Tháng 8', created: 6, done: 5 },
    { period: 'Tháng 9', created: 7, done: 6 },
    { period: 'Tháng 10 (Hiện tại)', created: dockets.length, done: statusCounts.completed },
  ];
  const maxBarValue = Math.max(...workloadTimeline.map((w) => Math.max(w.created, w.done)), 8);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-3 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Biểu đồ & Thống kê Phân tích
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Báo cáo tổng quan về khối lượng hồ sơ, tiến độ thực hiện các bước con và hiệu suất hoàn thành.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800/90 rounded-2xl shadow-md text-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng hồ sơ quản lý</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-2">
            {totalDockets}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {statusCounts.completed} hồ sơ đã giải quyết xong
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800/90 rounded-2xl shadow-md text-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tổng số bước con</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-2">
            {completedStepsCount}/{totalStepsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Đạt {overallStepProgress}% tiến độ phân rã
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800/90 rounded-2xl shadow-md text-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tỷ lệ hoàn thành đúng hạn</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/60 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-2">
            {onTimeRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {overdueStepsCount > 0 ? `${overdueStepsCount} bước bị chậm tiến độ` : '100% hồ sơ trong hạn'}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800/90 rounded-2xl shadow-md text-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Đang trong guồng xử lý</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-400 mt-2">
            {statusCounts.in_progress + statusCounts.review}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Gồm xử lý trực tiếp & thẩm định
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Donut Status Distribution */}
        <div className="p-5 bg-slate-900 border border-slate-800/90 rounded-2xl shadow-md space-y-4 text-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Phân bổ Trạng thái Hồ sơ
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tỷ trọng trạng thái xử lý hiện thời
              </p>
            </div>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            {/* SVG Donut */}
            <div className="relative w-40 h-40 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-slate-800"
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
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
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
        <div className="p-5 bg-slate-900 border border-slate-800/90 rounded-2xl shadow-md space-y-4 text-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Khối lượng Hồ sơ Tiếp nhận & Đã hoàn thành
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Đối chiếu xu hướng tiếp nhận và tỷ lệ kết thúc theo chu kỳ
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
            {workloadTimeline.map((item, idx) => {
              const createdHeight = (item.created / maxBarValue) * 100;
              const doneHeight = (item.done / maxBarValue) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-36">
                    {/* Bar Created */}
                    <div
                      className="w-3.5 bg-blue-900/80 border border-blue-700/60 rounded-t-xs transition-all duration-300 group-hover:bg-blue-800"
                      style={{ height: `${createdHeight}%` }}
                      title={`Tiếp nhận: ${item.created} hồ sơ`}
                    />
                    {/* Bar Done */}
                    <div
                      className="w-3.5 bg-blue-500 rounded-t-xs transition-all duration-300 group-hover:bg-blue-400 shadow-xs"
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
              <span className="w-3 h-3 bg-blue-500 rounded-xs" />
              <span>Đã hoàn thành</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Category Breakdown and Team Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-5 bg-slate-900 border border-slate-800/90 rounded-2xl shadow-md space-y-4 text-slate-100">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Phân bổ theo Lĩnh vực công tác
          </h3>

          <div className="space-y-3">
            {categoriesList.map(([cat, data], idx) => {
              const percent = totalDockets > 0 ? Math.round((data.total / totalDockets) * 100) : 0;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{cat}</span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {data.total} hồ sơ ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-750">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assignee Workload List */}
        <div className="p-5 bg-slate-900 border border-slate-800/90 rounded-2xl shadow-md space-y-4 text-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Khối lượng Công việc theo Nhân sự
            </h3>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto">
            {assigneesList.map(([name, stat], idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{name}</div>
                  <div className="text-[11px] text-slate-400">
                    Tổng nhiệm vụ: {stat.active + stat.done}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 font-mono text-xs tabular-nums">
                  <span className="text-blue-300 bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded-md">
                    {stat.active} đang làm
                  </span>
                  <span className="text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                    {stat.done} đã xong
                  </span>
                  {stat.overdue > 0 && (
                    <span className="text-rose-300 bg-rose-950/80 border border-rose-800/60 px-2 py-0.5 rounded-md font-semibold">
                      {stat.overdue} chậm
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
