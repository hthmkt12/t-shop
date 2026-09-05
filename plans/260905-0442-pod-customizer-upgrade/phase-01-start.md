# Phase 1: Audit & Setup

## Overview

- **Priority:** P1
- **Status:** Pending
- **Effort:** 0.5 ngày

Audit trạng thái hiện tại của PodCustomizer, install Fabric.js, xác nhận sharp availability, thiết lập test baseline.

## Key Insights

- `PodCustomizer/index.tsx` đã có: upload ảnh → local preview, drag (pointer events), scale/rotation sliders, text overlay, front/back toggle, upload lên `/api/media`
- `CartItem` đã có `customDesignUrl`, `customText`
- `Orders.items` đã có `customDesignUrl`, `customText`, `customDesignPreview` (ui field)
- `Products` đã có `enableCustomizer` checkbox, `productType` select
- **Gap 1:** Không có design JSON serialization (position, scale, rotation không được lưu)
- **Gap 2:** Không có server-side thumbnail generation
- **Gap 3:** `customDesignPreview` là `type: 'ui'` — cần đổi thành `type: 'text'` (URL) để hiển thị ảnh trong admin
- **Gap 4:** Fabric.js chưa install — hiện dùng CSS transform

## Requirements

- Fabric.js phải load lazy (dynamic import) để tránh SSR error
- sharp phải được add vào `dependencies` chính thức
- Không break existing cart/checkout flow

## Related Code Files

**Files cần đọc:**
- `src/app/_components/PodCustomizer/index.tsx` — existing implementation
- `src/app/_components/PodCustomizer/index.module.scss` — existing styles
- `src/payload/collections/Orders/index.ts` — schema hiện tại
- `src/payload/collections/Products/index.ts` — enableCustomizer field
- `package.json` — current dependencies

**Files sẽ modify:**
- `package.json` — thêm `fabric`, `@types/fabric`; đảm bảo `sharp` trong dependencies

## Implementation Steps

1. Đọc `PodCustomizer/index.module.scss` để hiểu layout hiện tại
2. Đọc `Orders/index.ts` line 142-149 (`customDesignPreview` ui field) — xác nhận cần đổi type
3. Chạy: `yarn add fabric @types/fabric`
4. Chạy: `yarn add sharp` (make it explicit, không chỉ transitive)
5. Verify: `import { fabric } from 'fabric'` không throw trong test component
6. Verify: `import sharp from 'sharp'` không throw trong API route

## Todo

- [ ] Đọc PodCustomizer SCSS layout
- [ ] Audit Orders schema — `customDesignPreview` field type
- [ ] `yarn add fabric @types/fabric`
- [ ] `yarn add sharp`
- [ ] Tạo `src/app/_components/PodCustomizer/__tests__/fabric-import.test.ts` — verify dynamic import không throw

## Success Criteria

- `yarn add fabric @types/fabric sharp` hoàn thành, no peer conflict
- `import('fabric')` resolve trong jest/vitest environment
- Audit report: list đủ 4 gaps ở trên

## Risk Assessment

- **Fabric.js SSR:** Fabric dùng `window` → phải dynamic import với `{ ssr: false }` hoặc trong `useEffect`. Medium risk.
- **sharp version conflict:** Payload đã dùng sharp internally — version mismatch có thể xảy ra. Low risk (Payload pin sharp version cụ thể).

## Security Considerations

- Media upload endpoint `access.create: () => true` — unauthenticated. Chấp nhận cho MVP vì file size limit nằm ở Payload config. Document rõ trong code.
