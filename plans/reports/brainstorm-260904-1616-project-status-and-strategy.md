# Báo Cáo Phân Tích Hiện Trạng & Đề Xuất Chiến Lược T-Shop POD

**Ngày:** 04/09/2026  
**Vị trí:** `plans/reports/brainstorm-260904-1616-project-status-and-strategy.md`

---

## 1. Hiện Trạng Hệ Thống (Current State)

### Điểm mạnh đã hoàn thành:
1. **Toàn vẹn luồng tiền (Money Integrity):**
   - `src/payload/collections/Orders/hooks/recalculateTotal.ts` chạy strict fail-closed. Rebuild giỏ hàng từ server + đối chiếu Stripe PaymentIntent. Chặn tamper giá và replay attack.
   - Test suite pass 100%: `yarn test:pod` (5 test: money, track-order, catalog fixture, fulfillment webhook, e2e smoke).
2. **Nghiệp vụ POD & Fulfillment:**
   - Hỗ trợ biến thể (Size, Color, SKU), upload artwork lên S3/R2.
   - Đã có hook `dispatchFulfillmentWebhook.ts` bắn webhook tự động sang xưởng in khi đơn chuyển sang `in_production`.
   - Endpoint `export-production-batch.ts` xuất CSV/JSON chuẩn thông số in.
3. **UI/UX Storefront:**
   - Áp dụng chuẩn `DESIGN.md` (Apple / Nike Luxury Minimalism), token hóa SCSS (`_css/theme.scss`, `colors.scss`).
   - `PodCustomizer` hỗ trợ drag, scale, rotate, touch trên mobile, multi-view (front/back).
   - Cart có Order Bump upsell tăng AOV.

---

## 2. Rủi Ro & Lỗ Hổng Kỹ Thuật (Findings)

| Khu vực | File:Line | Vấn đề | Mức độ |
|---|---|---|---|
| **Bảo mật / DoS** | `src/payload/endpoints/track-order.ts:8` | Thiếu rate-limiting. Kẻ tấn công brute-force quét `orderId` + `email`. | **Cao** |
| **Bảo mật / Stripe** | `src/payload/endpoints/create-payment-intent.ts:53` | Guest checkout tạo Stripe Customer không qua captcha/rate-limit. Nguy cơ card testing attack. | **Trung bình** |
| **Dữ liệu / Kho** | `src/payload/collections/Orders/hooks/updateProductStock.ts:41` | Trừ kho bằng `payload.update` tuần tự, không dùng atomic `$inc` hoặc MongoDB session transaction. Flash sale hoặc race condition gây âm kho (oversell). | **Cao** |
| **Hiệu năng DB** | `src/payload/endpoints/export-production-batch.ts:17` | `Orders` chưa có compound index `{ fulfillmentStatus: 1, createdAt: -1 }`. Query `limit: 500` không pagination dễ nghẽn RAM khi quy mô lớn. | **Trung bình** |
| **POD Preview** | `src/app/_components/PodCustomizer/index.tsx` | Preview client bằng CSS transform, chưa export file composite (ảnh mockup + artwork lồng nhau) để hiển thị đồng bộ trong cart/admin. | **Thấp** |

---

## 3. So Sánh 3 Phương Án Chiến Lược

### Phương án 1: Production Hardening & Concurrency Safety (Khuyến nghị hàng đầu - Recommended)
- **Nội dung:**
  - Thêm rate-limiting (express-rate-limit) cho `/api/track-order` và `/api/create-payment-intent`.
  - Chuyển cơ chế trừ kho sang atomic `$inc` hoặc MongoDB transaction session chống race condition.
  - Bổ sung compound index `{ fulfillmentStatus: 1, createdAt: -1 }` trên `orders`.
  - Phân trang cursor/page cho `export-production-batch`.
- **Giả định then chốt:** Xưởng in nhận đơn qua webhook tự động hoặc batch CSV/JSON đã có.
- **Ưu điểm:** Khóa chặt bảo mật, xử lý triệt để race condition, sẵn sàng chạy chịu tải cao, chi phí thấp, hoàn thành trong 1-2 ngày.
- **Fail condition:** Xưởng in đối tác yêu cầu tích hợp API riêng (Printful/CustomCat) thay vì webhook chuẩn.

### Phương án 2: Tích Hợp API Đơn Vị Fulfillment Quốc Tế (Printful / Gelato / Merchize API)
- **Nội dung:** Kết nối API 2 chiều để tự động đẩy đơn sang nhà in ngoại sàn và kéo mã tracking bưu điện về.
- **Ưu điểm:** Không cần vận hành thủ công khâu in ấn.
- **Nhược điểm:** Phụ thuộc downtime bên thứ 3, phát sinh chi phí duy trì API integration, chưa cấp thiết cho xưởng in nội địa.
- **Fail condition:** Vendor API đổi version hoặc timeout làm gián đoạn luồng thanh toán/đơn hàng.

### Phương án 3: Nâng Cấp Visual Studio 3D Canvas
- **Nội dung:** Dùng Fabric.js hoặc Three.js render mockup 3D tương tác xoay 360 độ.
- **Ưu điểm:** Trải nghiệm thị giác cao cấp.
- **Nhược điểm:** Tăng bundle size Next.js, phức tạp hóa frontend, không giải quyết bài toán bảo mật và ổn định backend.
- **Fail condition:** Thiết bị di động cấu hình yếu bị giật lag khi tải canvas 3D nặng.

---

## 4. Hợp Đồng Triển Khai (Delivery Contract - Cho Phương Án 1)

- **Outcome:** Backend T-Shop POD bảo mật, xử lý đơn đồng thời không lỗi kho, API có rate-limit, dữ liệu xuất xưởng tối ưu chỉ mục.
- **Constraints:** Giữ stack Payload v2 + MongoDB + Next.js 13; bảo toàn 100% kết quả pass của `yarn test:pod`.
- **Non-goals:** Chưa làm 3D canvas studio; chưa kết nối API bên thứ 3 (Printful).
- **Acceptance Criteria:**
  1. Rate-limit chặn request vượt ngưỡng tại `/api/track-order` (HTTP 429).
  2. Hàm trừ kho chạy an toàn khi nhiều request đồng thời vào cùng 1 SKU.
  3. Compound index được kích hoạt trên MongoDB cho `Orders`.
  4. Test suite `yarn test:pod` và lint pass 100%.

---

## 5. Câu Hỏi Chưa Định Đoạt (Unresolved Questions)
1. Dự án sử dụng xưởng in nội địa (nhận webhook / batch CSV) hay đơn vị fulfillment quốc tế (Printful/Merchize)?
2. Có cần tích hợp cổng thanh toán nội địa (SePay/VietQR) song song với Stripe cho khách Việt Nam không?
