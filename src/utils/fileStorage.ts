import { jsPDF } from 'jspdf';

/**
 * Offline File Storage using browser IndexedDB
 * Allows storing, retrieving and viewing local documents offline without server dependency.
 */

const DB_NAME = 'docuflow_offline_files_db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_files';

export interface StoredFileData {
  id: string; // docketId, docketCode, or attachmentId
  name: string;
  type: string;
  size: number;
  blob: Blob;
  localPath?: string;
  updatedAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an offline file to IndexedDB
 */
export async function saveOfflineFile(
  id: string,
  file: File | Blob,
  fileName: string,
  localPath?: string
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredFileData = {
      id,
      name: fileName,
      type: file.type || 'application/octet-stream',
      size: file.size,
      blob: file,
      localPath,
      updatedAt: new Date().toISOString(),
    };

    store.put(record);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Error saving offline file to IndexedDB:', err);
  }
}

/**
 * Retrieve an offline file from IndexedDB by ID or alternate key
 */
export async function getOfflineFile(id: string): Promise<StoredFileData | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error getting offline file from IndexedDB:', err);
    return null;
  }
}

/**
 * Delete an offline file from IndexedDB
 */
export async function deleteOfflineFile(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch (err) {
    console.error('Error deleting offline file:', err);
  }
}

/**
 * Generate a standard Microsoft Word compatible document (.doc)
 * Uses UTF-8 HTML with standard Word namespace and BOM
 */
export function generateWordDocumentBlob(params: {
  docketCode: string;
  docketTitle: string;
  department?: string;
  leadAssignee?: string;
  dueDate?: string;
  steps?: { title: string; order: number; status: string; dueDate?: string }[];
  notes?: string;
}): Blob {
  const wordHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${params.docketTitle}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.45;
      margin: 2cm 2cm 2cm 2.5cm;
      color: #000000;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    .header-table td {
      border: none;
      text-align: center;
      vertical-align: top;
      font-size: 12pt;
    }
    h1.doc-title {
      font-size: 15pt;
      text-align: center;
      text-transform: uppercase;
      font-weight: bold;
      margin: 20px 0 10px 0;
    }
    .meta-box {
      margin: 15px 0;
      line-height: 1.6;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      margin-bottom: 25px;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #000000;
      padding: 7px 10px;
      font-size: 12pt;
    }
    table.data-table th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: center;
    }
    .footer-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
    }
    .footer-table td {
      border: none;
      vertical-align: top;
      font-size: 12pt;
    }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 45%;">
        <strong>${params.department ? params.department.toUpperCase() : 'CƠ QUAN / ĐƠN VỊ'}</strong><br/>
        <span style="font-size: 11pt;">Số hồ sơ: <strong>${params.docketCode}</strong></span>
      </td>
      <td style="width: 55%;">
        <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
        <strong>Độc lập - Tự do - Hạnh phúc</strong><br/>
        <span style="letter-spacing: 2px;">-------------------</span>
      </td>
    </tr>
  </table>

  <h1 class="doc-title">HỒ SƠ CÔNG VIỆC VÀ TIẾN ĐỘ THỰC HIỆN</h1>

  <div class="meta-box">
    <p><strong>1. Tên hồ sơ / Trích yếu nội dung:</strong> ${params.docketTitle}</p>
    <p><strong>2. Mã số quản lý:</strong> <span style="font-family: monospace; font-weight: bold;">${params.docketCode}</span></p>
    <p><strong>3. Người chủ trì giải quyết:</strong> ${params.leadAssignee || 'Tôi (Cá nhân)'}</p>
    <p><strong>4. Thời hạn hoàn thành:</strong> ${params.dueDate || 'Đang cập nhật'}</p>
    ${params.notes ? `<p><strong>5. Ý kiến chỉ đạo / Ghi chú:</strong> ${params.notes}</p>` : ''}
  </div>

  <h3 style="font-size: 13pt; margin-top: 20px;">DANH MỤC CÁC BƯỚC QUY TRÌNH THỰC HIỆN:</h3>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 8%;">STT</th>
        <th style="width: 52%;">Nội dung công việc / Bước thực hiện</th>
        <th style="width: 20%;">Hạn hoàn thành</th>
        <th style="width: 20%;">Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      ${(params.steps && params.steps.length > 0)
        ? params.steps.map((s, idx) => `
          <tr>
            <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
            <td>${s.title}</td>
            <td style="text-align: center;">${s.dueDate || 'Theo hạn hồ sơ'}</td>
            <td style="text-align: center;">${s.status === 'completed' ? 'Đã hoàn thành' : s.status === 'in_progress' ? 'Đang thực hiện' : 'Chờ thực hiện'}</td>
          </tr>
        `).join('')
        : `
          <tr>
            <td style="text-align: center; font-weight: bold;">1</td>
            <td>Tiếp nhận và kiểm tra tính pháp lý của hồ sơ</td>
            <td style="text-align: center;">${params.dueDate || ''}</td>
            <td style="text-align: center;">Đang xử lý</td>
          </tr>
        `
      }
    </tbody>
  </table>

  <table class="footer-table">
    <tr>
      <td style="width: 50%;">
        <em>Nơi nhận:</em><br/>
        - Lưu hồ sơ cá nhân;<br/>
        - Đơn vị phối hợp.
      </td>
      <td style="width: 50%; text-align: center;">
        <em>Ngày ..... tháng ..... năm 2026</em><br/>
        <strong>NGƯỜI LẬP HỒ SƠ</strong><br/>
        <em>(Ký, ghi rõ họ tên)</em><br/><br/><br/><br/>
        <strong>${params.leadAssignee || 'Vũ Văn Thành'}</strong>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  return new Blob(['\ufeff' + wordHtml], { type: 'application/msword;charset=utf-8' });
}

