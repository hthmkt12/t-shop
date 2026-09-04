# Database & Data Layer Audit Report: T-Shop (MongoDB / Mongoose / Payload CMS)

**Date**: 2026-09-04  
**Auditor**: Database Administrator & Performance Optimization Specialist (`db-admin-agent`)  
**Scope**: `src/payload/collections/` (Orders, Products, Categories, Users, Media), Indexing, Concurrency, Stock Management, Batch Export Scalability.

---

## 1. Executive Summary

Hệ thống dữ liệu T-Shop sử dụng **Payload CMS v2.0.7** với database adapter `@payloadcms/db-mongodb` (Mongoose / MongoDB). Kiến trúc dữ liệu hỗn hợp kết hợp E-commerce truyền thống với mô hình Print-on-Demand (POD) tùy biến artwork/text.

### Điểm tích cực:
- Hook tài chính `recalculateTotal.ts` tuân thủ nguyên tắc fail-closed và replay guard theo `stripePaymentIntentID`.
- Các trường tra cứu chính đã được gán `index: true` (`stripePaymentIntentID`, `fulfillmentStatus`, `orderedBy`, `guestEmail`, `slug`, `stripeCustomerID`).

### Rủi ro nghiêm trọng (High / Critical):
1. **Lỗ hổng Overselling do Race Condition tại `updateProductStock.ts`**: Cơ chế trừ kho dùng Read-Modify-Write trong JavaScript không atomic, dẫn đến mất dữ liệu tồn kho (Lost Updates) khi có nhiều đơn đồng thời.
2. **Không có cơ chế hoàn kho (Restock Rollback)**: Khi đơn bị hủy (`cancelled`) hoặc hoàn tiền (refund), tồn kho không được hoàn trả.
3. **Thiếu Unique Database Index trên `stripePaymentIntentID`**: Chỉ kiểm tra bằng application code trong hook, tiềm ẩn rủi ro duplicate order nếu 2 request cùng lọt qua trước khi ghi DB.
4. **Thiếu Multikey Index trên Subdocument Arrays**: Không có index trên `items.sku` (Orders) và `variants.sku` (Products).
5. **Nghẽn bộ nhớ tại Batch Export (`export-production-batch.ts`)**: Sử dụng `depth: 2` trên `payload.find` tải 500 documents kèm sub-relations trực tiếp vào RAM Node.js.

---

## 2. Rà soát Collections & Indexing

| Collection | Trường dữ liệu | Index hiện tại | Đánh giá & Rủi ro | Đề xuất khắc phục |
|---|---|---|---|---|
| **Orders** | `stripePaymentIntentID` | B-tree (`index: true`) | Không có `unique: true`. Replay check trong hook có race condition. | Thêm `unique: true` cấp schema |
| **Orders** | `fulfillmentStatus` | B-tree (`index: true`) | Query queue xưởng in thường lọc theo status và sort theo `createdAt`. Single index gây index scan + memory sort. | Tạo Compound Index: `{ fulfillmentStatus: 1, createdAt: -1 }` |
| **Orders** | `orderedBy` | B-tree (`index: true`) | Đạt yêu cầu cho query lịch sử đơn của user. | Giữ nguyên |
| **Orders** | `guestEmail` | B-tree (`index: true`) | Đạt yêu cầu cho guest order tracking. | Giữ nguyên |
| **Orders** | `items.sku` | Không có | Subdocument array field. Tra cứu đơn hàng theo SKU phôi áo/cốc phải quét toàn bộ collection scan. | Tạo Multikey Index: `{ "items.sku": 1 }` |
| **Products** | `slug` | B-tree (`index: true`) | Khởi tạo qua `slugField()`. Tối ưu cho routing URL. | Giữ nguyên |
| **Products** | `variants.sku` | Không có | Mảng variants chứa SKU biến thể. Tra cứu variant để trừ kho hoặc check tồn kho bị chậm khi catalog lớn. | Tạo Multikey Index: `{ "variants.sku": 1 }` |
| **Products** | `price` | Không có | Thiếu index phục vụ sort/filter theo giá trên storefront. | Tạo Index: `{ price: 1 }` |
| **Users** | `email` | Unique B-tree | Tự động sinh từ Payload auth config. Đạt chuẩn. | Giữ nguyên |
| **Users** | `stripeCustomerID` | B-tree (`index: true`) | Đạt yêu cầu cho webhook lookup. | Giữ nguyên |
| **Categories**| `title` | Không có | Thiếu index trên title, thiếu trường `slug`. | Thêm `slugField()` có index |
| **Media** | `filename` | Default Payload | Upload local (`media/`), thiếu hash/checksum chống trùng file design. | Cân nhắc lưu MD5 hash để deduplicate ảnh upload |

---

## 3. Tính toàn vẹn dữ liệu, Concurrency & Giao dịch (Transactions)

### 3.1. Phân tích lỗ hổng trừ kho (`updateProductStock.ts`)

File `src/payload/collections/Orders/hooks/updateProductStock.ts` được kích hoạt tại hook `afterChange` khi tạo order:

```typescript
// BƯỚC 1: Đọc vào bộ nhớ JS (Read)
const product = await payload.findByID({ collection: 'products', id: productId })

// BƯỚC 2: Tính toán (Modify trong JS)
const newStock = Math.max(0, currentStock - quantity)

// BƯỚC 3: Ghi đè (Write)
await payload.update({
  collection: 'products',
  id: productId,
  data: { variants: updatedVariants } // hoặc { stock: newStock }
})
```

