# Báo Cáo Tư Vấn: Nâng Cấp Toàn Diện UI/UX Studio In PET theo Design Token styles.refero.design

- **Dự án**: T-Shop (Print-on-Demand E-Commerce Storefront)
- **Chủ đề**: Nâng cấp toàn diện UI/UX PodCustomizer với Design Token Minimalist Precision (styles.refero.design) & Guided Precision UX.
- **Ngày lập**: 05/09/2026
- **Trạng thái**: Đã phê duyệt (Confirmed by User)

---

## 1. Nhận Định & Đánh Giá Tổng Quan (Verdict)

Studio in ấn trực tuyến (PodCustomizer) là trái tim tạo ra doanh thu của mô hình Print-on-Demand (POD) Direct-to-Film (PET). Hiện tại, logic tính toán kỹ thuật (DPI Calculator, Phụ phí kích thước A3/A4/ngực, Proof Modal) đã hoàn thiện ở tầng data, nhưng lớp thể hiện thị giác (UI) còn rời rạc, các nút điều khiển dày đặc và thiếu độ mượt mà cao cấp chuẩn Apple / Nike.

Lựa chọn phong cách **Minimalist Precision** từ `styles.refero.design` kết hợp luồng **Guided Precision UX** (3 bước có chỉ dẫn) là quyết định đúng đắn nhất: vừa triệt tiêu sự bối rối của khách hàng phổ thông, vừa nâng tầm thẩm mỹ thương hiệu từ một "xưởng in giá rẻ" thành "thương hiệu thời trang bespoke cao cấp".

---

## 2. Hệ Thống Design Token: Minimalist Precision

Hệ thống token chuẩn hóa từ triết lý của Refero Design:

### 2.1. Bảng Màu & Bề Mặt (Colors & Surfaces)
- **Ground / Surface Canvas**: `#FFFFFF` (Light) / `#0A0A0C` (Dark Obsidian).
- **Surface Elevated / Floating Cards**: `#FBFBFD` (Light) / `#141416` (Dark).
- **Hairline Borders**: `rgba(0, 0, 0, 0.08)` (Light) / `rgba(255, 255, 255, 0.10)` (Dark).
- **Signal Accent (Electric Blue)**: `#0071E3` (Hover: `#0077ED`) - Dành cho CTA chính, viền active vùng in và điểm focus.
- **Status Indicators (DPI & Proof)**:
  - High Quality (300+ DPI): `#10B981` (Emerald).
  - Acceptable (150-299 DPI): `#F59E0B` (Amber).
  - Pixelated Warning (<150 DPI): `#EF4444` (Rose/Red).

### 2.2. Typography & Spacing
- **Font Stack**: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Geist", sans-serif`.
- **Typographic Scale**:
  - Eyebrow / Technical Tag: `11px` | `font-weight: 700` | `letter-spacing: 0.1em` | `uppercase`.
  - Tool Labels / Selectors: `13px` | `font-weight: 500`.
  - Headline / Panel Title: `18px` | `font-weight: 600` | `letter-spacing: -0.015em`.
  - Price Surcharge: `16px` | `font-weight: 700` | `tabular-nums`.
- **Corner Radii**:
  - Buttons & Badges: `999px` (Full Pill).
  - Canvas Container: `20px` (Apple Smooth Corner).
  - Tool Panels: `16px`.
  - Sub-cards / Pickers: `10px`.

---

## 3. Những Việc NÊN Làm (What You Should Do)

1. **Cấu trúc lại Layout Customizer dạng 2 cột bất đối xứng (60/40)**:
   - **Cột trái (60% Desktop)**: Khung Canvas giả lập phôi áo không viền, nền sáng dịu với nút đổi mặt áo (Trước / Sau) lơ lửng dạng pill kính mờ (frosted glass dock) ở đáy canvas.
   - **Cột phải (40% Desktop)**: Thanh công cụ điều khiển tuần tự 3 bước (Guided Stepper):
     - *Bước 1: Chọn màu & chất liệu phôi*.
     - *Bước 2: Tải lên đồ họa & Smart DPI Audit trực quan*.
     - *Bước 3: Chọn kích thước in PET (Ngực $0 | A4 +$3 | A3 +$6) kèm hiển thị giá live*.
