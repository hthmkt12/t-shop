'use client'

import React, { ChangeEvent, useState } from 'react'

import { Media, Product } from '../../../payload/payload-types'
import { useAnalytics } from '../../_providers/Analytics'
import classes from './index.module.scss'

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
  const [scale, setScale] = useState<number>(100)
  const [rotation, setRotation] = useState<number>(0)
  const [posX, setPosX] = useState<number>(0)
  const [posY, setPosY] = useState<number>(0)
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front')
  const [customText, setCustomText] = useState<string>('')
  const [textColor, setTextColor] = useState<string>('#131118')
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const updateParent = (
    nextUrl: string | null,
    nextName: string,
    nextScale: number,
    nextRot: number,
    nextText: string,
    nextColor: string,
    nextPosX: number = posX,
    nextPosY: number = posY,
    nextSide: 'front' | 'back' = activeSide,
  ) => {
    if (!onDesignChange) return
    if (!nextUrl && !nextText.trim()) {
      onDesignChange(null)
      return
    }

    trackEvent({
      name: 'customize_pod',
      params: {
        item_id: product.id,
        item_name: product.title,
        has_artwork: Boolean(nextUrl),
        has_text: Boolean(nextText.trim()),
        text_length: nextText.trim().length,
      },
    })

    onDesignChange({
      artworkUrl: nextUrl || undefined,
      artworkName: nextName || undefined,
      scale: nextScale,
      rotation: nextRot,
      positionX: nextPosX,
      positionY: nextPosY,
      customText: nextText.trim() || undefined,
      textColor: nextColor,
      activeSide: nextSide,
    })
  }

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setIsUploading(true)

    // Local instant preview
    const localPreviewUrl = URL.createObjectURL(file)
    setArtworkUrl(localPreviewUrl)
    setArtworkName(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', `Artwork for ${product.title}: ${file.name}`)

      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/media`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Failed to upload artwork to server')
      }

      const json = await res.json()
      const serverUrl = json?.doc?.url || localPreviewUrl

      setArtworkUrl(serverUrl)
      updateParent(serverUrl, file.name, scale, rotation, customText, textColor)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading file'
      setUploadError(msg)
      // Still allow client preview if offline/mock
      updateParent(localPreviewUrl, file.name, scale, rotation, customText, textColor)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearArtwork = () => {
    setArtworkUrl(null)
    setArtworkName('')
    setUploadError(null)
    setPosX(0)
    setPosY(0)
    updateParent(null, '', scale, rotation, customText, textColor, 0, 0, activeSide)
  }

  const handleScaleChange = (val: number) => {
    setScale(val)
    updateParent(
      artworkUrl,
      artworkName,
      val,
      rotation,
      customText,
      textColor,
      posX,
      posY,
      activeSide,
    )
  }

  const handleRotationChange = (val: number) => {
    setRotation(val)
    updateParent(artworkUrl, artworkName, scale, val, customText, textColor, posX, posY, activeSide)
  }

  const handleTextChange = (text: string) => {
    setCustomText(text)
    updateParent(artworkUrl, artworkName, scale, rotation, text, textColor, posX, posY, activeSide)
  }

  const handleColorChange = (color: string) => {
    setTextColor(color)
    updateParent(
      artworkUrl,
      artworkName,
      scale,
      rotation,
      customText,
      color,
      posX,
      posY,
      activeSide,
    )
  }

  const handleSideToggle = (side: 'front' | 'back') => {
    setActiveSide(side)
    updateParent(artworkUrl, artworkName, scale, rotation, customText, textColor, posX, posY, side)
  }

  // Pointer / Touch Drag Handler for Artwork Placement
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!artworkUrl && !customText) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - posX, y: e.clientY - posY })
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const newX = Math.max(-60, Math.min(60, e.clientX - dragStart.x))
    const newY = Math.max(-60, Math.min(60, e.clientY - dragStart.y))
    setPosX(newX)
    setPosY(newY)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
    updateParent(
      artworkUrl,
      artworkName,
      scale,
      rotation,
      customText,
      textColor,
      posX,
      posY,
      activeSide,
    )
  }

  const handleResetPosition = () => {
    setPosX(0)
    setPosY(0)
    updateParent(artworkUrl, artworkName, scale, rotation, customText, textColor, 0, 0, activeSide)
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
        {/* Mockup Preview Canvas */}
        <div className={classes.previewStage}>
          {fallbackImage ? (
            <img src={fallbackImage} alt={product.title} className={classes.mockupBase} />
          ) : (
            <div className={classes.blankFallback}>
              <span>{product.title} Blank Canvas</span>
            </div>
          )}

          {/* Printable Design Area with Drag Support */}
          <div
            className={[classes.printAreaBox, (artworkUrl || customText) && classes.interactiveArea]
              .filter(Boolean)
              .join(' ')}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              cursor: artworkUrl || customText ? (isDragging ? 'grabbing' : 'grab') : 'default',
              touchAction: 'none',
            }}
          >
            {artworkUrl && (
              <img
                src={artworkUrl}
                alt="Uploaded Artwork"
                className={classes.uploadedImage}
                style={{
                  transform: `translate3d(${posX}px, ${posY}px, 0) scale(${
                    scale / 100
                  }) rotate(${rotation}deg)`,
                }}
                draggable={false}
              />
            )}
            {customText && (
              <span
                className={classes.customTextLayer}
                style={{
                  color: textColor,
                  fontSize: `${Math.max(12, Math.round((scale / 100) * 16))}px`,
                  transform: `translate3d(${posX}px, ${posY}px, 0)`,
                }}
              >
                {customText}
              </span>
            )}
            {!artworkUrl && !customText && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--theme-text-muted)',
                  textAlign: 'center',
                }}
              >
                Print Area ({activeSide})
              </span>
            )}
          </div>
        </div>

        {/* Customization Controls */}
        <div className={classes.controlsPanel}>
          {(posX !== 0 || posY !== 0) && (
            <div className={classes.dragStatusNotice}>
              <span>
                ✋ Dragged: X: {posX}px, Y: {posY}px
              </span>
              <button type="button" onClick={handleResetPosition} className={classes.resetPosBtn}>
                Reset Center
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
          </div>

          {artworkUrl && (
            <>
              <div className={classes.controlGroup}>
                <label>Scale: {scale}%</label>
                <div className={classes.sliderRow}>
                  <input
                    type="range"
                    min={40}
                    max={160}
                    value={scale}
                    onChange={e => handleScaleChange(Number(e.target.value))}
                  />
                  <span>{scale}%</span>
                </div>
              </div>

              <div className={classes.controlGroup}>
                <label>Rotation: {rotation}°</label>
                <div className={classes.sliderRow}>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    value={rotation}
                    onChange={e => handleRotationChange(Number(e.target.value))}
                  />
                  <span>{rotation}°</span>
                </div>
              </div>
            </>
          )}

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
        </div>
      </div>
    </div>
  )
}
