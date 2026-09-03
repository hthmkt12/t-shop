---
phase: 5
title: "Trang Chi Tiết Sản Phẩm (PDP), POD Customizer & Giỏ Hàng Checkout"
status: pending
priority: P1
effort: "4.5h"
dependencies: ["phase-02", "phase-03", "phase-04"]
---

# Phase 05: Trang Chi Tiết Sản Phẩm (PDP), POD Customizer & Giỏ Hàng Checkout

## Mục tiêu
Hoàn thiện trái tim của trải nghiệm POD: Trang Chi Tiết Sản Phẩm (PDP) phong cách Apple với tính năng đổi góc nhìn áo mượt mà, bộ công cụ POD Customizer (floating dock, kéo thả sticker cảm ứng), bảng tra cứu kích cỡ/chất liệu chuẩn spec sheet, và luồng giỏ hàng tích hợp Order Bump chuyển đổi cao.

## Danh sách File Tác động
- Cập nhật:
  - `src/app/_heros/Product/index.tsx` & `index.module.scss`
  - `src/app/_components/PodCustomizer/index.tsx` & `index.module.scss`
  - `src/app/_components/AddToCartButton/index.module.scss`
  - `src/app/(pages)/cart/CartPage/index.tsx` & `index.module.scss`
  - `src/app/(pages)/cart/CartItem/index.module.scss`

## Nhiệm vụ chi tiết (Tasks & Steps)

1. **Product Detail Page (PDP Layout):**
   - Cột trái: Mockup sản phẩm kích thước lớn cố định (sticky). Nút chuyển đổi góc nhìn (Mặt trước / Mặt sau) thiết kế dạng segmented control tinh xảo.
   - Cột phải: Thông tin giá, danh sách chọn màu áo dạng swatch tròn tối giản, chọn size dạng capsule pills có hiển thị trạng thái còn/hết hàng rõ nét.

2. **Nâng cấp Giao diện POD Customizer (`PodCustomizer/`):**
   - Thiết kế lại thanh công cụ thành Floating Dock bo góc nhẹ nổi phía dưới canvas in áo.
   - Vùng in giới hạn (print area) hiển thị viền đứt nét siêu mảnh, tinh tế, tự ẩn khi không tương tác để khách ngắm trọn vẹn mockup.
   - Tối ưu các nút xoay, đổi tỷ lệ, xoá sticker với icon nét mảnh (stroke 1.5px), phản hồi cảm ứng mượt trên mobile.

3. **Size Guide & Technical Print Specs:**
   - Trình bày thông số kích thước (Dài áo, Rộng vai, Ngực) dạng bảng tối giản viền 1px, hỗ trợ chuyển đổi cm/inch.
   - Bổ sung thông tin chất liệu (100% Ring-spun Combed Cotton, trọng lượng vải gsm) theo phong cách thông số kỹ thuật Apple.

4. **Giỏ hàng (CartPage) & Order Bump Upsell:**
   - Giỏ hàng 2 cột cân đối: Danh sách món hàng bên trái (hiển thị rõ thumbnail mockup đã customize), tóm tắt đơn hàng bên phải.
   - Nâng cấp card Order Bump Upsell: Thiết kế dạng thẻ ưu đãi viền mảnh với công tắc toggle nhanh 1 chạm, làm nổi bật ngay số tiền tiết kiệm được.

## Tiêu chí Nghiệm thu (Verification)
- [ ] POD Customizer thao tác kéo thả, scale và xoay sticker mượt mà, đạt 60fps trên màn hình cảm ứng điện thoại.
- [ ] Thông tin thiết kế tùy chỉnh và biến thể áo được lưu chính xác vào Giỏ hàng khi bấm "Thêm vào giỏ".
- [ ] Order Bump bật/tắt cập nhật tổng tiền đơn hàng tức thì không bị giật lag.
- [ ] Chạy `yarn test:pod` và `yarn build` xác nhận toàn bộ hệ thống hoạt động hoàn hảo.
