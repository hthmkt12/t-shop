# Phase 6: Quick Wins UX

## Overview

- **Priority:** P2
- **Status:** Pending (độc lập — có thể chạy song song Phase 4/5)
- **Effort:** 1 ngày

Low-effort UX improvements từ Vistaprint analysis. Không phụ thuộc Fabric.js — có thể implement bất kỳ lúc nào sau Phase 1.

## Items

### 6.1 Satisfaction Guarantee badge

**Where:** Product page hero (`ProductHero`) và Cart sidebar
**What:** Badge nhỏ với text "Satisfaction Guaranteed" hoặc "100% Satisfaction Guarantee" + icon checkmark

**Files:**
- `src/app/_heros/Product/index.tsx` — thêm badge dưới AddToCartButton
- `src/app/_components/Cart/CartItem/index.tsx` hoặc Cart sidebar — thêm badge footer

**Implementation:**
```tsx
// Inline component — không cần file mới
<div className="satisfaction-badge">
  <CheckIcon size={14} />
  <span>100% Satisfaction Guaranteed</span>
</div>
```

SCSS: `border: 1px solid #22c55e`, `border-radius: 4px`, `padding: 4px 8px`, `font-size: 12px`, `color: #16a34a`.

### 6.2 Free shipping threshold banner in cart

**Where:** Cart sidebar header hoặc footer
**What:** Dynamic text hiển thị tiến độ đến free shipping threshold

**Logic:**
```ts
const FREE_SHIPPING_THRESHOLD = 500_000 // VND — set theo business rule
const remaining = FREE_SHIPPING_THRESHOLD - cartTotal
// remaining > 0: "Thêm {formatPrice(remaining)} để được miễn phí vận chuyển"
// remaining <= 0: "🎉 Bạn được miễn phí vận chuyển!"
```

**Files:**
- `src/app/_components/Cart/index.tsx` (hoặc CartSidebar) — thêm threshold banner
- Constants: `FREE_SHIPPING_THRESHOLD` vào `src/app/_constants/shipping.ts` (new file nếu chưa có)

**Note:** Nếu free shipping threshold chưa có trong business logic, set = 0 (tắt feature) cho đến khi confirm với owner.

### 6.3 FAQ accordion trên product page

**Where:** Product detail page, dưới description
**What:** 3-5 câu hỏi thường gặp về POD/customization, dạng accordion expand/collapse

**FAQ content (default — có thể edit trong Payload CMS nếu thêm field sau):**
1. Q: "Thời gian sản xuất và giao hàng là bao lâu?" → A: "3-5 ngày sản xuất + 2-3 ngày vận chuyển"
2. Q: "Tôi có thể upload file ảnh định dạng nào?" → A: "PNG, JPG, PDF (tối thiểu 300 DPI cho chất lượng in tốt nhất)"
3. Q: "Chính sách đổi trả như thế nào?" → A: "Miễn phí đổi/hoàn nếu lỗi in hoặc không đúng thiết kế. Liên hệ trong vòng 7 ngày sau khi nhận hàng."
4. Q: "Tôi có thể xem preview trước khi đặt hàng?" → A: "Có — dùng công cụ thiết kế trực tiếp trên trang sản phẩm để xem mockup trước khi thêm vào giỏ."

**Files:**
- `src/app/_heros/Product/index.tsx` — thêm `<FAQAccordion />` component bên dưới description
- `src/app/_components/FAQAccordion/index.tsx` — NEW component
- `src/app/_components/FAQAccordion/index.module.scss` — NEW styles

**Implementation (no JS library needed):**
```tsx
// Dùng HTML <details>/<summary> native — zero JS, accessible by default
export const FAQAccordion: React.FC<{ items: { q: string; a: string }[] }> = ({ items }) => (
  <div className={styles.faqList}>
    {items.map((item, i) => (
      <details key={i} className={styles.faqItem}>
        <summary className={styles.question}>{item.q}</summary>
        <p className={styles.answer}>{item.a}</p>
      </details>
    ))}
  </div>
)
```

SCSS: `details[open] summary` arrow rotate 180°, `border-bottom: 1px solid #e5e7eb` giữa items, smooth transition max-height không cần.

### 6.4 Delivery estimate text trên product page

**Where:** Dưới AddToCartButton trong ProductHero
**What:** Static text "Thường giao trong 5-8 ngày làm việc" (hoặc dynamic nếu có shipping calculator)

**MVP:** Static text, update sau khi có data thực.

**Files:**
- `src/app/_heros/Product/index.tsx` — thêm `<p className={styles.deliveryEstimate}>` dưới AddToCartButton

## Todo

- [ ] 6.1: Badge component trong ProductHero + Cart
- [ ] 6.2: Shipping threshold logic + banner (confirm threshold value với owner trước)
- [ ] 6.3: `FAQAccordion` component + integrate vào ProductHero
- [ ] 6.4: Delivery estimate text trong ProductHero
- [ ] Review: mobile layout cho badge + FAQ accordion

## Success Criteria

- Badge visible trên product page và cart trên cả desktop + mobile
- Cart hiển thị đúng remaining amount đến free shipping (hoặc ẩn nếu threshold = 0)
- FAQ accordion: click mở/đóng đúng, accessible (keyboard navigable via Tab/Enter)
- Delivery estimate text visible dưới AddToCartButton

## Risk Assessment

- **Free shipping threshold value:** Cần confirm với owner — implement với const = 0 (ẩn feature) nếu chưa có số cụ thể.
- **FAQ content:** Text tiếng Việt placeholder — owner review trước khi ship.
- **`<details>` browser support:** 96%+ — không cần fallback cho t-shop B2C.

## Dependency

Không phụ thuộc Phase 2-5. Chạy được ngay sau Phase 1 (setup). Nên parallelize với Phase 3/4.
