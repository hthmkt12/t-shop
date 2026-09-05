# Phase 5: Admin Fulfillment View

## Overview

- **Priority:** P1
- **Status:** Pending (blocked by Phase 4)
- **Effort:** 1 ngày

Hiển thị design thumbnail + fabricJson trong Payload admin order view để staff có thể xem và fulfill đúng design mà customer đã tạo.

## Key Insights (sau scout chi tiết)

- `src/payload/collections/Orders/ui/CustomDesignPreview.tsx` **đã tồn tại** — hiển thị `customDesignUrl` (64×64 thumbnail) + `customText` trong Payload admin
- `src/payload/collections/Orders/ui/OrderFulfillmentActions.tsx` đã có — nút đổi fulfillmentStatus
- `src/payload/endpoints/export-production-batch.ts` đã có — `GET /api/export-production-batch?status=in_production&format=csv|json`
- `src/payload/collections/Orders/hooks/dispatchFulfillmentWebhook.ts` đã có

**Gap thực tế:** `CustomDesignPreview.tsx` hiện đọc `customDesignUrl` (artwork gốc) — chưa đọc `customDesignPreview` (thumbnail từ Phase 4) hay `fabricJson`. Cần update component thêm Phase 3/4 fields.

## Architecture (delta only)

```
CustomDesignPreview.tsx (existing) — UPDATE để đọc thêm:
  ├── customDesignPreview  (thumbnail URL từ Phase 4 — 200×200)  ← ADD
  ├── customDesignUrl      (artwork gốc link — existing)
  ├── customText           (existing)
  └── fabricJson           (collapsible raw JSON — ADD, read-only)

export-production-batch.ts — UPDATE output để include fabricJson per item
```

## Related Code Files

**Files modify:**
- `src/payload/collections/Orders/ui/CustomDesignPreview.tsx` — thêm `customDesignPreview` thumbnail + `fabricJson` collapsible display
- `src/payload/endpoints/export-production-batch.ts` — thêm `fabricJson` vào CSV/JSON output rows

## Implementation Steps

1. **`CustomDesignPreview.tsx`** — Thêm `customDesignPreview` thumbnail (200×200) trên `customDesignUrl` thumbnail (64×64):
   ```tsx
   const { value: customDesignPreview } =
     useFormFields(([fields]) => fields['items.customDesignPreview'] || fields['customDesignPreview']) || {}
   const { value: fabricJson } =
     useFormFields(([fields]) => fields['items.fabricJson'] || fields['fabricJson']) || {}

   // Render 200×200 thumbnail nếu có customDesignPreview (từ Phase 4)
   // Fallback: customDesignUrl 64×64 (existing behavior)
   // Thêm <details><summary>View Canvas JSON</summary><pre>{fabricJson}</pre></details>
   ```

2. **`export-production-batch.ts`** — Thêm `item.fabricJson` vào production row object (lines ~38-90). Staff cần `fabricJson` để reconstruct design nếu cần reprint.

3. **Verify `defaultColumns`** trong `Orders/index.ts` admin config — đảm bảo `fulfillmentStatus` visible trong list view (không cần thay đổi nếu đã có).

## Todo

- [ ] Đọc toàn bộ `CustomDesignPreview.tsx` — confirm `useFormFields` path cho nested items fields
- [ ] Update `CustomDesignPreview.tsx`: thêm `customDesignPreview` thumbnail + `fabricJson` collapsible
- [ ] Update `export-production-batch.ts`: thêm `fabricJson` vào output
- [ ] Test: tạo test order với Phase 3/4 data → admin hiển thị 200×200 thumbnail
- [ ] Test: export CSV → column `fabricJson` có data

## Success Criteria

- Admin order detail: `customDesignPreview` thumbnail 200×200 hiển thị (nếu có), fallback về artwork 64×64
- `fabricJson` visible trong admin dưới dạng collapsible `<details>`
- Export batch CSV bao gồm `fabricJson` column
- Component không crash khi fields null

## Risk Assessment

- **`useFormFields` nested path:** Path `items.fabricJson` có thể không work trong nested array context — cần test. Fallback: đọc từ parent form context.

## Security Considerations

- `fabricJson` display trong admin: render as `<pre>` text — không eval, không dangerouslySetInnerHTML.
- Export CSV với `fabricJson`: chỉ admin role (đã guard trong endpoint).
