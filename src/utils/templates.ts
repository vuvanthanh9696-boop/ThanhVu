export interface WorkflowTemplateStep {
  codeSuffix: string;
  title: string;
  relativeDays: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  notes?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  defaultCategory: string;
  steps: WorkflowTemplateStep[];
}

export const DEFAULT_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl-tham-dinh',
    name: 'Quy trình Thẩm định & Trình ký Phê duyệt',
    description: 'Quy trình 4 bước chuẩn để thẩm định kỹ thuật, đối chiếu dự toán và trình ký lãnh đạo',
    defaultCategory: 'Thẩm định & Phê duyệt',
    steps: [
      {
        codeSuffix: 'B01',
        title: 'Tiếp nhận hồ sơ, kiểm tra tính đầy đủ và văn bản pháp lý liên quan',
        relativeDays: 1,
        priority: 'high',
        notes: 'Kiểm tra dấu, chữ ký và danh mục tài liệu kèm theo.',
      },
      {
        codeSuffix: 'B02',
        title: 'Lấy ý kiến chuyên gia kỹ thuật và đối chiếu định mức, đơn giá',
        relativeDays: 3,
        priority: 'urgent',
        notes: 'Lập phiếu lấy ý kiến hoặc họp tổ tư vấn.',
      },
      {
        codeSuffix: 'B03',
        title: 'Dự thảo Báo cáo kết quả thẩm định và tờ trình phê duyệt',
        relativeDays: 5,
        priority: 'high',
        notes: 'Soạn thảo theo mẫu biểu quy định.',
      },
      {
        codeSuffix: 'B04',
        title: 'Trình Lãnh đạo ký duyệt và ban hành văn bản chính thức',
        relativeDays: 7,
        priority: 'medium',
        notes: 'Gửi văn thư phát hành và lưu trữ điện tử.',
      },
    ],
  },
  {
    id: 'tpl-nghiem-thu',
    name: 'Quy trình Nghiệm thu & Quyết toán Hợp đồng',
    description: 'Quy trình kiểm tra sản phẩm, lập biên bản nghiệm thu và thanh toán',
    defaultCategory: 'Nghiệm thu - Bàn giao',
    steps: [
      {
        codeSuffix: 'B01',
        title: 'Rà soát khối lượng công việc hoàn thành và hồ sơ chứng từ của nhà thầu',
        relativeDays: 2,
        priority: 'medium',
        notes: 'Kiểm tra bảng khối lượng và hóa đơn chứng từ.',
      },
      {
        codeSuffix: 'B02',
        title: 'Kiểm tra thực tế hiện trường / thử nghiệm vận hành hệ thống',
        relativeDays: 4,
        priority: 'urgent',
        notes: 'Lập biên bản kiểm tra kỹ thuật tại hiện trường.',
      },
      {
        codeSuffix: 'B03',
        title: 'Ký kết Biên bản nghiệm thu kỹ thuật và thanh lý hợp đồng',
        relativeDays: 6,
        priority: 'high',
        notes: 'Ký các bên A - B và đại diện tư vấn giám sát.',
      },
      {
        codeSuffix: 'B04',
        title: 'Hoàn thiện hồ sơ thanh quyết toán gửi Kho bạc / Ngân hàng',
        relativeDays: 8,
        priority: 'high',
        notes: 'Lập giấy đề nghị thanh toán và ủy nhiệm chi.',
      },
    ],
  },
  {
    id: 'tpl-xu-ly-don-thu',
    name: 'Quy trình Xử lý Đơn thư & Văn bản đến',
    description: 'Quy trình phân loại, xác minh và ban hành văn bản trả lời công dân / đối tác',
    defaultCategory: 'Hành chính - Văn phòng',
    steps: [
      {
        codeSuffix: 'B01',
        title: 'Vào sổ văn thư, phân loại nội dung và kiểm tra thẩm quyền',
        relativeDays: 1,
        priority: 'medium',
        notes: 'Ghi số ký hiệu, ngày đến và lập phiếu trình chỉ đạo.',
      },
      {
        codeSuffix: 'B02',
        title: 'Phối hợp các phòng chức năng xác minh hồ sơ và tài liệu đính kèm',
        relativeDays: 3,
        priority: 'high',
        notes: 'Xác minh thực tế hoặc đề nghị bổ sung thông tin.',
      },
      {
        codeSuffix: 'B03',
        title: 'Dự thảo văn bản phúc đáp hoặc phương án giải quyết',
        relativeDays: 5,
        priority: 'high',
        notes: 'Dự thảo công văn trả lời kèm căn cứ pháp luật.',
      },
      {
        codeSuffix: 'B04',
        title: 'Báo cáo Lãnh đạo duyệt ký và gửi văn bản trả lời người gửi',
        relativeDays: 7,
        priority: 'urgent',
        notes: 'Ký duyệt, vào sổ phát hành và lưu hồ sơ lưu trữ.',
      },
    ],
  },
];

const TEMPLATES_STORAGE_KEY = 'docuflow_custom_workflow_templates_v2';

/**
 * Load all workflow templates (from localStorage if custom, fallback to defaults)
 */
export function loadWorkflowTemplates(): WorkflowTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(DEFAULT_WORKFLOW_TEMPLATES));
      return DEFAULT_WORKFLOW_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_WORKFLOW_TEMPLATES;
  } catch {
    return DEFAULT_WORKFLOW_TEMPLATES;
  }
}

/**
 * Save workflow templates to localStorage
 */
export function saveWorkflowTemplates(templates: WorkflowTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Failed to save templates:', err);
  }
}

/**
 * Reset templates back to initial system defaults
 */
export function resetWorkflowTemplates(): WorkflowTemplate[] {
  saveWorkflowTemplates(DEFAULT_WORKFLOW_TEMPLATES);
  return DEFAULT_WORKFLOW_TEMPLATES;
}

// For backward compatibility
export const WORKFLOW_TEMPLATES = DEFAULT_WORKFLOW_TEMPLATES;
