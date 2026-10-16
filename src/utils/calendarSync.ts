import { Docket, DocketStep } from '../types';

/**
 * Format a Date or date string to YYYYMMDD
 */
function formatDateToICS(dateStr: string): string {
  const clean = dateStr.replace(/-/g, '');
  return clean.length >= 8 ? clean.substring(0, 8) : clean;
}

/**
 * Export single docket or multiple dockets to an iCalendar (.ics) string
 */
export function generateICSContent(dockets: Docket[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DocuFlow//QuanLyHoSoCongViec//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Lịch Hồ Sơ Công Việc - DocuFlow',
    'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
  ];

  dockets.forEach((docket) => {
    // Event for the Docket due date
    const dStartDate = formatDateToICS(docket.startDate || docket.dueDate);
    const dDueDate = formatDateToICS(docket.dueDate);
    const summary = `[Hạn Hồ sơ] ${docket.code}: ${docket.title}`;
    const desc = `Mã hồ sơ: ${docket.code}\\nNgười phụ trách: ${docket.leadAssignee}\\nĐơn vị: ${docket.department}\\nĐộ ưu tiên: ${docket.priority}\\nTrạng thái: ${docket.status}\\nGhi chú: ${docket.notes || 'Không có'}`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:docket-${docket.id}@docuflow.local`);
    lines.push(`DTSTAMP:${formatDateToICS(new Date().toISOString().split('T')[0])}T000000Z`);
    lines.push(`DTSTART;VALUE=DATE:${dStartDate}`);
    lines.push(`DTEND;VALUE=DATE:${dDueDate}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${desc}`);
    lines.push(`STATUS:${docket.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`);
    lines.push('END:VEVENT');

    // Events for individual sub-steps with deadlines
    docket.steps.forEach((step) => {
      if (!step.dueDate) return;
      const stepDue = formatDateToICS(step.dueDate);
      const stepSummary = `[Bước con] ${step.stepCode}: ${step.title} (Hồ sơ ${docket.code})`;
      const stepDesc = `Bước: ${step.stepCode}\\nThuộc hồ sơ: ${docket.code} - ${docket.title}\\nNgười thực hiện: ${step.assignee}\\nTrạng thái: ${step.status}\\nGhi chú: ${step.notes || ''}`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:step-${step.id}@docuflow.local`);
      lines.push(`DTSTAMP:${formatDateToICS(new Date().toISOString().split('T')[0])}T000000Z`);
      lines.push(`DTSTART;VALUE=DATE:${stepDue}`);
      lines.push(`DTEND;VALUE=DATE:${stepDue}`);
      lines.push(`SUMMARY:${stepSummary}`);
      lines.push(`DESCRIPTION:${stepDesc}`);
      lines.push(`STATUS:${step.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`);
      lines.push('END:VEVENT');
    });
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger download of .ics file in browser
 */
export function downloadICSFile(dockets: Docket[], filename = 'Lich_Cong_Viec_DocuFlow.ics') {
  const icsData = generateICSContent(dockets);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar Web Add-Event URL
 */
export function getGoogleCalendarUrl(params: {
  title: string;
  details: string;
  location?: string;
  dueDate: string;
}): string {
  const cleanDate = params.dueDate.replace(/-/g, '');
  // Format as full day event: YYYYMMDD/YYYYMMDD
  const dates = `${cleanDate}/${cleanDate}`;

  const searchParams = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    dates: dates,
    details: params.details,
    location: params.location || 'Văn phòng / Hệ thống DocuFlow',
  });

  return `https://calendar.google.com/calendar/render?${searchParams.toString()}`;
}
