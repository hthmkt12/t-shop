# Tư vấn Nâng cấp Toàn diện UI/UX theo Chuẩn DESIGN.md (Apple / Nike Minimalist)

- **Ngày thực hiện:** 2026-09-03
- **Định hướng thẩm mỹ:** Thời trang tối giản cao cấp (Apple / Nike style từ `awesome-design-md`)
- **Phạm vi:** Toàn bộ Storefront (Header, Hero, Showcase, Catalog, PDP/POD Customizer, Cart & Checkout)
- **Nền tảng kỹ thuật:** Next.js 13 (App Router) + SCSS Modules + Payload CMS

---

## 1. Phán quyết (Verdict)
Shop POD hiện tại có luồng kỹ thuật tốt (touch-drag POD customizer, order bump cart, size guide, print specs), nhưng visual thô, tỷ lệ typography chưa chuẩn, spacing không đồng nhất và thiếu chiều sâu thời trang cao cấp. 

Áp dụng mô hình `DESIGN.md` chuẩn hóa toàn bộ Design Tokens vào SCSS Modules là lựa chọn đúng đắn:
- Không phá vỡ cấu trúc CSS Modules đang chạy ổn định.
- Không phát sinh dependency nặng (như Tailwind hay runtime CSS-in-JS).
- Thiết lập luật bất biến cho AI/Dev: typography scale, spacing grid 8pt, contrast ratios và micro-interactions.

---

## 2. Việc Nên Làm (What You Should Do)

### Giai đoạn 1: Thiết lập DESIGN.md gốc & Bộ Design Tokens chuẩn Apple/Nike
1. **Tạo `DESIGN.md` tại root dự án:**
   - Visual philosophy: Minimalist luxury, edge-to-edge product photography, generous whitespace, brutal contrast (pure black/white with surgical accent).
   - Typography: Font grotesque/geometric (SF Pro / Inter / Helvetica Neue), tỷ lệ phân cấp chuẩn (Display 48-64px, H1 36-40px, H2 28-32px, Body 15-16px, Micro 12px), line-height chặt chẽ (1.05 - 1.15 cho heading, 1.45 - 1.55 cho body).
   - Color Roles: Nền `#FFFFFF` / `#0A0A0A`, chữ `#111111` / `#F5F5F7`, viền siêu mờ `rgba(0,0,0,0.08)`, màu nhấn mua hàng/badge `#000000` (đảo ngược `#FFFFFF` trên dark mode).
   - Spacing & Radius: Scale 4px - 8px - 16px - 24px - 32px - 48px - 64px - 96px. Border radius: 0px (brutalist) hoặc 6px - 10px (Apple subtle rounded). Không dùng bo tròn bừa bãi.
2. **Refactor `src/app/_css/colors.scss`, `type.scss`, `theme.scss`:**
   - Map các biến token sang CSS variables toàn cục đồng bộ trực tiếp với `DESIGN.md`.

### Giai đoạn 2: Nâng cấp Thành phần Cốt lõi (Core Atoms & Molecules)
1. **Button & Input:**
   - Nút Apple/Nike: Chiều cao chuẩn 48px/52px, font-weight 500/600, transition `transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)`, hover scale nhẹ 1.01 hoặc invert màu dứt khoát.
   - Input: Nền flat nhẹ, viền border 1px subtle, focus outline 2px sắc nét, label nổi rõ ràng.
2. **Product Card (`Card/index.tsx` & `index.module.scss`):**
   - Hình ảnh tỷ lệ 1:1 hoặc 4:5 tràn viền, hover zoom nhẹ `scale(1.03)`, không dùng bóng đổ nặng (drop shadow).
   - Typography: Tên sản phẩm gọn 1 dòng, tag phân loại chữ nhỏ (12px uppercase tracking rộng), giá tiền nổi bật và badge variant tối giản.

### Giai đoạn 3: Nâng cấp Toàn diện các Màn hình Chính (Full Storefront)
1. **Header & Navigation:**
   - Header dạng sticky blur (`backdrop-filter: blur(20px)`), chiều cao 56px - 64px, logo đen tuyền, menu tinh giản, mini-cart badge thanh lịch.
2. **Trang chủ & Hero:**
   - Hero: Visual POD sản phẩm kích thước lớn, typography Display tối giản, 1 CTA chính duy nhất ("Khám phá BST" hoặc "Tự thiết kế ngay").
   - POD Showcase: Bố cục dạng editorial grid hoặc masonry thời trang thay vì dạng bảng carousel thông thường.
3. **Trang Chi tiết Sản phẩm (PDP) & POD Customizer:**
   - Split layout chuẩn Apple: Cột trái mockup sticky lớn, hỗ trợ đổi view (Mặt trước / Mặt sau) mượt mà; cột phải thông tin sản phẩm, chọn màu/size dạng capsule pills thời trang, giá rõ ràng.
   - POD Customizer: Canvas vùng in hiển thị viền đứt nét tinh tế, toolbar công cụ upload/drag/scale/rotate thiết kế dạng floating dock nổi hiện đại.
   - Size Guide & Specs: Modal hoặc drawer mở trượt từ cạnh phải, bảng đo size kẻ viền tối giản dễ tra cứu trên mobile.
4. **Giỏ hàng & Luồng Thanh toán (Cart & Checkout):**
   - Giỏ hàng: Layout 2 cột rõ ràng, thông tin sản phẩm in POD kèm thumbnail preview góc nhìn thực tế.
   - Order Bump Upsell: Card upsell viền mảnh, switch bật/tắt nhanh 1 chạm, hiển thị rõ số tiền tiết kiệm và mockup quà tặng kèm.

---

