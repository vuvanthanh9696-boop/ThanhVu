export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type DocketStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'delayed';

export type StepStatus = 'todo' | 'in_progress' | 'completed' | 'blocked';

export interface DocketStep {
  id: string;
  stepCode: string; // e.g. HS-01-B01
  title: string;
  assignee: string;
  dueDate: string; // YYYY-MM-DD
  status: StepStatus;
  priority: Priority;
  notes?: string;
  completedAt?: string;
  order: number;
}

export interface DocketAttachment {
  id: string;
  name: string;
  size?: string;
  url?: string;
  localPath?: string; // Path to original document on local computer (e.g. D:\HoSo\QuyetDinh.pdf)
  addedAt: string;
}

export interface Docket {
  id: string;
  code: string; // Unique index, e.g. HS-2026-001
  title: string;
  category: string;
  department: string;
  leadAssignee: string;
  collaborators: string[];
  priority: Priority;
  status: DocketStatus;
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  completedAt?: string;
  notes?: string;
  tags: string[];
  attachments: DocketAttachment[];
  steps: DocketStep[];
  localFilePath?: string; // Path or URI to local file/folder on computer (e.g. D:\HoSo\HS01.pdf or file:///D:/...)
  localFileName?: string; // Original filename on user's computer
  createdAt: string;
  updatedAt: string;
}

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: 'overdue' | 'due_today' | 'upcoming' | 'info';
  docketId: string;
  docketCode: string;
  stepId?: string;
  timestamp: string;
  read: boolean;
}

export type ActiveTab = 'today' | 'dockets' | 'analytics' | 'calendar';

export const PRIORITY_CONFIG: Record<Priority, { label: string; textClass: string; bgClass: string; borderClass: string }> = {
  urgent: {
    label: 'Hỏa tốc / Khẩn',
    textClass: 'text-rose-700',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
  },
  high: {
    label: 'Ưu tiên cao',
    textClass: 'text-amber-700',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
  },
  medium: {
    label: 'Bình thường',
    textClass: 'text-blue-700',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
  },
  low: {
    label: 'Thấp',
    textClass: 'text-slate-600',
    bgClass: 'bg-slate-100',
    borderClass: 'border-slate-200',
  },
};

export const DOCKET_STATUS_CONFIG: Record<DocketStatus, { label: string; textClass: string; bgClass: string; borderClass: string }> = {
  pending: {
    label: 'Chờ tiếp nhận',
    textClass: 'text-slate-700',
    bgClass: 'bg-slate-100',
    borderClass: 'border-slate-300',
  },
  in_progress: {
    label: 'Đang xử lý',
    textClass: 'text-blue-700',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
  },
  review: {
    label: 'Đang thẩm định / Trình ký',
    textClass: 'text-indigo-700',
    bgClass: 'bg-indigo-50',
    borderClass: 'border-indigo-200',
  },
  completed: {
    label: 'Đã hoàn thành',
    textClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
  },
  delayed: {
    label: 'Trễ hạn / Quá hạn',
    textClass: 'text-rose-700',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
  },
};

export const STEP_STATUS_CONFIG: Record<StepStatus, { label: string; textClass: string; bgClass: string; dotClass: string }> = {
  todo: {
    label: 'Chưa làm',
    textClass: 'text-slate-600',
    bgClass: 'bg-slate-100',
    dotClass: 'bg-slate-400',
  },
  in_progress: {
    label: 'Đang thực hiện',
    textClass: 'text-blue-700',
    bgClass: 'bg-blue-50',
    dotClass: 'bg-blue-500',
  },
  completed: {
    label: 'Đã hoàn thành',
    textClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50',
    dotClass: 'bg-emerald-500',
  },
  blocked: {
    label: 'Vướng mắc / Bổ sung',
    textClass: 'text-amber-700',
    bgClass: 'bg-amber-50',
    dotClass: 'bg-amber-500',
  },
};

export const DEFAULT_CATEGORIES = [
  'Dự án & Chuyển đổi số',
  'Hành chính - Văn phòng',
  'Kế hoạch - Tài chính',
  'Thanh tra - Pháp chế',
  'Nhân sự - Đào tạo',
  'Nghiệm thu - Bàn giao',
  'Văn bản & Tham mưu',
];

export const DEFAULT_DEPARTMENTS = [
  'Văn phòng Ban',
  'Phòng Kế hoạch & Đầu tư',
  'Phòng Công nghệ Thông tin',
  'Phòng Tài chính - Kế toán',
  'Ban Quản lý Dự án',
  'Bộ phận Tiếp nhận & Trả kết quả',
  'Đối tác tư vấn / Nhà thầu',
];
