# Orchestration & Implementation Report: Guest Checkout, Feedback & Security Hardening

**Date:** 2026-09-03
**Status:** COMPLETED (All checks passed)

---

## 1. Executive Summary

Triển khai hoàn tất tuần tự 3 hạng mục trọng điểm nhằm gỡ bỏ rào cản chuyển đổi (conversion friction) và gia cố an toàn dữ liệu cho nền tảng POD e-commerce:
1. **Guest Checkout Support:** Mở cổng thanh toán không bắt buộc đăng nhập, tự động liên kết Stripe customer và Payload order thông qua email khách vãng lai.
2. **Cart Feedback & Real-time Notification:** Thay thế điều hướng cưỡng bức bằng inline notification / toast trên CTA button cho trải nghiệm tuỳ biến sản phẩm POD liền mạch.
3. **Security & Financial Integrity Verification:** Đảm bảo toàn bộ quy trình kiểm tra tiền tệ (`fail-closed`), bảo vệ endpoint `track-order`, và kiểm tra tồn kho theo từng variant SKU.

---

## 2. Changes Delivered

### Job 1: Guest Checkout Support
- **Payload Schema (`src/payload/collections/Orders/index.ts`):** Thêm trường `guestEmail` (indexed), nới lỏng permission `create: anyone`.
- **Payment Intent (`src/payload/endpoints/create-payment-intent.ts`):** Hỗ trợ tính toán đơn giá và tạo Stripe `PaymentIntent` cho giỏ hàng của guest.
- **Total & Verification Hook (`src/payload/collections/Orders/hooks/recalculateTotal.ts`):** Tính toán lại tổng tiền từ `data.items` đối với guest order và xác thực khớp số tiền thanh toán từ Stripe `PaymentIntent`.
- **Order Confirmation Email (`src/payload/collections/Orders/hooks/sendOrderConfirmationEmail.ts`):** Fallback gửi email xác nhận và tracking link tới `doc.guestEmail`.
- **Client Flow (`src/app/(pages)/checkout/`):** Xoá bỏ redirect ép buộc đăng nhập, cho phép nhập guest email và thanh toán trực tiếp qua Stripe Elements.

### Job 2: Cart Feedback & Toast Notification
- **Button Component (`src/app/_components/AddToCartButton/`):**
  - Giữ người dùng ở lại trang sản phẩm POD khi chọn variant hoặc tuỳ biến in ấn.
  - Hiển thị toast thông báo thành công kèm link "View Cart" và "Checkout →".

### Job 3: Security & Testing Verification
- **Dual-key Order Tracking (`/api/track-order`):** Yêu cầu cả `orderId` và `email` để chống enumeration attack.
- **Variant Stock Safety (`updateProductStock.ts`):** Cập nhật đúng SKU variant trong mảng variants của product.

---

## 3. Test & Verification Results

| Suite / Check | Command | Result |
| :--- | :--- | :--- |
| **Financial Hook Integrity** | `yarn test:money` | ✅ Passed (Replay & tampering blocked) |
| **Track Order Security** | `yarn test:track` | ✅ Passed (Missing params, 404, 403, sanitized response) |
| **POD Catalog Integrity** | `yarn test:catalog` | ✅ Passed (All variant matrices validated) |
| **Server TypeScript Build** | `yarn build:server` | ✅ Passed (`tsc --project tsconfig.server.json` cleanly compiled) |

---

## 4. Arbiter Checklist

- [x] Mọi thay đổi tuân thủ nguyên tắc không phá vỡ logic tính tiền máy chủ.
- [x] Không còn lỗi biên dịch TypeScript.
- [x] Không xuất hiện duplicate processes hoặc orphan handles.
- [x] Toàn bộ test suite POD pass 100%.
