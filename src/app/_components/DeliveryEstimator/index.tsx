'use client'

import React, { useEffect, useState } from 'react'
import { DeliveryEstimate, getEstimatedDelivery } from './estimator'
import classes from './index.module.scss'

export const DeliveryEstimator: React.FC<{
  className?: string
  showGuarantee?: boolean
}> = ({ className, showGuarantee = true }) => {
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null)

  useEffect(() => {
    setEstimate(getEstimatedDelivery())
    const interval = setInterval(() => {
      setEstimate(getEstimatedDelivery())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  if (!estimate) return null

  return (
    <div className={[classes.deliveryEstimator, className].filter(Boolean).join(' ')}>
      <div className={classes.countdownRow}>
        <svg
          className={classes.icon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>
          Đặt hàng trong{' '}
          <span className={classes.countdownHighlight}>
            {estimate.hoursLeft} giờ {estimate.minutesLeft} phút
          </span>{' '}
          để kịp in &amp; xuất xưởng sớm nhất!
        </span>
      </div>

      <div className={classes.deliveryDateRow}>
        <svg
          className={classes.truckIcon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <span>
          Dự kiến nhận hàng:{' '}
          <span className={classes.dateRange}>{estimate.formattedDeliveryRange}</span>
        </span>
      </div>

      {showGuarantee && (
        <div className={classes.washGuaranteeBadge}>
          <span className={classes.badgeIcon}>🛡️</span>
          <span>Bảo hành in PET: Cam kết 50+ lần giặt không bong tróc, nứt vỡ hình in</span>
        </div>
      )}
    </div>
  )
}
