import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  FileText,
  Copy
} from 'lucide-react';
import { 
  WorkflowTemplate, 
  WorkflowTemplateStep, 
  saveWorkflowTemplates, 
  resetWorkflowTemplates 
} from '../utils/templates';
import { DEFAULT_CATEGORIES, Priority } from '../types';

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: WorkflowTemplate[];
  onTemplatesChange: (newTemplates: WorkflowTemplate[]) => void;
  onSelectTemplateToLoad?: (templateId: string) => void;
}

export const TemplateManagerModal: React.FC<TemplateManagerModalProps> = ({
  isOpen,
  onClose,
  templates,
  onTemplatesChange,
  onSelectTemplateToLoad,
}) => {
  // Editing state
  const [editingTemplate, setEditingTemplate] = useState<WorkflowTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form states for template editing
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultCategory, setDefaultCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [steps, setSteps] = useState<WorkflowTemplateStep[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Start editing existing template
  const handleStartEdit = (tpl: WorkflowTemplate) => {
    setEditingTemplate(tpl);
    setIsCreatingNew(false);
    setName(tpl.name);
    setDescription(tpl.description || '');
    setDefaultCategory(tpl.defaultCategory || DEFAULT_CATEGORIES[0]);
    setSteps([...tpl.steps]);
  };

  // Start creating new template
  const handleStartCreateNew = () => {
    setEditingTemplate(null);
    setIsCreatingNew(true);
    setName('');
    setDescription('');
    setDefaultCategory(DEFAULT_CATEGORIES[0]);
    setSteps([
      {
        codeSuffix: 'B01',
        title: 'Bước 1: Tiếp nhận và kiểm tra thông tin',
        relativeDays: 1,
        priority: 'high',
        notes: '',
      },
      {
        codeSuffix: 'B02',
        title: 'Bước 2: Xử lý chuyên môn và lập hồ sơ',
        relativeDays: 3,
        priority: 'high',
        notes: '',
      },
    ]);
  };

  // Add step to editing template
  const handleAddStepToTemplate = () => {
    const nextIdx = steps.length + 1;
    const newStep: WorkflowTemplateStep = {
      codeSuffix: `B${String(nextIdx).padStart(2, '0')}`,
      title: `Bước ${nextIdx}: `,
      relativeDays: nextIdx * 2,
      priority: 'high',
      notes: '',
    };
    setSteps([...steps, newStep]);
  };

  // Remove step from template
  const handleRemoveStepFromTemplate = (index: number) => {
    const updated = steps.filter((_, idx) => idx !== index);
    setSteps(updated);
  };

  // Move step
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= steps.length) return;
    const reordered = [...steps];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    setSteps(reordered);
  };

  // Update step field
  const handleStepChange = (index: number, field: keyof WorkflowTemplateStep, val: any) => {
    setSteps(steps.map((s, idx) => (idx === index ? { ...s, [field]: val } : s)));
  };

  // Save template
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên quy trình mẫu');
      return;
    }
    if (steps.length === 0) {
      alert('Quy trình mẫu cần có ít nhất 1 bước thực hiện');
      return;
    }

    let updatedList: WorkflowTemplate[];

    if (isCreatingNew) {
      const newTpl: WorkflowTemplate = {
        id: `tpl-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        defaultCategory,
        steps: steps.map((s, idx) => ({ ...s, codeSuffix: `B${String(idx + 1).padStart(2, '0')}` })),
      };
      updatedList = [newTpl, ...templates];
      showNotification(`Đã tạo mẫu mới: "${newTpl.name}"`);
    } else if (editingTemplate) {
      const updatedTpl: WorkflowTemplate = {
        ...editingTemplate,
        name: name.trim(),
        description: description.trim(),
        defaultCategory,
        steps: steps.map((s, idx) => ({ ...s, codeSuffix: `B${String(idx + 1).padStart(2, '0')}` })),
      };
      updatedList = templates.map((t) => (t.id === editingTemplate.id ? updatedTpl : t));
      showNotification(`Đã cập nhật mẫu: "${updatedTpl.name}"`);
    } else {
      return;
    }

    saveWorkflowTemplates(updatedList);
    onTemplatesChange(updatedList);
    setEditingTemplate(null);
    setIsCreatingNew(false);
  };

  // Delete template
  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa mẫu quy trình "${templateName}"?`)) return;
    const updated = templates.filter((t) => t.id !== templateId);
    saveWorkflowTemplates(updated);
    onTemplatesChange(updated);
    if (editingTemplate?.id === templateId) {
      setEditingTemplate(null);
      setIsCreatingNew(false);
    }
    showNotification(`Đã xóa mẫu quy trình.`);
  };

  // Reset to default
  const handleResetDefaults = () => {
    if (!window.confirm('Khôi phục danh sách mẫu quy trình về mặc định ban đầu của hệ thống?')) return;
    const defaults = resetWorkflowTemplates();
    onTemplatesChange(defaults);
    setEditingTemplate(null);
    setIsCreatingNew(false);
    showNotification('Đã khôi phục các mẫu quy trình mặc định.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        id="template-manager-modal"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#e2e8f0] border-2 border-slate-400 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_3px_#94a3b8] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-black font-sans"
      >
        {/* Header - 3D Slab */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-400 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md border-2 border-indigo-800">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-black">
                Quản lý & Tùy chỉnh Mẫu Quy trình ({templates.length} mẫu)
              </h3>
              <p className="text-xs text-slate-800 font-bold mt-0.5">
                Chỉnh sửa các mẫu có sẵn hoặc tạo quy trình chuẩn hóa của riêng bạn để nạp nhanh khi tạo hồ sơ.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-700 hover:text-black hover:bg-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alert */}
        {feedbackMsg && (
          <div className="px-6 py-2 bg-emerald-100 border-b border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-[#e2e8f0]">
          {/* Top Actions: Add New / Reset Defaults */}
          {!editingTemplate && !isCreatingNew && (
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
              <button
                type="button"
                onClick={handleStartCreateNew}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs rounded-xl shadow-[0_3px_0_#1e3a8a] active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer border border-blue-800"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Mẫu Quy trình Mới</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-black font-bold text-xs rounded-xl border-2 border-slate-400 shadow-[0_2px_0_#94a3b8] active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
                title="Khôi phục danh sách mẫu ban đầu"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-700" />
                <span>Khôi phục mặc định</span>
              </button>
            </div>
          )}

          {/* Form: Add or Edit Template */}
          {(editingTemplate || isCreatingNew) ? (
            <form onSubmit={handleSaveTemplate} className="card-block-3d p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3">
                <h4 className="text-sm font-black text-black uppercase tracking-wide flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span>{isCreatingNew ? 'Tạo Mẫu Quy trình Mới' : `Chỉnh sửa: ${editingTemplate?.name}`}</span>
                </h4>

                <button
                  type="button"
                  onClick={() => {
                    setEditingTemplate(null);
                    setIsCreatingNew(false);
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-black hover:underline"
                >
                  Quay lại danh sách mẫu
                </button>
              </div>

              {/* Template Meta */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                <div className="md:col-span-8">
                  <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                    Tên mẫu quy trình <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Quy trình Thẩm định Hạ tầng CNTT..."
                    className="input-groove-3d w-full px-3.5 py-2 text-xs font-black rounded-xl placeholder:text-slate-500"
                    required
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                    Lĩnh vực mặc định
                  </label>
                  <select
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value)}
                    className="input-groove-3d w-full px-3.5 py-2 text-xs font-black rounded-xl cursor-pointer"
                  >
                    {DEFAULT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="text-black font-bold">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-12">
                  <label className="block text-xs font-black text-black uppercase tracking-wide mb-1">
                    Mô tả ngắn gọn quy trình
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mục đích, đối tượng áp dụng và căn cứ quy trình..."
                    className="input-groove-3d w-full px-3.5 py-2 text-xs font-bold rounded-xl placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Steps Editor */}
              <div className="pt-3 border-t-2 border-slate-300 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-black uppercase tracking-wide">
                    Danh sách các bước con ({steps.length} bước)
                  </label>

                  <button
                    type="button"
                    onClick={handleAddStepToTemplate}
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-black font-black text-xs rounded-xl border-2 border-slate-400 shadow-[0_2px_0_#94a3b8] active:translate-y-0.5 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>+ Thêm bước</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto custom-mini-scrollbar pr-1">
                  {steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border-2 border-slate-300 rounded-xl space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-mono font-black text-black bg-slate-200 border border-slate-400 rounded-md">
                          Bước {idx + 1}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveStep(idx, 'up')}
                            className="p-1 text-black hover:bg-slate-200 disabled:opacity-20 rounded cursor-pointer"
                            title="Lên"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === steps.length - 1}
                            onClick={() => handleMoveStep(idx, 'down')}
                            className="p-1 text-black hover:bg-slate-200 disabled:opacity-20 rounded cursor-pointer"
                            title="Xuống"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveStepFromTemplate(idx)}
                            className="p-1 text-rose-700 hover:bg-rose-100 rounded cursor-pointer"
                            title="Xóa bước này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                        <div className="md:col-span-7">
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                            placeholder="Nội dung bước thực hiện..."
                            className="input-groove-3d w-full px-2.5 py-1.5 text-xs font-black rounded-lg placeholder:text-slate-500"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-bold text-black shrink-0">+</span>
                            <input
                              type="number"
                              min="0"
                              max="365"
                              value={step.relativeDays}
                              onChange={(e) => handleStepChange(idx, 'relativeDays', parseInt(e.target.value, 10) || 0)}
                              className="input-groove-3d w-full px-2 py-1.5 text-xs font-mono font-black rounded-lg"
                              title="Số ngày dự kiến cộng thêm tính từ ngày bắt đầu"
                            />
                            <span className="text-[11px] font-bold text-black shrink-0">ngày</span>
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <select
                            value={step.priority}
                            onChange={(e) => handleStepChange(idx, 'priority', e.target.value as Priority)}
                            className="input-groove-3d w-full px-2 py-1.5 text-xs font-black rounded-lg cursor-pointer"
                          >
                            <option value="urgent">Hỏa tốc</option>
                            <option value="high">Cao</option>
                            <option value="medium">Bình thường</option>
                            <option value="low">Thấp</option>
                          </select>
                        </div>

                        <div className="md:col-span-12">
                          <input
                            type="text"
                            value={step.notes || ''}
                            onChange={(e) => handleStepChange(idx, 'notes', e.target.value)}
                            placeholder="Ghi chú hướng dẫn cho bước này (tùy chọn)..."
                            className="input-groove-3d w-full px-2.5 py-1 text-xs font-bold rounded-lg placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-slate-300">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTemplate(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2 text-xs font-black text-black bg-white hover:bg-slate-100 rounded-xl border-2 border-slate-400 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-[0_3px_0_#1e3a8a] active:translate-y-0.5 cursor-pointer"
                >
                  {isCreatingNew ? 'Lưu thành Mẫu Mới' : 'Cập nhật Mẫu Quy trình'}
                </button>
              </div>
            </form>
          ) : (
            /* List of existing templates */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="card-block-3d p-4 rounded-2xl flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-blue-900 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full uppercase">
                          {tpl.defaultCategory || 'Mẫu chung'}
                        </span>
                        <h4 className="text-sm font-black text-black leading-snug pt-1">
                          {tpl.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(tpl)}
                          className="p-1.5 text-black hover:bg-slate-200 rounded-lg border border-transparent hover:border-slate-400 cursor-pointer transition-colors"
                          title="Sửa mẫu này"
                        >
                          <Edit3 className="w-4 h-4 text-blue-700" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                          className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-lg border border-transparent hover:border-rose-300 cursor-pointer transition-colors"
                          title="Xóa mẫu này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {tpl.description && (
                      <p className="text-xs text-slate-800 font-medium line-clamp-2">
                        {tpl.description}
                      </p>
                    )}

                    {/* Steps list preview */}
                    <div className="space-y-1 pt-1 border-t border-slate-300">
                      <div className="text-[11px] font-black text-black">
                        Các bước thực hiện ({tpl.steps.length} bước):
                      </div>
                      <div className="space-y-1">
                        {tpl.steps.map((st, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center justify-between text-xs bg-white p-1.5 rounded-lg border border-slate-300"
                          >
                            <span className="truncate flex-1 font-bold text-black">
                              <strong className="text-blue-900 font-mono mr-1">B0{sIdx + 1}:</strong>
                              {st.title}
                            </span>
                            <span className="font-mono text-[10px] text-slate-700 font-extrabold shrink-0 ml-1">
                              +{st.relativeDays}d
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Load Button if caller provided onSelectTemplateToLoad */}
                  {onSelectTemplateToLoad && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTemplateToLoad(tpl.id);
                        onClose();
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-[0_2px_0_#1e3a8a] active:translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Chọn nạp mẫu này ngay</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 border-t-2 border-slate-400 flex items-center justify-between text-xs font-bold text-black">
          <span>Các mẫu được lưu tự động trên máy tính để sử dụng lâu dài.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-slate-100 text-black font-black rounded-xl border-2 border-slate-400 shadow-[0_2px_0_#94a3b8] cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
