# Báo Cáo Brainstorm & Đánh Giá Hiện Trạng Dự Án T-Shop POD

**Ngày thực hiện:** 02/09/2026  
**Mục tiêu:** Đánh giá hiện trạng toàn diện hệ thống e-commerce Print-on-Demand (POD), phân tích rủi ro kỹ thuật / vận hành, và đề xuất 3 phương án chiến lược tối ưu để đưa dự án vào sản xuất.

---

## 1. Hiện Trạng Tổng Quan Dự Án

Dự án `t-shop` xây dựng trên nền tảng **Payload CMS v2.0.7 (Express backend + MongoDB Mongoose)** tích hợp **Next.js 13 App Router**, phục vụ mô hình e-commerce thời trang & vật phẩm Print-on-Demand (POD).

### Điểm mạnh đã hoàn thiện:
- **Toàn vẹn luồng tiền (Financial & Money Integrity):** Cơ chế `recalculateTotal.ts` tuân thủ strict fail-closed: tự động tái dựng giỏ hàng từ server, đối chiếu khớp 100% với Stripe PaymentIntent amount thực tế, ngăn chặn triệt để client tamper giá hoặc replay attack (`yarn test:money` PASS 100%).
- **Hỗ trợ biến thể POD & Custom Artwork:** Model sản phẩm hỗ trợ variants (Size, Color, SKU) cùng upload artwork / custom text cho từng item.
- **POD Fulfillment & Tracking:** Đã có endpoint `GET /api/track-order` (tra cứu đơn kèm artwork & trạng thái fulfillment) và `GET /api/export-production-batch` (xuất dữ liệu sản xuất CSV/JSON cho xưởng in).
- **Lưu trữ Cloud & Email:** Tích hợp S3/Cloudflare R2 Adapter cho Media upload và SMTP hook gửi email xác nhận đơn hàng khi thanh toán thành công.

---

## 2. Phát Hiện Trọng Yếu & Rủi Ro Kỹ Thuật (Findings)

| Lĩnh vực | Hiện trạng | Rủi ro / Điểm nghẽn |
|---|---|---|
| **Backend & DB** | MongoDB Mongoose, Stripe Webhook fallback, S3 Storage | Thiếu DB Indexing tối ưu trên `orders.stripePaymentIntentID`, `orders.fulfillmentStatus`; MongoDB chưa dùng transaction session khi trừ kho (`updateProductStock.ts`). |
| **Bảo mật & Access** | Payload role-based access (`admin`, `customer`) | Endpoint `/api/track-order` dựa vào `orderId` + `email` (an toàn cơ bản nhưng cần rate-limiting chống brute-force ID). Webhook Stripe cần cấu hình `STRIPE_WEBHOOKS_ENDPOINT_SECRET` chuẩn ở production. |
| **Frontend & UX** | Next.js 13 App Router, SCSS Modules | Luồng custom artwork trên UI client chưa có visual designer/canvas trực quan (chủ yếu là input text/link); checkout chưa có preview mockup live. |
| **DevOps & QA** | Dockerfile multi-stage, docker-compose.prod.yml | Script test CJS/ESM (`test-export-batch.js`) cần đồng bộ loader `ts-node`/ESM; cần bổ sung CI check tự động trên GitHub Actions. |

---

## 3. So Sánh 3 Phương Án Chiến Lược (Option Exploration)

### Phương án 1: Lean POD Production Launch (Khuyến nghị hàng đầu - Recommended)
- **Nội dung:** Tập trung hoàn thiện toàn bộ luồng vận hành cốt lõi: rate-limiting API tra cứu, thêm MongoDB indexes, hoàn thiện UI upload artwork trực tiếp lên S3/R2 ở trang Product/Cart, và kích hoạt pipeline CI/CD Docker chuẩn.
- **Giả định then chốt:** Vận hành xưởng in thủ công qua batch export CSV/JSON trước khi cần API đồng bộ tự động.
- **Ưu điểm:** Tối thiểu rủi ro, chi phí thấp, ra mắt nhanh trong 1-2 tuần, kiến trúc sạch và ổn định cao.
- **Worst-case / Fail condition:** Nếu lượng đơn đột biến >1000 đơn/ngày, đội ngũ vận hành xử lý CSV xuất xưởng sẽ bị quá tải thủ công.

### Phương án 2: Automated Provider Integration (Tích hợp API xưởng in Printful/Printify)
- **Nội dung:** Xây dựng webhook & API đồng bộ 2 chiều trực tiếp tới các đơn vị fulfillment quốc tế (Printful, CustomCat, Merchize).
- **Ưu điểm:** Tự động hóa 100% khâu đẩy đơn in và cập nhật tracking code.
- **Nhược điểm:** Phụ thuộc API bên thứ 3, chi phí phát triển lớn hơn, cần xử lý lỗi webhook/failover phức tạp.
- **Worst-case:** Vendor API downtime hoặc thay đổi schema làm tắc nghẽn toàn bộ luồng tạo đơn.

### Phương án 3: Interactive Visual Canvas POD Studio
- **Nội dung:** Đầu tư sâu vào Frontend Fabric.js / Konva / Three.js cho phép khách hàng tự kéo thả, xoay lật artwork 3D trên mockup áo/cốc.
- **Ưu điểm:** Trải nghiệm người dùng vượt trội, tỷ lệ chuyển đổi cao.
- **Nhược điểm:** Tốn nguồn lực frontend, chưa giải quyết ngay bài toán vận hành đơn hàng thực tế.

---

## 4. Hợp Đồng Triển Khai (Delivery Contract) & Lộ Trình Đề Xuất

### Delivery Contract:
- **Outcome:** Hệ thống T-Shop POD sẵn sàng golive production an toàn, bảo mật luồng tiền, xưởng in nhận file sản xuất tự động qua S3/R2, khách hàng tra cứu đơn minh bạch.
- **Constraints:** Giữ nguyên stack Payload CMS v2 + Next.js 13 App Router + MongoDB; tuân thủ strict fail-closed money integrity.
- **Non-goals:** Chưa làm 3D Canvas Editor phức tạp; chưa tích hợp đa nhà cung cấp fulfillment tự động.
- **Acceptance criteria:**
  1. `yarn test:pod` và test suite chạy PASS 100%.
  2. MongoDB schema có index đầy đủ cho `stripePaymentIntentID`, `fulfillmentStatus`, `orderedBy`.
  3. API `/api/track-order` và `/api/export-production-batch` có rate-limiting và bảo vệ xác thực.
  4. Docker build production `docker-compose.prod.yml` chạy trơn tru với S3/R2 và SMTP.

---

## 5. Câu Hỏi Cần Xác Nhận (Unresolved Questions)

1. Xưởng in POD của dự án ưu tiên nhận file qua cổng xuất file CSV/JSON định kỳ hay cần tích hợp API webhook thẳng vào hệ thống riêng của xưởng?
2. Có cần bổ sung cổng thanh toán nội địa (SePay / VietQR) song song với Stripe cho thị trường Việt Nam không?
