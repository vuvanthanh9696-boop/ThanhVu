# DocuFlow - Nền tảng Quản lý Hồ sơ & Công việc Cá nhân Thông minh

> Hệ thống quản lý công việc và hồ sơ cá nhân/đơn vị hiện đại, chuyên nghiệp, loại bỏ bảng tính rườm rà, tích hợp biểu đồ trực quan hóa dữ liệu và thông báo nhắc việc thông minh.

---

## 🌟 Tính Năng Nổi Bật

1. **Mô hình Dữ liệu Đa tầng (Docket & Sub-steps)**:
   - Một hồ sơ lớn (vụ việc, đề án, hợp đồng) chứa nhiều bước con tuần tự.
   - Mỗi bước con sở hữu mã định danh riêng, người phụ trách, thời hạn và trạng thái xử lý độc lập.

2. **Cơ chế Kiểm soát Thông minh & Chống Trùng lặp**:
   - Tự động phát hiện trùng lặp mã hồ sơ ngay trong quá trình nhập liệu.
   - Gợi ý mã hồ sơ tự động theo định dạng chuẩn (`HS-YYYY-XXX`).

3. **Bàn Làm Việc Hôm Nay (Executive Today View)**:
   - Tổng hợp nhiệm vụ cần xử lý ngay, quá hạn, sắp đến hạn (trong 48h) và hoàn thành trong ngày.
   - Hỗ trợ đánh dấu hoàn thành trực tiếp một chạm kèm âm thanh tương tác tinh tế (Web Audio Chime).

4. **Kho Tra Cứu & Bộ Lọc Nhanh**:
   - Tìm kiếm tức thì theo mã hồ sơ, trích yếu, cán bộ phụ trách, cơ quan phối hợp.
   - Lọc đa chiều: Theo trạng thái, danh mục, độ ưu tiên.
   - Xem dạng bảng chi tiết (hỗ trợ mở rộng bước con trực tiếp) hoặc dạng thẻ (Cards).

5. **Phân Tích & Biểu Đồ Trực Quan (Analytics Dashboard)**:
   - Biểu đồ tròn (Donut chart) phân bổ trạng thái hồ sơ.
   - Biểu đồ thanh tiến độ xử lý và khối lượng công việc theo cán bộ.
   - Đo lường tỷ lệ đúng hạn và hiệu suất giải quyết hồ sơ.

6. **Đồng Bộ Lịch Cá Nhân (Calendar & iCal Sync)**:
   - Tự động đưa các deadline vào lịch tháng/tuần trực quan.
   - Xuất tệp tiêu chuẩn `.ics` tương thích Apple Calendar, Google Calendar, Microsoft Outlook.
   - Tạo liên kết Google Calendar một chạm cho từng hồ sơ hoặc từng bước con.

7. **Bảo Mật & Sao Lưu Dữ Liệu**:
   - Xuất bảng kê chi tiết ra file Excel CSV (hỗ trợ UTF-8 tiếng Việt có dấu).
   - Sao lưu và phục hồi toàn diện qua tệp JSON.
   - Lưu trữ cục bộ an toàn (Local Storage).

---

## 🛠 Công Nghệ Sử Dụng

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v4 (Obsidian Dark Theme)
- **Icons**: Lucide React
- **Build Tool**: Vite 8
- **Audio & Notifications**: Web Audio API, Web Notification API

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu hệ thống:
- [Node.js](https://nodejs.org/) (khuyến nghị phiên bản 18+ hoặc 20+)
- Trình quản lý gói `npm`, `pnpm` hoặc `yarn`

### Các bước cài đặt:

1. **Clone repository về máy:**
   ```bash
   git clone <URL_REPOSITORY_CUA_BAN>
   cd docuflow
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Chạy máy chủ phát triển (Dev server):**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000` (hoặc cổng hiển thị trên terminal).

4. **Build phiên bản sản xuất (Production build):**
   ```bash
   npm run build
   ```
   Các tệp đầu ra được tối ưu hóa sẽ nằm trong thư mục `dist/`.

5. **Xem trước bản build (Preview):**
   ```bash
   npm run preview
   ```

---

## 📁 Cấu Trúc Thư Mục

```
├── src/
│   ├── components/         # Các module giao diện (Header, Sidebar, TodayView, DocketList,...)
│   ├── types/              # Khai báo kiểu TypeScript (Docket, DocketStep, Status,...)
│   ├── utils/              # Tiện ích (Lưu trữ, Âm thanh, Đồng bộ Lịch, Thông báo, Mẫu quy trình)
│   ├── App.tsx             # Điều phối trạng thái chính
│   ├── index.css           # Cấu hình Tailwind CSS & Scrollbar
│   └── main.tsx            # Điểm khởi chạy React DOM
├── index.html              # Trang HTML chính & font Plus Jakarta Sans
├── package.json            # Cấu hình dự án & dependencies
├── tsconfig.json           # Cấu hình TypeScript
└── vite.config.ts          # Cấu hình Vite & Tailwind plugin
```

---

## 📄 Bản Quyền
Dự án được xây dựng với mục tiêu nâng cao năng suất quản lý công việc và xử lý hồ sơ hành chính, chuyên môn.
