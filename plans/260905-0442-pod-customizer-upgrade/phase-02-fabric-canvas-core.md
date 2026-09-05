# Phase 2: Fabric.js Canvas Core

## Overview

- **Priority:** P1
- **Status:** Pending (blocked by Phase 1)
- **Effort:** 3-4 ngày

Thay thế CSS preview trong `PodCustomizer` bằng Fabric.js canvas thật. Giữ nguyên API (`onDesignChange`, `CustomDesignData`) để không break `ProductHero` và `AddToCartButton`.

## Key Insights

- Fabric.js dùng `<canvas>` element — không render được server-side → phải dynamic import + `useEffect`
- Existing `CustomDesignData` type cần extend để lưu full Fabric JSON (`fabricJson?: string`)
- `printAreaBox` CSS hiện tại dùng pointer events cho drag — Fabric.js handle internally, không cần
- Existing upload flow (`/api/media`) giữ nguyên — chỉ thay phần render preview

## Requirements

**Functional:**
- Upload ảnh → add vào Fabric canvas như `fabric.Image` object
- Add text → `fabric.IText` object (editable on canvas)
- Select, move, resize, rotate object trực tiếp trên canvas (Fabric built-in controls)
- Delete selected object (keyboard Delete hoặc button)
- Front/Back side toggle — 2 canvas state riêng biệt
- Export canvas → `toDataURL('png')` cho thumbnail
- Export canvas JSON → `canvas.toJSON()` cho persistence

**Non-functional:**
- Dynamic import Fabric: `const { fabric } = await import('fabric')`
- Canvas container: fixed 400×400px trên desktop, responsive trên mobile (`max-width: 100%`)
- Load time: Fabric.js ~300KB gzipped → lazy load chỉ khi `enableCustomizer === true`

## Architecture

```
ProductHero
  └── PodCustomizer (upgraded)
        ├── useEffect: init fabric.Canvas on mount
        ├── FabricCanvasRef: canvas instance
        ├── ControlsPanel (upload, text, color, delete)
        └── onDesignChange callback:
              CustomDesignData {
                artworkUrl, artworkName,         // existing
                scale, rotation, positionX/Y,   // existing (deprecated — Fabric owns)
                customText, textColor,           // existing
                activeSide,                      // existing
                fabricJson?: string,             // NEW: full canvas JSON
                previewDataUrl?: string,         // NEW: canvas.toDataURL()
              }
```

## Related Code Files

**Files modify:**
- `src/app/_components/PodCustomizer/index.tsx` — full rewrite logic, keep same export name + Props type
- `src/app/_components/PodCustomizer/index.module.scss` — thêm canvas container styles
- (type extension only) `src/app/_providers/Cart/reducer.ts` — add `fabricJson?: string` vào `CartItem`

**Files create:**
- `src/app/_components/PodCustomizer/use-fabric-canvas.ts` — custom hook: init, cleanup, add image, add text

## Implementation Steps

1. **Tạo `use-fabric-canvas.ts` hook:**
   ```ts
   // Dynamic import fabric only on client
   // Returns: { canvasRef, addImage, addText, clearCanvas, exportJson, exportDataUrl, deleteSelected }
   ```

2. **Rewrite `PodCustomizer/index.tsx`:**
   - Thêm `<canvas ref={canvasRef} />` trong `previewStage`
   - Remove CSS drag handlers (`handlePointerDown/Move/Up`)
   - Giữ file upload flow (`handleFileUpload`) — sau khi upload xong, gọi `addImage(serverUrl)`
   - Text input → `addText(customText, textColor)`
   - Front/Back toggle → lưu `frontJson`/`backJson` state, swap canvas content
   - `canvas.on('object:modified', ...)` → gọi `updateParent` với `fabricJson + previewDataUrl`

3. **Extend `CustomDesignData` type** (vẫn backward-compatible):
   ```ts
   export type CustomDesignData = {
     // existing fields (không xóa)
     artworkUrl?: string
     artworkName?: string
     scale: number
     rotation: number
     positionX?: number
     positionY?: number
     customText?: string
     textColor: string
     activeSide?: 'front' | 'back'
     // new fields
     fabricJson?: string       // canvas.toJSON() stringified
     previewDataUrl?: string   // canvas.toDataURL('png')
   }
   ```

4. **SCSS update:** thêm `canvasWrapper` với `position: relative`, `border: 1px dashed`, safe zone overlay như SVG absolute positioned trên canvas.

5. **Safe zone overlay:** `<svg>` absolute positioned over canvas — rectangle với `stroke-dasharray` hiển thị printable area boundary.

6. **Mobile:** canvas `width: min(400, 100vw - 32px)` — Fabric `canvas.setDimensions()` để match.

## Todo

- [ ] Tạo `use-fabric-canvas.ts` hook với dynamic import
- [ ] Rewrite `PodCustomizer/index.tsx` dùng hook
- [ ] Extend `CustomDesignData` type (backward-compatible)
- [ ] SCSS: canvasWrapper + safe zone SVG overlay
- [ ] Front/Back dual-state: `frontJson` / `backJson` swap
- [ ] `canvas.on('object:modified')` → `updateParent` với fabricJson + previewDataUrl
- [ ] Test: upload ảnh → appears trên canvas
- [ ] Test: add text → editable IText
- [ ] Test: Delete key → xóa selected object
- [ ] Test: switch Front/Back → state preserved

## Success Criteria

- Upload ảnh → image xuất hiện trên Fabric canvas, có thể drag/resize/rotate
- Add text → IText editable trực tiếp trên canvas
- `onDesignChange` nhận đủ `fabricJson` và `previewDataUrl`
- Front/Back toggle lưu state riêng biệt
- Canvas load < 2s trên Lighthouse 4G throttle
- Không break `AddToCartButton` — `customDesignUrl` vẫn được pass đúng

## Risk Assessment

- **Fabric.js SSR crash:** `window is not defined` nếu import sai. Fix: dynamic import trong `useEffect` chỉ.
- **Canvas cleanup:** Phải gọi `canvas.dispose()` trong `useEffect` cleanup để tránh memory leak.
- **Mobile touch:** Fabric.js cần `allowTouchScrolling: false` trên canvas để handle touch drag đúng.

## Security Considerations

- `canvas.toDataURL()` chạy client-side — không expose server data
- File upload vẫn qua `/api/media` endpoint, Payload validate mime type
