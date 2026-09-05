// Print-area templates for POD products, keyed by Products.productType.
// Standard DTG and Sublimation specifications @ 300 DPI.
// Client Fabric customizer uses a square 400x400 source canvas.
// When rendering for production, scale and center geometry onto physical print bounds.

export type PrintTemplate = {
  // Canvas size to render the Fabric design at, in pixels, at `dpi`.
  widthPx: number
  heightPx: number
  dpi: number
  // Whether this product type has a distinct back-side print (wearables only).
  hasBack: boolean
}

// productType values come from Products/index.ts `productType` select field.
export const PRINT_TEMPLATES: Record<string, PrintTemplate> = {
  // T-Shirt: 12" x 16" chest print area @ 300 DPI
  tshirt: { widthPx: 3600, heightPx: 4800, dpi: 300, hasBack: true },
  // Hoodie: 12" x 16" chest/back print area @ 300 DPI
  hoodie: { widthPx: 3600, heightPx: 4800, dpi: 300, hasBack: true },
  // Tote Bag: 14" x 14" square print area @ 300 DPI
  tote: { widthPx: 4200, heightPx: 4200, dpi: 300, hasBack: true },
  // Mug: 8.5" x 3.5" full wrap print area @ 300 DPI
  mug: { widthPx: 2550, heightPx: 1050, dpi: 300, hasBack: false },
  // Poster: 12" x 18" portrait @ 300 DPI
  poster: { widthPx: 3600, heightPx: 5400, dpi: 300, hasBack: false },
  // Sticker: 4" x 4" die-cut/kiss-cut @ 300 DPI
  sticker: { widthPx: 1200, heightPx: 1200, dpi: 300, hasBack: false },
  // Phone Case: 6" x 12" full wrap @ 300 DPI
  phonecase: { widthPx: 1800, heightPx: 3600, dpi: 300, hasBack: false },
}

export const DEFAULT_TEMPLATE_KEY = 'tshirt'

// Fabric canvas is always instantiated at 400x400 client-side (use-fabric-canvas.ts).
export const SOURCE_CANVAS_PX = 400

export function getPrintTemplate(productType?: string | null): PrintTemplate {
  if (productType && PRINT_TEMPLATES[productType]) return PRINT_TEMPLATES[productType]
  return PRINT_TEMPLATES[DEFAULT_TEMPLATE_KEY]
}

export interface ViewportTransformConfig {
  scale: number
  offsetX: number
  offsetY: number
}

/**
 * Calculates uniform scale and centering offset to fit 400x400 source canvas
 * inside the physical print area without stretching or distortion.
 */
export function calculatePrintViewport(
  targetWidthPx: number,
  targetHeightPx: number,
  sourcePx: number = SOURCE_CANVAS_PX,
): ViewportTransformConfig {
  // Scale uniformly to contain design within print bounds
  const scale = Math.min(targetWidthPx, targetHeightPx) / sourcePx
  const offsetX = (targetWidthPx - sourcePx * scale) / 2
  const offsetY = (targetHeightPx - sourcePx * scale) / 2

  return { scale, offsetX, offsetY }
}