**Nguy cơ:**
- Nếu Khách A và Khách B cùng đặt 1 sản phẩm còn tồn kho `stock = 1`:
  1. Cả 2 luồng đọc được `currentStock = 1`.
  2. Cả 2 luồng tính `newStock = 0`.
  3. Cả 2 luồng ghi `stock = 0`.
  4. **Hậu quả**: Bán được 2 đơn hàng nhưng chỉ trừ 1 tồn kho (Overselling / Race Condition).

### 3.2. Đề xuất giải pháp Atomic Mutation

Thay thế Read-Modify-Write bằng **MongoDB Atomic Decrement** có điều kiện chặn âm (`$inc` + `$gte`):

```typescript
// Đối với sản phẩm đơn (không variant):
const result = await payload.db.collections['products'].updateOne(
  {
    _id: productId,
    stock: { $gte: quantity }
  },
  {
    $inc: { stock: -quantity }
  }
)
if (result.matchedCount === 0) {
  throw new Error(`Sản phẩm ${productId} đã hết hàng hoặc không đủ tồn kho.`)
}

// Đối với sản phẩm có variants:
const result = await payload.db.collections['products'].updateOne(
  {
    _id: productId,
    "variants.sku": itemSku,
    "variants.$.stock": { $gte: quantity }
  },
  {
    $inc: { "variants.$.stock": -quantity }
  }
)
```

### 3.3. Cơ chế hoàn kho khi Cancel / Refund

- **Hiện trạng**: Khi đơn chuyển trạng thái sang `cancelled` (hoặc Stripe refund webhook trả về), hệ thống không có hook xử lý hoàn kho.
- **Giải pháp**:
  - Bổ sung hook `afterChange` trên `Orders`: kiểm tra nếu `previousDoc.fulfillmentStatus !== 'cancelled' && doc.fulfillmentStatus === 'cancelled'`, lặp qua `doc.items` và thực hiện atomic `$inc: { stock: quantity }` (hoặc variant stock) để trả lại phôi POD vào kho.

### 3.4. Vấn đề MongoDB ACID Transactions trong Payload CMS

- Payload v2 hỗ trợ MongoDB Session Transaction nếu MongoDB đang chạy dạng **Replica Set**. Trong môi trường Standalone (ví dụ Docker đơn lẻ hoặc local dev không cấu hình replica), transaction sẽ ném lỗi:
  `Transaction numbers are only allowed on a replica set member or mongos`.
- Hiện tại các hook `updateUserPurchases`, `clearUserCart`, `updateProductStock`, `sendOrderConfirmationEmail` chạy tuần tự ngoài transaction.
- **Đánh giá**:
  - Đối với hệ thống POD nhỏ và vừa, việc đảm bảo tính atomic ở cấp tài liệu (Atomic Document Update qua `$inc`) là giải pháp an toàn, không phụ thuộc vào cấu hình Replica Set phức tạp.
  - Khi scale lên Production lớn, khuyến nghị chuyển MongoDB URI sang Replica Set (Atlas hoặc 3-node container) để kích hoạt transactional session của Payload CMS.

---

## 4. Đánh giá khả năng mở rộng (Scalability)

### 4.1. Điểm nghẽn Batch Export xưởng in (`src/payload/endpoints/export-production-batch.ts`)

- **Vấn đề**:
  - `payload.find({ collection: 'orders', where: { fulfillmentStatus: status }, limit: 500, depth: 2 })`.
  - `depth: 2` buộc Mongoose join và hydrate toàn bộ quan hệ `product`, `media`, `orderedBy` vào bộ nhớ.
  - Mỗi đơn POD chứa nhiều items kèm `customDesignUrl`, `shippingAddress`. Khi đạt 500 - 1.000 đơn, payload JSON/CSV có thể chiếm 150MB - 300MB RAM, gây nghẽn Event Loop của Node.js.
- **Giải pháp**:
  1. Đổi `depth: 1` hoặc `depth: 0`, chỉ populate trường `title` của `product`.
  2. Sử dụng Mongoose Streaming Cursor cho export CSV:
     ```typescript
     const cursor = payload.db.collections['orders']
       .find({ fulfillmentStatus: status })
       .sort({ createdAt: -1 })
       .cursor()
     // Pipe từng dòng sang res mà không buffer toàn bộ vào RAM
     ```

---

## 5. Kế hoạch hành động cụ thể (Action Plan)

1. **Bước 1 (Ưu tiên P0 - Database Indexes)**:
   - Thêm `unique: true` cho `stripePaymentIntentID` trong `src/payload/collections/Orders/index.ts`.
   - Khai báo compound index `{ fulfillmentStatus: 1, createdAt: -1 }` trên `orders`.
   - Khai báo index cho `sku` trong `variants` của `products`.

2. **Bước 2 (Ưu tiên P0 - Concurrency & Stock)**:
   - Refactor `updateProductStock.ts` sử dụng atomic query `$inc` chống overselling.
   - Thêm hook hoàn kho khi đơn chuyển trạng thái `cancelled`.

3. **Bước 3 (Ưu tiên P1 - Scalability)**:
   - Tối ưu `export-production-batch.ts` giảm `depth: 2` xuống `depth: 1` hoặc dùng cursor streaming.
