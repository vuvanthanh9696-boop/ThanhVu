import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  RotateCcw, 
  Database, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Docket } from '../types';
import { exportToCSV, exportToJSON, resetToSampleData } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  dockets: Docket[];
  onImportDockets: (dockets: Docket[]) => void;
  onResetData: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  dockets,
  onImportDockets,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalSteps = dockets.reduce((acc, d) => acc + d.steps.length, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const importedDockets = Array.isArray(parsed) ? parsed : parsed.dockets;

        if (Array.isArray(importedDockets) && importedDockets.length > 0) {
          onImportDockets(importedDockets);
          setImportStatus(`Đã khôi phục thành công ${importedDockets.length} hồ sơ!`);
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        } else {
          alert('Tệp dữ liệu không hợp lệ!');
        }
      } catch {
        alert('Lỗi đọc tệp sao lưu JSON!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Trung tâm Sao lưu & Xuất Dữ liệu
              </h2>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                Lưu trữ: {dockets.length} hồ sơ · {totalSteps} bước con
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {importStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Option 1: Excel CSV */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Xuất Bảng tính Excel (.csv)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Đầy đủ mã, tên trích yếu, tiến độ và hạn chót theo chuẩn tiếng Việt UTF-8.
              </p>
            </div>
            <button
              onClick={() => exportToCSV(dockets)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-lg transition-colors shrink-0 shadow-2xs"
            >
              Tải Excel
            </button>
          </div>

          {/* Option 2: JSON Backup */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-blue-600" />
                Sao lưu Dữ liệu (.json)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Lưu trữ toàn bộ cấu trúc hồ sơ, các bước con, người làm và tài liệu để phục hồi khi cần.
              </p>
            </div>
            <button
              onClick={() => exportToJSON(dockets)}
              className="px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors shrink-0 shadow-2xs"
            >
              Tải JSON
            </button>
          </div>

          {/* Option 3: Restore JSON */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-indigo-600" />
                Khôi phục từ Tệp sao lưu
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nạp lại dữ liệu từ tệp JSON đã lưu trước đó.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-800 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors shrink-0 shadow-2xs"
            >
              Chọn tệp
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Option 4: Reset to Sample */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-slate-500" />
                Đặt lại Dữ liệu mẫu chuẩn
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nạp lại danh mục hồ sơ công sở mẫu ban đầu để tham khảo và trải nghiệm.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Khôi phục lại dữ liệu mẫu sẽ ghi đè các thay đổi hiện tại. Tiếp tục?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors shrink-0"
            >
              Khôi phục
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
