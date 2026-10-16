import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CalendarCheck, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Docket, DocketStep } from '../types';
import { downloadICSFile, getGoogleCalendarUrl } from '../utils/calendarSync';

interface CalendarViewProps {
  dockets: Docket[];
  onOpenDocketDetail: (docket: Docket) => void;
  onToggleStepStatus: (docketId: string, stepId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  dockets,
  onOpenDocketDetail,
  onToggleStepStatus,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Calendar calculations
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Adjust so Monday is day 0, Sunday is day 6 (standard Vietnamese calendar)
  const startOffset = (firstDayIndex + 6) % 7;

  // Build grid dates
  const calendarCells: Array<{ dateStr: string; dayNum: number; isCurrentMonth: boolean }> = [];

  // Previous month trailing days
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  // Next month leading days to complete grid (42 cells: 6 rows of 7)
  const remaining = 42 - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // Map events by date
  interface DayEvent {
    type: 'docket' | 'step';
    docket: Docket;
    step?: DocketStep;
    title: string;
    code: string;
    status: string;
    isOverdue: boolean;
  }

  const eventsByDate: Record<string, DayEvent[]> = {};
  const todayStr = new Date().toISOString().split('T')[0];

  dockets.forEach((docket) => {
    // Docket due date
    if (docket.dueDate) {
      if (!eventsByDate[docket.dueDate]) eventsByDate[docket.dueDate] = [];
      const isOverdue = docket.status !== 'completed' && docket.dueDate < todayStr;
      eventsByDate[docket.dueDate].push({
        type: 'docket',
        docket,
        title: docket.title,
        code: docket.code,
        status: docket.status,
        isOverdue,
      });
    }

    // Steps due dates
    docket.steps.forEach((step) => {
      if (!step.dueDate) return;
      if (!eventsByDate[step.dueDate]) eventsByDate[step.dueDate] = [];
      const isOverdue = step.status !== 'completed' && step.dueDate < todayStr;
      eventsByDate[step.dueDate].push({
        type: 'step',
        docket,
        step,
        title: step.title,
        code: step.stepCode,
        status: step.status,
        isOverdue,
      });
    });
  });

  const selectedEvents = eventsByDate[selectedDateStr] || [];

  return (
    <div className="space-y-6">
      {/* Title & Sync Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Lịch biểu & Đồng bộ Deadline
            </h1>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-md tabular-nums font-semibold">
              Tháng {month + 1}/{year}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Trực quan hóa hạn chót hồ sơ và nhiệm vụ con. Dễ dàng xuất lịch hoặc bấm đồng bộ vào Google Calendar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadICSFile(dockets, `Lich_Thang_${month + 1}_${year}.ics`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 rounded-xl transition-colors shadow-2xs"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tải tệp Lịch (.ics)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Calendar Grid (8 cols) - Modern Dark Theme */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 text-slate-100">
          {/* Calendar Month Navigation Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-white font-mono tabular-nums tracking-tight">
                Tháng {month + 1}, {year}
              </span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-md tabular-nums">
                Lịch điều hành
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700/70 rounded-lg transition-colors shadow-2xs"
              >
                Hôm nay
              </button>
              <button
                onClick={prevMonth}
                className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/70 rounded-lg transition-colors"
                title="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/70 rounded-lg transition-colors"
                title="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 border-b border-slate-800 pb-2.5">
            <span>Th 2</span>
            <span>Th 3</span>
            <span>Th 4</span>
            <span>Th 5</span>
            <span>Th 6</span>
            <span className="text-cyan-400 font-semibold">Th 7</span>
            <span className="text-rose-400 font-semibold">CN</span>
          </div>

          {/* Day Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => {
              const dayEvents = eventsByDate[cell.dateStr] || [];
              const isSelected = selectedDateStr === cell.dateStr;
              const isToday = cell.dateStr === todayStr;

              const hasOverdue = dayEvents.some((e) => e.isOverdue);
              const hasDocket = dayEvents.some((e) => e.type === 'docket');

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[88px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400/50 shadow-md'
                      : isToday
                      ? 'border-blue-500/80 bg-blue-950/40 ring-1 ring-blue-500/40'
                      : cell.isCurrentMonth
                      ? 'border-slate-800/80 hover:border-slate-700 bg-slate-800/50 hover:bg-slate-800/80'
                      : 'border-slate-800/20 bg-slate-900/30 opacity-30 hover:opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-semibold tabular-nums w-5 h-5 flex items-center justify-center rounded-full transition-colors ${
                        isToday
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : isSelected
                          ? 'bg-cyan-400 text-slate-950 font-bold shadow-xs'
                          : 'text-slate-200'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-mono tabular-nums text-slate-400 font-medium">
                        {dayEvents.length} việc
                      </span>
                    )}
                  </div>

                  {/* Badges preview */}
                  <div className="space-y-1 mt-1.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev, eIdx) => (
                      <div
                        key={eIdx}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium ${
                          ev.type === 'docket'
                            ? 'bg-blue-950/90 text-blue-300 border border-blue-800/80'
                            : 'bg-slate-850 text-slate-300 border border-slate-700/60'
                        }`}
                        title={`${ev.code}: ${ev.title}`}
                      >
                        {ev.code}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-mono tabular-nums pl-1">
                        +{dayEvents.length - 2} việc khác
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector Sidebar (4 cols) - Harmonized Dark Theme */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between text-slate-100">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Công việc ngày {selectedDateStr}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(selectedDateStr).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/70 px-2 py-0.5 rounded-md tabular-nums">
                {selectedEvents.length} mốc hạn
              </span>
            </div>

            {/* List for selected date */}
            {selectedEvents.length === 0 ? (
              <div className="py-14 text-center text-slate-500 text-xs">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                Không có thời hạn nào trong ngày này
              </div>
            ) : (
              <div className="space-y-2.5 mt-3 max-h-[440px] overflow-y-auto pr-1">
                {selectedEvents.map((ev, idx) => {
                  const isDone = ev.status === 'completed';
                  const googleCalUrl = getGoogleCalendarUrl({
                    title: `[${ev.code}] ${ev.title}`,
                    details: `Mã: ${ev.code}\\nHồ sơ: ${ev.docket.code} - ${ev.docket.title}\\nNgười phụ trách: ${ev.step?.assignee || ev.docket.leadAssignee}`,
                    dueDate: selectedDateStr,
                  });

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                        isDone
                          ? 'bg-slate-800/40 border-slate-800 opacity-60'
                          : ev.isOverdue
                          ? 'bg-rose-950/30 border-rose-900/60 text-rose-100'
                          : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-white tabular-nums">
                          {ev.code}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                          ev.type === 'docket' 
                            ? 'bg-blue-950 text-blue-300 border-blue-800/80' 
                            : 'bg-slate-700 text-slate-200 border-slate-600/60'
                        }`}>
                          {ev.type === 'docket' ? 'Hạn hồ sơ' : 'Bước con'}
                        </span>
                      </div>

                      <div className={`font-medium line-clamp-2 leading-relaxed ${isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {ev.title}
                      </div>

                      <div className="text-[11px] text-slate-400 truncate">
                        Thuộc: {ev.docket.code} · {ev.docket.title}
                      </div>

                      <div className="pt-2 border-t border-slate-750/70 flex items-center justify-between">
                        {ev.type === 'step' && ev.step ? (
                          <button
                            onClick={() => onToggleStepStatus(ev.docket.id, ev.step!.id)}
                            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-cyan-300 transition-colors"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            {isDone ? 'Đã xong' : 'Đánh dấu xong'}
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenDocketDetail(ev.docket)}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
                          >
                            Xem hồ sơ mẹ
                          </button>
                        )}

                        <a
                          href={googleCalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
                          title="Mở Google Calendar để thêm sự kiện"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Google Cal
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 leading-normal">
            * Nhấn <span className="text-slate-300 font-semibold">Tải tệp Lịch (.ics)</span> ở trên để đồng bộ hàng loạt vào Apple Calendar, Google Calendar hoặc Outlook.
          </div>
        </div>
      </div>
    </div>
  );
};
