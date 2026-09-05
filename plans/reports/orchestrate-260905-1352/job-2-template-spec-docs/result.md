# Job 2: POD Supplier Print Specification Checklist

## Purpose
Bridge placeholder measurements in `src/payload/lib/pod-print-templates.ts` with real-world supplier machine configurations (Printful / Printify / Local DTG / Sublimation workshop).

## Supplier Inquiry Form

| Product Category | Key Questions for Supplier | Current Default (Placeholder) |
|---|---|---|
| **T-Shirt (DTG)** | - Maximum printable area (W × H inches)?<br>- Required DPI resolution (300 DPI or 150 DPI)?<br>- Color profile (sRGB or CMYK)?<br>- Minimum transparent border / bleed margin (px)? | 12" × 16" (3600 × 4800 px) @ 300 DPI, sRGB, transparent background |
| **Hoodie (DTG)** | - Print placement distance from collar (inches)?<br>- Pocket seam clearance (pocket print vs chest)? | 12" × 16" (3600 × 4800 px) @ 300 DPI |
| **Ceramic Mug (Sublimation)** | - Full wrap dimensions (W × H)?<br>- Handle-to-handle gap (margin)?<br>- Template aspect ratio? | 8.5" × 3.5" (2550 × 1050 px) @ 300 DPI |
| **Canvas Tote Bag** | - Printable surface area?<br>- Seam / strap clearance? | 14" × 14" (4200 × 4200 px) @ 300 DPI |

## Integration Steps
1. Upon receiving exact supplier spec sheet, update numbers in `PRINT_TEMPLATES` object (`pod-print-templates.ts`).
2. Run `node F:/t-shop/dist/payload/scripts/scripts/verify-batch-zip-export.js` to ensure batch export preserves new aspect ratios without distortion.
