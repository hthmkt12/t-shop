---
phase: 2
title: "Nâng cấp Thành phần Giao diện Cốt lõi (Base Atoms & Core Molecules)"
status: pending
priority: P1
effort: "3h"
dependencies: ["phase-01"]
---

# Phase 02: Nâng cấp Thành phần Giao diện Cốt lõi (Base Atoms & Core Molecules)

## Mục tiêu
Tái cấu trúc các thành phần UI nguyên tử (Button, Input, Checkbox, Radio, Card sản phẩm, Price badge) theo quy chuẩn thời trang tối giản của Apple / Nike, đồng bộ các hiệu ứng hover, active và trạng thái tương tác mượt mà.

## Danh sách File Tác động
- Cập nhật:
  - `src/app/_components/Button/index.tsx` & `index.module.scss`
  - `src/app/_components/Input/index.tsx` & `index.module.scss`
  - `src/app/_components/Card/index.tsx` & `index.module.scss`
  - `src/app/_components/Price/index.tsx` & `index.module.scss`
  - `src/app/_components/Checkbox/index.module.scss`
  - `src/app/_components/Radio/index.module.scss`

## Nhiệm vụ chi tiết (Tasks & Steps)

1. **Button Component (`Button/`):**
   - Định hình 3 biến thể rõ ràng: Primary (solid black / white on dark), Secondary (ghost with subtle 1px border), Link / Minimalist.
   - Chuẩn hóa padding, font-weight 500/600, height 44px/52px.
   - Transition siêu tốc `transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)` với active state scale `0.98`.

2. **Input, Checkbox & Form Controls (`Input/`, `Checkbox/`, `Radio/`):**
   - Loại bỏ viền dày thô; sử dụng viền mảnh 1px tinh tế `rgba(0,0,0,0.1)`.
   - Focus state: Outline 1.5px sắc nét, không đổ bóng mờ nhòe.
   - Label & error text theo tỷ lệ chuẩn, phân cấp màu chữ rõ ràng.

3. **Product Card (`Card/index.module.scss`):**
   - Tỷ lệ khung hình sản phẩm chuẩn (1:1 hoặc 4:5 tràn viền hiện đại).
   - Hiệu ứng hover: Image scale nhẹ `1.03` với transition mượt, không dùng drop shadow bệt màu.
   - Layout thông tin: Tên sản phẩm typography thanh mảnh, category tag tracking rộng, hiển thị giá rõ ràng kèm variant color swatch dots nếu có.

## Tiêu chí Nghiệm thu (Verification)
- [ ] Các nút bấm, ô nhập liệu và card sản phẩm phản chiếu chính xác ngôn ngữ Apple/Nike.
- [ ] Hover/active states đồng nhất, không có độ trễ hoặc giật khung hình.
- [ ] Không có lỗi typecheck TypeScript trên các file components đã chỉnh sửa.
