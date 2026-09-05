'use client'

import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'

import { Media, Product } from '../../../payload/payload-types'
import { useAnalytics } from '../../_providers/Analytics'
import { calculatePrintDpi, DpiAssessment } from './dpi-calculator'
import classes from './index.module.scss'
import {
  calculatePetSurcharge,
  PET_PRINT_SIZE_SURCHARGES,
  PetPrintSize,
} from './pet-pricing'
import { ImageMetrics, useFabricCanvas } from './use-fabric-canvas'

export type CustomDesignData = {
  artworkUrl?: string
  artworkName?: string
  // Legacy fields kept for backward compatibility with CartItem / Orders schema
  scale: number
  rotation: number
  positionX?: number
  positionY?: number
  customText?: string
  textColor: string
  activeSide?: 'front' | 'back'
  // Fabric.js extended fields (active side only — kept for back-compat)
  fabricJson?: string
  previewDataUrl?: string
  // Fabric.js per-side fields — use these for cart/order persistence, not the two above
  fabricJsonFront?: string
  fabricJsonBack?: string
  previewDataUrlFront?: string
  previewDataUrlBack?: string
  // In PET pricing configurations
  petPrintSize?: PetPrintSize
  petSurcharge?: number
}

type Props = {
  product: Product
  baseImageUrl?: string
  onDesignChange?: (design: CustomDesignData | null) => void
}

const TEXT_COLORS = ['#131118', '#FFFFFF', '#6C4CF1', '#FF5C8A', '#FFA820', '#10B981']

