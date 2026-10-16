import { Docket, SmartNotification } from '../types';

/**
 * Compute smart notifications from active dockets and sub-steps
 */
export function computeSmartNotifications(dockets: Docket[]): SmartNotification[] {
  const notifications: SmartNotification[] = [];
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date(todayStr).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  dockets.forEach((docket) => {
    if (docket.status === 'completed') return;

    // Check Docket Due Date
    if (docket.dueDate) {
      const dueTime = new Date(docket.dueDate).getTime();
      const diffDays = Math.round((dueTime - now) / oneDayMs);

      if (diffDays < 0) {
        notifications.push({
          id: `notif-docket-overdue-${docket.id}`,
          title: `Hồ sơ quá hạn: ${docket.code}`,
          message: `Hồ sơ "${docket.title}" đã quá hạn ${Math.abs(diffDays)} ngày (Hạn: ${docket.dueDate}). Cần rà soát xử lý ngay.`,
          type: 'overdue',
          docketId: docket.id,
          docketCode: docket.code,
          timestamp: new Date().toISOString(),
          read: false,
        });
      } else if (diffDays === 0) {
        notifications.push({
          id: `notif-docket-today-${docket.id}`,
          title: `Hồ sơ đến hạn hôm nay: ${docket.code}`,
          message: `Hồ sơ "${docket.title}" có hạn hoàn tất trong ngày hôm nay.`,
          type: 'due_today',
          docketId: docket.id,
          docketCode: docket.code,
          timestamp: new Date().toISOString(),
          read: false,
        });
      } else if (diffDays <= 2) {
        notifications.push({
          id: `notif-docket-upcoming-${docket.id}`,
          title: `Hồ sơ sắp đến hạn: ${docket.code}`,
          message: `Hồ sơ "${docket.title}" còn ${diffDays} ngày nữa là đến hạn hoàn thành (${docket.dueDate}).`,
          type: 'upcoming',
          docketId: docket.id,
          docketCode: docket.code,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    }

    // Check Sub-steps
    docket.steps.forEach((step) => {
      if (step.status === 'completed' || !step.dueDate) return;

      const stepTime = new Date(step.dueDate).getTime();
      const diffDays = Math.round((stepTime - now) / oneDayMs);

      if (diffDays < 0) {
        notifications.push({
          id: `notif-step-overdue-${step.id}`,
          title: `Bước công việc quá hạn: ${step.stepCode}`,
          message: `Bước "${step.title}" thuộc hồ sơ ${docket.code} đã quá hạn ${Math.abs(diffDays)} ngày. Phụ trách: ${step.assignee}.`,
          type: 'overdue',
          docketId: docket.id,
          docketCode: docket.code,
          stepId: step.id,
          timestamp: new Date().toISOString(),
          read: false,
        });
      } else if (diffDays === 0) {
        notifications.push({
          id: `notif-step-today-${step.id}`,
          title: `Bước công việc đến hạn hôm nay: ${step.stepCode}`,
          message: `Bước "${step.title}" thuộc hồ sơ ${docket.code} cần hoàn tất trong ngày. Người làm: ${step.assignee}.`,
          type: 'due_today',
          docketId: docket.id,
          docketCode: docket.code,
          stepId: step.id,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    });
  });

  return notifications;
}

/**
 * Web Notification API helper
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  return await Notification.requestPermission();
}

export function sendBrowserNotification(title: string, body: string) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch {
      // quiet fail
    }
  }
}
