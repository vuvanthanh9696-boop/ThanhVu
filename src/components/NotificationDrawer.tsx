import React from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CheckCheck, 
  BellRing,
  ArrowRight
} from 'lucide-react';
import { SmartNotification, Docket } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SmartNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectDocket: (docketId: string) => void;
  onEnableBrowserNotifications: () => void;
  notificationPermission: NotificationPermission;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectDocket,
  onEnableBrowserNotifications,
  notificationPermission,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 shadow-2xl border-l border-slate-800 flex flex-col justify-between animate-in slide-in-from-right duration-200 text-slate-100">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-800/60 text-blue-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Trung tâm Thông báo Nhắc việc
                </h3>
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {unreadCount} cảnh báo chưa đọc
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="px-2 py-1 text-xs text-cyan-400 hover:bg-slate-800 rounded-lg font-medium transition-colors"
                  title="Đánh dấu tất cả là đã đọc"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Browser notification permission banner if not granted */}
            {notificationPermission !== 'granted' && (
              <div className="p-3.5 bg-blue-950/80 border border-blue-800/70 rounded-2xl space-y-2 text-xs text-blue-200">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <BellRing className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Kích hoạt Thông báo Đẩy (Web Push)</span>
                </div>
                <p className="text-[11px] text-blue-300 leading-relaxed">
                  Nhận cảnh báo trực tiếp trên màn hình máy tính mỗi khi có hồ sơ đến hạn hoặc quá hạn mà không cần mở ứng dụng.
                </p>
                <button
                  onClick={onEnableBrowserNotifications}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors"
                >
                  Cho phép thông báo trình duyệt
                </button>
              </div>
            )}

            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                Hiện tại không có thông báo hay hạn việc nào cần cảnh báo
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.map((notif) => {
                  return (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-2 transition-all ${
                        !notif.read
                          ? notif.type === 'overdue'
                            ? 'bg-rose-950/40 border-rose-900/60'
                            : notif.type === 'due_today'
                            ? 'bg-amber-950/40 border-amber-900/60'
                            : 'bg-blue-950/40 border-blue-900/60'
                          : 'bg-slate-900/50 border-slate-800/80 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {notif.type === 'overdue' && (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          {notif.type === 'due_today' && (
                            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                          {notif.type === 'upcoming' && (
                            <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                          )}
                          <span className="font-semibold text-white">
                            {notif.title}
                          </span>
                        </div>

                        {!notif.read && (
                          <button
                            onClick={() => onMarkAsRead(notif.id)}
                            className="text-[10px] text-cyan-400 hover:underline font-semibold shrink-0"
                          >
                            Đã đọc
                          </button>
                        )}
                      </div>

                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                          {new Date(notif.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        <button
                          onClick={() => {
                            onMarkAsRead(notif.id);
                            onSelectDocket(notif.docketId);
                            onClose();
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          <span>Mở hồ sơ</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 border-t border-slate-800 bg-slate-900/80 text-center">
            <span className="text-[11px] text-slate-400">
              Hệ thống tự động đồng bộ và quét kiểm tra mốc thời hạn liên tục
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
