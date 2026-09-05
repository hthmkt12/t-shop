import type { PayloadHandler } from 'payload/config'
import { renderPodPrintBuffer } from '../lib/render-pod-service'

// Renders a Fabric.js design at physical print resolution for production.
// Wraps core renderPodPrintBuffer service for the HTTP endpoint.
export const renderPodPrint: PayloadHandler = async (req, res): Promise<void> => {
  const { fabricJson, productType, side } = (req.body || {}) as {
    fabricJson?: string
    productType?: string
    side?: 'front' | 'back'
  }

  if (!fabricJson) {
    res.status(400).json({ error: 'fabricJson is required' })
    return
  }

  try {
    const result = await renderPodPrintBuffer({
      fabricJson,
      productType,
      side,
    })

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('X-Print-DPI', String(result.dpi))
    res.setHeader('X-Print-Px', `${result.widthPx}x${result.heightPx}`)
    res.status(200).send(result.buffer)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('not valid JSON') || message.includes('has no back print area')) {
      res.status(400).json({ error: message })
      return
    }
    req.payload.logger.error(`render-pod-print failed: ${message}`)
    res.status(500).json({ error: 'Failed to render print asset', detail: message })
  }
}
