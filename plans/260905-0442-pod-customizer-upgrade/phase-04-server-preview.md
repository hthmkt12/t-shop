# Phase 4: Server-Side Preview (sharp)

## Overview

- **Priority:** P1
- **Status:** Pending (blocked by Phase 3)
- **Effort:** 1.5 ngày

Tạo API endpoint server-side dùng `sharp` để composite artwork lên mockup product image, tạo thumbnail 300×300 lưu vào Media collection. Dùng cho admin fulfillment view và future print-ready export.

## Key Insights

- `sharp` đã có trong `node_modules` (Payload transitive dep). Sau Phase 1, nó là explicit dep.
- Payload Media `staticDir` = `path.resolve(__dirname, '../../../media')` — local storage default. S3 nếu có `S3_BUCKET`.
- `fabricJson` từ Phase 3 đủ để reconstruct canvas server-side nếu cần — nhưng MVP: dùng `previewDataUrl` (PNG base64) từ client làm input, sharp chỉ resize/optimize.
- **Không cần Fabric.js trên server** — client export PNG, server nhận PNG, sharp optimize + lưu.

## Architecture

```
POST /api/generate-design-preview
  Body: { previewDataUrl: string, orderId: string, itemIndex: number }
  Auth: phải có valid session hoặc signed request (order secret)

  1. Decode base64 dataURL → Buffer
  2. sharp(buffer).resize(800, 800, { fit: 'contain', background: '#fff' })
             .png({ quality: 90 })
             .toBuffer()
  3. Upload buffer → Payload Media collection (programmatic, không qua HTTP)
  4. Update Orders[orderId].items[itemIndex].customDesignPreview = media.url
  5. Return { previewUrl }
```

**Trigger:** Sau khi order được tạo thành công (webhook `payment_intent.succeeded` hoặc client order creation), gọi endpoint này per item có `customDesignUrl`.

## Related Code Files

**Files create:**
- `src/payload/endpoints/generate-design-preview.ts` — Payload custom endpoint

**Files modify:**
- `src/payload/payload.config.ts` — register endpoint
- `src/payload/stripe/webhooks/payment-intent-succeeded.ts` — sau khi tạo order, queue/call preview generation per item

## Implementation Steps

1. **`generate-design-preview.ts` endpoint:**
   ```ts
   // POST /api/generate-design-preview
   // Req body: { previewDataUrl, orderId, itemIndex }
   // Auth: req.user (admin) OR validate orderId belongs to req.user
   export const generateDesignPreviewEndpoint: Endpoint = {
     path: '/generate-design-preview',
     method: 'post',
     handler: async (req, res) => {
       const { previewDataUrl, orderId, itemIndex } = req.body
       // 1. validate input
       // 2. decode base64
       const base64Data = previewDataUrl.replace(/^data:image\/\w+;base64,/, '')
       const buffer = Buffer.from(base64Data, 'base64')
       // 3. sharp resize
       const optimized = await sharp(buffer)
         .resize(800, 800, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
         .png({ quality: 90 })
         .toBuffer()
       // 4. create media doc programmatically
       const media = await req.payload.create({
         collection: 'media',
         data: { alt: `Order ${orderId} item ${itemIndex} design preview` },
         file: { data: optimized, mimetype: 'image/png', name: `order-${orderId}-item-${itemIndex}.png`, size: optimized.length },
       })
       // 5. update order item
       const order = await req.payload.findByID({ collection: 'orders', id: orderId })
       const items = [...(order.items || [])]
       if (items[itemIndex]) items[itemIndex].customDesignPreview = media.url
       await req.payload.update({ collection: 'orders', id: orderId, data: { items } })
       return res.json({ previewUrl: media.url })
     },
   }
   ```

2. **`payload.config.ts`:** Add endpoint vào `endpoints` array.

3. **Trigger từ checkout client:** Sau khi `POST /api/orders` thành công, client gọi `POST /api/generate-design-preview` per item có `previewDataUrl`. Fire-and-forget (không block checkout redirect).

4. **Fallback trong webhook:** `paymentIntentSucceeded.ts` — nếu order có `customDesignUrl` nhưng `customDesignPreview` null, gọi preview generation. (Edge case: client crash trước khi gọi.)

## Todo

- [ ] Tạo `generate-design-preview.ts` endpoint
- [ ] Register endpoint trong `payload.config.ts`
- [ ] Checkout client: gọi preview endpoint sau order creation (fire-and-forget)
- [ ] Webhook fallback: check + generate preview nếu missing
- [ ] Test: POST với base64 PNG → Payload media doc tạo, order item updated
- [ ] Test: thumbnail xuất hiện trong admin order view

## Success Criteria

- `POST /api/generate-design-preview` trả về `{ previewUrl }` trong < 3s
- Order item `customDesignPreview` được set sau checkout
- Thumbnail visible trong Payload admin (phase 5)
- sharp resize không throw trên Windows + Linux (cross-platform sharp binary)

## Risk Assessment

- **sharp Windows binary:** Nếu dev trên Windows nhưng deploy Linux, `sharp` cần rebuild. Mitigation: pin `sharp` version, dùng `--ignore-scripts=false` khi install.
- **base64 size limit:** Nếu `previewDataUrl` > 5MB, request body parse sẽ fail. Mitigation: set `express.json({ limit: '10mb' })` trong Payload server config, hoặc upload blob trực tiếp thay vì base64.
- **Race condition:** Client gọi preview endpoint trước khi order tạo xong. Mitigation: gọi sau khi `/api/orders` trả về 201.

## Security Considerations

- Validate `orderId` thuộc về `req.user` hoặc là admin — không để user generate preview cho order của người khác.
- `previewDataUrl` input: chỉ accept `data:image/png;base64,` hoặc `data:image/jpeg;base64,` prefix — reject các data URI khác.
