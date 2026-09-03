---
phase: 4
title: "Trang Chủ, Hero Section & Catalog Grid (Homepage & Discovery)"
status: pending
priority: P1
effort: "3.5h"
dependencies: ["phase-02", "phase-03"]
---

# Phase 04: Trang Chủ, Hero Section & Catalog Grid (Homepage & Discovery)

## Mục tiêu
Nâng cấp trang chủ và trang danh mục sản phẩm từ giao diện blog/template mặc định sang diện mạo showroom thời trang POD ấn tượng: Hero visual kích thước lớn, Showcase bố cục editorial grid, bộ lọc danh mục tinh tế.

## Danh sách File Tác động
- Cập nhật:
  - `src/app/_heros/HighImpact/index.tsx` & `index.module.scss`
  - `src/app/_heros/CustomHero/index.tsx` & `index.module.scss`
  - `src/app/_components/PodShowcase/index.tsx` & `index.module.scss`
  - `src/app/_components/CollectionArchive/index.module.scss`
  - `src/app/(pages)/products/Filters/index.module.scss`
  - `src/app/(pages)/products/index.module.scss`

## Nhiệm vụ chi tiết (Tasks & Steps)

1. **Hero Section (HighImpact / CustomHero):**
   - Thiết kế dạng Apple Keynote / Nike Lookbook: Headline Display lớn (48px - 64px), subheadline súc tích nêu bật khả năng in ấn POD theo yêu cầu.
   - Hình ảnh mockup chính sắc nét, tràn viền hoặc bố cục chia đôi bất đối xứng.
   - CTA hành động đơn rõ ràng: Nút Primary đen tuyền dẫn thẳng tới Bộ sưu tập hoặc Customizer.

2. **PodShowcase & Bố cục Editorial Grid:**
   - Thay thế dạng thẻ sản phẩm lặp lại nhàm chán bằng lưới bố cục thời trang (editorial lookbook grid): có thẻ lớn tạo điểm nhấn visual, kết hợp các thẻ sản phẩm tiêu chuẩn.
   - Hiển thị thông số in ấn cao cấp: công nghệ in DTG sắc nét, chất liệu 100% cotton định lượng cao (250gsm+).

3. **Catalog & Bộ Lọc Sản Phẩm (`products/Filters/`):**
   - Bộ lọc danh mục dạng horizontal pills hoặc sidebar tối giản, lựa chọn tức thì không reload trang.
   - Tối ưu phân trang và số lượng sản phẩm hiển thị trên lưới gọn gàng.

## Tiêu chí Nghiệm thu (Verification)
- [ ] Trang chủ tạo ấn tượng thương hiệu thời trang cao cấp ngay từ first fold (khung nhìn đầu tiên).
- [ ] Lưới sản phẩm đều đặn, responsive chuẩn từ 1 cột (mobile) -> 2 cột (tablet) -> 3-4 cột (desktop).
- [ ] Bộ lọc thao tác nhạy, phản hồi chuyển đổi mượt mà.
