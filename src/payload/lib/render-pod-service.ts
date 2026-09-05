import { StaticCanvas } from 'fabric/node'
import sharp from 'sharp'
import {
  getPrintTemplate,
  calculatePrintViewport,
  type PrintTemplate,
} from './pod-print-templates'

export interface RenderPodPrintOptions {
  fabricJson: string | Record<string, any>
  productType?: string | null
  side?: 'front' | 'back'
}

export interface RenderPodPrintResult {
  buffer: Buffer
  template: PrintTemplate
  widthPx: number
  heightPx: number
  dpi: number
}

/**
 * Replays client Fabric.js JSON on server StaticCanvas at physical print resolution.
 * Uniformly scales and centers design into transparent 300 DPI PNG buffer.
 */
export async function renderPodPrintBuffer(
  options: RenderPodPrintOptions,
): Promise<RenderPodPrintResult> {
  const { fabricJson, productType, side = 'front' } = options

  if (!fabricJson) {
    throw new Error('fabricJson is required')
  }

  let parsedJson: Record<string, any>
  try {
    parsedJson = typeof fabricJson === 'string' ? JSON.parse(fabricJson) : fabricJson
  } catch {
    throw new Error('fabricJson is not valid JSON')
  }

  const template = getPrintTemplate(productType)
  if (side === 'back' && !template.hasBack) {
    throw new Error(`productType "${productType}" has no back print area`)
  }

  const targetW = template.widthPx
  const targetH = template.heightPx
  const { scale, offsetX, offsetY } = calculatePrintViewport(targetW, targetH)

  const canvas = new StaticCanvas(undefined, {
    width: targetW,
    height: targetH,
    backgroundColor: 'transparent',
  })

  try {
    await canvas.loadFromJSON(parsedJson)
    // Scale scene uniformly and center within target print dimensions
    canvas.setViewportTransform([scale, 0, 0, scale, offsetX, offsetY])
    canvas.renderAll()

    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 })
    const base64 = dataUrl.split(',')[1] || ''
    const rawPng = Buffer.from(base64, 'base64')

    // Stamp DPI metadata into PNG pHYs chunk
    const finalPng = await sharp(rawPng)
      .withMetadata({ density: template.dpi })
      .png()
      .toBuffer()

    return {
      buffer: finalPng,
      template,
      widthPx: targetW,
      heightPx: targetH,
      dpi: template.dpi,
    }
  } finally {
    await canvas.dispose()
  }
}
