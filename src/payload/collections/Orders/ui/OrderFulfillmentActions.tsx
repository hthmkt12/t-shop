import * as React from 'react'
import { UIField } from 'payload/dist/fields/config/types'
import Button from 'payload/dist/admin/components/elements/Button'

export const OrderFulfillmentActions: React.FC<UIField> = () => {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExportCSV = () => {
    setIsExporting(true)
    window.open('/api/export-production-batch?status=in_production&format=csv', '_blank')
    setTimeout(() => setIsExporting(false), 1000)
  }

  const handleExportJSON = () => {
    window.open('/api/export-production-batch?status=in_production&format=json', '_blank')
  }

  return (
    <div
      style={{
        marginTop: '15px',
        padding: '12px',
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: '6px',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <h4
        style={{
          margin: '0 0 8px 0',
          fontSize: '13px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        POD Workshop Tools
      </h4>
      <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--theme-elevation-600)' }}>
        Export batch queue for in-production orders or review raw production JSON.
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button size="small" buttonStyle="primary" onClick={handleExportCSV} disabled={isExporting}>
          {isExporting ? 'Exporting...' : '📥 Export Workshop CSV'}
        </Button>
        <Button size="small" buttonStyle="secondary" onClick={handleExportJSON}>
          📄 View Batch JSON
        </Button>
      </div>
    </div>
  )
}
