import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Check, 
  Clock, 
  AlertTriangle, 
  Plus, 
  FileSpreadsheet, 
  MoreVertical, 
  LayoutList, 
  LayoutGrid, 
  FolderKanban,
  ExternalLink,
  Edit,
  Trash2,
  Tag
} from 'lucide-react';
import { 
  Docket, 
  DocketStatus, 
  Priority, 
  DOCKET_STATUS_CONFIG, 
  PRIORITY_CONFIG, 
  DEFAULT_CATEGORIES,
  DEFAULT_DEPARTMENTS 
} from '../types';
import { exportToCSV } from '../utils/storage';

interface DocketListProps {
  dockets: Docket[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenCreateModal: () => void;
  onOpenDocketDetail: (docket: Docket) => void;
  onEditDocket: (docket: Docket) => void;
  onDeleteDocket: (docketId: string) => void;
  onToggleStepStatus: (docketId: string, stepId: string) => void;
  onUpdateDocketStatus: (docketId: string, newStatus: DocketStatus) => void;
}

export const DocketList: React.FC<DocketListProps> = ({
  dockets,
  searchTerm,
  onSearchChange,
  onOpenCreateModal,
  onOpenDocketDetail,
  onEditDocket,
  onDeleteDocket,
  onToggleStepStatus,
  onUpdateDocketStatus,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'startDate' | 'priority' | 'progress'>('dueDate');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [expandedDocketIds, setExpandedDocketIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedDocketIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter and search
  const filteredDockets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return dockets.filter((docket) => {
      // Search keyword matches
      if (term) {
        const matchCode = docket.code.toLowerCase().includes(term);
        const matchTitle = docket.title.toLowerCase().includes(term);
        const matchAssignee = docket.leadAssignee.toLowerCase().includes(term);
        const matchDept = docket.department.toLowerCase().includes(term);
        const matchCategory = docket.category.toLowerCase().includes(term);
        const matchTags = docket.tags.some((t) => t.toLowerCase().includes(term));
        const matchSteps = docket.steps.some(
          (s) => s.stepCode.toLowerCase().includes(term) || s.title.toLowerCase().includes(term) || s.assignee.toLowerCase().includes(term)
        );

        if (!matchCode && !matchTitle && !matchAssignee && !matchDept && !matchCategory && !matchTags && !matchSteps) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && docket.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && docket.status !== selectedStatus) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && docket.priority !== selectedPriority) {
        return false;
      }

      return true;
    });
  }, [dockets, searchTerm, selectedCategory, selectedStatus, selectedPriority]);

