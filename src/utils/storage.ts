import { Docket, DocketStep, YearlyTask } from '../types';

const STORAGE_KEY = 'docuflow_dockets_v1';
const YEARLY_TASKS_STORAGE_KEY = 'docuflow_yearly_tasks_v1';

export const INITIAL_DOCKETS: Docket[] = [
  {
    id: 'docket-001',
    code: 'HS-2026-039',
    title: 'Thẩm định Báo cáo kinh tế - kỹ thuật Dự án Nâng cấp Hệ thống mạng và An toàn thông tin',
    category: 'Dự án & Chuyển đổi số',
    department: 'Phòng Công nghệ Thông tin',
    leadAssignee: 'Nguyễn Văn Thành',
    collaborators: ['Trần Thị Mai', 'Lê Hoàng Nam'],
    priority: 'urgent',
    status: 'in_progress',
    startDate: '2026-10-05',
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    notes: 'Ưu tiên thẩm định theo Quyết định số 142/QĐ-UBND. Chú ý tính tương thích thiết bị tường lửa thế hệ mới.',
    tags: ['Thẩm định', 'Hạ tầng mạng', 'An toàn thông tin', 'Khẩn'],
    attachments: [
      { id: 'att-1', name: 'ToTrinh_ThamDinh_039.pdf', size: '2.4 MB', localPath: 'D:\\HoSoCongViec\\HS-2026-039\\ToTrinh_ThamDinh_039.pdf', addedAt: '2026-10-05' },
      { id: 'att-2', name: 'DuToanChiTiet_MangATTT_v2.xlsx', size: '1.8 MB', localPath: 'D:\\HoSoCongViec\\HS-2026-039\\DuToanChiTiet_MangATTT_v2.xlsx', addedAt: '2026-10-06' }
    ],
    localFilePath: 'D:\\HoSoCongViec\\HS-2026-039\\ToTrinh_ThamDinh_039.pdf',
    localFileName: 'ToTrinh_ThamDinh_039.pdf',
    steps: [
      {
        id: 'step-001-1',
        stepCode: 'HS039-B01',
        title: 'Tiếp nhận hồ sơ, kiểm tra tính pháp lý và đầy đủ của hồ sơ dự án',
        assignee: 'Nguyễn Văn Thành',
        dueDate: '2026-10-06',
        status: 'completed',
        priority: 'high',
        completedAt: '2026-10-06T15:30:00Z',
        order: 1,
        notes: 'Đã nhận đủ 03 bộ hồ sơ gốc kèm file số hóa.',
      },
      {
        id: 'step-001-2',
        stepCode: 'HS039-B02',
        title: 'Lấy ý kiến chuyên gia kỹ thuật và đối chiếu đơn giá thiết bị',
        assignee: 'Lê Hoàng Nam',
        dueDate: new Date().toISOString().split('T')[0], // Today!
        status: 'in_progress',
        priority: 'urgent',
        order: 2,
        notes: 'Cần hoàn tất trong chiều nay để kịp tổng hợp bảng chênh lệch dự toán.',
      },
      {
        id: 'step-001-3',
        stepCode: 'HS039-B03',
        title: 'Dự thảo Báo cáo kết quả thẩm định và biên bản họp tổ tư vấn',
        assignee: 'Nguyễn Văn Thành',
        dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
        status: 'todo',
        priority: 'high',
        order: 3,
        notes: 'Áp dụng biểu mẫu chuẩn Mẫu số 04 ban hành kèm Nghị định 15.',
      },
      {
        id: 'step-001-4',
        stepCode: 'HS039-B04',
        title: 'Trình Lãnh đạo Ban phê duyệt và phát hành văn bản kết quả thẩm định',
        assignee: 'Nguyễn Văn Thành',
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        status: 'todo',
        priority: 'medium',
        order: 4,
        notes: 'Chuyển Văn thư đóng dấu và lưu trữ hồ sơ điện tử.',
      },
    ],
    createdAt: '2026-10-05T08:00:00Z',
    updatedAt: '2026-10-14T06:00:00Z',
  },
  {
    id: 'docket-002',
    code: 'HS-2026-042',
    title: 'Xây dựng Đề án Hiện đại hóa và Chuyển đổi số Quy trình Hồ sơ Công việc giai đoạn 2026-2028',
    category: 'Văn bản & Tham mưu',
    department: 'Văn phòng Ban',
    leadAssignee: 'Trần Thị Mai',
    collaborators: ['Nguyễn Văn Thành', 'Phạm Minh Đức'],
    priority: 'high',
    status: 'in_progress',
    startDate: '2026-10-01',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    notes: 'Mục tiêu số hóa 100% hồ sơ lưu trữ và liên thông chữ ký số cá nhân.',
    tags: ['Đề án', 'Chuyển đổi số', 'Quy trình công việc'],
    attachments: [
      { id: 'att-3', name: 'DeCuongDeAn_ChuyenDoiSo_2026.docx', size: '3.1 MB', localPath: 'D:\\HoSoCongViec\\HS-2026-042\\DeCuongDeAn_ChuyenDoiSo_2026.docx', addedAt: '2026-10-02' }
    ],
    localFilePath: 'D:\\HoSoCongViec\\HS-2026-042\\DeCuongDeAn_ChuyenDoiSo_2026.docx',
    localFileName: 'DeCuongDeAn_ChuyenDoiSo_2026.docx',
    steps: [
      {
        id: 'step-002-1',
        stepCode: 'HS042-B01',
        title: 'Khảo sát hiện trạng quy trình xử lý hồ sơ tại các phòng chuyên môn',
        assignee: 'Phạm Minh Đức',
        dueDate: '2026-10-08',
        status: 'completed',
        priority: 'medium',
        completedAt: '2026-10-08T16:00:00Z',
        order: 1,
      },
      {
        id: 'step-002-2',
        stepCode: 'HS042-B02',
        title: 'Xây dựng sơ đồ luồng công việc số và danh mục chỉ tiêu đo lường',
        assignee: 'Trần Thị Mai',
        dueDate: new Date().toISOString().split('T')[0], // Today!
        status: 'in_progress',
        priority: 'high',
        order: 2,
        notes: 'Làm việc cùng tổ công tác trước 16h.',
      },
      {
        id: 'step-002-3',
        stepCode: 'HS042-B03',
        title: 'Xin ý kiến góp ý của các Trưởng bộ phận và hoàn thiện dự thảo',
        assignee: 'Trần Thị Mai',
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        status: 'todo',
        priority: 'medium',
        order: 3,
      },
      {
        id: 'step-002-4',
        stepCode: 'HS042-B04',
        title: 'Báo cáo thông qua Ban Giám đốc và chuẩn bị phương án triển khai thử nghiệm',
        assignee: 'Trần Thị Mai',
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        status: 'todo',
        priority: 'high',
        order: 4,
      },
    ],
    createdAt: '2026-10-01T09:00:00Z',
    updatedAt: '2026-10-12T10:00:00Z',
  },
  {
    id: 'docket-003',
    code: 'HS-2026-035',
    title: 'Thanh tra, rà soát việc chấp hành quy chế quản lý tài chính và đấu thầu quý 3/2026',
    category: 'Thanh tra - Pháp chế',
    department: 'Phòng Kế hoạch & Đầu tư',
    leadAssignee: 'Vũ Quốc Huy',
    collaborators: ['Nguyễn Thị Lan'],
    priority: 'urgent',
    status: 'delayed',
    startDate: '2026-09-20',
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // Overdue!
    notes: 'Cần làm rõ hồ sơ năng lực nhà thầu phụ tại gói thầu trang thiết bị văn phòng.',
    tags: ['Thanh tra', 'Tài chính', 'Hạn chế rủi ro'],
    attachments: [
      { id: 'att-4', name: 'QuyetDinhThanhTra_35.pdf', size: '1.2 MB', localPath: 'D:\\HoSoCongViec\\HS-2026-035\\QuyetDinhThanhTra_35.pdf', addedAt: '2026-09-20' }
    ],
    localFilePath: 'D:\\HoSoCongViec\\HS-2026-035\\QuyetDinhThanhTra_35.pdf',
    localFileName: 'QuyetDinhThanhTra_35.pdf',
    steps: [
      {
        id: 'step-003-1',
        stepCode: 'HS035-B01',
        title: 'Kiểm tra hồ sơ chứng từ thanh toán và bảng kê hóa đơn điện tử',
        assignee: 'Nguyễn Thị Lan',
        dueDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
        status: 'completed',
        priority: 'high',
        completedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        order: 1,
      },
      {
        id: 'step-003-2',
        stepCode: 'HS035-B02',
        title: 'Đối chiếu biên bản bàn giao thực tế tại các điểm tiếp nhận',
        assignee: 'Vũ Quốc Huy',
        dueDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], // Step Overdue!
        status: 'blocked',
        priority: 'urgent',
        order: 2,
        notes: 'Chờ đơn vị bổ sung chứng từ xác nhận nguồn gốc linh kiện.',
      },
      {
        id: 'step-003-3',
        stepCode: 'HS035-B03',
        title: 'Lập Biên bản thanh tra chính thức và kiến nghị xử lý',
        assignee: 'Vũ Quốc Huy',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'todo',
        priority: 'urgent',
        order: 3,
      },
    ],
    createdAt: '2026-09-20T08:30:00Z',
    updatedAt: '2026-10-13T14:20:00Z',
  },
  {
    id: 'docket-004',
    code: 'HS-2026-028',
    title: 'Nghiệm thu, thanh quyết toán Hợp đồng cung cấp dịch vụ hạ tầng đám mây và bản quyền phần mềm',
    category: 'Nghiệm thu - Bàn giao',
    department: 'Phòng Tài chính - Kế toán',
    leadAssignee: 'Lê Hoàng Nam',
    collaborators: ['Nguyễn Văn Thành'],
    priority: 'medium',
    status: 'completed',
    startDate: '2026-09-10',
    dueDate: '2026-09-30',
    completedAt: '2026-09-29T16:00:00Z',
    notes: 'Đã hoàn tất thanh toán 100% giá trị hợp đồng sau nghiệm thu giai đoạn 2.',
    tags: ['Nghiệm thu', 'Hợp đồng', 'Quyết toán'],
    attachments: [
      { id: 'att-5', name: 'BienBanNghiemThu_28.pdf', size: '4.5 MB', localPath: 'D:\\HoSoCongViec\\HS-2026-028\\BienBanNghiemThu_28.pdf', addedAt: '2026-09-29' },
      { id: 'att-6', name: 'UyNhiemChi_KhoBac.pdf', size: '890 KB', localPath: 'D:\\HoSoCongViec\\HS-2026-028\\UyNhiemChi_KhoBac.pdf', addedAt: '2026-09-29' }
    ],
    localFilePath: 'D:\\HoSoCongViec\\HS-2026-028\\BienBanNghiemThu_28.pdf',
    localFileName: 'BienBanNghiemThu_28.pdf',
    steps: [
      {
        id: 'step-004-1',
        stepCode: 'HS028-B01',
        title: 'Kiểm tra tài khoản bàn giao và biên bản xác nhận SLA hệ thống',
        assignee: 'Lê Hoàng Nam',
        dueDate: '2026-09-20',
        status: 'completed',
        priority: 'medium',
        completedAt: '2026-09-19T11:00:00Z',
        order: 1,
      },
      {
        id: 'step-004-2',
        stepCode: 'HS028-B02',
        title: 'Ký kết Biên bản nghiệm thu kỹ thuật và hóa đơn VAT',
        assignee: 'Lê Hoàng Nam',
        dueDate: '2026-09-25',
        status: 'completed',
        priority: 'high',
        completedAt: '2026-09-24T15:00:00Z',
        order: 2,
      },
      {
        id: 'step-004-3',
        stepCode: 'HS028-B03',
        title: 'Hoàn tất thủ tục chuyển tiền tại Kho bạc Nhà nước',
        assignee: 'Phạm Thị Lan',
        dueDate: '2026-09-29',
        status: 'completed',
        priority: 'high',
        completedAt: '2026-09-29T14:30:00Z',
        order: 3,
      },
    ],
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-09-29T17:00:00Z',
  },
  {
    id: 'docket-005',
    code: 'HS-2026-045',
    title: 'Tiếp nhận và giải quyết Đơn thư kiến nghị của Công ty Cổ phần Công nghệ Việt An',
    category: 'Hành chính - Văn phòng',
    department: 'Bộ phận Tiếp nhận & Trả kết quả',
    leadAssignee: 'Đỗ Thị Hường',
    collaborators: ['Nguyễn Văn Thành'],
    priority: 'high',
    status: 'in_progress',
    startDate: '2026-10-10',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    notes: 'Thời hạn giải quyết đơn thư theo Luật Khiếu nại là tối đa 15 ngày làm việc.',
    tags: ['Đơn thư', 'Kiến nghị', 'Giải quyết đúng hạn'],
    attachments: [
      { id: 'att-7', name: 'DonKienNghi_VietAn.pdf', size: '1.1 MB', localPath: 'D:\\HoSoCongViec\\HS-2026-045\\DonKienNghi_VietAn.pdf', addedAt: '2026-10-10' }
    ],
    localFilePath: 'D:\\HoSoCongViec\\HS-2026-045\\DonKienNghi_VietAn.pdf',
    localFileName: 'DonKienNghi_VietAn.pdf',
    steps: [
      {
        id: 'step-005-1',
        stepCode: 'HS045-B01',
        title: 'Phân loại đơn thư và kiểm tra thẩm quyền giải quyết',
        assignee: 'Đỗ Thị Hường',
        dueDate: '2026-10-11',
        status: 'completed',
        priority: 'medium',
        completedAt: '2026-10-11T10:00:00Z',
        order: 1,
      },
      {
        id: 'step-005-2',
        stepCode: 'HS045-B02',
        title: 'Làm việc trực tiếp với đại diện doanh nghiệp để thu thập chứng cứ',
        assignee: 'Đỗ Thị Hường',
        dueDate: new Date().toISOString().split('T')[0], // Today!
        status: 'in_progress',
        priority: 'high',
        order: 2,
        notes: 'Họp lúc 14h tại phòng họp số 2.',
      },
      {
        id: 'step-005-3',
        stepCode: 'HS045-B03',
        title: 'Dự thảo văn bản trả lời chính thức trình Chánh Văn phòng duyệt',
        assignee: 'Đỗ Thị Hường',
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        status: 'todo',
        priority: 'high',
        order: 3,
      },
    ],
    createdAt: '2026-10-10T11:00:00Z',
    updatedAt: '2026-10-14T05:30:00Z',
  },
];