2. **Trực quan hóa vùng in PET (Print Boundary Zone)**:
   - Dùng đường nét đứt siêu mảnh 1px có nhãn tinh tế hiển thị vị trí in chính xác trên ngực hoặc lưng áo.
   - Tự động căn giữa (Auto-center Snap) khi người dùng tải hình lên.
3. **Phản hồi DPI dạng thanh đo kỹ thuật số (Precision Meter)**:
   - Thay vì thông báo dạng text thô, dùng thanh đo độ nét vi mô (Micro-bar meter) hiển thị chỉ số DPI thực tế kèm khuyến nghị cụ thể.
4. **Digital Proof Modal 1 chạm trước khi Add to Cart**:
   - Khi bấm "Thêm vào giỏ", hiển thị popup duyệt market chuẩn xác với checklist cam kết độ nét in và chính tả, tạo sự an tâm tuyệt đối cho khách hàng.

---

## 4. Những Việc KHÔNG NÊN Làm (What You Shouldn't Do)

1. **Không biến Studio thành công cụ biên tập đồ họa phức tạp (Photoshop trap)**:
   - Tránh nhồi nhét: thước đo mm, quản lý layer nhiều lớp, công cụ pen tool, bộ lọc màu phức tạp. Điều này làm khách hàng bối rối và bỏ giỏ hàng giữa chừng.
2. **Không dùng màu sắc tương phản gắt hoặc hiệu ứng gradient màu mè**:
   - Loại bỏ các gradient tím/hồng phong cách AI; giữ nguyên màu đen/trắng thuần và xám kim loại để tôn vinh tác phẩm đồ họa của chính khách hàng.
3. **Không giấu phụ phí in ấn**:
   - Tuyệt đối không để khách hàng bất ngờ về phụ phí in cỡ lớn (+$3, +$6) ở bước thanh toán. Phải hiển thị minh bạch ngay khi khách chọn kích thước A4/A3.

---

## 5. Lộ Trình Triển Khai (Work Checklist)

- [ ] **Task 1**: Cập nhật bộ CSS Variables `src/app/_css/theme.scss` bổ sung token Refero Design (Obsidian surfaces, Hairline borders, Electric Blue).
- [ ] **Task 2**: Tái cấu trúc layout `src/app/_components/PodCustomizer/index.tsx` thành 2 cột Guided Precision (Canvas Dock bên trái, 3-Step Inspector bên phải).
- [ ] **Task 3**: Tinh chỉnh style SCSS `src/app/_components/PodCustomizer/index.module.scss` với phong cách tối giản cao cấp.
- [ ] **Task 4**: Tích hợp DPI Micro-meter và bộ chọn vùng in PET (Chest / A4 / A3) với visual feedback sinh động.
- [ ] **Task 5**: Đồng bộ Digital Proof Modal và kích hoạt thông số phụ phí vào Cart/Orders.
- [ ] **Task 6**: Build kiểm thử trên Docker và xác minh trải nghiệm người dùng trên các kích thước màn hình (Desktop & Mobile).

---

## 6. Tiêu Chí Thành Công (Success Metrics)

1. **DPI Awareness**: 100% người dùng upload file đều nhìn thấy cảnh báo trực quan về chất lượng ảnh trước khi đặt hàng.
2. **Speed to Design**: Thời gian trung bình từ khi chọn sản phẩm đến khi hoàn tất bản in và bấm Add to Cart dưới 60 giây.
3. **Responsive Canvas**: Canvas Fabric.js hiển thị sắc nét, co giãn mượt mà trên cả iPhone/Android và màn hình Retina.
4. **Build Integrity**: Không phát sinh bất kỳ lỗi TypeScript hay ESLint nào trong quá trình build Docker container.
