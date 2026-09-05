'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Dynamic import — fabric uses `window`, cannot be imported at module level (SSR)
type FabricModule = typeof import('fabric')
type FabricCanvas = import('fabric').Canvas

export type FabricCanvasHandle = {
  canvasEl: React.RefObject<HTMLCanvasElement>
  isReady: boolean
  addImage: (url: string) => Promise<void>
  addText: (text: string, color: string) => void
  updateTextColor: (color: string) => void
  deleteSelected: () => void
  clearCanvas: () => void
  exportJson: () => string
  exportDataUrl: () => string
  loadJson: (json: string) => Promise<void>
}

export function useFabricCanvas(
  onModified: (json: string, dataUrl: string) => void,
): FabricCanvasHandle {
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<FabricCanvas | null>(null)
  const fabricModuleRef = useRef<FabricModule | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Init Fabric canvas on mount
  useEffect(() => {
    if (!canvasEl.current) return

    let disposed = false

    import('fabric').then(mod => {
      if (disposed || !canvasEl.current) return

      fabricModuleRef.current = mod

      const canvas = new mod.Canvas(canvasEl.current, {
        width: 400,
        height: 400,
        backgroundColor: 'transparent',
        allowTouchScrolling: false,
        selection: true,
      })

      fabricRef.current = canvas

      const notify = () => {
        if (!fabricRef.current) return
        const json = JSON.stringify(fabricRef.current.toJSON())
        const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 1 })
        onModified(json, dataUrl)
      }

      canvas.on('object:modified', notify)
      canvas.on('object:added', notify)
      canvas.on('object:removed', notify)

      // Delete selected object on keyboard Delete/Backspace
      const handleKeyDown = (e: KeyboardEvent) => {
        const active = fabricRef.current?.getActiveObject()
        if (!active) return
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const tag = (e.target as HTMLElement)?.tagName
          if (tag === 'INPUT' || tag === 'TEXTAREA') return
          fabricRef.current?.remove(active)
          fabricRef.current?.discardActiveObject()
          fabricRef.current?.requestRenderAll()
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      setIsReady(true)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    })

    return () => {
      disposed = true
      fabricRef.current?.dispose()
      fabricRef.current = null
      setIsReady(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addImage = useCallback(async (url: string) => {
    const mod = fabricModuleRef.current
    const canvas = fabricRef.current
    if (!mod || !canvas) return

    const img = await mod.FabricImage.fromURL(url, { crossOrigin: 'anonymous' })

    // Scale image to fit within 60% of canvas
    const maxDim = canvas.width! * 0.6
    const scale = Math.min(maxDim / img.width!, maxDim / img.height!, 1)
    img.scale(scale)

    img.set({
      left: (canvas.width! - img.getScaledWidth()) / 2,
      top: (canvas.height! - img.getScaledHeight()) / 2,
      originX: 'left',
      originY: 'top',
    })

    canvas.add(img)
    canvas.setActiveObject(img)
    canvas.requestRenderAll()
  }, [])

  const addText = useCallback((text: string, color: string) => {
    const mod = fabricModuleRef.current
    const canvas = fabricRef.current
    if (!mod || !canvas || !text.trim()) return

    // Remove existing IText objects to avoid stacking same text layer
    const existingTexts = canvas.getObjects('i-text')
    existingTexts.forEach(t => canvas.remove(t))

    const itext = new mod.IText(text, {
      left: canvas.width! / 2,
      top: canvas.height! * 0.7,
      originX: 'center',
      originY: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      fill: color,
      fontFamily: 'Arial, sans-serif',
    })

    canvas.add(itext)
    canvas.setActiveObject(itext)
    canvas.requestRenderAll()
  }, [])

  const updateTextColor = useCallback((color: string) => {
    const canvas = fabricRef.current
    if (!canvas) return
    const texts = canvas.getObjects('i-text') as import('fabric').IText[]
    texts.forEach(t => {
      t.set({ fill: color })
    })
    canvas.requestRenderAll()
  }, [])

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (!active) return
    canvas.remove(active)
    canvas.discardActiveObject()
    canvas.requestRenderAll()
  }, [])

  const clearCanvas = useCallback(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    canvas.clear()
    canvas.requestRenderAll()
  }, [])

  const exportJson = useCallback(() => {
    if (!fabricRef.current) return '{}'
    return JSON.stringify(fabricRef.current.toJSON())
  }, [])

  const exportDataUrl = useCallback(() => {
    if (!fabricRef.current) return ''
    return fabricRef.current.toDataURL({ format: 'png', multiplier: 1 })
  }, [])

  const loadJson = useCallback(async (json: string) => {
    const canvas = fabricRef.current
    if (!canvas) return
    try {
      await canvas.loadFromJSON(JSON.parse(json))
      canvas.requestRenderAll()
    } catch {
      // ignore malformed JSON
    }
  }, [])

  return {
    canvasEl,
    isReady,
    addImage,
    addText,
    updateTextColor,
    deleteSelected,
    clearCanvas,
    exportJson,
    exportDataUrl,
    loadJson,
  }
}
