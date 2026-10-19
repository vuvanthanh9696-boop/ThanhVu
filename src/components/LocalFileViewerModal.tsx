import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  HardDrive, 
  FileText, 
  ExternalLink, 
  Download, 
  Copy, 
  UploadCloud, 
  Check, 
  Eye, 
  FolderOpen, 
  Terminal, 
  Sparkles,
  Printer,
  FileCheck,
  HelpCircle,
  Play,
  FileSpreadsheet,
  Presentation,
  CheckCircle2,
  Info,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { 
  saveOfflineFile, 
  triggerWindowsLauncher, 
  getOrCreateDocumentBlob 
} from '../utils/fileStorage';

interface LocalFileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  docketCode: string;
  docketTitle: string;
  localFilePath?: string;
  localFileName?: string;
  docketId?: string;
  department?: string;
  leadAssignee?: string;
  dueDate?: string;
  steps?: { title: string; order: number; status: string; dueDate?: string }[];
  notes?: string;
  onUpdateFilePath?: (newPath: string, newFileName: string) => void;
}

export const LocalFileViewerModal: React.FC<LocalFileViewerModalProps> = ({
  isOpen,
  onClose,
  docketCode,
  docketTitle,
  localFilePath = '',
  localFileName = '',
  docketId,
  department,
  leadAssignee,
  dueDate,
  steps,
  notes,
  onUpdateFilePath,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [isCopied, setIsCopied] = useState(false);
  const [launcherDownloaded, setLauncherDownloaded] = useState(false);
  const [wordLaunched, setWordLaunched] = useState(false);
  const [excelLaunched, setExcelLaunched] = useState(false);
  const [docHtmlContent, setDocHtmlContent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'guide'>('preview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPath = localFilePath.trim();
  const currentFileName = localFileName || (currentPath ? currentPath.split(/[\\/]/).pop() : '') || `${docketCode}.doc`;

  // Detect file type
  const isPdf = fileType.includes('pdf') || currentFileName.toLowerCase().endsWith('.pdf');
  const isWord = fileType.includes('word') || fileType.includes('msword') || /\.(doc|docx)$/i.test(currentFileName);
  const isExcel = fileType.includes('excel') || fileType.includes('spreadsheet') || /\.(xls|xlsx|csv)$/i.test(currentFileName);
  const isPpt = fileType.includes('presentation') || fileType.includes('powerpoint') || /\.(ppt|pptx)$/i.test(currentFileName);
  const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(currentFileName);

  // Load file or generate standard document when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      setCurrentBlob(null);
      setDocHtmlContent(null);
      setWordLaunched(false);
      setExcelLaunched(false);
      return;
    }

    let isMounted = true;
    const lookupId = docketId || docketCode;

    getOrCreateDocumentBlob({
      lookupId,
      docketCode,
      docketTitle,
      fileName: currentFileName,
      localPath: currentPath,
      department,
      leadAssignee,
      dueDate,
      steps,
      notes,
    }).then((res) => {
      if (!isMounted) return;
      setBlobUrl(res.url);
      setCurrentBlob(res.blob);
      setFileType(res.type);
      setFileSize(res.blob.size);

      // If it's a Word document or HTML, extract text for embedded sheet preview
      if (
        res.type.includes('word') || 
        res.type.includes('msword') || 
        currentFileName.toLowerCase().endsWith('.doc') || 
        currentFileName.toLowerCase().endsWith('.docx')
      ) {
        res.blob.text().then((txt) => {
          if (isMounted) setDocHtmlContent(txt);
        }).catch(() => {});
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, docketId, docketCode, currentFileName, currentPath]);

  if (!isOpen) return null;

  // Handle manual file selection from computer
  const handleSelectFileFromComputer = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lookupId = docketId || docketCode;
    const inferredPath = currentPath || `D:\\HoSoCongViec\\${docketCode}\\${file.name}`;

    await saveOfflineFile(lookupId, file, file.name, inferredPath);

    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const newUrl = URL.createObjectURL(file);
    setBlobUrl(newUrl);
    setCurrentBlob(file);
    setFileType(file.type);
    setFileSize(file.size);

    if (file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')) {
      file.text().then((txt) => setDocHtmlContent(txt)).catch(() => {});
    } else {
      setDocHtmlContent(null);
    }

    if (onUpdateFilePath) {
      onUpdateFilePath(inferredPath, file.name);
    }
  };

  // Copy path to clipboard
  const handleCopyPath = () => {
    const pathToCopy = currentPath || `D:\\HoSoCongViec\\${docketCode}\\${currentFileName}`;
    navigator.clipboard.writeText(pathToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 4000);
    });
  };

  // 1-Click Windows Launcher (.bat)
  const handleDownloadLauncher = () => {
    triggerWindowsLauncher(currentPath || `D:\\HoSoCongViec\\${docketCode}\\${currentFileName}`, docketCode);
    setLauncherDownloaded(true);
    setTimeout(() => setLauncherDownloaded(false), 5000);
  };

  // Direct Open with Microsoft Word / WPS Office
  const handleOpenInWord = async () => {
    let targetUrl = blobUrl;
    let targetBlob = currentBlob;

    if (!targetUrl || !targetBlob) {
      const res = await getOrCreateDocumentBlob({
        lookupId: docketId || docketCode,
        docketCode,
        docketTitle,
        fileName: currentFileName,
        localPath: currentPath,
        department,
        leadAssignee,
        dueDate,
        steps,
        notes,
      });
      targetUrl = res.url;
      targetBlob = res.blob;
      setBlobUrl(res.url);
      setCurrentBlob(res.blob);
      setFileType(res.type);
      setFileSize(res.blob.size);
    }

    const downloadName = currentFileName.toLowerCase().endsWith('.doc') || currentFileName.toLowerCase().endsWith('.docx')
      ? currentFileName
      : `${currentFileName.replace(/\.[^/.]+$/, '')}.doc`;

    // Trigger Word document download cleanly
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show high-visibility guidance banner so the user knows to click the downloaded file
    setWordLaunched(true);
  };

  // Direct Open with Excel
  const handleOpenInExcel = () => {
    if (blobUrl) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = currentFileName.toLowerCase().endsWith('.xlsx') || currentFileName.toLowerCase().endsWith('.xls') || currentFileName.toLowerCase().endsWith('.csv')
        ? currentFileName
        : `${currentFileName}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setExcelLaunched(true);
  };

  // Open in new tab (PDF/HTML)
  const handleOpenInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    }
  };

  // Print Document
  const handlePrint = () => {
    if (isPdf && blobUrl) {
      window.open(blobUrl, '_blank');
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleSelectFileFromComputer}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg"
        />

        {/* Header - 3D Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 border ${
              isWord 
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                : isExcel
                ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                : isPpt
                ? 'bg-amber-600/20 border-amber-500/50 text-amber-400'
                : isPdf 
                ? 'bg-rose-600/20 border-rose-500/50 text-rose-400' 
                : 'bg-cyan-600/20 border-cyan-500/50 text-cyan-400'
            }`}>
              {isWord ? (
                <FileText className="w-5 h-5 text-blue-400" />
              ) : isExcel ? (
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              ) : isPpt ? (
                <Presentation className="w-5 h-5 text-amber-400" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {docketCode}
                </span>
                <h3 className="text-sm sm:text-base font-black text-white truncate">
                  {isWord 
                    ? 'Tài liệu Văn bản Word (.doc / .docx)' 
                    : isExcel
                    ? 'Bảng tính Excel (.xlsx / .xls / .csv)'
                    : isPpt
                    ? 'Bản trình chiếu PowerPoint (.pptx / .ppt)'
                    : isPdf 
                    ? 'Hồ sơ Tài liệu PDF' 
                    : 'Tài liệu Hồ sơ Gốc'}
                </h3>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  Sẵn sàng mở
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate mt-0.5 font-medium">
                {currentFileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'preview' ? 'guide' : 'preview')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-cyan-600 text-white border-cyan-400'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hướng dẫn mở máy tính</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Quick Action Buttons */}
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Path Display */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-slate-400 font-bold shrink-0">Đường dẫn máy tính:</span>
            <span className="font-mono text-cyan-300 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-lg truncate select-all flex-1 text-xs">
              {currentPath || `D:\\HoSoCongViec\\${docketCode}\\${currentFileName}`}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Copy Path */}
            <button
              type="button"
              onClick={handleCopyPath}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Sao chép đường dẫn để dán vào hộp thoại Win + R"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isCopied ? 'Đã copy đường dẫn!' : 'Copy đường dẫn (Win+R)'}</span>
            </button>

            {/* Word Direct Launch Button */}
            {isWord && (
              <button
                type="button"
                onClick={handleOpenInWord}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black rounded-xl shadow-md border border-blue-400 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Tải văn bản để máy tính tự động mở bằng Microsoft Word hoặc WPS Office"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Mở bằng Microsoft Word</span>
              </button>
            )}

            {/* Excel Launch Button */}
            {isExcel && (
              <button
                type="button"
                onClick={handleOpenInExcel}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black rounded-xl shadow-md border border-emerald-400 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Mở bằng Microsoft Excel / WPS Spreadsheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Mở bằng Microsoft Excel</span>
              </button>
            )}

            {/* PDF New Tab */}
            {isPdf && blobUrl && (
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black rounded-xl shadow-md border border-rose-400 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Mở tài liệu PDF trong tab mới của trình duyệt"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở trong Tab Mới</span>
              </button>
            )}

            {/* Windows 1-Click Launcher */}
            <button
              type="button"
              onClick={handleDownloadLauncher}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black rounded-xl shadow-md border border-emerald-400 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Kích hoạt Windows mở tự động tệp gốc trên ổ cứng bằng ứng dụng mặc định"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{launcherDownloaded ? 'Đã tải .bat!' : 'Mở trên máy (.bat)'}</span>
            </button>

            {/* Choose Other File */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Nạp tệp khác từ máy tính để xem"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
              <span>Đổi tệp</span>
            </button>
          </div>
        </div>

        {/* Dynamic Action Notification Banner when user clicked 'Mở bằng Microsoft Word' */}
        {wordLaunched && (
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b-2 border-blue-400 px-5 py-3 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                W
              </div>
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Đã tải tệp Word thành công về máy tính!
                </div>
                <div className="text-slate-300 mt-0.5">
                  👉 <strong>Bước tiếp theo:</strong> Bấm chuột vào tệp vừa tải ở thanh tải xuống (góc trên bên phải hoặc dưới màn hình trình duyệt) để <strong>Microsoft Word</strong> hoặc <strong>WPS Office</strong> tự động mở ngay!
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleCopyPath}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer"
                title="Copy đường dẫn tệp gốc để mở qua Win+R"
              >
                <Copy className="w-3 h-3 text-cyan-400" />
                <span>{isCopied ? 'Đã copy!' : 'Copy mở Win+R'}</span>
              </button>
              <button
                type="button"
                onClick={() => setWordLaunched(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Action Notification Banner when user clicked 'Mở bằng Microsoft Excel' */}
        {excelLaunched && (
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b-2 border-emerald-400 px-5 py-3 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                X
              </div>
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Đã tải tệp Excel thành công về máy tính!
                </div>
                <div className="text-slate-300 mt-0.5">
                  👉 Bấm chuột vào tệp vừa tải ở thanh tải xuống trình duyệt để <strong>Microsoft Excel</strong> hoặc <strong>WPS Spreadsheets</strong> tự động mở ngay!
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExcelLaunched(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body Viewer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex flex-col">
          {activeTab === 'guide' ? (
            /* Guide Tab: How to open local files effortlessly */
            <div className="max-w-3xl mx-auto space-y-5 py-2">
              <div className="text-center space-y-1.5">
                <h4 className="text-base font-black text-white">
                  4 Cách Mở Hồ Sơ Gốc Trên Máy Tính Nhanh Nhất
                </h4>
                <p className="text-xs text-slate-400">
                  Do chính sách bảo mật của các trình duyệt (Chrome/Edge/Cốc Cốc), website không thể tự động can thiệp trực tiếp vào ổ đĩa máy tính. Bạn hãy chọn 1 trong 4 cách thuận tiện nhất dưới đây:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Method 1: Click downloaded Word */}
                <div className="p-4 bg-slate-900 border-2 border-blue-500/50 rounded-2xl space-y-2.5 shadow-md flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-black text-xs flex items-center justify-center">1</div>
                      <span className="text-xs font-black text-blue-400">
                        Bấm "Mở bằng Microsoft Word" (Màu xanh)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      1. Bấm nút <strong>"Mở bằng Microsoft Word"</strong> (màu xanh dương) ở trên thanh công cụ.<br/>
                      2. Trình duyệt tải ngay tệp về.<br/>
                      3. Bạn chỉ cần <strong>nhấp chuột vào tệp vừa tải</strong> ở thanh tải xuống (góc trên bên phải hoặc dưới màn hình), máy tính sẽ tự động kích hoạt phần mềm <strong>Microsoft Word / WPS Office</strong> mở tệp!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenInWord}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Thử mở bằng Word ngay</span>
                  </button>
                </div>

                {/* Method 2: Win + R (Fastest on disk) */}
                <div className="p-4 bg-slate-900 border-2 border-cyan-500/50 rounded-2xl space-y-2.5 shadow-md flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-cyan-600 text-white font-black text-xs flex items-center justify-center">2</div>
                      <span className="text-xs font-black text-cyan-400">
                        Phím tắt Win + R (Nhanh nhất - 2 giây)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Áp dụng khi tệp đã lưu trong ổ đĩa cứng của bạn:<br/>
                      1. Bấm nút <strong>"Copy đường dẫn"</strong>.<br/>
                      2. Trên bàn phím máy tính, ấn tổ hợp phím <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300 font-mono text-[11px]">Win + R</kbd> để mở hộp Run.<br/>
                      3. Bấm <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-cyan-300 font-mono text-[11px]">Ctrl + V</kbd> và ấn <strong>Enter</strong>. File Word/PDF trên máy tính mở ngay tức thì!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPath}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{isCopied ? 'Đã copy đường dẫn!' : 'Copy đường dẫn tệp'}</span>
                  </button>
                </div>

                {/* Method 3: Launcher .bat */}
                <div className="p-4 bg-slate-900 border-2 border-emerald-500/50 rounded-2xl space-y-2.5 shadow-md flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-emerald-600 text-white font-black text-xs flex items-center justify-center">3</div>
                      <span className="text-xs font-black text-emerald-400">
                        Tệp mở tự động Windows (.bat)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      1. Bấm nút <strong>"Mở trên máy (.bat)"</strong> để tải tệp lệnh tự động.<br/>
                      2. Nhấp đúp vào tệp <code className="font-mono text-emerald-300 text-[11px]">.bat</code> vừa tải về, hệ thống Windows sẽ tự động mở đúng tài liệu Word/PDF trong máy tính mà không bị chặn.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadLauncher}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-4 h-4" />
                    <span>{launcherDownloaded ? 'Đã tải .bat!' : 'Tải tệp .bat mở tự động'}</span>
                  </button>
                </div>

                {/* Method 4: Direct In-App Preview */}
                <div className="p-4 bg-slate-900 border-2 border-indigo-500/50 rounded-2xl space-y-2.5 shadow-md flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-600 text-white font-black text-xs flex items-center justify-center">4</div>
                      <span className="text-xs font-black text-indigo-400">
                        Xem & Đọc trực tiếp trên DocuFlow
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Giao diện tài liệu chuẩn A4 (Quốc hiệu, Tiêu ngữ, trích yếu, các bước thực hiện và chữ ký) được dựng sẵn ngay bên dưới. Bạn có thể đọc trực tiếp hoặc in ấn mà không cần phần mềm bên ngoài.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Xem nội dung tài liệu</span>
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Quay lại xem nội dung tài liệu
                </button>
              </div>
            </div>
          ) : (
            /* Preview Tab */
            <div className="flex-1 flex flex-col space-y-3 min-h-[460px]">
              {/* Document Banner */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white">
                    {isWord 
                      ? 'Đang hiển thị bản xem trước Văn bản Word' 
                      : isExcel
                      ? 'Đang xem bảng kê chi tiết tiến độ'
                      : isPpt
                      ? 'Đang xem bản tóm tắt trình chiếu'
                      : isPdf 
                      ? 'Đang xem trực tiếp tài liệu PDF' 
                      : 'Nội dung hồ sơ gốc'}
                  </span>
                  {fileSize > 0 && (
                    <span className="font-mono text-slate-500">
                      ({Math.round(fileSize / 1024)} KB)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="text-slate-300 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>In tài liệu</span>
                  </button>

                  {blobUrl && (
                    <a
                      href={blobUrl}
                      download={currentFileName}
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải bản sao</span>
                    </a>
                  )}
                </div>
              </div>

              {/* PDF Viewer */}
              {isPdf && blobUrl && (
                <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 min-h-[500px]">
                  <iframe
                    src={`${blobUrl}#toolbar=1&navpanes=1`}
                    className="w-full h-full min-h-[500px] border-none"
                    title="PDF Viewer"
                  />
                </div>
              )}

              {/* Word Document Direct Sheet View (.doc / .docx) */}
              {isWord && (
                <div className="flex-1 flex flex-col space-y-3">
                  {/* Top Word Action Helper Card */}
                  <div className="p-3.5 bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border-2 border-blue-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        W
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">
                          Đây là tệp văn bản Microsoft Word ({currentFileName})
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          Bấm nút bên cạnh để tải tệp và mở ngay trong phần mềm Microsoft Word trên máy tính của bạn:
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleOpenInWord}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs rounded-xl shadow-[0_3px_0_#1e3a8a] active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer border border-blue-400"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Mở trực tiếp bằng Word</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadLauncher}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-[0_3px_0_#065f46] active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
                        title="Tải tệp .bat mở nhanh trên máy"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Mở bằng .bat</span>
                      </button>
                    </div>
                  </div>

                  {/* Elegant White A4 Document Sheet - Word Paper Preview */}
                  <div className="flex-1 bg-slate-900 p-2 sm:p-4 rounded-xl border border-slate-800 overflow-y-auto max-h-[520px]">
                    <div className="max-w-3xl mx-auto bg-white text-black p-6 sm:p-10 rounded-xl shadow-2xl space-y-6 font-serif">
                      {docHtmlContent ? (
                        <div 
                          className="prose prose-slate max-w-none text-black"
                          dangerouslySetInnerHTML={{ __html: docHtmlContent }} 
                        />
                      ) : (
                        /* Standard Government Document Format */
                        <div className="space-y-6 text-sm text-black">
                          {/* Official Header */}
                          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300 text-center">
                            <div>
                              <div className="font-bold uppercase tracking-wider text-xs">
                                {department ? department.toUpperCase() : 'CƠ QUAN / ĐƠN VỊ CHỦ TRÌ'}
                              </div>
                              <div className="text-xs font-mono font-bold mt-1">
                                Số: {docketCode}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-xs uppercase">
                                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                              </div>
                              <div className="font-semibold text-xs italic">
                                Độc lập - Tự do - Hạnh phúc
                              </div>
                              <div className="text-xs text-slate-400 tracking-widest">
                                -----------------
                              </div>
                            </div>
                          </div>

                          {/* Title */}
                          <div className="text-center space-y-1">
                            <h2 className="text-lg font-black uppercase text-black tracking-wide">
                              HỒ SƠ CÔNG VIỆC & TIẾN ĐỘ THỰC HIỆN
                            </h2>
                            <p className="text-xs text-slate-600 italic">
                              (Lưu trữ tài liệu và theo dõi phân kỳ các bước giải quyết)
                            </p>
                          </div>

                          {/* Meta Information */}
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
                            <p><strong>Trích yếu nội dung:</strong> {docketTitle}</p>
                            <p><strong>Người chủ trì:</strong> {leadAssignee || 'Tôi (Cá nhân)'}</p>
                            <p><strong>Thời hạn hoàn thành:</strong> {dueDate || 'Theo quy chế'}</p>
                            {notes && <p><strong>Ghi chú / Ý kiến chỉ đạo:</strong> {notes}</p>}
                          </div>

                          {/* Steps Table */}
                          <div className="space-y-2">
                            <h4 className="font-black text-xs uppercase text-slate-800">
                              DANH MỤC CÁC BƯỚC QUY TRÌNH THỰC HIỆN ({steps?.length || 0} bước):
                            </h4>
                            <table className="w-full border-collapse border border-slate-300 text-xs">
                              <thead>
                                <tr className="bg-slate-100">
                                  <th className="border border-slate-300 p-2 text-center w-12 font-bold">STT</th>
                                  <th className="border border-slate-300 p-2 text-left font-bold">Nội dung công việc</th>
                                  <th className="border border-slate-300 p-2 text-center w-28 font-bold">Thời hạn</th>
                                  <th className="border border-slate-300 p-2 text-center w-28 font-bold">Trạng thái</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(steps && steps.length > 0) ? (
                                  steps.map((st, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50">
                                      <td className="border border-slate-300 p-2 text-center font-bold">{idx + 1}</td>
                                      <td className="border border-slate-300 p-2 font-medium">{st.title}</td>
                                      <td className="border border-slate-300 p-2 text-center font-mono">{st.dueDate || dueDate || ''}</td>
                                      <td className="border border-slate-300 p-2 text-center font-semibold">
                                        {st.status === 'completed' ? 'Đã hoàn thành' : st.status === 'in_progress' ? 'Đang thực hiện' : 'Chưa thực hiện'}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={4} className="border border-slate-300 p-4 text-center text-slate-500 italic">
                                      Hồ sơ đang ở giai đoạn tiếp nhận xử lý ban đầu.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Footer Signatures */}
                          <div className="grid grid-cols-2 gap-4 pt-6 text-xs">
                            <div className="italic text-slate-500">
                              Nơi nhận:<br/>
                              - Lưu hồ sơ cá nhân;<br/>
                              - Lưu trữ điện tử DocuFlow.
                            </div>
                            <div className="text-center space-y-1">
                              <div className="italic">Ngày ..... tháng ..... năm 2026</div>
                              <div className="font-bold uppercase">NGƯỜI LẬP HỒ SƠ</div>
                              <div className="italic text-[11px] text-slate-500">(Ký, ghi rõ họ tên)</div>
                              <div className="pt-12 font-bold uppercase">{leadAssignee || 'Vũ Văn Thành'}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Excel Spreadsheet View (.xls, .xlsx, .csv) */}
              {isExcel && (
                <div className="flex-1 flex flex-col space-y-3">
                  <div className="p-3.5 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border-2 border-emerald-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        X
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">
                          Bảng tính Excel / CSV ({currentFileName})
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          Bấm nút bên cạnh để mở ngay trong phần mềm Microsoft Excel hoặc WPS Spreadsheets:
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleOpenInExcel}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-[0_3px_0_#065f46] active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer border border-emerald-400"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Mở bằng Microsoft Excel</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadLauncher}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mở bằng .bat</span>
                      </button>
                    </div>
                  </div>

                  {/* Spreadsheet Grid Preview */}
                  <div className="flex-1 bg-slate-900 p-4 rounded-xl border border-slate-800 overflow-x-auto">
                    <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                      <span>Bảng kê các bước thực hiện ({steps?.length || 0} mục):</span>
                      <span className="font-mono text-emerald-400">Định dạng: Sheet1</span>
                    </div>
                    <table className="w-full text-xs text-left border-collapse border border-slate-700">
                      <thead>
                        <tr className="bg-slate-800 text-slate-200">
                          <th className="border border-slate-700 p-2.5 text-center w-12 font-bold">#</th>
                          <th className="border border-slate-700 p-2.5 font-bold">Nội dung bước</th>
                          <th className="border border-slate-700 p-2.5 text-center font-bold">Thời hạn</th>
                          <th className="border border-slate-700 p-2.5 text-center font-bold">Trạng thái</th>
                          <th className="border border-slate-700 p-2.5 text-center font-bold">Người phụ trách</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(steps && steps.length > 0) ? (
                          steps.map((st, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/60 border-b border-slate-800">
                              <td className="border border-slate-700 p-2.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                              <td className="border border-slate-700 p-2.5 text-slate-200 font-medium">{st.title}</td>
                              <td className="border border-slate-700 p-2.5 text-center font-mono text-cyan-300">{st.dueDate || dueDate || '-'}</td>
                              <td className="border border-slate-700 p-2.5 text-center">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  st.status === 'completed'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : st.status === 'in_progress'
                                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                    : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {st.status === 'completed' ? 'Hoàn thành' : st.status === 'in_progress' ? 'Đang làm' : 'Chưa làm'}
                                </span>
                              </td>
                              <td className="border border-slate-700 p-2.5 text-center text-slate-300">{leadAssignee || 'Vũ Văn Thành'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-slate-500 italic">Chưa có dữ liệu phân kỳ.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PowerPoint Presentation View (.ppt, .pptx) */}
              {isPpt && (
                <div className="flex-1 flex flex-col space-y-3">
                  <div className="p-3.5 bg-gradient-to-r from-amber-950/70 via-slate-900 to-orange-950/70 border-2 border-amber-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        P
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">
                          Bản trình chiếu PowerPoint ({currentFileName})
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          Bấm nút bên cạnh để mở ngay trong Microsoft PowerPoint hoặc WPS Presentation:
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleDownloadLauncher}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-[0_3px_0_#78350f] active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer border border-amber-400"
                      >
                        <Presentation className="w-4 h-4" />
                        <span>Mở bằng PowerPoint</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-700/60 text-amber-400 flex items-center justify-center shadow-lg">
                      <Presentation className="w-8 h-8" />
                    </div>
                    <div className="max-w-md space-y-2">
                      <h4 className="text-sm font-bold text-white">{docketTitle}</h4>
                      <p className="text-xs text-slate-400">
                        Định dạng trình chiếu PowerPoint được lưu sẵn trên máy tính. Bạn có thể mở qua phím tắt Win + R hoặc tệp launcher (.bat).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Viewer */}
              {isImage && blobUrl && (
                <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center p-4 min-h-[360px] overflow-auto">
                  <img
                    src={blobUrl}
                    alt={currentFileName}
                    className="max-h-[500px] max-w-full rounded-lg shadow-lg object-contain"
                  />
                </div>
              )}

              {/* Fallback for other file types */}
              {!isWord && !isExcel && !isPpt && !isPdf && !isImage && (
                <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900 p-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center shadow-lg">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <h4 className="text-base font-bold text-white">{currentFileName}</h4>
                    <p className="text-xs text-slate-400">
                      Tệp hồ sơ gốc đã được liên kết với đường dẫn trên máy tính của bạn. Bạn có thể mở trực tiếp bằng phần mềm mặc định trên Windows:
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCopyPath}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{isCopied ? 'Đã copy đường dẫn!' : 'Copy mở bằng Win+R'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadLauncher}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4" />
                      <span>Mở trên máy (.bat)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Chế độ làm việc cá nhân Offline 100% không lo mất dữ liệu.</span>
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
