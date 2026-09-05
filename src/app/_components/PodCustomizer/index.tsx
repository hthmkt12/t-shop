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
  scale: number
  rotation: number
  positionX?: number
  positionY?: number
  customText?: string
  textColor: string
  activeSide?: 'front' | 'back'
  fabricJson?: string
  previewDataUrl?: string
  fabricJsonFront?: string
  fabricJsonBack?: string
  previewDataUrlFront?: string
  previewDataUrlBack?: string
  petPrintSize?: PetPrintSize
  petSurcharge?: number
}

type Props = {
  product: Product
  baseImageUrl?: string
  onDesignChange?: (design: CustomDesignData | null) => void
}

const TEXT_COLORS = ['#000000', '#FFFFFF', '#0071E3', '#E03E3E', '#F59E0B', '#10B981']

export const PodCustomizer: React.FC<Props> = ({ product, baseImageUrl, onDesignChange }) => {
  const { trackEvent } = useAnalytics()

  const [artworkUrl, setArtworkUrl] = useState<string | null>(null)
  const [artworkName, setArtworkName] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [customText, setCustomText] = useState<string>('')
  const [textColor, setTextColor] = useState<string>('#000000')
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front')
  const [dpiAssessment, setDpiAssessment] = useState<DpiAssessment | null>(null)
  const [petPrintSize, setPetPrintSize] = useState<PetPrintSize>('chest_pocket')

  // Persist per-side canvas JSON so switching sides restores state
  const sideJsonRef = useRef<{ front: string; back: string }>({ front: '{}', back: '{}' })
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

  const handleSideToggle = async (side: 'front' | 'back') => {
    if (side === activeSide) return
    sideJsonRef.current[activeSide] = fabricHandle.exportJson()
    setActiveSide(side)
    const targetJson = sideJsonRef.current[side]
    if (targetJson && targetJson !== '{}' && targetJson !== '{"objects":[]}') {
      await fabricHandle.loadJson(targetJson)
    } else {
      fabricHandle.clearCanvas()
    }
  }

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
      await fabricHandle.addImage(serverUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading file'
      setUploadError(msg)
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
      fabricHandle.addText('', textColor)
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
      {/* Studio Bar */}
      <div className={classes.header}>
        <div className={classes.headerTitleBox}>
          <span className={classes.studioDot} />
          <h5 className={classes.studioTitle}>
            PET Transfer Studio
            <span className={classes.studioSubtitle}>/ Precision Mode</span>
          </h5>
        </div>

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
        </div>
      </div>

      {/* 60/40 Precision Workspace */}
      <div className={classes.stageContainer}>
        {/* Left Column: Canvas Preview */}
        <div className={classes.previewStage}>
          {fallbackImage ? (
            <img src={fallbackImage} alt={product.title} className={classes.mockupBase} />
          ) : (
            <div className={classes.blankFallback}>
              <span>{product.title} Blank Canvas</span>
            </div>
          )}

          {/* Safe zone boundary */}
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
              stroke="rgba(0, 113, 227, 0.4)"
              strokeWidth="0.8"
              strokeDasharray="3 2"
              rx="1"
            />
          </svg>

          {/* Fabric Canvas Overlay */}
          <div className={classes.canvasWrapper}>
            <canvas ref={fabricHandle.canvasEl} />
            {!fabricHandle.isReady && (
              <div className={classes.canvasLoading}>
                <span>Initializing precision canvas…</span>
              </div>
            )}
          </div>

          {/* Dock indicator */}
          {fabricHandle.isReady && (artworkUrl || customText) && (
            <div className={classes.canvasHintDock}>
              <span>Drag / Scale on Canvas</span>
              <button
                type="button"
                onClick={fabricHandle.deleteSelected}
                className={classes.deleteObjBtn}
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Right Column: 3-Step Guided Inspector */}
        <div className={classes.controlsPanel}>
          {/* Step 1: Upload Graphics & DPI Meter */}
          <div className={classes.stepSection}>
            <div className={classes.stepHeaderRow}>
              <span className={classes.stepLabel}>
                <span className={classes.stepNum}>1</span>
                Artwork & Fidelity
              </span>
            </div>

            <div className={classes.uploadActionRow}>
              <label className={classes.uploadTriggerBtn}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {isUploading ? 'Auditing File...' : artworkName ? 'Replace Artwork' : 'Upload Design File'}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  disabled={isUploading}
                  className={classes.fileInputHidden}
                  onChange={handleFileUpload}
                />
              </label>

              {artworkUrl && (
                <button type="button" onClick={handleClearArtwork} className={classes.clearArtworkBtn}>
                  Remove
                </button>
              )}
            </div>

            {uploadError && (
              <span style={{ fontSize: '11px', color: '#ef4444' }}>
                {uploadError}
              </span>
            )}

            {/* Smart DPI Micro-Meter */}
            {dpiAssessment && (
              <div
                className={[
                  classes.dpiMeterCard,
                  classes[`dpi_${dpiAssessment.quality}`],
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={classes.dpiMetaRow}>
                  <span className={classes.dpiTitleText}>
                    {dpiAssessment.quality === 'good'
                      ? 'Studio High Quality'
                      : dpiAssessment.quality === 'warning'
                      ? 'Acceptable Print DPI'
                      : 'Low Resolution Warning'}
                  </span>
                  <span className={classes.dpiBadgeScore}>{dpiAssessment.dpi} DPI</span>
                </div>

                <div className={classes.dpiBarTrack}>
                  <div
                    className={classes.dpiBarFill}
                    style={{
                      width: `${Math.min(100, Math.round((dpiAssessment.dpi / 300) * 100))}%`,
                    }}
                  />
                </div>

                <p className={classes.dpiGuidance}>{dpiAssessment.recommendation}</p>
              </div>
            )}
          </div>

          {/* Step 2: Custom Typography */}
          <div className={classes.stepSection}>
            <div className={classes.stepHeaderRow}>
              <span className={classes.stepLabel}>
                <span className={classes.stepNum}>2</span>
                Bespoke Typography (Optional)
              </span>
            </div>

            <input
              type="text"
              placeholder="e.g. BRAND NAME, MOTTO..."
              value={customText}
              className={classes.textInputField}
              maxLength={40}
              onChange={e => handleTextChange(e.target.value)}
            />

            {customText && (
              <div className={classes.colorPickerPalette}>
                {TEXT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={[classes.colorChoiceDot, textColor === c && classes.activeColor]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ backgroundColor: c, border: c === '#FFFFFF' ? '1px solid rgba(0,0,0,0.2)' : undefined }}
                    onClick={() => handleColorChange(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Step 3: PET Print Size Zone */}
          <div className={classes.stepSection}>
            <div className={classes.stepHeaderRow}>
              <span className={classes.stepLabel}>
                <span className={classes.stepNum}>3</span>
                Direct-to-Film Print Format
              </span>
            </div>

            <div className={classes.printSizeGrid}>
              {(Object.keys(PET_PRINT_SIZE_SURCHARGES) as PetPrintSize[]).map(sizeKey => {
                const conf = PET_PRINT_SIZE_SURCHARGES[sizeKey]
                const isSelected = petPrintSize === sizeKey
                return (
                  <button
                    key={sizeKey}
                    type="button"
                    className={[classes.printSizeTile, isSelected && classes.activePrintSize]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      setPetPrintSize(sizeKey)
                      broadcastDesignChange(sizeKey)
                    }}
                  >
                    <div className={classes.sizeInfoCol}>
                      <span className={classes.sizeTitle}>{conf.label}</span>
                      <span className={classes.sizeDimensions}>{conf.desc}</span>
                    </div>

                    <span className={classes.sizePriceTag}>
                      {conf.surchargeCents === 0 ? 'Standard' : `+$${(conf.surchargeCents / 100).toFixed(2)}`}
                    </span>
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