export const PodCustomizer: React.FC<Props> = ({ product, baseImageUrl, onDesignChange }) => {
  const { trackEvent } = useAnalytics()

  const [artworkUrl, setArtworkUrl] = useState<string | null>(null)
  const [artworkName, setArtworkName] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [customText, setCustomText] = useState<string>('')
  const [textColor, setTextColor] = useState<string>('#131118')
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front')
  const [dpiAssessment, setDpiAssessment] = useState<DpiAssessment | null>(null)
  const [petPrintSize, setPetPrintSize] = useState<PetPrintSize>('chest_pocket')

  // Persist per-side canvas JSON so switching sides restores state
  const sideJsonRef = useRef<{ front: string; back: string }>({ front: '{}', back: '{}' })

  // Called by Fabric canvas on every object:modified/added/removed
  const sideDataUrlRef = useRef<{ front: string; back: string }>({ front: '', back: '' })

  const broadcastDesignChange = useCallback(
    (currentPrintSize: PetPrintSize) => {
      if (!onDesignChange) return
      const frontJson = sideJsonRef.current.front
      const backJson = sideJsonRef.current.back
      const hasFront = frontJson !== '{}' && frontJson !== '{"objects":[]}'
      const hasBack = backJson !== '{}' && backJson !== '{"objects":[]}'

      if (!hasFront && !hasBack && !artworkUrl && !customText.trim()) {
        onDesignChange(null)
        return
      }

      const surcharge = calculatePetSurcharge(currentPrintSize, hasFront, hasBack)

      onDesignChange({
        artworkUrl: artworkUrl || undefined,
        artworkName: artworkName || undefined,
        scale: 100,
        rotation: 0,
        customText: customText.trim() || undefined,
        textColor,
        activeSide,
        fabricJson: sideJsonRef.current[activeSide],
        previewDataUrl: sideDataUrlRef.current[activeSide],
        fabricJsonFront: frontJson,
        fabricJsonBack: backJson,
        previewDataUrlFront: sideDataUrlRef.current.front,
        previewDataUrlBack: sideDataUrlRef.current.back,
        petPrintSize: currentPrintSize,
        petSurcharge: surcharge,
      })
    },
    [activeSide, artworkUrl, artworkName, customText, textColor, onDesignChange],
  )

  const handleCanvasModified = useCallback(
    (json: string, dataUrl: string, imageMetrics?: ImageMetrics | null) => {
      sideJsonRef.current[activeSide] = json
      sideDataUrlRef.current[activeSide] = dataUrl

      if (imageMetrics && imageMetrics.originalWidth > 0 && imageMetrics.scaledWidth > 0) {
        const assessment = calculatePrintDpi(
          imageMetrics.originalWidth,
          imageMetrics.originalHeight,
          imageMetrics.scaledWidth,
        )
        setDpiAssessment(assessment)
      } else if (!artworkUrl) {
        setDpiAssessment(null)
      }

      const hasContent = json !== '{}' && json !== '{"objects":[]}'
      const otherSide = activeSide === 'front' ? 'back' : 'front'
      const otherHasContent =
        sideJsonRef.current[otherSide] !== '{}' && sideJsonRef.current[otherSide] !== '{"objects":[]}'
      if (!hasContent && !otherHasContent && !artworkUrl && !customText.trim()) {
        if (onDesignChange) onDesignChange(null)
        return
      }

      trackEvent({
        name: 'customize_pod',
        params: {
          item_id: product.id,
          item_name: product.title,
          has_artwork: Boolean(artworkUrl),
          has_text: Boolean(customText.trim()),
          text_length: customText.trim().length,
        },
      })

      broadcastDesignChange(petPrintSize)
    },
    [
      activeSide,
      artworkUrl,
      customText,
      product,
      trackEvent,
      broadcastDesignChange,
      petPrintSize,
      onDesignChange,
    ],
  )

  const fabricHandle = useFabricCanvas(handleCanvasModified)

  // When switching sides: save current JSON, load the other side's JSON
  const handleSideToggle = async (side: 'front' | 'back') => {
    if (side === activeSide) return
    // Save current side
    sideJsonRef.current[activeSide] = fabricHandle.exportJson()
    setActiveSide(side)
    const targetJson = sideJsonRef.current[side]
    if (targetJson && targetJson !== '{}' && targetJson !== '{"objects":[]}') {
      await fabricHandle.loadJson(targetJson)
    } else {
      fabricHandle.clearCanvas()
    }
  }

  // Sync text color into canvas when it changes
  useEffect(() => {
    if (fabricHandle.isReady && customText) {
      fabricHandle.updateTextColor(textColor)
    }
  }, [textColor, fabricHandle, customText])

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setIsUploading(true)

    // Local blob URL for instant canvas preview while upload is in flight
    const localUrl = URL.createObjectURL(file)
    setArtworkUrl(localUrl)
    setArtworkName(file.name)
    await fabricHandle.addImage(localUrl)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', `Artwork for ${product.title}: ${file.name}`)

      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/media`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Failed to upload artwork to server')

      const json = await res.json()
      const serverUrl: string = json?.doc?.url || localUrl
      setArtworkUrl(serverUrl)
      // Replace canvas image with server URL so fabricJson references a stable URL
      await fabricHandle.addImage(serverUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading file'
      setUploadError(msg)
      // Keep local blob URL in canvas — still usable for preview
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearArtwork = () => {
    setArtworkUrl(null)
    setArtworkName('')
    setUploadError(null)
    setDpiAssessment(null)
    fabricHandle.clearCanvas()
    if (onDesignChange) onDesignChange(null)
  }

  const handleTextChange = (text: string) => {
    setCustomText(text)
    if (!fabricHandle.isReady) return
    if (text.trim()) {
      fabricHandle.addText(text.trim(), textColor)
    } else {
      // Remove all text layers when field is cleared
      fabricHandle.addText('', textColor) // addText guards on empty string
    }
  }

  const handleColorChange = (color: string) => {
    setTextColor(color)
    fabricHandle.updateTextColor(color)
  }

  const metaImage = product?.meta?.image as Media | undefined
  const fallbackImage =
    typeof metaImage === 'object' && metaImage?.url ? metaImage.url : baseImageUrl

  return (
    <div className={classes.customizerWrapper}>
      <div className={classes.header}>
        <h5>
          <span>🎨</span> Live POD Mockup Customizer
        </h5>
        <div className={classes.headerActions}>
          <div className={classes.sideToggleGroup}>
            <button
              type="button"
              className={[classes.sideBtn, activeSide === 'front' && classes.activeSide]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleSideToggle('front')}
            >
              Front Side
            </button>
            <button
              type="button"
              className={[classes.sideBtn, activeSide === 'back' && classes.activeSide]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleSideToggle('back')}
            >
              Back Side
            </button>
          </div>
          <span className={classes.badge}>Custom Print</span>
        </div>
      </div>

      <div className={classes.stageContainer}>
        {/* Mockup + Fabric canvas overlay */}
        <div className={classes.previewStage}>
          {fallbackImage ? (
            <img src={fallbackImage} alt={product.title} className={classes.mockupBase} />
          ) : (
            <div className={classes.blankFallback}>
              <span>{product.title} Blank Canvas</span>
            </div>
          )}

          {/* Safe zone indicator (static SVG) */}
          <svg
            className={classes.safeZoneOverlay}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="28"
              y="22"
              width="44"
              height="52"
              fill="none"
              stroke="rgba(108,76,241,0.4)"
              strokeWidth="0.8"
              strokeDasharray="3 2"
              rx="1"
            />
          </svg>

          {/* Fabric.js canvas — absolute, covers print zone */}
          <div className={classes.canvasWrapper}>
            <canvas ref={fabricHandle.canvasEl} />
            {!fabricHandle.isReady && (
              <div className={classes.canvasLoading}>
                <span>Loading canvas…</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls panel */}
        <div className={classes.controlsPanel}>
          {fabricHandle.isReady && (artworkUrl || customText) && (
            <div className={classes.dragStatusNotice}>
              <span>✋ Click objects on canvas to move, resize, rotate</span>
              <button
                type="button"
                onClick={fabricHandle.deleteSelected}
                className={classes.resetPosBtn}
              >
                Delete Selected
              </button>
            </div>
          )}

          <div className={classes.controlGroup}>
            <label>1. Upload Artwork / Design (PNG/JPG)</label>
            <div className={classes.uploadBtnRow}>
              <label className={classes.uploadLabel}>
                <span>📁</span>{' '}
                {isUploading ? 'Uploading...' : artworkName ? 'Change Design' : 'Choose Image File'}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  disabled={isUploading}
                  className={classes.fileInput}
                  onChange={handleFileUpload}
                />
              </label>
              {artworkUrl && (
                <button type="button" onClick={handleClearArtwork} className={classes.clearBtn}>
                  Remove
                </button>
              )}
            </div>
            {uploadError && (
              <span style={{ fontSize: '0.8rem', color: 'var(--color-error-500, #e74c3c)' }}>
                {uploadError}
              </span>
            )}

            {/* Smart DPI Quality Badge for PET Transfer */}
            {dpiAssessment && (
              <div
                className={[
                  classes.dpiBadgeContainer,
                  classes[`dpi_${dpiAssessment.quality}`],
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={classes.dpiHeader}>
                  <span className={classes.dpiIcon}>
                    {dpiAssessment.quality === 'good'
                      ? '✨'
                      : dpiAssessment.quality === 'warning'
                      ? '⚠️'
                      : '🛑'}
                  </span>
                  <strong className={classes.dpiTitle}>{dpiAssessment.message}</strong>
                  <span className={classes.dpiValue}>({dpiAssessment.dpi} DPI)</span>
                </div>
                <p className={classes.dpiRecommendation}>{dpiAssessment.recommendation}</p>
              </div>
            )}
          </div>

          <div className={classes.controlGroup}>
            <label>2. Add Custom Text (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Your Name, Slogan..."
              value={customText}
              className={classes.textInput}
              maxLength={40}
              onChange={e => handleTextChange(e.target.value)}
            />
          </div>

          {customText && (
            <div className={classes.controlGroup}>
              <label>Text Color</label>
              <div className={classes.colorPickerRow}>
                {TEXT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={[classes.textColorDot, textColor === c && classes.activeColor]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ backgroundColor: c }}
                    onClick={() => handleColorChange(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. PET Print Size Selector */}
          <div className={classes.controlGroup}>
            <label>3. Chọn Khổ In Màng PET Nhiệt</label>
            <div className={classes.printSizeGrid}>
              {(Object.keys(PET_PRINT_SIZE_SURCHARGES) as PetPrintSize[]).map(sizeKey => {
                const conf = PET_PRINT_SIZE_SURCHARGES[sizeKey]
                const isSelected = petPrintSize === sizeKey
                return (
                  <button
                    key={sizeKey}
                    type="button"
                    className={[classes.printSizeBtn, isSelected && classes.activePrintSize]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      setPetPrintSize(sizeKey)
                      broadcastDesignChange(sizeKey)
                    }}
                  >
                    <div className={classes.printSizeHeader}>
                      <strong>{conf.label}</strong>
                      <span className={classes.printSizePrice}>
                        {conf.surchargeCents === 0 ? 'Mặc định' : `+${(conf.surchargeCents / 100).toFixed(2)}$`}
                      </span>
                    </div>
                    <span className={classes.printSizeDesc}>{conf.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
