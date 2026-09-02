import * as React from 'react'
import { UIField } from 'payload/dist/fields/config/types'
import { useFormFields } from 'payload/components/forms'

export const CustomDesignPreview: React.FC<UIField> = () => {
  const { value: customDesignUrl } =
    useFormFields(([fields]) => fields['items.customDesignUrl'] || fields['customDesignUrl']) || {}
  const { value: customText } =
    useFormFields(([fields]) => fields['items.customText'] || fields['customText']) || {}

  if (!customDesignUrl && !customText) return null

  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: '#1c1b22',
        border: '1px solid #322f3d',
        borderRadius: '6px',
        marginTop: '8px',
        marginBottom: '12px',
      }}
    >
      <div style={{ fontWeight: 600, color: '#a78bfa', marginBottom: '8px', fontSize: '13px' }}>
        🎨 POD Production Artwork & Specs
      </div>
      {Boolean(customDesignUrl) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <img
            src={String(customDesignUrl)}
            alt="Artwork"
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
              borderRadius: '4px',
              border: '1px solid #4a455a',
              backgroundColor: '#121118',
            }}
          />
          <div>
            <a
              href={String(customDesignUrl)}
              target="_blank"
              rel="noreferrer noopener"
              style={{
                color: '#818cf8',
                textDecoration: 'underline',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Open Full Resolution Artwork ↗
            </a>
          </div>
        </div>
      )}
      {Boolean(customText) && (
        <div style={{ fontSize: '13px', color: '#f3f4f6' }}>
          <strong>Custom Text:</strong> &ldquo;{String(customText)}&rdquo;
        </div>
      )}
    </div>
  )
}
