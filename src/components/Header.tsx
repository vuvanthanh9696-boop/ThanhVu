import React from 'react';
import { 
  Plus, 
  Bell, 
  Search, 
  FolderGit2, 
  Download, 
  CalendarDays,
  ShieldAlert
} from 'lucide-react';
import { Docket, SmartNotification } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  dockets: Docket[];
  notifications: SmartNotification[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenCreateModal: () => void;
  onOpenNotifications: () => void;
  onOpenBackupModal: () => void;
  unreadNotifCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  onOpenCreateModal,
  onOpenNotifications,
  onOpenBackupModal,
  unreadNotifCount,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 py-3 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-750/70 text-slate-100 select-none shadow-[0_4px_25px_-5px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.06)] shrink-0">
      {/* Zone 1: Single text element wordmark with icon */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_16px_rgba(37,99,235,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] border border-blue-400/40">
          <FolderGit2 className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-tight text-white whitespace-nowrap leading-none drop-shadow-sm">
            DocuFlow
          </span>
          <span className="text-[11px] text-slate-400 font-semibold leading-none mt-1">
            Quản trị Hồ sơ & Công việc
          </span>
        </div>
      </div>

      {/* Zone 2: Search input and quick tools */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tra cứu nhanh mã hồ sơ, tên trích yếu, bước con, người phụ trách..."
            className="w-full pl-9 pr-8 py-2 text-xs inner-groove text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors outline-hidden font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Actions & Notifications */}
      <div className="flex items-center gap-2 shrink-0">
        <PWAInstallButton variant="full" />

        <button
          onClick={onOpenBackupModal}
          title="Sao lưu & Xuất dữ liệu"
          className="p-2 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-xl transition-all border border-slate-800/80 hover:border-slate-700 shadow-xs"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenNotifications}
          title="Thông báo nhắc việc"
          className="relative p-2 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-xl transition-all border border-slate-800/80 hover:border-slate-700 shadow-xs"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full font-mono tabular-nums shadow-[0_0_10px_rgba(244,63,94,0.7)] animate-pulse">
              {unreadNotifCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 active:translate-y-0.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(37,99,235,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] border border-blue-400/40 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tạo hồ sơ mới</span>
        </button>
      </div>
    </header>
  );
};