export function loadDockets(): Docket[] {
  if (typeof window === 'undefined') return INITIAL_DOCKETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DOCKETS));
      return INITIAL_DOCKETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Migrate and backfill localFilePath and attachment localPath if missing
      const migrated = parsed.map((d: Docket) => {
        const defaultPath = `D:\\HoSoCongViec\\${d.code}\\HoSo_${d.code}.pdf`;
        const localFilePath = d.localFilePath || defaultPath;
        const localFileName = d.localFileName || (d.attachments?.[0]?.name || `HoSo_${d.code}.pdf`);
        const attachments = (d.attachments || []).map((att) => ({
          ...att,
          localPath: att.localPath || `D:\\HoSoCongViec\\${d.code}\\${att.name}`,
        }));
        return {
          ...d,
          localFilePath,
          localFileName,
          attachments,
        };
      });
      return migrated;
    }
    return INITIAL_DOCKETS;
  } catch {
    return INITIAL_DOCKETS;
  }
}

export function saveDockets(dockets: Docket[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dockets));
  } catch (err) {
    console.error('Failed to save dockets to localStorage', err);
  }
}

/**
 * Intelligent duplicate code checker (real-time validation)
 */
export function checkDuplicateDocketCode(
  code: string,
  dockets: Docket[],
  excludeDocketId?: string
): { isDuplicate: boolean; matchedDocket?: Docket } {
  const normalized = code.trim().toLowerCase();
  if (!normalized) return { isDuplicate: false };

  const matched = dockets.find(
    (d) => d.code.trim().toLowerCase() === normalized && d.id !== excludeDocketId
  );

  return {
    isDuplicate: !!matched,
    matchedDocket: matched,
  };
}

