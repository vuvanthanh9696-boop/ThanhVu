import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  Check, 
  Paperclip, 
  Calendar, 
  ArrowDown, 
  ArrowUp,
  FileText,
  Lightbulb,
  HardDrive,
  FolderOpen
} from 'lucide-react';
import { 
  Docket, 
  DocketStep, 
  Priority, 
  DocketStatus,
  DEFAULT_CATEGORIES, 
  DEFAULT_DEPARTMENTS,
  PRIORITY_CONFIG
} from '../types';
import { checkDuplicateDocketCode, suggestNextDocketCode } from '../utils/storage';
import { WORKFLOW_TEMPLATES } from '../utils/templates';

interface DocketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docket: Docket) => void;
  existingDockets: Docket[];
  editingDocket?: Docket | null;
}

export const DocketFormModal: React.FC<DocketFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingDockets,
  editingDocket,
}) => {
  const isEdit = !!editingDocket;

  // Form states
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [department, setDepartment] = useState(DEFAULT_DEPARTMENTS[0]);
  const [leadAssignee, setLeadAssignee] = useState('Nguyễn Văn Thành');
  const [collaboratorsText, setCollaboratorsText] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [status, setStatus] = useState<DocketStatus>('in_progress');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [localFilePath, setLocalFilePath] = useState('');
  const [localFileName, setLocalFileName] = useState('');
  const formFileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Dynamic Steps
  const [steps, setSteps] = useState<DocketStep[]>([]);
  
  // Real-time duplicate detection state
  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; matchedTitle?: string } | null>(null);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (editingDocket) {
      setCode(editingDocket.code);
      setTitle(editingDocket.title);
      setCategory(editingDocket.category);
      setDepartment(editingDocket.department);
      setLeadAssignee(editingDocket.leadAssignee);
      setCollaboratorsText(editingDocket.collaborators.join(', '));
      setPriority(editingDocket.priority);
      setStatus(editingDocket.status);
      setStartDate(editingDocket.startDate);
      setDueDate(editingDocket.dueDate);
      setNotes(editingDocket.notes || '');
      setTagsText(editingDocket.tags.join(', '));
      setSteps(editingDocket.steps || []);
      setLocalFilePath(editingDocket.localFilePath || '');
      setLocalFileName(editingDocket.localFileName || '');
      setDuplicateWarning(null);
    } else {
      const suggested = suggestNextDocketCode(existingDockets);
      setCode(suggested);
      setTitle('');
      setCategory(DEFAULT_CATEGORIES[0]);
      setDepartment(DEFAULT_DEPARTMENTS[0]);
      setLeadAssignee('Nguyễn Văn Thành');
      setCollaboratorsText('');
      setPriority('high');
      setStatus('in_progress');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
      setNotes('');
      setTagsText('');
      setLocalFilePath('');
      setLocalFileName('');
      
      // Default with 2 initial sequential steps
      const cleanPrefix = suggested.replace(/[^a-zA-Z0-9]/g, '');
      setSteps([
        {
          id: `step-${Date.now()}-1`,
          stepCode: `${suggested}-B01`,
          title: 'Tiếp nhận hồ sơ và kiểm tra tính đầy đủ của tài liệu',
          assignee: 'Nguyễn Văn Thành',
          dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          status: 'todo',
          priority: 'high',
          order: 1,
          notes: 'Kiểm tra thành phần hồ sơ theo quy định',
        },
        {
          id: `step-${Date.now()}-2`,
          stepCode: `${suggested}-B02`,
          title: 'Thẩm định chuyên môn và lấy ý kiến các đơn vị liên quan',
          assignee: 'Nguyễn Văn Thành',
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          status: 'todo',
          priority: 'high',
          order: 2,
        },
      ]);
      setDuplicateWarning(null);
    }
  }, [isOpen, editingDocket, existingDockets]);

  // Check duplicate code in real-time as user types
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const result = checkDuplicateDocketCode(newCode, existingDockets, editingDocket?.id);
    if (result.isDuplicate) {
      setDuplicateWarning({
        isDuplicate: true,
        matchedTitle: result.matchedDocket?.title,
      });
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleApplySuggestedCode = () => {
    const nextCode = suggestNextDocketCode(existingDockets);
    setCode(nextCode);
    setDuplicateWarning(null);

    // Update steps codes if they match old prefix pattern
    setSteps((prev) =>
      prev.map((s, idx) => ({
        ...s,
        stepCode: `${nextCode}-B${String(idx + 1).padStart(2, '0')}`,
      }))
    );
  };

  // Add step dynamically
  const handleAddStep = () => {
    const nextIndex = steps.length + 1;
    const baseCode = code.trim() || 'HS-MOI';
    const newStep: DocketStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      stepCode: `${baseCode}-B${String(nextIndex).padStart(2, '0')}`,
      title: `Bước ${nextIndex}: `,
      assignee: leadAssignee || 'Nguyễn Văn Thành',
      dueDate: dueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: 'todo',
      priority: priority,
      order: nextIndex,
      notes: '',
    };
    setSteps([...steps, newStep]);
  };

  // Remove step
  const handleRemoveStep = (stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId));
  };

  // Update step field
  const handleStepFieldChange = (stepId: string, field: keyof DocketStep, value: any) => {
    setSteps(steps.map((s) => (s.id === stepId ? { ...s, [field]: value } : s)));
  };

  // Move step up / down
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const reordered = [...steps];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    // re-assign order numbers
    setSteps(reordered.map((item, idx) => ({ ...item, order: idx + 1 })));
  };

  // Load a standard workflow template
  const handleLoadTemplate = (templateId: string) => {
    const tpl = WORKFLOW_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    if (steps.length > 0) {
      const confirm = window.confirm(`Áp dụng "${tpl.name}" sẽ thay thế các bước hiện tại. Tiếp tục?`);
      if (!confirm) return;
    }

    setCategory(tpl.defaultCategory);
    const baseCode = code.trim() || 'HS-2026-TPL';
    const nowMs = Date.now();

    const newSteps: DocketStep[] = tpl.steps.map((s, idx) => ({
      id: `step-${Date.now()}-${idx}`,
      stepCode: `${baseCode}-${s.codeSuffix}`,
      title: s.title,
      assignee: leadAssignee || 'Nguyễn Văn Thành',
      dueDate: new Date(nowMs + s.relativeDays * 86400000).toISOString().split('T')[0],
      status: 'todo',
      priority: s.priority,
      order: idx + 1,
      notes: s.notes || '',
    }));

    setSteps(newSteps);
    // Adjust docket due date to max step dueDate
    const maxDays = Math.max(...tpl.steps.map((s) => s.relativeDays));
    setDueDate(new Date(nowMs + maxDays * 86400000).toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      alert('Vui lòng nhập Mã hồ sơ');
      return;
    }
    if (!title.trim()) {
      alert('Vui lòng nhập Tên/Trích yếu hồ sơ');
      return;
    }
    if (duplicateWarning?.isDuplicate) {
      alert('Mã hồ sơ đang bị trùng lặp. Vui lòng sửa lại mã trước khi lưu!');
      return;
    }

    const collaborators = collaboratorsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const docketData: Docket = {
      id: editingDocket?.id || `docket-${Date.now()}`,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      category,
      department,
      leadAssignee: leadAssignee.trim(),
      collaborators,
      priority,
      status,
      startDate,
      dueDate,
      notes: notes.trim(),
      tags,
      attachments: editingDocket?.attachments || [
        { id: `att-${Date.now()}`, name: `HoSo_${code.trim()}.pdf`, size: '1.5 MB', addedAt: startDate }
      ],
      steps: steps.map((s, idx) => ({ ...s, order: idx + 1 })),
      localFilePath: localFilePath.trim() || undefined,
      localFileName: localFileName.trim() || undefined,
      createdAt: editingDocket?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: status === 'completed' ? (editingDocket?.completedAt || new Date().toISOString()) : undefined,
    };

    onSave(docketData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEdit ? 'Chỉnh sửa Hồ sơ Công việc' : 'Tạo mới Hồ sơ Công việc & Phân rã Bước con'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tổ chức hồ sơ lớn thành các bước con cụ thể, tự động kiểm soát trùng mã và hạn định xử lý.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Thông tin Hồ sơ mẹ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Thông tin chung hồ sơ
              </h3>

              {/* Template quick-picker */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Nạp mẫu quy trình:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleLoadTemplate(e.target.value);
                    e.target.value = '';
                  }}
                  defaultValue=""
                  className="text-xs py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 focus:outline-hidden cursor-pointer"
                >
                  <option value="" disabled>-- Chọn quy trình mẫu --</option>
                  {WORKFLOW_TEMPLATES.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duplicate Warning Alert */}
            {duplicateWarning?.isDuplicate && (
              <div className="flex items-start justify-between gap-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Cảnh báo trùng lặp mã hồ sơ:</span> Mã{' '}
                    <strong className="font-mono underline">{code}</strong> đã tồn tại cho hồ sơ: "
                    {duplicateWarning.matchedTitle}". Hệ thống chặn tạo trùng để đảm bảo tính toàn vẹn dữ liệu.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplySuggestedCode}
                  className="px-2.5 py-1 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-md shrink-0 transition-colors"
                >
                  Gợi ý mã khác
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Mã hồ sơ <span className="text-rose-600">*</span>
                  </label>
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={handleApplySuggestedCode}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <Sparkles className="w-3 h-3" />
                      Gợi ý mã
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="VD: HS-2026-048"
                  className={`w-full px-3 py-1.5 text-xs font-mono rounded-lg border focus:outline-hidden ${
                    duplicateWarning?.isDuplicate
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-slate-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  }`}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lĩnh vực / Phân loại
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đơn vị liên quan / Ban ban hành
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  {DEFAULT_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên hồ sơ / Trích yếu nội dung <span className="text-rose-600">*</span>
              </label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tên trích yếu hồ sơ (VD: Thẩm định hồ sơ thiết kế thi công công trình...)"
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>

            {/* Row: Lead Assignee, Priority, Status, Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Người chủ trì / Phụ trách chính
                </label>
                <input
                  type="text"
                  value={leadAssignee}
                  onChange={(e) => setLeadAssignee(e.target.value)}
                  placeholder="Họ và tên..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mức độ ưu tiên
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="urgent">Hỏa tốc / Khẩn</option>
                  <option value="high">Ưu tiên cao</option>
                  <option value="medium">Bình thường</option>
                  <option value="low">Thấp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày tiếp nhận / bắt đầu
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hạn hoàn thành toàn bộ
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            {/* Row: Notes & Collaborators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Người phối hợp (cách nhau bởi dấu phẩy)
                </label>
                <input
                  type="text"
                  value={collaboratorsText}
                  onChange={(e) => setCollaboratorsText(e.target.value)}
                  placeholder="Trần Thị Mai, Lê Hoàng Nam..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nhãn từ khóa (tags)
                </label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="Thẩm định, CNTT, Khẩn..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú / Chỉ đạo của Lãnh đạo
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ý kiến chỉ đạo hoặc yêu cầu bổ sung đặc biệt..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Field: Đường dẫn hồ sơ gốc & Tệp đính kèm trên máy tính cá nhân (Offline) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                  Đường dẫn hồ sơ gốc trên máy tính cá nhân (Dành cho làm việc Offline)
                </label>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                  Offline Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Nhập đường dẫn tệp tài liệu hoặc thư mục trên máy tính (ví dụ: <code className="font-mono text-slate-700">D:\HoSoCongViec\{code || 'HS-01'}\HoSoGoc.pdf</code>), hoặc bấm nút dưới để chọn tệp trực tiếp từ máy tính.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={localFilePath}
                  onChange={(e) => setLocalFilePath(e.target.value)}
                  placeholder={`D:\\HoSoCongViec\\${code || 'HS-01'}\\HoSoGoc.pdf`}
                  className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-hidden bg-white"
                />

                <input
                  type="file"
                  ref={formFileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLocalFileName(file.name);
                      if (!localFilePath) {
                        setLocalFilePath(`D:\\HoSoCongViec\\${code || 'HS-01'}\\${file.name}`);
                      }
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => formFileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  Chọn tệp trên máy...
                </button>
              </div>

              {localFileName && (
                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                  <span>Tên tệp gốc:</span>
                  <strong className="text-slate-800 font-semibold">{localFileName}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Danh sách các bước công việc con (Sub-steps) */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Phân rã các bước công việc con ({steps.length} bước)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mỗi bước mang mã định danh riêng để theo dõi tiến độ, người làm và hạn định chi tiết.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm bước tiếp theo
              </button>
            </div>

            {steps.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                Chưa có bước con nào. Bấm "+ Thêm bước tiếp theo" hoặc nạp quy trình mẫu ở trên.
              </div>
            ) : (
              <div className="space-y-2.5">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={step.stepCode}
                          onChange={(e) => handleStepFieldChange(step.id, 'stepCode', e.target.value)}
                          placeholder="Mã bước"
                          className="w-28 px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveStep(idx, 'up')}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                          title="Chuyển lên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === steps.length - 1}
                          onClick={() => handleMoveStep(idx, 'down')}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                          title="Chuyển xuống"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(step.id)}
                          className="p-1 text-rose-500 hover:bg-rose-100 rounded transition-colors"
                          title="Xóa bước này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                      {/* Title */}
                      <div className="md:col-span-6">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleStepFieldChange(step.id, 'title', e.target.value)}
                          placeholder="Nội dung bước thực hiện..."
                          className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Assignee */}
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          value={step.assignee}
                          onChange={(e) => handleStepFieldChange(step.id, 'assignee', e.target.value)}
                          placeholder="Người làm..."
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Due Date */}
                      <div className="md:col-span-2">
                        <input
                          type="date"
                          value={step.dueDate}
                          onChange={(e) => handleStepFieldChange(step.id, 'dueDate', e.target.value)}
                          className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      {/* Priority */}
                      <div className="md:col-span-2">
                        <select
                          value={step.priority}
                          onChange={(e) => handleStepFieldChange(step.id, 'priority', e.target.value as Priority)}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:border-blue-500 focus:outline-hidden"
                        >
                          <option value="urgent">Hỏa tốc</option>
                          <option value="high">Cao</option>
                          <option value="medium">Vừa</option>
                          <option value="low">Thấp</option>
                        </select>
                      </div>
                    </div>

                    {/* Step Notes */}
                    <input
                      type="text"
                      value={step.notes || ''}
                      onChange={(e) => handleStepFieldChange(step.id, 'notes', e.target.value)}
                      placeholder="Ghi chú chi tiết cho bước này (tùy chọn)..."
                      className="w-full px-2.5 py-1 text-[11px] bg-white/70 border border-slate-200/80 rounded-md text-slate-600 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={duplicateWarning?.isDuplicate}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs ${
                duplicateWarning?.isDuplicate
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              {isEdit ? 'Cập nhật hồ sơ' : 'Lưu hồ sơ vào hệ thống'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
