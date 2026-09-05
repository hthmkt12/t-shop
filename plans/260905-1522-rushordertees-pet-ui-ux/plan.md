---
title: "Plan Thiết Kế UI/UX Phong Cách RushOrderTees Cho Công Nghệ In PET"
description: "Thiết kế và nâng cấp luồng UI/UX storefront, bộ tính giá bậc thang in PET, Fabric.js Studio và bảng đặt hàng ma trận phôi vật liệu"
status: pending
priority: P1
effort: "12-16 days"
tags: [ui-ux, pod, pet-transfer, rushordertees, fabric-js, nextjs]
created: 2026-09-05
---

# Plan Thiết Kế UI/UX Chuẩn RushOrderTees Ứng Dụng Công Nghệ In PET (DTF)

## 1. Tổng Quan & Mục Tiêu

Tái định hình trải nghiệm người dùng (UI/UX) của **t-shop** dựa trên thành công của **RushOrderTees.com**, tối ưu riêng cho **công nghệ in màng chuyển nhiệt PET (Direct-To-Film / DTF)**:
- Không giới hạn số màu in (CMYK+W full-color).
- In trên đa vật liệu (Cotton, Poly, Canvas, Da, Gỗ, Nón...).
- Đáp ứng cả khách mua lẻ 1 sản phẩm lẫn khách đặt sỉ theo team/doanh nghiệp.

---

## 2. Các Phase Triển Khai Chi Tiết

### Phase 1: Header, Value Proposition & Delivery Date Estimator
- **Sticky Delivery Bar:** Hiển thị widget cam kết giao hàng: *"Đặt hàng trong 2h tới để nhận hàng vào [Thứ Tư, 09/09]"*.
- **Trust & Value Signals:** Banner cam kết chất lượng in PET sắc nét, giặt không bong tróc (Washability Guarantee 50+ lần giặt), không phụ thu màu in.
- **Category Mega-Nav:** Phân chia theo vật liệu & chủng loại sản phẩm (Áo thun, Hoodie, Túi Canvas, Mũ/Nón, Đồng phục).

### Phase 2: Bảng Báo Giá Tự Động Theo Kích Thước In PET (Instant Pricing Calculator)
- **Cơ chế tính giá in PET:** 
  `Giá = Giá Phôi Vật Liệu + Phí In PET (theo diện tích: Logo 10x10cm / A4 / A3) x Hệ số vị trí (Ngực / Lưng / Tay)`
- **Chiết khấu số lượng bậc thang (Tiered Volume Discount):** Hiển thị bảng giá minh bạch (1-5 cái, 6-19 cái, 20-49 cái, 50+ cái). Thanh trượt / bộ đếm số lượng hiển thị tức thì số tiền tiết kiệm được.

### Phase 3: Nâng Cấp Fabric.js Studio Chuẩn RushOrderTees
- **Multi-Zone / Multi-Side Customizer:** Cho phép chuyển đổi linh hoạt các vùng in theo từng loại sản phẩm:
  - Áo: Ngực trái, Ngực giữa, Lưng, Tay áo.
  - Túi / Nón / Bình: Vùng in phẳng quy chuẩn.
- **Smart Print Quality Checker (DPI Warning):** 
  - Tính toán độ phân giải thực tế của ảnh upload dựa trên kích thước in thật (300 DPI = Chuẩn nét, < 150 DPI = Cảnh báo mờ).
- **Công cụ hỗ trợ artwork in PET:**
  - One-click xóa nền ảnh (Remove background / Alpha channel).
  - Tự động căn giữa, căn lề (Snap to alignment guides).

### Phase 4: Bảng Đặt Hàng Ma Trận Size/Màu (Bulk Order Matrix)
- **Giao diện đặt hàng 2 chế độ:**
  - *Chế độ mua lẻ (Single item):* Chọn 1 Size, 1 Màu nhanh gọn.
  - *Chế độ Team/Sỉ (Matrix Grid):* Nhập nhanh số lượng theo bảng:
    | Màu / Size | S | M | L | XL | 2XL | Tổng |
    |---|---|---|---|---|---|---|
    | Trắng | 2 | 5 | 8 | 3 | 0 | 18 |
    | Đen | 0 | 4 | 6 | 2 | 1 | 13 |
- Tự động đồng bộ thiết kế in PET qua tất cả các phân loại màu/size mà khách đã chọn.

### Phase 5: Tối Ưu Hóa Checkout & Proof Approval
- **Xem trước bản in (Digital Proof Preview):** Hiển thị mockups 2D sắc nét trước khi thanh toán kèm thông số chi tiết: Kích thước bản in cm, chất liệu vải, công nghệ in PET.
- **Stripe Express Checkout:** Giữ chân người dùng với Apple Pay, Google Pay, Link (học hỏi từ RushOrderTees giúp tăng conversion).

---

## 3. Tiêu Chí Hoàn Thành (Acceptance Criteria)

1. Khách hàng nhìn thấy rõ ngày nhận hàng dự kiến và chính sách cam kết chất lượng in PET ngay tại trang sản phẩm.
2. Công cụ Studio cảnh báo tức thì khi ảnh upload không đủ chuẩn 300 DPI cho máy in PET.
3. Bảng giá cập nhật theo thời gian thực khi khách đổi kích thước vùng in hoặc tăng số lượng sản phẩm.
4. Hỗ trợ đặt hàng theo bảng ma trận size/màu mượt mà, lưu toàn bộ thông tin thiết kế vào đơn hàng Payload/MongoDB.