/**
 * Auto-suggest the next available docket code
 */
export function suggestNextDocketCode(dockets: Docket[], prefix = 'HS-2026-'): string {
  let highest = 0;
  const numRegex = /\d+$/;

  dockets.forEach((d) => {
    const match = d.code.match(numRegex);
    if (match) {
      const n = parseInt(match[0], 10);
      if (!isNaN(n) && n > highest) {
        highest = n;
      }
    }
  });

  const nextNum = highest > 0 ? highest + 1 : 46;
  const pad = nextNum < 100 ? String(nextNum).padStart(3, '0') : String(nextNum);
  return `${prefix}${pad}`;
}

/**
 * Export dockets to UTF-8 BOM CSV (Excel friendly)
 */
export function exportToCSV(dockets: Docket[]): void {
  const headers = [
    'Mã hồ sơ',
    'Tên hồ sơ / Trích yếu',
    'Lĩnh vực',
    'Đơn vị liên quan',
    'Người phụ trách chính',
    'Độ ưu tiên',
    'Trạng thái',
    'Ngày bắt đầu',
    'Hạn hoàn thành',
    'Số bước con',
    'Số bước đã xong',
    'Tiến độ %',
    'Ghi chú',
  ];

  const rows = dockets.map((d) => {
    const totalSteps = d.steps.length;
    const completedSteps = d.steps.filter((s) => s.status === 'completed').length;
    const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return [
      `"${d.code.replace(/"/g, '""')}"`,
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.category.replace(/"/g, '""')}"`,
      `"${d.department.replace(/"/g, '""')}"`,
      `"${d.leadAssignee.replace(/"/g, '""')}"`,
      `"${d.priority.replace(/"/g, '""')}"`,
      `"${d.status.replace(/"/g, '""')}"`,
      `"${d.startDate || ''}"`,
      `"${d.dueDate || ''}"`,
      totalSteps,
      completedSteps,
      `${progress}%`,
      `"${(d.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `HoSoCongViec_DocuFlow_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export complete JSON Backup
 */
export function exportToJSON(dockets: Docket[]): void {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalDockets: dockets.length,
    dockets,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DocuFlow_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Initial sample strategic goals / key annual tasks
 */
export const INITIAL_YEARLY_TASKS: YearlyTask[] = [
  {
    id: 'yt-001',
    year: 2026,
    code: 'NV-2026-01',
    title: 'Hiện đại hóa hạ tầng mạng & đảm bảo an toàn thông tin cấp độ 3 toàn cơ quan',
    description: 'Nâng cấp toàn bộ hệ thống tường lửa thế hệ mới (Next-Gen Firewall), chuyển đổi địa chỉ IPv6 và đạt chứng nhận ATTT cấp độ 3 theo Nghị định 85/2016/NĐ-CP.',
    category: 'Dự án & Chuyển đổi số',
    quarter: 'q1',
    leadDepartment: 'Phòng Công nghệ Thông tin',
    leadPerson: 'Tôi (Cá nhân)',
    priority: 'urgent',
    status: 'in_progress',
    progress: 70,
    targetMetric: 'Hoàn thành thẩm định thiết kế, dự toán và ký hợp đồng thi công trước 30/11/2026',
    linkedDocketIds: ['docket-001'],
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'yt-002',
    year: 2026,
    code: 'NV-2026-02',
    title: 'Xây dựng Đề án Chuyển đổi số & Cơ sở dữ liệu chuyên ngành tập trung giai đoạn 2026 - 2030',
    description: 'Xây dựng kho dữ liệu dùng chung (Data Lake), tích hợp liên thông với Cổng Dịch vụ công Quốc gia và Trục kết nối liên thông dữ liệu NDXP.',
    category: 'Dự án & Chuyển đổi số',
    quarter: 'q2',
    leadDepartment: 'Phòng Kế hoạch & Đầu tư',
    leadPerson: 'Tôi (Cá nhân) - phối hợp: Trần Thị Mai',
    priority: 'high',
    status: 'in_progress',
    progress: 45,
    targetMetric: 'Trình UBND thành phố phê duyệt Đề cương dự toán chi tiết và kế hoạch lựa chọn nhà thầu',
    linkedDocketIds: ['docket-002'],
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-10-14T11:00:00Z',
  },
  {
    id: 'yt-003',
    year: 2026,
    code: 'NV-2026-03',
    title: 'Thanh tra toàn diện công tác quản trị nội bộ & thực thi công vụ tại các đơn vị',
    description: 'Tổ chức 05 đoàn thanh tra chuyên đề về việc chấp hành quy chế làm việc, quản lý tài sản công và tiếp công dân theo đúng chỉ đạo.',
    category: 'Thanh tra - Pháp chế',
    quarter: 'q3',
    leadDepartment: 'Văn phòng Ban',
    leadPerson: 'Tôi (Cá nhân) - phối hợp: Lê Hoàng Nam',
    priority: 'high',
    status: 'in_progress',
    progress: 80,
    targetMetric: 'Ban hành kết luận thanh tra đúng hạn, đôn đốc 100% kiến nghị xử lý sau thanh tra',
    linkedDocketIds: ['docket-003'],
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-09-30T15:00:00Z',
  },
  {
    id: 'yt-004',
    year: 2026,
    code: 'NV-2026-04',
    title: 'Quyết toán vốn đầu tư công & Nghiệm thu bàn giao trụ sở làm việc giai đoạn 1',
    description: 'Thực hiện kiểm toán độc lập, hoàn tất hồ sơ nghiệm thu phòng cháy chữa cháy và nghiệm thu hoàn thành công trình đưa vào sử dụng.',
    category: 'Nghiệm thu - Bàn giao',
    quarter: 'q4',
    leadDepartment: 'Ban Quản lý Dự án',
    leadPerson: 'Tôi (Cá nhân)',
    priority: 'urgent',
    status: 'completed',
    progress: 100,
    targetMetric: 'Giải ngân 100% kế hoạch vốn giao năm 2026 qua Kho bạc Nhà nước trước 31/12',
    linkedDocketIds: ['docket-004'],
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-09-29T17:00:00Z',
  },
  {
    id: 'yt-005',
    year: 2026,
    code: 'NV-2026-05',
    title: 'Nâng cao chất lượng tiếp nhận, giải quyết phản ánh kiến nghị của tổ chức và công dân',
    description: 'Đảm bảo tỷ lệ hài lòng của người dân trên 95%, chấm dứt hoàn toàn tình trạng hồ sơ trễ hạn không có văn bản xin lỗi.',
    category: 'Văn bản & Tham mưu',
    quarter: 'all_year',
    leadDepartment: 'Bộ phận Tiếp nhận & Trả kết quả',
    leadPerson: 'Tôi (Cá nhân) - phối hợp: Phạm Thu Hà',
    priority: 'medium',
    status: 'in_progress',
    progress: 55,
    targetMetric: '100% đơn thư khiếu nại, phản ánh được phân loại và xử lý theo đúng quy trình 7 ngày',
    linkedDocketIds: ['docket-005'],
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-10-12T09:00:00Z',
  },
  {
    id: 'yt-006',
    year: 2026,
    code: 'NV-2026-06',
    title: 'Đào tạo kỹ năng số, chuẩn hóa quy trình số hóa hồ sơ cho 100% cán bộ công chức',
    description: 'Tổ chức tập huấn sử dụng phần mềm quản lý hồ sơ công việc điện tử và khai thác an toàn trên môi trường mạng.',
    category: 'Nhân sự - Đào tạo',
    quarter: 'q2',
    leadDepartment: 'Văn phòng Ban',
    leadPerson: 'Tôi (Cá nhân) - phối hợp: Trần Thị Mai',
    priority: 'medium',
    status: 'completed',
    progress: 100,
    targetMetric: '100% cán bộ tham gia kiểm tra sát hạch đạt yêu cầu và thành thạo thao tác offline/online',
    linkedDocketIds: [],
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-06-15T16:00:00Z',
  },
];

/**
 * Load Yearly Tasks from LocalStorage
 */
export function loadYearlyTasks(): YearlyTask[] {
  try {
    const raw = localStorage.getItem(YEARLY_TASKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(YEARLY_TASKS_STORAGE_KEY, JSON.stringify(INITIAL_YEARLY_TASKS));
      return INITIAL_YEARLY_TASKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_YEARLY_TASKS;
  } catch (err) {
    console.error('Failed to load yearly tasks:', err);
    return INITIAL_YEARLY_TASKS;
  }
}

/**
 * Save Yearly Tasks to LocalStorage
 */
export function saveYearlyTasks(tasks: YearlyTask[]): void {
  try {
    localStorage.setItem(YEARLY_TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save yearly tasks:', err);
  }
}

/**
 * Reset to sample demo data for both Dockets and Yearly Tasks
 */
export function resetToSampleData(): Docket[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DOCKETS));
  localStorage.setItem(YEARLY_TASKS_STORAGE_KEY, JSON.stringify(INITIAL_YEARLY_TASKS));
  return INITIAL_DOCKETS;
}

export function resetToSampleYearlyTasks(): YearlyTask[] {
  localStorage.setItem(YEARLY_TASKS_STORAGE_KEY, JSON.stringify(INITIAL_YEARLY_TASKS));
  return INITIAL_YEARLY_TASKS;
}

/**
 * Export Yearly Tasks to CSV
 */
export function exportYearlyTasksToCSV(tasks: YearlyTask[], year = 2026): void {
  const headers = [
    'Mã nhiệm vụ',
    'Năm',
    'Quý / Kỳ hạn',
    'Tên nhiệm vụ trọng tâm',
    'Lĩnh vực',
    'Đơn vị chủ trì',
    'Cán bộ phụ trách',
    'Độ ưu tiên',
    'Trạng thái',
    'Tiến độ (%)',
    'Chỉ tiêu / Sản phẩm đầu ra',
    'Số hồ sơ liên kết',
    'Mô tả chi tiết',
  ];

  const rows = tasks.map((t) => [
    `"${t.code}"`,
    t.year,
    `"${t.quarter.toUpperCase()}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.category.replace(/"/g, '""')}"`,
    `"${t.leadDepartment.replace(/"/g, '""')}"`,
    `"${t.leadPerson.replace(/"/g, '""')}"`,
    `"${t.priority}"`,
    `"${t.status}"`,
    `${t.progress}%`,
    `"${(t.targetMetric || '').replace(/"/g, '""')}"`,
    t.linkedDocketIds?.length || 0,
    `"${(t.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `KeHoachNhiemVuTrongTam_${year}_DocuFlow.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a 1-click Windows Launcher Batch (.bat) file
 * that launches the exact local file path on the user's PC without browser sandbox restrictions!
 */
export function downloadWindowsLauncher(filePath: string, docketCode: string): void {
  if (!filePath) return;

  // Normalize path with Windows backslashes
  const winPath = filePath.replace(/\//g, '\\');
  const cleanCode = docketCode.replace(/[^a-zA-Z0-9_-]/g, '_');

  const batContent = `@echo off
chcp 65001 > nul
title DocuFlow - Mở hồ sơ gốc: ${cleanCode}
echo ======================================================================
echo  DOCUFLOW OFFLINE LAUNCHER - HO SO GOC
echo  Ma ho so: ${docketCode}
echo  Duong dan tep: ${winPath}
echo ======================================================================
echo Dang khoi chay tep tren may tinh...

if exist "${winPath}" (
    start "" "${winPath}"
    echo [OK] Da mo tep thanh cong tren may tinh!
    timeout /t 2 > nul
    exit
) else (
    echo [Luu y] Khong tim thay tep tai duong dan chinh xac:
    echo "${winPath}"
    echo.
    echo Dang mo thu muc chua ho so trong File Explorer...
    for %%F in ("${winPath}") do start "" "%%~dpF"
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