/**
 * Generate a standard PDF document using jsPDF
 */
export function generatePdfDocumentBlob(params: {
  docketCode: string;
  docketTitle: string;
  department?: string;
  leadAssignee?: string;
  dueDate?: string;
  steps?: { title: string; order: number; status: string; dueDate?: string }[];
  notes?: string;
}): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Background and borders
  doc.setDrawColor(30, 41, 59);
  doc.rect(10, 10, 190, 277);

  // Header Box
  doc.setFillColor(241, 245, 249);
  doc.rect(12, 12, 186, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('CONG HOA XA HOI CHU NGHIA VIET NAM', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Doc lap - Tu do - Hanh phuc', 105, 26, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(80, 29, 130, 29);

  // Agency & Code
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`DON VI: ${params.department ? params.department.toUpperCase() : 'CO QUAN / PHONG BAN'}`, 16, 46);
  doc.text(`SO HO SO: ${params.docketCode}`, 16, 52);

  // Document Title
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text('HO SO CONG VIEC & TAI LIEU GOC', 105, 64, { align: 'center' });

  // Details
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Trich yeu noi dung:', 16, 75);
  doc.setFont('helvetica', 'normal');
  
  // Wrap text
  const splitTitle = doc.splitTextToSize(params.docketTitle || 'Ho so cong viec', 170);
  doc.text(splitTitle, 16, 82);

  let currentY = 82 + splitTitle.length * 6 + 4;

  doc.setFont('helvetica', 'bold');
  doc.text(`Nguoi chu tri:`, 16, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${params.leadAssignee || 'Toi (Ca nhan)'}`, 50, currentY);

  currentY += 7;
  doc.setFont('helvetica', 'bold');
  doc.text(`Han hoan thanh:`, 16, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${params.dueDate || 'Theo quy dinh'}`, 50, currentY);

  if (params.notes) {
    currentY += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`Ghi chu / Chi dao:`, 16, currentY);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(params.notes, 130);
    doc.text(splitNotes, 55, currentY);
    currentY += splitNotes.length * 6;
  }

  // Steps Table Header
  currentY += 10;
  doc.setFillColor(30, 58, 138);
  doc.rect(16, currentY, 178, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('STT', 20, currentY + 5.5);
  doc.text('NOI DUNG BUOC THUC HIEN', 38, currentY + 5.5);
  doc.text('HAN DINH', 145, currentY + 5.5);
  doc.text('TRANG THAI', 172, currentY + 5.5);

  currentY += 8;
  doc.setTextColor(15, 23, 42);

  const stepsList = params.steps && params.steps.length > 0 ? params.steps : [
    { title: 'Tiep nhan va kiem tra ho so', order: 1, status: 'completed', dueDate: params.dueDate },
    { title: 'Tham dinh va xu ly chuyen mon', order: 2, status: 'in_progress', dueDate: params.dueDate }
  ];

  stepsList.forEach((step, index) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFillColor(index % 2 === 0 ? 248 : 255, index % 2 === 0 ? 250 : 255, index % 2 === 0 ? 252 : 255);
    doc.rect(16, currentY, 178, 10, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(16, currentY, 178, 10);

    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}`, 22, currentY + 6.5);
    
    doc.setFont('helvetica', 'normal');
    const safeTitle = (step.title || '').replace(/[\u0300-\u036f]/g, '').substring(0, 55);
    doc.text(safeTitle, 35, currentY + 6.5);

    doc.text(step.dueDate || params.dueDate || '', 142, currentY + 6.5);
    doc.text(step.status === 'completed' ? 'Hoan thanh' : 'Dang lam', 172, currentY + 6.5);

    currentY += 10;
  });

  // Footer Signature
  currentY = Math.max(currentY + 15, 230);
  doc.setFont('helvetica', 'normal');
  doc.text('Ngay ..... thang ..... nam 2026', 135, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text('NGUOI PHU TRACH HO SO', 140, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text('(Ky va ghi ro ho ten)', 143, currentY + 12);
  doc.text(params.leadAssignee || 'Vu Van Thanh', 143, currentY + 30);

  return doc.output('blob');
}

/**
 * Retrieve existing document blob from storage, or generate a valid Doc/PDF blob
 * matching the user's file extension so that clicking 'Open' ALWAYS opens the file immediately!
 */
export async function getOrCreateDocumentBlob(params: {
  lookupId: string;
  docketCode: string;
  docketTitle: string;
  fileName: string;
  localPath?: string;
  department?: string;
  leadAssignee?: string;
  dueDate?: string;
  steps?: { title: string; order: number; status: string; dueDate?: string }[];
  notes?: string;
}): Promise<{ blob: Blob; url: string; type: string; isGenerated: boolean }> {
  // 1. Try finding existing stored file in IndexedDB
  const candidates = [params.lookupId, params.docketCode, params.fileName].filter(Boolean);
  for (const key of candidates) {
    const existing = await getOfflineFile(key);
    if (existing && existing.blob) {
      return {
        blob: existing.blob,
        url: URL.createObjectURL(existing.blob),
        type: existing.type,
        isGenerated: false,
      };
    }
  }

  // 2. Not found in IndexedDB -> Generate valid doc/pdf matching target extension
  const cleanFileName = params.fileName || (params.localPath ? params.localPath.split(/[\\/]/).pop() : '') || `${params.docketCode}.pdf`;
  const lowerName = cleanFileName.toLowerCase();

  let blob: Blob;
  let type: string;

  if (lowerName.endsWith('.doc') || lowerName.endsWith('.docx')) {
    blob = generateWordDocumentBlob(params);
    type = 'application/msword';
  } else {
    // Default to PDF
    blob = generatePdfDocumentBlob(params);
    type = 'application/pdf';
  }

  // Persist into IndexedDB under lookupId & docketCode so subsequent opens are instant
  await saveOfflineFile(params.lookupId, blob, cleanFileName, params.localPath);
  if (params.docketCode && params.docketCode !== params.lookupId) {
    await saveOfflineFile(params.docketCode, blob, cleanFileName, params.localPath);
  }

  return {
    blob,
    url: URL.createObjectURL(blob),
    type,
    isGenerated: true,
  };
}

/**
 * Instant 1-Click Document Opener:
 * - For PDF: Immediately opens the PDF document in a new tab AND in viewer modal!
 * - For Word (.doc, .docx): Immediately triggers launch/download into MS Word AND in viewer modal!
 * - For other files: triggers download & launcher.
 */
export async function instantOpenDocument(params: {
  lookupId: string;
  docketCode: string;
  docketTitle: string;
  fileName: string;
  localPath?: string;
  department?: string;
  leadAssignee?: string;
  dueDate?: string;
  steps?: { title: string; order: number; status: string; dueDate?: string }[];
  notes?: string;
}): Promise<{ url: string; fileName: string; type: string; mode: 'pdf' | 'doc' | 'other' }> {
  const result = await getOrCreateDocumentBlob(params);
  const cleanFileName = params.fileName || (params.localPath ? params.localPath.split(/[\\/]/).pop() : '') || `${params.docketCode}.pdf`;
  const lower = cleanFileName.toLowerCase();

  if (lower.endsWith('.pdf') || result.type.includes('pdf')) {
    // Open PDF directly in a new tab!
    window.open(result.url, '_blank');
    return { url: result.url, fileName: cleanFileName, type: 'application/pdf', mode: 'pdf' };
  }

  if (lower.endsWith('.doc') || lower.endsWith('.docx') || result.type.includes('word') || result.type.includes('msword')) {
    // Trigger direct launch / download into Microsoft Word
    const link = document.createElement('a');
    link.href = result.url;
    link.download = cleanFileName.endsWith('.doc') || cleanFileName.endsWith('.docx') ? cleanFileName : `${cleanFileName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { url: result.url, fileName: cleanFileName, type: 'application/msword', mode: 'doc' };
  }

  // Other types
  const link = document.createElement('a');
  link.href = result.url;
  link.download = cleanFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return { url: result.url, fileName: cleanFileName, type: result.type, mode: 'other' };
}

/**
 * Generate and trigger download of a Windows launcher script (.bat)
 * This allows 1-click execution in Windows to open the exact file or directory in default desktop apps
 */
export function triggerWindowsLauncher(filePath: string, docketCode = 'HS'): void {
  if (!filePath) return;

  const winPath = filePath.replace(/\//g, '\\');
  const cleanCode = docketCode.replace(/[^a-zA-Z0-9_-]/g, '_');

  const batContent = `@echo off
chcp 65001 > nul
title DocuFlow - Mở hồ sơ gốc: ${cleanCode}
echo ======================================================================
echo  DOCUFLOW - BO MO TEP OFFLINE TREN MAY TINH
echo  Ma ho so: ${docketCode}
echo  Duong dan tep: ${winPath}
echo ======================================================================
echo.
echo Dang khoi chay tep tren ung dung mac dinh cua Windows...
echo.

if exist "${winPath}" (
    start "" "${winPath}"
    echo [THANH CONG] Da mo tep truc tiep!
    timeout /t 2 > nul
    exit
) else (
    echo [THONG BAO] Khong tim thay tep tai duong dan chinh xac:
    echo "${winPath}"
    echo.
    echo Dang thu mo thu muc chua ho so trong File Explorer...
    for %%F in ("${winPath}") do (
        if exist "%%~dpF" (
            start "" "%%~dpF"
        ) else (
            explorer.exe
        )
    )
    pause
    exit
)
`;

  const blob = new Blob([batContent], { type: 'application/x-bat;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Mo_HoSo_${cleanCode}.bat`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
