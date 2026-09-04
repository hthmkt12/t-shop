# Báo Cáo Tổng Hợp Đánh Giá Toàn Diện T-Shop POD & Kế Hoạch Khắc Phục

**Ngày:** 04/09/2026  
**Nguồn:** `reviewer-agent` (Security/Code), `db-admin-agent` (DB/Data), `ui-ux-agent` (Storefront/DESIGN.md)

---

## 1. Phát Hiện Trọng Yếu (Critical & High Findings)

### Nhóm 1: Bảo mật & Toàn vẹn giao dịch (Security & Money Flow)
1. **[C1] Race condition Replay Attack (`recalculateTotal.ts:41–51`):**
   - Check `find({ stripePaymentIntentID })` tại application layer không atomic.
   - Hai request đồng thời cùng pass kiểm tra trước khi insert, gây duplicate order.
   - **Xử lý:** Thêm `unique: true` cho `stripePaymentIntentID` tại `src/payload/collections/Orders/index.ts`.

2. **[C2] Mất đơn im lặng tại Webhook Fallback (`paymentIntentSucceeded.ts:88–123`):**
   - Webhook tạo đơn fallback bỏ qua 3-tier price lookup. Khi `recalculateTotal` chạy lại, lệch giá với `paymentIntent.amount` gây throw error.
   - Error bị catch im lặng tại line 128: Stripe trừ tiền thành công nhưng đơn không bao giờ được lưu vào DB.
   - **Xử lý:** Webhook fallback dùng chung price-resolution chain hoặc ghi nhận `paymentIntent.amount` trực tiếp.

3. **[C3] Rò rỉ dữ liệu đơn hàng (`track-order.ts:27–34`):**
   - Khi `order.orderedBy` là raw ID string (chưa populate) và `order.guestEmail` rỗng, `userEmail` thành `undefined`.
   - Điều kiện so khớp bị bỏ qua, bất kỳ ai có order ID đều xem được địa chỉ, artwork URL, mã tracking.
   - **Xử lý:** Trả HTTP 403 ngay khi `userEmail` rỗng/không khớp.

4. **[H1] Lấy giá cũ nhất từ Stripe (`recalculateTotal.ts:114`, `create-payment-intent.ts:141`):**
   - `stripe.prices.list` mặc định sort tăng dần theo ngày tạo (`data[0]` là giá cũ nhất). Cả hai hàm cùng lấy sai giá, khách bị tính sai tiền.
   - **Xử lý:** Thêm filter `{ active: true }` và sort `created: 'desc'`.

5. **[H2] Webhook xưởng in thiếu HMAC (`dispatchFulfillmentWebhook.ts:70`):**
   - Dùng static bearer token `X-Fulfillment-Secret` thay vì chữ ký payload.
   - **Xử lý:** Dùng HMAC-SHA256 ký body (`X-Fulfillment-Signature`).

---

### Nhóm 2: Cơ sở dữ liệu & Quản lý tồn kho (Database & Stock Concurrency)
1. **Trừ kho không atomic (`updateProductStock.ts:27–58`):**
   - Dùng Read-Modify-Write trong JS (`findByID` -> trừ stock -> `update`).
   - Nhiều đơn đồng thời mua cùng 1 SKU gây Lost Update, overselling âm kho.
   - **Xử lý:** Dùng atomic operator `$inc: { "variants.$.stock": -qty }` hoặc session transaction.
2. **Thiếu hoàn kho khi huỷ đơn:**
   - Đơn chuyển sang `cancelled` hoặc khách refund không hoàn lại số lượng tồn kho.
   - **Xử lý:** Thêm hook kiểm tra transition sang `cancelled` để `$inc` trả lại kho.
3. **Thiếu chỉ mục truy vấn & Tràn RAM Batch Export (`export-production-batch.ts:17`):**
   - `depth: 2` trên 500 orders hydrate toàn bộ quan hệ gây spike RAM.
   - Thiếu compound index `{ fulfillmentStatus: 1, createdAt: -1 }` trên `orders`.
   - **Xử lý:** Bổ sung compound index, giảm `depth: 1` hoặc chuyển sang stream cursor.

---

### Nhóm 3: Giao diện Storefront & Chuẩn DESIGN.md
1. **Lệch token & Dark mode White Box:**
   - Một số component hardcode background `#ffffff`, gây lỗi khối trắng khi bật dark mode.
   - Token chưa đồng bộ hoàn toàn giữa `DESIGN.md` (`--color-*`) và code (`--theme-*`, `--pod-*`).
2. **Lỗi cú pháp CSS:**
   - Lỗi gõ nhầm đơn vị tại `Price` component (`16p` thay vì `16px`).
3. **POD Customizer UX:**
   - Đã mượt kéo thả và multi-view tab; cần thêm bộ chọn swatch đổi màu áo phôi và ảnh phôi mặt sau chuẩn.

---

## 2. Kế Hoạch Khắc Phục 3 Giai Đoạn (Action Plan)

### Giai đoạn 1: Hotfix An Toàn Dữ Liệu & Bảo Mật (Ưu tiên P0 - Ngay lập tức)
- Sửa C1: Thêm `unique: true` cho `stripePaymentIntentID`.
- Sửa C2: Đồng bộ price logic tại `paymentIntentSucceeded.ts`.
- Sửa C3: Chặn email rỗng tại `track-order.ts`.
- Sửa H1: Thêm `active: true, created: 'desc'` khi query Stripe prices.
- Sửa lỗi cú pháp CSS `16p` tại `Price/index.tsx`.

### Giai đoạn 2: Tối Ưu DB & Atomic Kho (Ưu tiên P1)
- Refactor `updateProductStock.ts` sang atomic `$inc` chống race condition.
- Bổ sung logic hoàn kho khi đơn `cancelled`.
- Thêm compound index `{ fulfillmentStatus: 1, createdAt: -1 }` và index `variants.sku`.
- Giảm `depth` query tại `export-production-batch.ts`.

### Giai đoạn 3: Hoàn Thiện Webhook & UI/UX (Ưu tiên P2)
- Triển khai HMAC-SHA256 cho `dispatchFulfillmentWebhook.ts`.
- Thêm rate-limiting cho `/api/track-order` và `/api/create-payment-intent`.
- Dọn dẹp hardcoded color, đảm bảo Dark Mode chuẩn 100% DESIGN.md.
