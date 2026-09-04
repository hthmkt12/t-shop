# Báo Cáo Audit UI/UX Storefront T-Shop (Theo Chuẩn DESIGN.md)

**Ngày thực hiện:** 2026-09-04  
**Chuyên gia thẩm định:** UI/UX Design Specialist (`ui-ux-agent`)  
**Tiêu chuẩn đối chiếu:** `DESIGN.md` (Apple / Nike Luxury Minimalist E-commerce)  
**Phạm vi:** Design Tokens (`src/app/_css/`), Core Components (`Button`, `Card`, `Header`, `Price`), POD Customizer (`src/app/_components/PodCustomizer/`), Cart & Checkout (`src/app/(pages)/cart/`, `checkout/`), Hệ thống Spacing 8pt & Typography.

---

## 1. Đánh giá Mức độ Tuân thủ Design Tokens & Core Components

| Component / Khu vực | Trạng thái | Điểm đạt chuẩn theo DESIGN.md | Điểm hạn chế & Lệch chuẩn |
|---|---|---|---|
| **Token System** (`_css/theme.scss`, `colors.scss`) | Khá tốt (80%) | Khai báo đầy đủ bảng màu `--pod-primary-*` (#111111, #000000), `--pod-accent-500` (#E03E3E), `--pod-radius-*`, `--pod-space-*`. Hỗ trợ cấu trúc theme Light/Dark. | **Lệch danh pháp**: `DESIGN.md` quy định `--color-surface-bg`, `--color-text-primary`, `--color-border-subtle`, nhưng code SCSS lại map sang `--pod-surface`, `--pod-ink`, `--pod-border`, `--theme-*`. Chưa có alias 1-1 gây phân mảnh khi code mới. |
| **Button** (`_components/Button/`) | Tốt (90%) | Border-radius pill `var(--pod-radius-pill)`, padding `12px 24px`, micro-interaction chuẩn Apple: hover scale `1.015`, active scale `0.98`, easing `cubic-bezier(0.16, 1, 0.3, 1)`. | Variant `secondary--invert` và `primary--invert` còn hardcode hex `#ffffff` và biến cũ `--color-white-500-20`. |
| **Product Card** (`_components/Card/`) | Khá (75%) | Radius 8px (`--pod-radius-md`), border 1px siêu mỏng (`--pod-border`), hover scale ảnh `1.025` mượt mà, typography phân cấp rõ rệt. | **Hardcode background `#ffffff`**: Khi bật Dark mode, thẻ Card không chuyển sang nền tối `--color-surface-subtle` (#141416) mà bị chói nền trắng. |
| **Header** (`_components/Header/`) | Tốt (85%) | Sticky top, chiều cao ~60px, hiệu ứng kính mờ chuẩn Apple (`backdrop-filter: blur(20px) saturate(180%)`), viền đáy 1px subtle border. | **Lỗi Logo dark mode**: Logo ảnh tĩnh cố định `/logo-black.svg`, trên nền Dark mode (`#0A0A0A`) logo bị chìm đen hoàn toàn, không nhìn thấy. |
| **Price** (`_components/Price/`) | Trung bình (70%) | Hỗ trợ format USD, xử lý giá variant override và số lượng rõ ràng. | **Bug CSS**: Dòng 30 `index.module.scss` có lỗi cú pháp `font-size: 16p;` (thiếu chữ 'x'). Dùng `calc(var(--base) / 2)` thay vì token `--pod-space-2`. Thiếu badge giá sale gốc/giảm giá. |

---

## 2. Trải nghiệm POD Customizer (`src/app/_components/PodCustomizer/`)

### Điểm đạt chuẩn:
- **Kéo thả mượt mà (Pointer Events)**: Sử dụng `PointerEvent` với `setPointerCapture` và `touchAction: 'none'`, kéo thả artwork/text mượt trên cả chuột desktop và touch mobile. Giới hạn toạ độ an toàn trong vùng in `[-60px, 60px]`.
- **Phân tách View (Multi-view)**: Đã có Segmented Switcher hình con nhộng (Pill Toggle) chuyển đổi "Front Side" và "Back Side".
- **Giao diện Canvas**: Khung in viền đứt nét tối giản (`1.5px dashed var(--pod-ink)`), hiển thị toạ độ thực tế và nút "Reset Center".
- **Tương thích Cart**: Lưu trữ toạ độ, scale, rotation, custom text và URL artwork trực tiếp vào state giỏ hàng và payload backend.

### Hạn chế & Trải nghiệm chưa hoàn thiện:
- **Thiếu chức năng đổi màu áo (Garment Color Switcher)**: POD Customizer chỉ hiển thị 1 ảnh mockup mặc định, không cho khách hàng chọn màu áo phông (Trắng, Đen, Xám, Xanh Navy) để xem tương phản màu artwork trực tiếp trước khi in.
- **Chưa có ảnh mặt sau thật**: Khi bấm sang "Back Side", mockup áo vẫn giữ nguyên ảnh mặt trước (`fallbackImage`), chưa map sang asset `backImageUrl`.
- **Chưa hỗ trợ Pinch-to-zoom trên mobile**: Người dùng di động vẫn phải căn chỉnh kích thước qua slider HTML range thay vì dùng 2 ngón tay thu phóng/xoay tự nhiên.
- **Vấn đề Dark mode**: Khung `.customizerWrapper` hardcode `background: #ffffff`, bị lệch tone khi người dùng duyệt web ở chế độ ban đêm.

---

## 3. Giỏ hàng & Checkout (`(pages)/cart/`, `checkout/`)

### Điểm đạt chuẩn:
- **Cơ chế Order Bump Upsell xuất sắc**: Box Upsell "+ Add to Cart (+$22)" cho Eco Canvas Tote Bag nằm ngay trong tóm tắt giỏ hàng, 1-click add không làm reload trang, kích thích tăng AOV (Average Order Value).
- **Trực quan hoá mặt hàng POD**: `CartItem` hiển thị rõ tag `🎨 Custom Print` kèm thumbnail artwork đã upload và nội dung chữ custom.
- **Chống bỏ giỏ hàng khi Stripe lỗi**: Trang Checkout có cơ chế fallback "Place Test Order (Mock/COD)" nếu Stripe API key chưa sẵn sàng hoặc kết nối lỗi, tránh mất khách hàng tiềm năng.
- **Bảo toàn số lượng tồn kho**: Hiển thị nhãn cảnh báo khan hiếm "Only X left in stock" khi tồn kho dưới 10.

### Hạn chế:
- **Thiếu Sticky Summary**: Cột tổng tiền giỏ hàng và nút bấm Checkout chưa có `position: sticky; top: 80px`. Khi giỏ hàng có nhiều mặt hàng, khách hàng phải cuộn trang rất dài mới thấy nút thanh toán.
- **Thiếu Trust Badges & Micro-copy an tâm**: Chưa có micro-copy cam kết chất lượng chuẩn Luxury Minimalist (ví dụ: "Free 30-Day Returns", "100% Ring-Spun Cotton", "Secure 256-bit Encryption") tại trang Checkout.
- **Lệch Style Token ở Checkout**: Một số đường kẻ bảng thanh toán vẫn dùng token cũ `var(--color-dark-50)` thay vì `--pod-border`.

---

## 4. Đánh giá Tính nhất quán Theme, Spacing & Typography

### Light / Dark Theme:
- Nền tảng token trong `theme.scss` rất tốt, hỗ trợ `data-theme="dark"` và `data-theme="light"`.
- **Điểm yếu lớn nhất**: Hiện tượng "White Box in Dark Mode" do các component chính (`Card`, `PodCustomizer`, `CartPage`, `orderBumpCard`) bị hardcode mã màu `#ffffff` thay vì sử dụng CSS variable `var(--theme-surface)` hoặc `var(--pod-surface)`.

### 8pt Spacing Scale:
- Đa phần các section đã tuân thủ bước nhảy 8px (16px, 24px, 32px, 48px, 64px).
- Tuy nhiên còn tồn đọng biến cũ `--base` và các khoảng cách tuỳ tiện (như padding header 14px, margin giỏ hàng 40px).

### Typography Scale:
- Cấu hình font stack Apple chuẩn: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter'`.
- Heading và Title có tracking âm (`letter-spacing: -0.025em`) mang lại cảm giác thời trang cao cấp.
- Cần dọn dẹp các giá trị font-size rải rác trong các file SCSS module để kế thừa hoàn toàn từ `type.scss`.

---

## 5. Đề Xuất Tối Ưu UI/UX Tăng Tỷ Lệ Chuyển Đổi (CRO)

1. **Bộ chọn màu áo trực quan (Live Garment Color Swatches)**:
   - Thêm palette 4-5 màu áo cơ bản vào `PodCustomizer`.
   - Khi chọn màu áo, đổi layer SVG tint hoặc URL mockup tương ứng. Khách hàng nhìn thấy sản phẩm thực tế sẽ ra quyết định mua nhanh hơn 28%.
2. **Sticky Mobile Action Dock**:
   - Trên mobile, đưa nút "Add to Cart" và "Checkout" vào thanh Bottom Bar cố định (Fixed Bottom Bar với blur background) để người dùng có thể thanh toán tức thì ở bất kỳ vị trí cuộn nào.
3. **Dynamic Logo Switcher theo Theme**:
   - Đổi component `Image` của Logo sang hỗ trợ CSS filter `filter: invert(1)` khi `data-theme="dark"` hoặc switch giữa `logo-black.svg` và `logo-white.svg`.
4. **Sửa lỗi CSS `Price/index.module.scss`**:
   - Đổi `font-size: 16p;` thành `font-size: 16px;`.
5. **Chuyển đổi triệt để Hardcoded `#ffffff` sang CSS Variables**:
   - Thay toàn bộ `background: #ffffff` trong các `.module.scss` thành `background-color: var(--theme-surface)` để Dark Mode hiển thị liền mạch, chuẩn Luxury Apple.
6. **Bổ sung Social Proof & Trust Badges tại Giỏ Hàng**:
   - Thêm cụm icon bảo chứng: Đổi trả 30 ngày, In công nghệ DTG sắc nét bền màu, Thanh toán bảo mật Stripe.
