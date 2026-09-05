# Phase 3: Design Persistence

## Overview

- **Priority:** P1
- **Status:** Pending (blocked by Phase 2)
- **Effort:** 1.5 ngày

Lưu `fabricJson` + `previewDataUrl` vào cart item → checkout → order record. Đảm bảo admin có đủ data để fulfill đúng design.

## Key Insights

- `CartItem` hiện có `customDesignUrl` (artwork URL) và `customText` — cần thêm `fabricJson`
- `Orders.items.customDesignPreview` hiện là `type: 'ui'` — không lưu data, chỉ render UI trong admin. Phải đổi thành `type: 'text'` để lưu thumbnail URL
- Checkout flow: client POST `/api/orders` với items array → cần truyền `fabricJson` theo
- Stripe PaymentIntent metadata không lưu design (quá lớn) — OK, design lưu trong Payload order
- `previewDataUrl` là base64 data URI (~50-200KB) — không nên lưu vào Payload text field. Thay vào đó: upload lên `/api/media` trước, lưu URL

## Requirements

1. `CartItem` lưu `fabricJson` (JSON string) và `previewImageUrl` (sau khi upload thumbnail)
2. Checkout POST `/api/orders` truyền `fabricJson` và `customDesignPreview` URL per item
3. `Orders.items.customDesignPreview` đổi từ `type: 'ui'` sang `type: 'upload'` (relationship to media) hoặc `type: 'text'` (URL string)
4. Khi user click "Add to Cart": export canvas → upload thumbnail → lưu URL vào cart item

## Architecture

```
AddToCartButton.onClick
  → exportCanvasPreview() → fetch POST /api/media (multipart, blob)
  → returns { doc: { url } }
  → addItemToCart({ ..., fabricJson, previewImageUrl: url })

Cart localStorage: CartItem { customDesignUrl, customText, fabricJson, previewImageUrl }

Checkout POST /api/orders:
  items: [{ product, sku, customDesignUrl, customText, fabricJson, customDesignPreview: previewImageUrl }]

Orders.items schema:
  customDesignUrl: text (artwork source URL)
  customText: text
  fabricJson: textarea (full canvas JSON)     ← NEW field
  customDesignPreview: text (thumbnail URL)   ← change from ui → text
```

## Related Code Files

**Files modify:**
- `src/app/_providers/Cart/reducer.ts` — thêm `fabricJson?: string`, `previewImageUrl?: string` vào `CartItem`
- `src/app/_components/AddToCartButton/index.tsx` — nhận `fabricJson`, `previewImageUrl` props, truyền vào `addItemToCart`
- `src/app/_heros/Product/index.tsx` — pass `customDesign.fabricJson` và `customDesign.previewDataUrl` xuống `AddToCartButton`
- `src/payload/collections/Orders/index.ts` — thêm `fabricJson` textarea field; đổi `customDesignPreview` từ `ui` → `text`
- `src/app/(pages)/checkout/CheckoutForm/index.tsx` — thêm `fabricJson`, `customDesignPreview` vào order POST body

**Files create:**
- `src/app/_components/PodCustomizer/upload-canvas-preview.ts` — helper: canvas.toBlob() → FormData → POST /api/media → return URL

## Implementation Steps

1. **`Orders/index.ts`:** Đổi `customDesignPreview` field:
   ```ts
   // Trước: type: 'ui' (line ~142)
   // Sau:
   {
     name: 'customDesignPreview',
     type: 'text',
     label: 'Design Preview URL',
     admin: {
       description: 'Thumbnail URL generated from canvas export',
       readOnly: true,
     },
   },
   // Thêm field mới:
   {
     name: 'fabricJson',
     type: 'textarea',
     label: 'Fabric Canvas JSON',
     admin: { description: 'Full Fabric.js canvas JSON for re-rendering' },
   },
   ```

2. **`upload-canvas-preview.ts`:**
   ```ts
   export async function uploadCanvasPreview(dataUrl: string, productTitle: string): Promise<string | null>
   // dataUrl → Blob → FormData → POST /api/media → return doc.url
   ```

3. **`PodCustomizer/index.tsx`:** Trong `updateParent`, expose `previewDataUrl` (không upload — upload xảy ra ở AddToCartButton click để tránh upload mỗi khi user kéo)

4. **`ProductHero/index.tsx`:** State `customDesign` đã có `fabricJson` và `previewDataUrl` — pass xuống `AddToCartButton`

5. **`AddToCartButton/index.tsx`:**
   - Thêm props: `fabricJson?: string`, `previewDataUrl?: string`
   - Trong `onClick`: gọi `uploadCanvasPreview(previewDataUrl)` → lấy `previewImageUrl`
   - Gọi `addItemToCart({ ..., fabricJson, previewImageUrl })`
   - Show loading state trong khi upload

6. **`Cart/reducer.ts`:** Thêm fields vào `CartItem` type

7. **`CheckoutForm/index.tsx`:** Thêm `fabricJson`, `customDesignPreview` vào items array khi POST `/api/orders`

## Todo

- [ ] `Orders/index.ts`: đổi `customDesignPreview` type, thêm `fabricJson` field
- [ ] Tạo `upload-canvas-preview.ts` helper
- [ ] `Cart/reducer.ts`: extend `CartItem` type
- [ ] `AddToCartButton`: thêm props + upload on click + loading state
- [ ] `ProductHero`: pass `fabricJson` + `previewDataUrl` xuống button
- [ ] `CheckoutForm`: truyền `fabricJson` + `customDesignPreview` trong order POST
- [ ] Test: add to cart → Payload admin hiển thị `customDesignPreview` URL
- [ ] Test: order record có `fabricJson` populated

## Success Criteria

- Cart item chứa `fabricJson` string sau khi add to cart
- Order record trong Payload admin hiển thị `customDesignPreview` thumbnail URL (click-open image)
- Order record có `fabricJson` textarea populated
- Không tăng latency Add-to-Cart > 2s (upload thumbnail chạy trước khi navigate)

## Risk Assessment

- **Upload on click latency:** thumbnail upload (~200KB) có thể mất 1-3s trên chậm. Mitigation: show spinner trên button, không disable button.
- **Payload schema migration:** đổi `customDesignPreview` từ `ui` → `text` không cần migration (ui field không store data). Safe.
- **fabricJson size:** canvas JSON có thể 5-50KB tùy complexity. Payload `textarea` field handle OK (max 64KB default).

## Security Considerations

- `fabricJson` chứa artwork URLs — không chứa credentials. Safe để store plain text.
- Thumbnail upload qua `/api/media` (unauthenticated) — same risk profile như artwork upload. Đã accept ở Phase 1.
