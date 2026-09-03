---
title: "Nâng cấp Toàn diện UI/UX Storefront theo Chuẩn DESIGN.md (Apple / Nike Minimalist)"
description: "Kế hoạch 5 giai đoạn đại tu giao diện thời trang tối giản cao cấp, chuẩn hóa Design Tokens SSoT, refactor SCSS Modules cho toàn bộ Storefront, POD Customizer và Cart Checkout."
status: pending
priority: P1
effort: "16h"
branch: main
tags: [ui, ux, design-system, scss, pod, ecommerce]
blockedBy: []
blocks: []
created: 2026-09-03
---

# Kế hoạch Nâng cấp Toàn diện UI/UX Storefront theo Chuẩn DESIGN.md (Apple / Nike Minimalist)

## 1. Tổng quan & Mục tiêu
Chuyển đổi toàn bộ storefront từ kiểu mẫu e-commerce thô sơ sang phong cách thời trang tối giản cao cấp lấy cảm hứng từ Apple / Nike (dựa trên tài liệu chuẩn `awesome-design-md`). 

Dự án giữ nguyên cấu trúc kỹ thuật cốt lõi: **Next.js 13 App Router + SCSS Modules + Payload CMS**, áp dụng file `DESIGN.md` ở root làm Single Source of Truth (SSoT) cho toàn bộ quy tắc giao diện, màu sắc, khoảng cách, font chữ và tương tác.

## 2. Các giai đoạn thực thi (Phases Roadmap)

| Phase | Tên giai đoạn | Mục tiêu chính | File tác động chính | Ước tính |
|---|---|---|---|---|
| **Phase 01** | `DESIGN.md` & Core Design Tokens | Tạo file `DESIGN.md`, map token vào biến CSS toàn cục | `DESIGN.md`, `src/app/_css/*.scss` | 2.5h |
| **Phase 02** | Base Atoms & Core Molecules | Nâng cấp Button, Input, Card sản phẩm, Typography | `Button/`, `Input/`, `Card/`, `Price/` | 3h |
| **Phase 03** | Layout Frame, Header & Footer | Header sticky blur, navigation tối giản, footer thời trang | `Header/`, `Footer/`, `Gutter/` | 2.5h |
| **Phase 04** | Homepage, Hero & Catalog Grid | Hero khổ lớn, PodShowcase editorial grid, bộ lọc | `HighImpact/`, `PodShowcase/`, `products/` | 3.5h |
| **Phase 05** | PDP, POD Customizer & Cart/Checkout | Giao diện Product detail 2 cột, floating dock toolbar, size specs, cart order bump | `Product/`, `PodCustomizer/`, `CartPage/` | 4.5h |

## 3. Rủi ro & Chiến lược phòng ngừa
1. **Rủi ro vỡ layout responsive:**
   - *Phòng ngừa:* Giữ nguyên semantic HTML và logic container của Next.js; chỉ tinh chỉnh layout flex/grid và biến token SCSS. Kiểm thử breakpoint 375px, 768px, 1024px, 1440px ở mỗi phase.
2. **Xung đột kiểu màu sắc trên Dark Mode:**
   - *Phòng ngừa:* Định nghĩa cặp token tương phản tuyệt đối trong `theme.scss` (`--theme-bg`, `--theme-elevation`, `--theme-text-primary`, `--theme-border`) dựa theo `DESIGN.md`.

## 4. Tiêu chí nghiệm thu tổng thể (Acceptance Criteria)
- [ ] File `DESIGN.md` chuẩn 9 phần hiện diện tại root dự án.
- [ ] Không còn hardcode mã màu hex hay khoảng cách pixel tùy tiện trong các file `.module.scss` được refactor.
- [ ] Build thành công với lệnh `yarn build` không sinh lỗi CSS/SCSS hay TypeScript.
- [ ] Trải nghiệm POD Customizer mượt mà trên cả desktop và màn hình cảm ứng điện thoại.