  // Sort
  const sortedDockets = useMemo(() => {
    return [...filteredDockets].sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'startDate') {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      if (sortBy === 'priority') {
        const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
        return weights[b.priority] - weights[a.priority];
      }
      if (sortBy === 'progress') {
        const getRate = (d: Docket) =>
          d.steps.length > 0 ? d.steps.filter((s) => s.status === 'completed').length / d.steps.length : 0;
        return getRate(b) - getRate(a);
      }
      return 0;
    });
  }, [filteredDockets, sortBy]);

  return (
    <div className="space-y-4">
      {/* Page Title & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Kho hồ sơ công việc
            </h1>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-md tabular-nums font-semibold">
              {sortedDockets.length} hồ sơ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quản trị toàn bộ hồ sơ, kiểm tra phân rã nhiệm vụ và theo dõi tiến độ từng công đoạn.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportToCSV(dockets)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors shadow-2xs"
            title="Xuất bảng kê Excel (.csv)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo hồ sơ mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar - 3D Elevated Deck */}
      <div className="card-3d p-4 md:p-5 rounded-2xl space-y-4 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Lĩnh vực công việc
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs inner-groove text-slate-100 rounded-xl focus:border-cyan-500 focus:outline-hidden transition-colors cursor-pointer"
            >
              <option value="all">Tất cả lĩnh vực</option>
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Trạng thái hồ sơ
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs inner-groove text-slate-100 rounded-xl focus:border-cyan-500 focus:outline-hidden transition-colors cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ tiếp nhận</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="review">Đang thẩm định / Trình ký</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="delayed">Trễ hạn / Quá hạn</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Độ ưu tiên
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs inner-groove text-slate-100 rounded-xl focus:border-cyan-500 focus:outline-hidden transition-colors cursor-pointer"
            >
              <option value="all">Tất cả mức ưu tiên</option>
              <option value="urgent">Hỏa tốc / Khẩn</option>
              <option value="high">Ưu tiên cao</option>
              <option value="medium">Bình thường</option>
              <option value="low">Thấp</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Sắp xếp theo
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs inner-groove text-slate-100 rounded-xl focus:border-cyan-500 focus:outline-hidden transition-colors cursor-pointer"
            >
              <option value="dueDate">Hạn hoàn thành (gần nhất)</option>
              <option value="startDate">Ngày khởi tạo (mới nhất)</option>
              <option value="priority">Mức ưu tiên (cao nhất)</option>
              <option value="progress">Tiến độ hoàn thành (% cao nhất)</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle and Active Filters */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {(selectedCategory !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSelectedPriority('all');
                  onSearchChange('');
                }}
                className="px-2.5 py-1 text-[11px] text-cyan-300 hover:text-white bg-cyan-950/80 border border-cyan-800/70 rounded-lg transition-colors font-medium"
              >
                ✕ Xóa bộ lọc đang chọn
              </button>
            )}

            <span className="text-slate-400 font-medium">
              Đang hiển thị <strong className="text-white font-mono">{sortedDockets.length}</strong> / {dockets.length} hồ sơ
            </span>
          </div>

          {/* Segmented View Mode Toggle */}
          <div className="flex items-center p-1 inner-groove rounded-xl gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                viewMode === 'table'
                  ? 'bg-gradient-to-b from-slate-700 to-slate-800 text-white badge-3d shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Dạng bảng</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                viewMode === 'cards'
                  ? 'bg-gradient-to-b from-slate-700 to-slate-800 text-white badge-3d shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Dạng thẻ (3D Cards)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dockets Listing */}
      {sortedDockets.length === 0 ? (
        <div className="card-3d p-12 text-center rounded-3xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Không tìm thấy hồ sơ phù hợp</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại các tiêu chí bộ lọc lĩnh vực, trạng thái.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW WITH INLINE SUB-STEP EXPAND */
        <div className="card-3d rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px] select-none">
                <tr>
                  <th className="py-4 px-3 w-8"></th>
                  <th className="py-4 px-3">Mã hồ sơ</th>
                  <th className="py-4 px-4">Tên trích yếu hồ sơ</th>
                  <th className="py-4 px-3">Chủ trì & Đơn vị</th>
                  <th className="py-4 px-3">Tiến độ quy trình</th>
                  <th className="py-4 px-3">Hạn hoàn tất</th>
                  <th className="py-4 px-3">Trạng thái</th>
                  <th className="py-4 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {sortedDockets.map((docket) => {
                  const isExpanded = expandedDocketIds.has(docket.id);
                  const statusConf = DOCKET_STATUS_CONFIG[docket.status] || DOCKET_STATUS_CONFIG.in_progress;
                  const prioConf = PRIORITY_CONFIG[docket.priority] || PRIORITY_CONFIG.medium;
                  const totalSteps = docket.steps.length;
                  const doneSteps = docket.steps.filter((s) => s.status === 'completed').length;
                  const percent = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
                  const isOverdue =
                    docket.status !== 'completed' &&
                    new Date(docket.dueDate).getTime() < new Date(new Date().toISOString().split('T')[0]).getTime();

                  return (
                    <React.Fragment key={docket.id}>
                      <tr className={`hover:bg-slate-800/40 transition-colors ${isExpanded ? 'bg-slate-950/50' : ''}`}>
                        {/* Expand toggle */}
                        <td className="py-4 px-3 text-center">
                          <button
                            onClick={() => toggleExpand(docket.id)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-all"
                            title={isExpanded ? 'Thu gọn bước con' : 'Xem chi tiết các bước con'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-cyan-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Code Badge */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <button
                            onClick={() => onOpenDocketDetail(docket)}
                            className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/70 hover:border-cyan-500 px-2.5 py-1 rounded-lg badge-3d tabular-nums transition-all"
                          >
                            {docket.code}
                          </button>
                        </td>

                        {/* Title & Metadata */}
                        <td className="py-4 px-4 max-w-sm">
                          <div
                            onClick={() => onOpenDocketDetail(docket)}
                            className="font-bold text-slate-100 hover:text-cyan-300 cursor-pointer line-clamp-2 leading-snug tracking-tight text-xs md:text-sm"
                            title={docket.title}
                          >
                            {docket.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-slate-950/60 border border-slate-800 text-slate-300 font-medium">
                              {docket.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md border font-semibold ${
                              docket.priority === 'urgent'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-800/70'
                                : docket.priority === 'high'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800/70'
                                : 'bg-slate-950/60 text-slate-400 border-slate-800'
                            }`}>
                              {prioConf.label}
                            </span>
                          </div>
                        </td>

                        {/* Assignee & Dept */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                              {docket.leadAssignee ? docket.leadAssignee.split(' ').pop()?.[0] || 'U' : 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-white">{docket.leadAssignee}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                                {docket.department}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Steps Progress */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="space-y-1.5 min-w-[110px]">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono text-slate-300 font-semibold">{doneSteps}/{totalSteps} bước</span>
                              <span className="font-mono font-bold text-white tabular-nums">{percent}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="py-4 px-3 font-mono tabular-nums whitespace-nowrap">
                          <div className={`font-bold px-2 py-1 rounded-lg inline-block ${
                            isOverdue 
                              ? 'text-rose-300 bg-rose-950/90 border border-rose-800/70' 
                              : 'text-slate-200 bg-slate-950/60 border border-slate-800'
                          }`}>
                            {docket.dueDate}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {isOverdue ? '⚠️ Quá hạn giải quyết' : `Bắt đầu: ${docket.startDate}`}
                          </div>
                        </td>

                        {/* Status Select */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <select
                            value={docket.status}
                            onChange={(e) => onUpdateDocketStatus(docket.id, e.target.value as DocketStatus)}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-xl inner-groove text-slate-100 focus:outline-hidden focus:border-cyan-500 cursor-pointer"
                          >
                            <option value="pending">Chờ tiếp nhận</option>
                            <option value="in_progress">Đang xử lý</option>
                            <option value="review">Đang thẩm định</option>
                            <option value="completed">Đã hoàn thành</option>
                            <option value="delayed">Quá hạn</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenDocketDetail(docket)}
                              className="px-3 py-1.5 text-xs text-white bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all font-semibold badge-3d"
                            >
                              Chi tiết
                            </button>
                            <button
                              onClick={() => onEditDocket(docket)}
                              className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                              title="Sửa hồ sơ"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteDocket(docket.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                              title="Xóa hồ sơ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* INLINE EXPANDED SUB-STEPS (Distinct Nested Card Slab) */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80 border-b border-slate-800">
                          <td colSpan={8} className="p-4 pl-10 pr-6">
                            <div className="inner-groove p-4 rounded-2xl space-y-3">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                                <span>Phân rã các bước thực hiện ({docket.steps.length} bước)</span>
                                <span className="font-mono text-cyan-400">{docket.code}</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {docket.steps.map((st) => {
                                  const isStDone = st.status === 'completed';
                                  return (
                                    <div
                                      key={st.id}
                                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                                        isStDone 
                                          ? 'bg-slate-950/60 border-slate-800/60 opacity-70' 
                                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-sm'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <button
                                          onClick={() => onToggleStepStatus(docket.id, st.id)}
                                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                            isStDone 
                                              ? 'bg-emerald-500 text-white' 
                                              : 'border border-slate-700 hover:border-cyan-400 text-slate-400'
                                          }`}
                                        >
                                          {isStDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Circle className="w-3 h-3" />}
                                        </button>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-cyan-400 text-[11px]">
                                              {st.stepCode}
                                            </span>
                                            <span className={`text-xs font-semibold truncate ${isStDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                                              {st.title}
                                            </span>
                                          </div>
                                          <div className="text-[10px] text-slate-400 mt-0.5">
                                            Phụ trách: <strong className="text-slate-300">{st.assignee}</strong>
                                          </div>
                                        </div>
                                      </div>

                                      <span className="font-mono text-[11px] font-semibold text-slate-300 shrink-0 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                                        {st.dueDate}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS GRID VIEW - 3D Tactile Structured Slabs (Cực kỳ rõ ràng, không rối mắt) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedDockets.map((docket) => {
            const statusConf = DOCKET_STATUS_CONFIG[docket.status] || DOCKET_STATUS_CONFIG.in_progress;
            const prioConf = PRIORITY_CONFIG[docket.priority] || PRIORITY_CONFIG.medium;
            const totalSteps = docket.steps.length;
            const doneSteps = docket.steps.filter((s) => s.status === 'completed').length;
            const percent = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
            const isOverdue =
              docket.status !== 'completed' &&
              new Date(docket.dueDate).getTime() < new Date(new Date().toISOString().split('T')[0]).getTime();

            return (
              <div
                key={docket.id}
                className="card-3d-interactive p-5 rounded-2xl flex flex-col justify-between space-y-4 text-slate-200 relative overflow-hidden transition-all duration-300 transform-gpu hover:scale-[1.02] hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-10px_rgba(0,0,0,0.85),0_0_25px_rgba(56,189,248,0.18)]"
              >
                {/* Zone 1: Code + Priority + Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-extrabold text-cyan-300 bg-cyan-950/90 border border-cyan-700/70 px-2.5 py-1 rounded-xl badge-3d tabular-nums">
                      {docket.code}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border badge-3d ${
                        docket.priority === 'urgent'
                          ? 'bg-rose-950 text-rose-300 border-rose-700/80 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                          : docket.priority === 'high'
                          ? 'bg-amber-950 text-amber-300 border-amber-700/80'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {prioConf.label}
                      </span>

                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border badge-3d flex items-center gap-1.5 ${
                        docket.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700/80'
                          : docket.status === 'delayed'
                          ? 'bg-rose-950 text-rose-300 border-rose-700/80'
                          : docket.status === 'review'
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-700/80'
                          : 'bg-blue-950 text-blue-300 border-blue-700/80'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {statusConf.label}
                      </span>
                    </div>
                  </div>

                  {/* Zone 2: Title & Category Tags */}
                  <div>
                    <h3
                      onClick={() => onOpenDocketDetail(docket)}
                      className="text-base font-bold text-white hover:text-cyan-300 cursor-pointer line-clamp-2 leading-snug tracking-tight"
                      title={docket.title}
                    >
                      {docket.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 font-medium">
                        {docket.category}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {docket.department}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Zone 3: Compartmentalized Metric Deck (2 Distinct Panels) */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  {/* Panel A: Assignee */}
                  <div className="inner-groove p-3 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Cán bộ chủ trì
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {docket.leadAssignee ? docket.leadAssignee.split(' ').pop()?.[0] || 'U' : 'U'}
                      </div>
                      <span className="font-bold text-white text-xs truncate">
                        {docket.leadAssignee}
                      </span>
                    </div>
                  </div>

                  {/* Panel B: Deadline & Progress */}
                  <div className="inner-groove p-3 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Hạn & Tiến độ
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-mono font-bold tabular-nums ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                        {docket.dueDate}
                      </span>
                      <span className="font-mono text-[11px] font-extrabold text-white">
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Zone 4: Steps Count & Action */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-slate-400 tabular-nums">
                    Đã hoàn thành <strong className="text-white font-bold">{doneSteps}</strong>/{totalSteps} bước
                  </span>

                  <button
                    onClick={() => onOpenDocketDetail(docket)}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all badge-3d shadow-xs flex items-center gap-1.5"
                  >
                    <span>Chi tiết</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
