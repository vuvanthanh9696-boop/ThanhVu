import React, { useState } from 'react';
import { 
  X, 
  Github, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink, 
  RefreshCw, 
  FolderGit2, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Download,
  Info
} from 'lucide-react';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportJson?: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  onExportJson
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [repoUrlInput, setRepoUrlInput] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 3500);
    });
  };

  const defaultRepoUrl = repoUrlInput.trim() || 'https://github.com/vuvanthanh9696-boop/Kho.git';

  const fullGitCommand = `git remote add origin ${defaultRepoUrl}
git branch -M main
git push -u origin main`;

  const pushCommand = `git add .
git commit -m "Cập nhật tính năng mở Word và dùng offline"
git push origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-md">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">
                  Đồng Bộ Dữ Liệu & Mã Nguồn Lên GitHub
                </h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  Git Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cập nhật mã nguồn và nội dung website lên kho lưu trữ GitHub của bạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          
          {/* Status Box */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div>
                <span className="font-bold text-white text-xs block">
                  Mã nguồn đã sẵn sàng đồng bộ (Nhánh chính: main)
                </span>
                <span className="text-[11px] text-slate-400">
                  Tất cả các tính năng mở Word, xem offline và sửa đổi mới nhất đã được đóng gói.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <a
                href="/docuflow-source.zip"
                download="docuflow-source.zip"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="Tải gói ZIP mã nguồn về máy"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải mã nguồn (.zip)</span>
              </a>

              <a
                href="https://github.com/vuvanthanh9696-boop/Kho"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở repo "Kho"</span>
              </a>
            </div>
          </div>

          {/* Step 1: Input GitHub URL */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white uppercase tracking-wide">
              Bước 1: Nhập đường dẫn GitHub Repository của bạn:
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={repoUrlInput}
                  onChange={(e) => setRepoUrlInput(e.target.value)}
                  placeholder="https://github.com/your-username/docuflow.git"
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              * Nếu bạn chưa tạo repo trên GitHub, hãy bấm nút "Tạo repo GitHub" ở trên để tạo một repo trống.
            </p>
          </div>

          {/* Step 2: Push command */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wide">
                Bước 2: Lệnh liên kết và đẩy code lên GitHub lần đầu:
              </label>
              <button
                type="button"
                onClick={() => handleCopy(fullGitCommand, 1)}
                className="px-2.5 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-bold rounded-lg border border-purple-700/60 flex items-center gap-1 cursor-pointer transition-all"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 1 ? 'Đã copy lệnh!' : 'Sao chép lệnh'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 border border-purple-500/30 rounded-xl font-mono text-[11px] text-purple-200 select-all space-y-1">
              <div>git remote add origin {defaultRepoUrl}</div>
              <div>git branch -M main</div>
              <div>git push -u origin main</div>
            </div>
          </div>

          {/* Step 3: Subsequent Updates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wide">
                Bước 3: Lệnh cập nhật những lần tiếp theo:
              </label>
              <button
                type="button"
                onClick={() => handleCopy(pushCommand, 2)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 2 ? 'Đã copy!' : 'Sao chép lệnh'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-cyan-300 select-all space-y-1">
              <div>git add .</div>
              <div>git commit -m "Cập nhật tính năng mở Word và dùng offline"</div>
              <div>git push origin main</div>
            </div>
          </div>

          {/* Terminal Guide Box */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wide">
              <Terminal className="w-4 h-4" />
              <span>Terminal ở đâu và làm sao để mở?</span>
            </div>
            
            <div className="space-y-2 text-[11px] text-slate-300">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">
                  Cách 1 (Nhanh nhất - Không cần mở Terminal):
                </span>
                <p className="text-slate-300">
                  Bạn không cần tự tìm Terminal! Chỉ cần gửi đường dẫn link repository GitHub của bạn (ví dụ: <code className="text-cyan-300 font-mono">https://github.com/ten-ban/docuflow.git</code>) vào ô chat, tôi sẽ trực tiếp chạy Terminal ngầm để liên kết và đẩy toàn bộ mã nguồn lên GitHub cho bạn từ A-Z!
                </p>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-cyan-300 block">
                  Cách 2: Mở Terminal trên máy tính Windows của bạn
                </span>
                <p className="text-slate-300 leading-relaxed">
                  • <strong>Cách 1:</strong> Mở thư mục dự án trong File Explorer $\rightarrow$ Bấm chuột vào thanh hiển thị đường dẫn thư mục ở trên cùng $\rightarrow$ Gõ chữ <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-300">cmd</kbd> rồi ấn <strong>Enter</strong>. Cửa sổ dòng lệnh Terminal màu đen sẽ mở ngay tại thư mục.<br/>
                  • <strong>Cách 2:</strong> Nhấn tổ hợp phím <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-cyan-300">Win + S</kbd> (hoặc phím Windows) $\rightarrow$ Gõ chữ <strong>Terminal</strong> hoặc <strong>cmd</strong> $\rightarrow$ Nhấn <strong>Enter</strong>.<br/>
                  • Sau khi mở Terminal, bạn chỉ cần bấm chuột phải (hoặc ấn <strong>Ctrl + V</strong>) để dán câu lệnh ở Bước 2 rồi gõ <strong>Enter</strong>.
                </p>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-purple-300 block">
                  Cách 3: Tải mã nguồn lên GitHub trực tiếp trên web (Không cần Terminal)
                </span>
                <p className="text-slate-300">
                  Vào trang repository trên trang web GitHub của bạn $\rightarrow$ Bấm nút <strong>Add file</strong> $\rightarrow$ Chọn <strong>Upload files</strong> $\rightarrow$ Kéo thả các tệp mã nguồn vào trang web và bấm <strong>Commit changes</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Extra: Backup Data */}
          <div className="p-4 bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-white block text-xs">
                  Sao lưu dữ liệu JSON để lưu trữ trên GitHub
                </span>
                <span className="text-[11px] text-slate-400">
                  Tải tệp JSON chứa toàn bộ danh sách hồ sơ công việc hiện có
                </span>
              </div>
            </div>

            {onExportJson && (
              <button
                type="button"
                onClick={onExportJson}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Xuất JSON</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Mã nguồn hỗ trợ tự động build qua GitHub Actions & Vercel.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
