import React, { useState } from 'react';
import { 
  DownloadCloud, 
  Check, 
  HelpCircle, 
  Laptop, 
  Smartphone, 
  HardDrive, 
  WifiOff, 
  X,
  ExternalLink
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'sidebar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'full' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div className="w-full flex items-center gap-2.5 px-3 py-2 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs font-bold">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">Đã cài đặt Desktop App (Offline 100%)</span>
        </div>
      );
    }
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/80 rounded-xl">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>Bản Offline</span>
      </span>
    );
  }

  return (
    <>
      {variant === 'sidebar' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 border-2 border-blue-400/50 rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.4)] transition-all text-left cursor-pointer active:scale-98 group"
          title="Tải ứng dụng về máy tính để sử dụng offline không cần mạng"
        >
          <div className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <DownloadCloud className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex flex-col truncate">
            <span className="leading-tight font-black text-white">Tải về dùng Offline</span>
            <span className="text-[10px] text-blue-200">Cài đặt ứng dụng máy tính</span>
          </div>
        </button>
      ) : variant === 'compact' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl border border-blue-400 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
          title="Tải ứng dụng về máy tính"
        >
          <DownloadCloud className="w-3.5 h-3.5" />
          <span>Dùng Offline</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 border border-blue-400/60 rounded-xl shadow-[0_2px_10px_rgba(37,99,235,0.35)] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
          title="Tải ứng dụng về máy tính để dùng offline 100%"
        >
          <DownloadCloud className="w-4 h-4" />
          <span>Tải về dùng Offline</span>
        </button>
      )}

      {/* Guided Modal: How to install as Desktop App */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shrink-0 shadow-md">
                  <DownloadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Tải về & Cài đặt DocuFlow để Dùng Offline
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ứng dụng độc lập chạy trực tiếp trên máy tính cá nhân không phụ thuộc internet.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Highlights */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <WifiOff className="w-4 h-4" />
                  <span>Hoạt động 100% Offline</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Toàn bộ mã nguồn, dữ liệu hồ sơ và tài liệu được lưu trong bộ nhớ máy tính. Mất mạng vẫn làm việc trơn tru.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                  <HardDrive className="w-4 h-4" />
                  <span>Dữ liệu an toàn tuyệt đối</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Dữ liệu được lưu trữ trực tiếp trên thiết bị của riêng bạn, không tải lên bất kỳ máy chủ bên ngoài nào.
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-blue-400" />
                Hướng dẫn cài đặt trên Máy tính (Windows / macOS)
              </h4>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                  <p>
                    Trên thanh địa chỉ (URL) của trình duyệt <strong>Google Chrome</strong> hoặc <strong>Microsoft Edge</strong>, tìm biểu tượng <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">Cài đặt ứng dụng (Install App)</strong> hoặc biểu tượng màn hình máy tính có dấu mũi tên xuống ở góc phải.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                  <p>
                    Bấm <strong>"Cài đặt" (Install)</strong>. DocuFlow sẽ tự động xuất hiện thành biểu tượng trên màn hình chính (Desktop) và thanh Taskbar của Windows.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                  <p>
                    Từ lần sau, bạn chỉ cần nhấp vào biểu tượng <strong>DocuFlow</strong> trên Desktop để mở làm việc ngay, không cần mở trình duyệt web hay kết nối mạng internet.
                  </p>
                </div>
              </div>

              {isIOS && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    Cài đặt trên iPhone / iPad (Safari):
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Bấm nút <strong>Chia sẻ (Share)</strong> ở thanh dưới cùng Safari &rarr; Cuộn xuống chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Chuẩn công nghệ PWA (Progressive Web Application).
              </span>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
