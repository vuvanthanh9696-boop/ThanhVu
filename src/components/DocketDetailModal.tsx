import React, { useState, useRef } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Building2, 
  Tag, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Clock, 
  Paperclip, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Printer, 
  CalendarCheck, 
  Check, 
  HardDrive, 
  FolderOpen, 
  Copy, 
  FileText, 
  CheckCheck, 
  UploadCloud, 
  Info,
  ChevronRight
} from 'lucide-react';
import { 
  Docket, 
  DocketStep, 
  DocketAttachment,
  DocketStatus, 
  StepStatus,
  DOCKET_STATUS_CONFIG, 
  PRIORITY_CONFIG, 
  STEP_STATUS_CONFIG 
} from '../types';
import { downloadICSFile, getGoogleCalendarUrl } from '../utils/calendarSync';

interface DocketDetailModalProps {
  docket: Docket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateDocket: (updated: Docket) => void;
  onEditDocket: (docket: Docket) => void;
  onDeleteDocket: (docketId: string) => void;
}

export const DocketDetailModal: React.FC<DocketDetailModalProps> = ({
  docket,
  isOpen,
  onClose,
  onUpdateDocket,
  onEditDocket,
  onDeleteDocket,
}) => {
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepAssignee, setNewStepAssignee] = useState('');
  const [newStepDueDate, setNewStepDueDate] = useState('');

  // Local file linking states
  const [isEditingLocalPath, setIsEditingLocalPath] = useState(false);
  const [localPathInput, setLocalPathInput] = useState('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Attachment management states (Linking to local files on computer)
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const [newAttName, setNewAttName] = useState('');
  const [newAttPath, setNewAttPath] = useState('');
  const [editingAttId, setEditingAttId] = useState<string | null>(null);
  const [editingAttPath, setEditingAttPath] = useState('');
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !docket) return null;

  const totalSteps = docket.steps.length;
  const completedSteps = docket.steps.filter((s) => s.status === 'completed').length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const statusConfig = DOCKET_STATUS_CONFIG[docket.status] || DOCKET_STATUS_CONFIG.in_progress;
  const priorityConfig = PRIORITY_CONFIG[docket.priority] || PRIORITY_CONFIG.medium;

  const isOverdue =
    docket.status !== 'completed' &&
    new Date(docket.dueDate).getTime() < new Date(new Date().toISOString().split('T')[0]).getTime();

  // Format local path to browser URL
  const getFormattedFileUrl = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    if (path.startsWith('file://')) {
      return path;
    }
    // Convert Windows path: D:\HoSo\file.pdf -> file:///D:/HoSo/file.pdf
    const normalized = path.replace(/\\/g, '/');
    if (/^[a-zA-Z]:/.test(normalized)) {
      return `file:///${normalized}`;
    }
    if (normalized.startsWith('/')) {
      return `file://${normalized}`;
    }
    return `file:///${normalized}`;
  };

  // Open local file or folder on user's computer
  const handleOpenLocalFile = () => {
    const targetPath = docket.localFilePath || '';
    if (!targetPath && !previewBlobUrl) {
      setIsEditingLocalPath(true);
      return;
    }

    const openUrl = previewBlobUrl || getFormattedFileUrl(targetPath);

    // Try opening URL in browser
    try {
      window.open(openUrl, '_blank');
    } catch {
      // Browser might block direct file navigation
    }

    // Always copy the file path to clipboard so the user can paste into Windows File Explorer / Run / Mac Finder
    if (targetPath) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(targetPath).catch(() => {});
      }
      setCopiedNotification(
        `Đã mở tệp và sao chép đường dẫn: "${targetPath}". Nếu trình duyệt chặn mở tệp cục bộ, bạn hãy dán (Ctrl+V) vào thanh địa chỉ File Explorer hoặc hộp thoại Run (Win+R) để mở ngay!`
      );
      setTimeout(() => setCopiedNotification(null), 7000);
    }
  };

  // Copy path directly
  const handleCopyPath = () => {
    if (!docket.localFilePath) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(docket.localFilePath).catch(() => {});
    }
    setCopiedNotification(`Đã sao chép đường dẫn vào bộ nhớ tạm: "${docket.localFilePath}"`);
    setTimeout(() => setCopiedNotification(null), 4000);
  };

  // Handle local file selection from computer (offline file picker)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local blob URL for instant preview even offline
    const objectUrl = URL.createObjectURL(file);
    setPreviewBlobUrl(objectUrl);

    // Save filename and simulated local path if not provided
    const newFileName = file.name;
    const defaultLocalPath = docket.localFilePath || `D:\\HoSoCongViec\\${docket.code}\\${newFileName}`;

    const updatedDocket: Docket = {
      ...docket,
      localFilePath: defaultLocalPath,
      localFileName: newFileName,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDocket(updatedDocket);
    setCopiedNotification(`Đã liên kết tệp: "${newFileName}". Sẵn sàng mở trực tiếp!`);
    setTimeout(() => setCopiedNotification(null), 5000);
  };

  // Save manually entered local path
  const handleSaveLocalPath = () => {
    const trimmed = localPathInput.trim();
    if (!trimmed) return;

    // Extract file name from path
    const parts = trimmed.split(/[\\/]/);
    const fileName = parts[parts.length - 1] || 'HoSoGoc';

    const updatedDocket: Docket = {
      ...docket,
      localFilePath: trimmed,
      localFileName: fileName,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDocket(updatedDocket);
    setIsEditingLocalPath(false);
    setLocalPathInput('');
    setCopiedNotification(`Đã lưu đường dẫn hồ sơ gốc trên máy tính!`);
    setTimeout(() => setCopiedNotification(null), 4000);
  };

  // Helper to get effective local path of an attachment on the user's computer
  const getAttachmentPath = (att: DocketAttachment): string => {
    if (att.localPath) return att.localPath;
    if (docket.localFilePath) {
      const dir = docket.localFilePath.replace(/[^\\/]+$/, '');
      return `${dir}${att.name}`;
    }
    return `D:\\HoSoCongViec\\${docket.code}\\${att.name}`;
  };

  // Open an individual attachment on local computer
  const handleOpenAttachment = (att: DocketAttachment) => {
    const targetPath = getAttachmentPath(att);
    const openUrl = att.url || getFormattedFileUrl(targetPath);

    try {
      window.open(openUrl, '_blank');
    } catch {
      // Browser security might block file navigation
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(targetPath).catch(() => {});
    }

    setCopiedNotification(
      `Đã kích hoạt liên kết tài liệu: "${att.name}". Đường dẫn máy tính: "${targetPath}" đã được sao chép! Bạn có thể dán (Ctrl+V) vào thanh địa chỉ File Explorer hoặc Run (Win+R) để mở trên máy tính offline!`
    );
    setTimeout(() => setCopiedNotification(null), 7000);
  };

  // Copy attachment path
  const handleCopyAttachmentPath = (att: DocketAttachment) => {
    const targetPath = getAttachmentPath(att);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(targetPath).catch(() => {});
    }
    setCopiedNotification(`Đã sao chép đường dẫn tài liệu vào bộ nhớ tạm: "${targetPath}"`);
    setTimeout(() => setCopiedNotification(null), 4000);
  };

  // Add attachment from local computer file dialog
  const handleAddAttachmentFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const fileName = file.name;
    const fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const defaultPath = docket.localFilePath
      ? `${docket.localFilePath.replace(/[^\\/]+$/, '')}${fileName}`
      : `D:\\HoSoCongViec\\${docket.code}\\${fileName}`;

    const newAttachment: DocketAttachment = {
      id: `att-${Date.now()}`,
      name: fileName,
      size: fileSize,
      url: fileUrl,
      localPath: defaultPath,
      addedAt: new Date().toISOString().split('T')[0],
    };

    const updatedDocket: Docket = {
      ...docket,
      attachments: [...(docket.attachments || []), newAttachment],
      updatedAt: new Date().toISOString(),
    };

    onUpdateDocket(updatedDocket);
    setCopiedNotification(`Đã liên kết tài liệu máy tính: "${fileName}"!`);
    setTimeout(() => setCopiedNotification(null), 5000);
    if (attachmentFileInputRef.current) attachmentFileInputRef.current.value = '';
  };

  // Save manual attachment
  const handleSaveManualAttachment = () => {
    if (!newAttName.trim()) return;
    const path = newAttPath.trim() || `D:\\HoSoCongViec\\${docket.code}\\${newAttName.trim()}`;
    const newAttachment: DocketAttachment = {
      id: `att-${Date.now()}`,
      name: newAttName.trim(),
      size: '1.5 MB',
      localPath: path,
      addedAt: new Date().toISOString().split('T')[0],
    };

    const updatedDocket: Docket = {
      ...docket,
      attachments: [...(docket.attachments || []), newAttachment],
      updatedAt: new Date().toISOString(),
    };

    onUpdateDocket(updatedDocket);
    setShowAddAttachment(false);
    setNewAttName('');
    setNewAttPath('');
    setCopiedNotification(`Đã thêm tài liệu liên kết máy tính cá nhân!`);
    setTimeout(() => setCopiedNotification(null), 4000);
  };

  // Save edited attachment path
  const handleSaveEditedAttachmentPath = (attId: string) => {
    if (!editingAttPath.trim()) return;
    const updatedAttachments = (docket.attachments || []).map((att) => {
      if (att.id !== attId) return att;
      return {
        ...att,
        localPath: editingAttPath.trim(),
      };
    });

    const updatedDocket: Docket = {
      ...docket,
      attachments: updatedAttachments,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDocket(updatedDocket);
    setEditingAttId(null);
    setEditingAttPath('');
    setCopiedNotification(`Đã cập nhật đường dẫn tài liệu trên máy tính!`);
    setTimeout(() => setCopiedNotification(null), 4000);
  };

  // Delete attachment
  const handleDeleteAttachment = (attId: string) => {
    const updatedAttachments = (docket.attachments || []).filter((a) => a.id !== attId);
    const updatedDocket: Docket = {
      ...docket,
      attachments: updatedAttachments,
      updatedAt: new Date().toISOString(),
    };
    onUpdateDocket(updatedDocket);
    setCopiedNotification('Đã gỡ tài liệu khỏi hồ sơ.');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Toggle step status
  const handleToggleStep = (stepId: string) => {
    const updatedSteps = docket.steps.map((s) => {
      if (s.id !== stepId) return s;
      const willBeCompleted = s.status !== 'completed';
      return {
        ...s,
        status: (willBeCompleted ? 'completed' : 'in_progress') as StepStatus,
        completedAt: willBeCompleted ? new Date().toISOString() : undefined,
      };
    });

    const allDone = updatedSteps.length > 0 && updatedSteps.every((s) => s.status === 'completed');
    const updatedDocket: Docket = {
      ...docket,
      steps: updatedSteps,
      status: allDone ? 'completed' : docket.status === 'completed' ? 'in_progress' : docket.status,
      completedAt: allDone ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDocket(updatedDocket);
  };

  // Change individual step status
  const handleStepStatusChange = (stepId: string, status: StepStatus) => {
    const updatedSteps = docket.steps.map((s) =>
      s.id === stepId
        ? {
            ...s,
            status,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined,
          }
        : s
    );

    const allDone = updatedSteps.length > 0 && updatedSteps.every((s) => s.status === 'completed');
    const updatedDocket: Docket = {
      ...docket,
      steps: updatedSteps,
      status: allDone ? 'completed' : docket.status === 'completed' ? 'in_progress' : docket.status,
      completedAt: allDone ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDocket(updatedDocket);
  };

  // Change docket main status
  const handleDocketStatusChange = (newStatus: DocketStatus) => {
    const updatedDocket: Docket = {
      ...docket,
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
    onUpdateDocket(updatedDocket);
  };

  // Add quick step
  const handleAddQuickStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;

    const nextOrder = docket.steps.length + 1;
    const newStep: DocketStep = {
      id: `step-${Date.now()}`,
      stepCode: `${docket.code}-B${String(nextOrder).padStart(2, '0')}`,
      title: newStepTitle.trim(),
      assignee: newStepAssignee.trim() || docket.leadAssignee,
      dueDate: newStepDueDate || docket.dueDate,
      status: 'todo',
      priority: docket.priority,
      order: nextOrder,
    };

    const updatedDocket: Docket = {
      ...docket,
      steps: [...docket.steps, newStep],
      status: docket.status === 'completed' ? 'in_progress' : docket.status,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDocket(updatedDocket);
    setNewStepTitle('');
    setNewStepAssignee('');
    setNewStepDueDate('');
    setShowAddStep(false);
  };

  // Delete step
  const handleDeleteStep = (stepId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bước công việc này?')) return;
    const updatedSteps = docket.steps.filter((s) => s.id !== stepId);
    onUpdateDocket({
      ...docket,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    });
  };

  // Google Calendar URL for main docket
  const googleCalUrl = getGoogleCalendarUrl({
    title: `[Hồ sơ ${docket.code}] ${docket.title}`,
    details: `Mã hồ sơ: ${docket.code}\nChủ trì: ${docket.leadAssignee}\nĐơn vị: ${docket.department}\nSố bước: ${totalSteps}\nGhi chú: ${docket.notes || ''}`,
    dueDate: docket.dueDate,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Hidden file input for local computer file selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg"
      />

      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        {/* Header Bar - Modern 3D Executive */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/90 border border-cyan-700/80 px-3 py-1 rounded-xl badge-3d tabular-nums">
              {docket.code}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border badge-3d ${
                docket.priority === 'urgent'
                  ? 'bg-rose-950/90 text-rose-300 border-rose-700/70 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                  : docket.priority === 'high'
                  ? 'bg-amber-950/90 text-amber-300 border-amber-700/70'
                  : 'bg-blue-950/90 text-blue-300 border-blue-700/70'
              }`}>
                {priorityConfig.label}
              </span>
              <span className="text-[11px] font-medium text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-700">
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditDocket(docket)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              Sửa
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800 cursor-pointer"
              title="In phiếu hồ sơ"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notification Alert Bar (when path copied or opened) */}
          {copiedNotification && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/90 to-teal-950/90 border border-emerald-500/80 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5 shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-in fade-in duration-200">
              <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {copiedNotification}
              </div>
              <button 
                onClick={() => setCopiedNotification(null)}
                className="text-emerald-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Title & Metadata Header */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white leading-snug">
              {docket.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300">{docket.department}</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-300">{docket.category}</span>
              </span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1.5 font-mono tabular-nums">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Khởi tạo: {docket.startDate}
              </span>
              <span className="text-slate-600">·</span>
              <span className={`flex items-center gap-1.5 font-mono tabular-nums font-semibold ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                <Clock className="w-3.5 h-3.5" />
                Hạn chót: {docket.dueDate} {isOverdue && '(Quá hạn)'}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION ĐẶC BIỆT: HỒ SƠ GỐC TRÊN MÁY TÍNH CÁ NHÂN (CHẾ ĐỘ OFFLINE)       */}
          {/* ========================================================================= */}
          <div className="card-3d-interactive p-4 md:p-5 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-900 space-y-4 shadow-[0_8px_24px_-4px_rgba(6,182,212,0.15)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      Hồ sơ gốc trên máy tính
                    </h3>
                    <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                      Offline Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Liên kết trực tiếp tới tài liệu gốc lưu trong ổ đĩa cứng của bạn (PDF, Word, Excel...)
                  </p>
                </div>
              </div>

              {/* Main Action Button to open local file */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenLocalFile}
                  title="Mở hồ sơ gốc trong ổ đĩa máy tính"
                  className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center gap-2 transition-all cursor-pointer badge-3d shrink-0 active:scale-95"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Mở hồ sơ gốc trên máy tính</span>
                </button>
              </div>
            </div>

            {/* Path display or path configuration */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
              {docket.localFilePath ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {docket.localFileName || 'Tệp hồ sơ gốc'}
                        </span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.2 rounded font-mono">
                          Đã liên kết
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-cyan-300/80 truncate select-all" title={docket.localFilePath}>
                        {docket.localFilePath}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={handleCopyPath}
                      className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Sao chép đường dẫn"
                    >
                      <Copy className="w-3 h-3 text-cyan-400" />
                      <span>Copy link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Nạp hoặc đổi tệp khác từ máy tính"
                    >
                      <UploadCloud className="w-3 h-3 text-blue-400" />
                      <span>Chọn tệp khác</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLocalPathInput(docket.localFilePath || '');
                        setIsEditingLocalPath(!isEditingLocalPath);
                      }}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      {isEditingLocalPath ? 'Đóng' : 'Sửa đường dẫn'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-slate-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Chưa liên kết đường dẫn hồ sơ gốc trên ổ cứng máy tính của bạn.</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Chọn tệp từ máy tính</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingLocalPath(true)}
                      className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    >
                      Nhập đường dẫn thủ công
                    </button>
                  </div>
                </div>
              )}

              {/* Inline Edit Path Box */}
              {isEditingLocalPath && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-300">
                    Nhập đường dẫn thư mục hoặc tệp trên máy tính của bạn:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={localPathInput}
                      onChange={(e) => setLocalPathInput(e.target.value)}
                      placeholder="Ví dụ: D:\HoSoCongViec\HS039.pdf hoặc C:\Users\Admin\Documents\QuyetDinh.docx"
                      className="flex-1 px-3 py-1.5 text-xs font-mono inner-groove rounded-xl text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveLocalPath}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all cursor-pointer"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingLocalPath(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Hủy
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Gợi ý: Bạn có thể sao chép đường dẫn từ thanh địa chỉ File Explorer của Windows rồi dán vào đây.
                  </p>
                </div>
              )}
            </div>

            {/* Offline Usage Tip */}
            <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-cyan-300 font-semibold">Cơ chế hoạt động khi dùng Offline:</strong> Khi bạn tải mã nguồn web này về máy tính và chạy offline, nút trên sẽ tự động kích hoạt tệp gốc trong máy tính của bạn và sao chép sẵn đường dẫn để bạn dán nhanh vào File Explorer hoặc phần mềm đọc tài liệu bất cứ lúc nào.
              </p>
            </div>
          </div>

          {/* Progress Banner */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                Tiến độ xử lý quy trình ({completedSteps}/{totalSteps} bước hoàn thành)
              </span>
              <span className="font-mono font-bold text-cyan-400 text-sm tabular-nums">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Chủ trì xử lý:</span>
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                {docket.leadAssignee}
              </span>
              {docket.collaborators.length > 0 && (
                <div className="text-[11px] text-slate-400 mt-1">
                  Phối hợp: {docket.collaborators.join(', ')}
                </div>
              )}
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Đổi trạng thái nhanh:</span>
              <select
                value={docket.status}
                onChange={(e) => handleDocketStatusChange(e.target.value as DocketStatus)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg font-medium text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="pending">Chờ tiếp nhận</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="review">Đang thẩm định / Trình ký</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="delayed">Trễ hạn / Quá hạn</option>
              </select>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Đồng bộ lịch & Nhắc việc:</span>
              <div className="flex items-center gap-2">
                <a
                  href={googleCalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 rounded-lg border border-cyan-800/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Google Calendar
                </a>
                <button
                  onClick={() => downloadICSFile([docket], `Lich_${docket.code}.ics`)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 rounded-lg border border-emerald-800/80 transition-colors cursor-pointer"
                >
                  <CalendarCheck className="w-3 h-3" />
                  Xuất .ics
                </button>
              </div>
            </div>
          </div>

          {/* Notes & Guidance */}
          {docket.notes && (
            <div className="p-3.5 bg-amber-950/30 border border-amber-700/60 rounded-xl text-xs text-amber-200 space-y-1">
              <span className="font-semibold block text-amber-300">Ý kiến chỉ đạo & Ghi chú hồ sơ:</span>
              <p className="leading-relaxed">{docket.notes}</p>
            </div>
          )}

          {/* Workflow Steps Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Quy trình từng bước con ({totalSteps} bước)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStep(!showAddStep)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 rounded-lg border border-cyan-800/80 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddStep ? 'Đóng form' : 'Thêm bước con'}
              </button>
            </div>

            {/* Quick Add Step Form */}
            {showAddStep && (
              <form
                onSubmit={handleAddQuickStep}
                className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3"
              >
                <div className="text-xs font-semibold text-cyan-300">
                  Thêm bước công việc mới vào hồ sơ {docket.code}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <div className="md:col-span-6">
                    <input
                      type="text"
                      value={newStepTitle}
                      onChange={(e) => setNewStepTitle(e.target.value)}
                      placeholder="Nội dung bước con..."
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md focus:border-cyan-500 focus:outline-hidden text-white"
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={newStepAssignee}
                      onChange={(e) => setNewStepAssignee(e.target.value)}
                      placeholder={`Người làm (mặc định: ${docket.leadAssignee})`}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md focus:border-cyan-500 focus:outline-hidden text-white"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="date"
                      value={newStepDueDate}
                      onChange={(e) => setNewStepDueDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-md focus:border-cyan-500 focus:outline-hidden text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStep(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:bg-slate-800 rounded-md"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md cursor-pointer"
                  >
                    Lưu bước mới
                  </button>
                </div>
              </form>
            )}

            {/* Steps List */}
            <div className="space-y-2">
              {docket.steps.map((step) => {
                const isStepDone = step.status === 'completed';
                const stepConfig = STEP_STATUS_CONFIG[step.status] || STEP_STATUS_CONFIG.todo;
                const pConfig = PRIORITY_CONFIG[step.priority] || PRIORITY_CONFIG.medium;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all ${
                      isStepDone
                        ? 'bg-slate-950/60 border-slate-800/60 opacity-70'
                        : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleStep(step.id)}
                      className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors shrink-0 cursor-pointer"
                    >
                      {isStepDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-cyan-400" />
                      )}
                    </button>

                    {/* Step Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-cyan-400 tabular-nums">
                          {step.stepCode}
                        </span>

                        <span className="text-slate-600">·</span>

                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          step.priority === 'urgent'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {pConfig.label}
                        </span>

                        <span className="text-slate-600">·</span>

                        <span className="text-xs text-slate-400">
                          Người làm: <strong className="font-semibold text-slate-200">{step.assignee}</strong>
                        </span>

                        <span className="text-slate-600">·</span>

                        <span className="text-xs font-mono text-slate-400 tabular-nums">
                          Hạn: {step.dueDate}
                        </span>
                      </div>

                      <div className={`text-xs font-medium mt-1 leading-relaxed ${isStepDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {step.title}
                      </div>

                      {step.notes && (
                        <div className="text-[11px] text-slate-400 mt-1 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          Lưu ý: {step.notes}
                        </div>
                      )}
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={step.status}
                        onChange={(e) => handleStepStatusChange(step.id, e.target.value as StepStatus)}
                        className="text-xs px-2 py-1 rounded-md border font-medium focus:outline-hidden bg-slate-900 text-slate-200 border-slate-700 cursor-pointer"
                      >
                        <option value="todo">Chưa làm</option>
                        <option value="in_progress">Đang làm</option>
                        <option value="completed">Đã xong</option>
                        <option value="blocked">Vướng mắc</option>
                      </select>

                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                        title="Xóa bước này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attachments & Files - Direct Links to Computer Files (Offline Support) */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                  Đường dẫn tài liệu & Hồ sơ trên máy tính ({docket.attachments?.length || 0})
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nhấn vào liên kết để mở trực tiếp tài liệu gốc đang lưu trữ trên máy tính của bạn khi làm việc offline.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={attachmentFileInputRef}
                  onChange={handleAddAttachmentFromFile}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => attachmentFileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/80 rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Nạp tệp từ máy...
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddAttachment(!showAddAttachment)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddAttachment ? 'Đóng' : 'Nhập đường dẫn'}
                </button>
              </div>
            </div>

            {/* Quick Add Manual Attachment Form */}
            {showAddAttachment && (
              <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5" />
                  Thêm liên kết tài liệu từ thư mục máy tính
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newAttName}
                    onChange={(e) => setNewAttName(e.target.value)}
                    placeholder="Tên tài liệu (vd: Nghi_Dinh_15.pdf)..."
                    className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-cyan-500"
                  />
                  <input
                    type="text"
                    value={newAttPath}
                    onChange={(e) => setNewAttPath(e.target.value)}
                    placeholder="Đường dẫn ổ đĩa (vd: D:\HoSoCongViec\Nghi_Dinh_15.pdf)..."
                    className="px-2.5 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAttachment(false);
                      setNewAttName('');
                      setNewAttPath('');
                    }}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveManualAttachment}
                    disabled={!newAttName.trim()}
                    className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    Lưu liên kết
                  </button>
                </div>
              </div>
            )}

            {/* Attachments List */}
            {(!docket.attachments || docket.attachments.length === 0) ? (
              <div className="p-4 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                Chưa có tài liệu đính kèm nào. Nhấn "Nạp tệp từ máy..." để thêm tệp trực tiếp từ máy tính cá nhân.
              </div>
            ) : (
              <div className="space-y-2.5">
                {docket.attachments.map((att) => {
                  const effectivePath = getAttachmentPath(att);
                  const isEditingThis = editingAttId === att.id;

                  return (
                    <div
                      key={att.id}
                      className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* File Name & Path */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="p-1 rounded-md bg-blue-950/80 border border-blue-800/80 text-blue-300">
                              <FileText className="w-3.5 h-3.5" />
                            </span>
                            <span className="font-bold text-xs text-slate-100 truncate" title={att.name}>
                              {att.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              {att.size || '1.5 MB'}
                            </span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                              <HardDrive className="w-2.5 h-2.5" />
                              Tệp máy tính (Offline)
                            </span>
                          </div>

                          {/* Local Computer Path display */}
                          {!isEditingThis ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900/90 px-2 py-1 rounded-md border border-slate-800/80 select-all truncate">
                              <FolderOpen className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span className="truncate">{effectivePath}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={editingAttPath}
                                onChange={(e) => setEditingAttPath(e.target.value)}
                                className="flex-1 px-2.5 py-1 text-xs font-mono bg-slate-900 border border-cyan-500 rounded-md text-white focus:outline-hidden"
                                placeholder="D:\HoSoCongViec\..."
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEditedAttachmentPath(att.id)}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
                              >
                                Lưu
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingAttId(null);
                                  setEditingAttPath('');
                                }}
                                className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                              >
                                Hủy
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Direct Action Link & Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Main Link to Personal Computer Document */}
                          <button
                            type="button"
                            onClick={() => handleOpenAttachment(att)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-sm transition-all cursor-pointer badge-3d active:scale-95"
                            title="Kích hoạt mở tệp và sao chép đường dẫn máy tính"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Mở tệp trên máy</span>
                          </button>

                          {/* Copy Path Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyAttachmentPath(att)}
                            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 cursor-pointer"
                            title="Sao chép đường dẫn vào bộ nhớ tạm (để dán vào File Explorer)"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Path Button */}
                          {!isEditingThis && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAttId(att.id);
                                setEditingAttPath(effectivePath);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 cursor-pointer"
                              title="Sửa đường dẫn trên máy tính"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Attachment Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(att.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors border border-slate-800 cursor-pointer"
                            title="Xóa tài liệu này"
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
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <button
            onClick={() => onDeleteDocket(docket.id)}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium hover:underline cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa hồ sơ này
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
