import React from 'react';
import { 
  FolderKanban, 
  BarChart3, 
  CalendarDays, 
  BellRing,
  RotateCcw,
  Sparkles,
  Layers,
  CalendarCheck2,
  Target,
  Github
} from 'lucide-react';
import { ActiveTab, Docket } from '../types';
import { downloadICSFile } from '../utils/calendarSync';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  dockets: Docket[];
  todayUrgentCount: number;
  yearlyTasksCount?: number;
  onResetData: () => void;
  onEnableNotifications: () => void;
  notificationPermission: NotificationPermission;
  onOpenTemplateManager?: () => void;
  onOpenGitHubSync?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  dockets,
  todayUrgentCount,
  yearlyTasksCount = 0,
  onResetData,
  onEnableNotifications,
  notificationPermission,
  onOpenTemplateManager,
  onOpenGitHubSync,
}) => {
  const totalDockets = dockets.length;

  return (
    <aside className="w-64 shrink-0 bg-[#0B0F19]/95 backdrop-blur-md border-r border-slate-800/90 flex flex-col justify-between h-full sticky top-0 select-none text-slate-300 z-20">
      {/* CSS selector 1: Fixed Navigation & Quick Tools Container */}
      <div className="p-4 space-y-6 flex-1 overflow-y-auto sticky top-0 overscroll-contain scrollbar-none">
        {/* Main Navigation */}
        <div className="space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center justify-between">
            <span>Điều hành & Giám sát</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          </div>

          <button
            onClick={() => onSelectTab('today')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all group ${
              activeTab === 'today'
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-200 font-bold border border-blue-500/50 shadow-[0_4px_14px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                activeTab === 'today'
                  ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] border border-blue-400/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight">Bàn làm việc hôm nay</span>
            </div>
            {todayUrgentCount > 0 && (
              <span className={`px-2 py-0.5 text-[11px] font-mono tabular-nums font-bold rounded-lg ${
                activeTab === 'today'
                  ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50 shadow-xs'
                  : 'bg-rose-500/25 text-rose-300 border border-rose-500/40 animate-pulse'
              }`}>
                {todayUrgentCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('dockets')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all group ${
              activeTab === 'dockets'
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-200 font-bold border border-blue-500/50 shadow-[0_4px_14px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                activeTab === 'dockets'
                  ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] border border-blue-400/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700'
              }`}>
                <FolderKanban className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight">Kho hồ sơ công việc</span>
            </div>
            <span className="px-2 py-0.5 text-[11px] font-mono tabular-nums text-slate-400 bg-slate-900/90 border border-slate-800 rounded-lg font-bold">
              {totalDockets}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('yearly')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all group ${
              activeTab === 'yearly'
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-200 font-bold border border-blue-500/50 shadow-[0_4px_14px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                activeTab === 'yearly'
                  ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] border border-blue-400/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700'
              }`}>
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight">Nhiệm vụ trọng tâm</span>
            </div>
            {yearlyTasksCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-mono tabular-nums text-indigo-300 bg-indigo-950/80 border border-indigo-800/80 rounded-lg font-bold">
                {yearlyTasksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all group ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-200 font-bold border border-blue-500/50 shadow-[0_4px_14px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] border border-blue-400/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700'
              }`}>
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight">Biểu đồ & Thống kê</span>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('calendar')}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all group ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-blue-200 font-bold border border-blue-500/50 shadow-[0_4px_14px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] border border-blue-400/50'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white group-hover:border-slate-700'
              }`}>
                <CalendarDays className="w-3.5 h-3.5" />
              </div>
              <span className="tracking-tight">Lịch biểu công việc</span>
            </div>
          </button>
        </div>

        {/* Quick Sync & Integrations */}
        <div className="pt-4 border-t border-slate-800/90 space-y-2">
          <div className="px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            Tiện ích & Quy trình
          </div>

          {/* PWA Desktop App install button */}
          <div className="w-full">
            <PWAInstallButton variant="sidebar" />
          </div>

          {onOpenTemplateManager && (
            <button
              onClick={onOpenTemplateManager}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all text-left group"
              title="Quản lý bộ mẫu quy trình chuẩn hóa nhiều bước"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col truncate">
                <span className="leading-tight font-semibold text-slate-200 group-hover:text-white">Bộ mẫu quy trình</span>
                <span className="text-[10px] text-slate-400">Tùy biến bước con mẫu</span>
              </div>
            </button>
          )}

          {onOpenGitHubSync && (
            <button
              onClick={onOpenGitHubSync}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all text-left group"
              title="Đồng bộ mã nguồn và dữ liệu sang GitHub"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Github className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col truncate">
                <span className="leading-tight font-semibold text-slate-200 group-hover:text-white">Đồng bộ GitHub</span>
                <span className="text-[10px] text-slate-400">Đẩy code & cập nhật web</span>
              </div>
            </button>
          )}

          <button
            onClick={() => downloadICSFile(dockets)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all text-left group"
            title="Tải tệp .ics để đồng bộ vào Google Calendar, Apple Calendar, Outlook"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CalendarCheck2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="leading-tight font-semibold text-slate-200 group-hover:text-white">Xuất Lịch (.ics)</span>
              <span className="text-[10px] text-slate-400">Đồng bộ lịch cá nhân</span>
            </div>
          </button>

          {notificationPermission !== 'granted' && (
            <button
              onClick={onEnableNotifications}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all text-left group"
              title="Bật thông báo đẩy nhắc việc trên trình duyệt"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BellRing className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col truncate">
                <span className="leading-tight font-semibold text-slate-200 group-hover:text-white">Bật nhắc việc</span>
                <span className="text-[10px] text-slate-400">Thông báo trình duyệt</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Profile & Storage Reset */}
      <div className="p-3.5 border-t border-slate-800/90 bg-slate-900/60">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs font-mono shadow-xs shrink-0">
              VT
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-slate-200 truncate">
                Vũ Văn Thành
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                Chuyên viên quản lý
              </span>
            </div>
          </div>
          <button
            onClick={onResetData}
            title="Khôi phục lại dữ liệu mẫu"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