## 3. Việc Không Nên Làm (What You Shouldn't Do)
- **Không nhồi nhét hiệu ứng màu mè:** Tránh dùng gradient cầu vồng, drop shadow đậm, viền neon rẻ tiền.
- **Không can thiệp cấu trúc CSS framework khác (như cài Tailwind bừa bãi):** Sẽ gây xung đột bundle SCSS Modules hiện tại của Next.js + Payload CMS.
- **Không bỏ qua Dark Mode / Contrast:** Tối giản nhưng độ tương phản text/background phải luôn đạt chuẩn WCAG AA (tối thiểu 4.5:1).
- **Không làm customizer quá phức tạp trên mobile:** Hạn chế nhồi nhét quá nhiều nút bấm che mất khung nhìn mockup áo/sản phẩm.

---

## 4. Giải pháp Hiệu quả & Tiết kiệm Nhất (Efficiency First)
- **Lập `DESIGN.md` làm Single Source of Truth (SSoT):** Mọi token SCSS chỉ khai báo ở biến gốc CSS, các file `.module.scss` chỉ gọi biến token, không hardcode mã màu hex hay pixel lẻ.
- **Tận dụng kỹ năng `frontend-design` & `ui-ux-pro-max`:** Dùng trực tiếp bộ rule `awesome-design-md/systems/nike` hoặc `apple` để định nghĩa token và áp dụng trực tiếp qua các subagent.

---

## 5. Lộ trình Thực thi Chi tiết (Implementation Roadmap)

### Bước 1: Khởi tạo DESIGN.md & Thống nhất Token Hệ thống
- Tạo file `DESIGN.md` ở root dự án theo chuẩn 9 phần của VoltAgent.
- Cập nhật `src/app/_css/` (colors, type, theme, common) khớp 100% với token trong `DESIGN.md`.

### Bước 2: Nâng cấp Cụm Header, Footer & Khung Layout Chung
- Refactor `HeaderComponent`, `FooterComponent`, `Gutter`, `Button`.
- Áp dụng font typography mới, sticky blur header, spacing đồng nhất.

### Bước 3: Nâng cấp Trang Chủ & Category/Catalog Grid
- Refactor `HighImpact` hero hoặc `CustomHero`.
- Tối ưu `Card` sản phẩm, `CollectionArchive`, bộ lọc `Filters`.

### Bước 4: Đại tu Trang Chi tiết Sản phẩm (PDP) & POD Customizer
- Thiết kế lại layout `ProductHero`.
- Nâng cấp UI/UX `PodCustomizer` (drag/drop touch handler, floating toolbar, view switcher).
- Hoàn thiện giao diện Size Guide & Material Specs theo chuẩn editorial spec sheet.

### Bước 5: Tối ưu Giỏ hàng (Cart) & Order Bump Upsell
- Chuẩn hóa layout `CartPage`, `CartItem`.
- Nâng cấp micro-interaction cho nút tăng giảm số lượng, xoá món và bật checkbox upsell.

---

## 6. Lợi ích Đạt được (Benefits)
1. **Nâng tầm định vị thương hiệu:** Giao diện từ phong cách template mẫu trở thành cửa hàng thời trang POD cao cấp, tạo độ tin cậy tức thì cho khách mua hàng.
2. **Tăng tỷ lệ chuyển đổi (CRO):** Phân cấp thị giác rõ ràng giúp khách chọn size, phối màu, tự thiết kế mockup và checkout mượt mà hơn.
3. **Bảo trì và mở rộng nhất quán:** Bất kỳ lập trình viên hay AI Agent nào tiếp quản sau này chỉ cần đọc `DESIGN.md` là có thể viết tiếp UI chuẩn xác 100%.

---

## 7. Đánh đổi & Thách thức (Trade-offs)
- **Công sức refactor CSS Modules:** Phải đi qua từng file `.module.scss` để thay thế class cũ và áp dụng token mới.
- **Rủi ro hồi quy giao diện (Visual Regression):** Cần test kỹ trên cả màn hình Desktop lớn (1440px+), Tablet và Mobile (375px - 430px) để đảm bảo mockup customizer không bị vỡ layout.

---

## 8. Danh mục Công việc & Chỉ số Đo lường (Work Checklist & Success Metrics)

### Work Checklist:
- [ ] Tạo `DESIGN.md` tại root dự án định nghĩa Design Tokens chuẩn Apple/Nike.
- [ ] Cập nhật `src/app/_css/colors.scss`, `theme.scss`, `type.scss` map toàn bộ biến token.
- [ ] Refactor `Button`, `Input`, `Card` theo chuẩn typography, radius và hover states mới.
- [ ] Refactor `Header` (blur background, tối giản icon) và `Footer`.
- [ ] Refactor `Hero` trang chủ và `PodShowcase` grid.
- [ ] Tối ưu UI/UX `PodCustomizer` (floating tool dock, touch drag mượt mà, khung viền in tinh tế).
- [ ] Nâng cấp bảng `Size Guide` và `Material Specs` trên PDP.
- [ ] Refactor `CartPage` và module `Order Bump Upsell`.
- [ ] Kiểm tra responsive toàn bộ các breakpoint (mobile, tablet, desktop).
- [ ] Chạy kiểm thử build (`yarn build`) và verify luồng mua hàng trọn vẹn.

### Success Metrics:
- **Build & Syntax:** `yarn build` thành công, không lỗi SCSS syntax hay biến thiếu.
- **Visual Consistency:** 100% màu sắc và typography lấy từ CSS variables trong `DESIGN.md`.
- **Accessibility (A11y):** Tương phản chữ/nền đạt chuẩn WCAG AA (>= 4.5:1).
- **Mobile Usability:** Các thao tác chọn size, đổi view áo và kéo thả sticker trong POD Customizer hoạt động không bị giật lag, đạt 60fps trên mobile touch.
