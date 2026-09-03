---
phase: 3
title: "Khung Layout Tổng thể, Header & Footer (Shell & Navigation)"
status: pending
priority: P1
effort: "2.5h"
dependencies: ["phase-01", "phase-02"]
---

# Phase 03: Khung Layout Tổng thể, Header & Footer (Shell & Navigation)

## Mục tiêu
Tái cấu trúc khung bao storefront, thanh điều hướng Header và chân trang Footer theo phong cách tối giản thanh lịch, sử dụng hiệu ứng backdrop blur chuẩn macOS/iOS và tối ưu trải nghiệm di chuyển qua các trang.

## Danh sách File Tác động
- Cập nhật:
  - `src/app/_components/Header/HeaderComponent/index.tsx` & `index.module.scss`
  - `src/app/_components/Header/Nav/index.tsx` & `index.module.scss`
  - `src/app/_components/Footer/FooterComponent/index.tsx` & `index.module.scss`
  - `src/app/_components/Gutter/index.module.scss`
  - `src/app/_components/AdminBar/index.module.scss`

## Nhiệm vụ chi tiết (Tasks & Steps)

1. **Header Sticky & Navigation Blur:**
   - Chiều cao cố định 56px - 64px, cố định trên cùng (`position: sticky; top: 0`).
   - Nền kính mờ `backdrop-filter: blur(20px) saturate(180%)`, border bottom 1px siêu mờ `rgba(0,0,0,0.06)`.
   - Logo typography đen tuyền thanh lịch, link menu phân cấp rõ ràng với hover underline hoặc opacity shift.
   - Mini-cart icon tích hợp badge số lượng dạng viên thuốc đen tối giản.

2. **Footer Structure:**
   - Chuyển sang phong cách editorial/luxury footer: background trung tính sạch sẽ, phân chia cột danh mục rõ ràng.
   - Bổ sung thông tin chính sách, bảo mật, cam kết in ấn POD và liên kết mạng xã hội theo phong cách tối giản.

3. **Gutter & Container Spacing:**
   - Tối ưu max-width container (1280px - 1440px) và padding biên responsive theo thang khoảng cách 8pt.

## Tiêu chí Nghiệm thu (Verification)
- [ ] Header giữ hiệu ứng blur mượt mà khi cuộn trang, không che mất nội dung.
- [ ] Menu responsive hoạt động mượt trên mobile (drawer hoặc fullscreen minimal overlay).
- [ ] Footer hiển thị cân đối, không xuất hiện thanh cuộn ngang ngoài ý muốn (`overflow-x`).
