---
phase: 1
title: "Thiết lập DESIGN.md gốc & Bộ Design Tokens chuẩn Apple/Nike"
status: pending
priority: P1
effort: "2.5h"
dependencies: []
---

# Phase 01: Thiết lập DESIGN.md gốc & Bộ Design Tokens chuẩn Apple/Nike

## Mục tiêu
Tạo file `DESIGN.md` tại root dự án làm bản đặc tả thiết kế chuẩn cho toàn bộ AI Agent và lập trình viên. Tái cấu trúc các file SCSS cơ sở (`colors.scss`, `type.scss`, `theme.scss`, `common.scss`) để xuất ra bộ CSS Variables tương thích 100% với hệ thống Design Tokens.

## Danh sách File Tác động
- Tạo mới: `DESIGN.md` (root)
- Cập nhật:
  - `src/app/_css/colors.scss`
  - `src/app/_css/type.scss`
  - `src/app/_css/theme.scss`
  - `src/app/_css/common.scss`

## Nhiệm vụ chi tiết (Tasks & Steps)

1. **Khởi tạo `DESIGN.md` theo chuẩn VoltAgent (9 mục):**
   - *Atmosphere:* High-fashion minimalist, high-contrast, generous whitespace, sharp edges or subtle 6px/8px radii.
   - *Color roles:* `--color-surface`, `--color-surface-subtle`, `--color-text-primary`, `--color-text-secondary`, `--color-border-subtle`, `--color-accent-black`.
   - *Typography scale:* Font stack `SF Pro, Inter, -apple-system, BlinkMacSystemFont, sans-serif`. Display (56px), Title 1 (36px), Title 2 (24px), Body (15px), Caption/Micro (12px uppercase tracking).
   - *Spacing scale:* 8pt grid (4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px).
   - *Component rules & anti-patterns:* Không dùng shadow mờ đục, không viền sặc sỡ, nút bấm vuông vắn hoặc pill sắc sảo.

2. **Refactor hệ thống CSS Variables toàn cục trong `src/app/_css/`:**
   - Map các biến token trực tiếp vào `:root` và `[data-theme='dark']` / `[data-theme='light']`.
   - Chuẩn hóa typography line-height và letter-spacing.
   - Đảm bảo tương thích ngược để không làm crash các component hiện hữu trước khi refactor.

## Tiêu chí Nghiệm thu (Verification)
- [ ] `DESIGN.md` tồn tại ở root với đầy đủ 9 phần theo cấu trúc `awesome-design-md`.
- [ ] Các biến CSS token mới được render chính xác trên `:root` trong trình duyệt.
- [ ] Chạy `yarn lint` và `yarn build:payload` không bị lỗi compile CSS.
