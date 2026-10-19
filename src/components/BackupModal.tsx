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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-100 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_0_2px_#cbd5e1] border-2 border-slate-300 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-300 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md border border-blue-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-950">
                Trung tâm Sao lưu & Xuất Dữ liệu
              </h2>
              <span className="text-xs text-slate-700 font-mono font-bold tabular-nums">
                Lưu trữ: {dockets.length} hồ sơ · {totalSteps} bước con
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-600 hover:text-black hover:bg-slate-300 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3.5 bg-slate-100">
          {importStatus && (
            <div className="p-3 bg-emerald-100 border-2 border-emerald-300 rounded-xl text-emerald-950 text-xs flex items-center gap-2 font-bold shadow-xs">
              <Check className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Option 1: Excel CSV */}
          <div className="p-4 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-400 transition-all">
            <div>
              <div className="text-xs font-black text-slate-950 flex items-center gap-1.5 uppercase tracking-wide">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                Xuất Bảng tính Excel (.csv)
              </div>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                Đầy đủ mã, tên trích yếu, tiến độ và hạn chót theo chuẩn tiếng Việt UTF-8.
              </p>
            </div>
            <button
              onClick={() => exportToCSV(dockets)}
              className="px-3.5 py-2 text-xs font-black text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Tải Excel
            </button>
          </div>

          {/* Option 2: JSON Backup */}
          <div className="p-4 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-400 transition-all">
            <div>
              <div className="text-xs font-black text-slate-950 flex items-center gap-1.5 uppercase tracking-wide">
                <Download className="w-4 h-4 text-blue-700" />
                Sao lưu Dữ liệu (.json)
              </div>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                Lưu trữ toàn bộ cấu trúc hồ sơ, các bước con, người làm và tài liệu để phục hồi khi cần.
              </p>
            </div>
            <button
              onClick={() => exportToJSON(dockets)}
              className="px-3.5 py-2 text-xs font-black text-blue-900 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Tải JSON
            </button>
          </div>

          {/* Option 3: Restore JSON */}
          <div className="p-4 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-400 transition-all">
            <div>
              <div className="text-xs font-black text-slate-950 flex items-center gap-1.5 uppercase tracking-wide">
                <Upload className="w-4 h-4 text-indigo-700" />
                Khôi phục từ Tệp sao lưu
              </div>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
                Nạp lại dữ liệu từ tệp JSON đã lưu trước đó vào hệ thống.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 text-xs font-black text-indigo-900 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
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
          <div className="p-4 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-400 transition-all">
            <div>
              <div className="text-xs font-black text-slate-950 flex items-center gap-1.5 uppercase tracking-wide">
                <RotateCcw className="w-4 h-4 text-slate-700" />
                Đặt lại Dữ liệu mẫu chuẩn
              </div>
              <p className="text-xs text-slate-700 font-medium mt-0.5">
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
              className="px-3.5 py-2 text-xs font-black text-slate-800 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              Khôi phục
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t-2 border-slate-300 bg-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-black text-slate-800 hover:text-black bg-slate-300 hover:bg-slate-400 rounded-xl border border-slate-400 transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
