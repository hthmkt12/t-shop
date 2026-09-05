import * as React from 'react'
import { UIField } from 'payload/dist/fields/config/types'
import { useFormFields } from 'payload/components/forms'

export const CustomDesignPreview: React.FC<UIField> = () => {
  const { value: customDesignUrl } =
    useFormFields(([fields]) => fields['items.customDesignUrl'] || fields['customDesignUrl']) || {}
  const { value: customText } =
    useFormFields(([fields]) => fields['items.customText'] || fields['customText']) || {}
  const { value: fabricJsonFront } =
    useFormFields(([fields]) => fields['items.fabricJsonFront'] || fields['fabricJsonFront']) || {}
  const { value: fabricJsonBack } =
    useFormFields(([fields]) => fields['items.fabricJsonBack'] || fields['fabricJsonBack']) || {}

  const hasFrontJson = Boolean(fabricJsonFront && fabricJsonFront !== '{}' && fabricJsonFront !== '{"objects":[]}')
  const hasBackJson = Boolean(fabricJsonBack && fabricJsonBack !== '{}' && fabricJsonBack !== '{"objects":[]}')

  if (!customDesignUrl && !customText && !hasFrontJson && !hasBackJson) return null

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
        <div style={{ fontSize: '13px', color: '#f3f4f6', marginBottom: '6px' }}>
          <strong>Custom Text:</strong> &ldquo;{String(customText)}&rdquo;
        </div>
      )}
      {hasFrontJson && (
        <details style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
          <summary style={{ cursor: 'pointer', color: '#c4b5fd', fontWeight: 500 }}>
            🔍 View Fabric JSON (Front Design)
          </summary>
          <pre
            style={{
              marginTop: '4px',
              padding: '8px',
              backgroundColor: '#0d0c11',
              borderRadius: '4px',
              overflowX: 'auto',
              maxHeight: '140px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#e5e7eb',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {String(fabricJsonFront)}
          </pre>
        </details>
      )}
      {hasBackJson && (
        <details style={{ marginTop: '6px', fontSize: '12px', color: '#9ca3af' }}>
          <summary style={{ cursor: 'pointer', color: '#c4b5fd', fontWeight: 500 }}>
            🔍 View Fabric JSON (Back Design)
          </summary>
          <pre
            style={{
              marginTop: '4px',
              padding: '8px',
              backgroundColor: '#0d0c11',
              borderRadius: '4px',
              overflowX: 'auto',
              maxHeight: '140px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#e5e7eb',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {String(fabricJsonBack)}
          </pre>
        </details>
      )}
    </div>
  )
}
