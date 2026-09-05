---
title: "POD Customizer Upgrade — Fabric.js Canvas"
description: "Upgrade existing CSS-based PodCustomizer to Fabric.js canvas with design persistence, server-side preview, and admin fulfillment view"
status: pending
priority: P1
effort: "10-14 days"
tags: [pod, customizer, fabric, canvas, b2c]
created: 2026-09-05
---

# POD Customizer Upgrade — Fabric.js Canvas

## Overview

t-shop đã có PodCustomizer (CSS-based: upload ảnh, drag, text, scale/rotation). Plan này upgrade lên Fabric.js canvas thực sự để cải thiện UX, thêm design persistence (lưu design JSON vào order), server-side preview thumbnail bằng sharp, và admin view xem design per order.

**Context:** B2C, cá nhân mua merch/áo in. Audience đã có sẵn: `PodCustomizer`, `CartItem.customDesignUrl`, `Orders.items.customDesignUrl`, `Orders.items.customDesignPreview`.

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Fabric.js canvas thay thế CSS preview — drag/drop thật, multi-layer | P1 |
| 2 | Design JSON serialize → lưu vào order record | P1 |
| 3 | Server-side thumbnail (sharp) khi order tạo | P1 |
| 4 | Admin view: xem designThumbnail + design JSON per order item | P1 |
| 5 | Quick wins UX: Guarantee badge, FAQ accordion, free shipping banner | P2 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Phase 1: Audit & Setup](./phase-01-start.md) | Pending |
| 2 | [Phase 2: Fabric.js Canvas Core](./phase-02-fabric-canvas-core.md) | Pending |
| 3 | [Phase 3: Design Persistence](./phase-03-design-persistence.md) | Pending |
| 4 | [Phase 4: Server Preview (sharp)](./phase-04-server-preview.md) | Pending |
| 5 | [Phase 5: Admin Fulfillment View](./phase-05-admin-fulfillment.md) | Pending |
| 6 | [Phase 6: Quick Wins UX](./phase-06-quick-wins.md) | Pending |

## Success Criteria

- [ ] Canvas load < 2s trên 4G mobile (Lighthouse throttle)
- [ ] User hoàn thành upload + add text + add to cart < 3 phút (session recording)
- [ ] Order record lưu đúng `customDesignUrl` + `customDesignPreview` thumbnail URL
- [ ] Admin xem được thumbnail design trong Payload admin per order item
- [ ] 0 order thiếu design data sau 2 tuần production

## Dependencies

- `fabric` npm package (chưa có trong package.json — cần `yarn add fabric`)
- `sharp` đã có trong node_modules (qua Payload), cần add vào dependencies chính thức
- Payload Media collection (đã có, access.create = true cho unauthenticated upload)

<!-- slug: pod-customizer-upgrade -->