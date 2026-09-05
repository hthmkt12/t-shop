export interface DeliveryEstimate {
  cutoffHour: number // e.g. 14:00 (2 PM)
  hoursLeft: number
  minutesLeft: number
  isToday: boolean
  minDeliveryDate: Date
  maxDeliveryDate: Date
  formattedDeliveryRange: string
}

export function getEstimatedDelivery(now: Date = new Date()): DeliveryEstimate {
  const currentHour = now.getHours()
  const cutoffHour = 14 // 14:00 cutoff for same-day production dispatch

  const targetDate = new Date(now)
  let productionDays = 1 // 1-day standard PET printing production
  let isToday = true

  if (currentHour >= cutoffHour) {
    isToday = false
    targetDate.setDate(targetDate.getDate() + 1)
  }

  // Calculate countdown until 14:00
  let hoursLeft = cutoffHour - currentHour - 1
  let minutesLeft = 59 - now.getMinutes()
  if (hoursLeft < 0) {
    hoursLeft = 24 + hoursLeft
  }

  // Calculate transit: standard courier 2-4 business days after production
  function addBusinessDays(startDate: Date, days: number): Date {
    const result = new Date(startDate)
    let added = 0
    while (added < days) {
      result.setDate(result.getDate() + 1)
      const dayOfWeek = result.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        added++
      }
    }
    return result
  }

  const minDeliveryDate = addBusinessDays(targetDate, productionDays + 2)
  const maxDeliveryDate = addBusinessDays(targetDate, productionDays + 4)

  const formatOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }
  const minStr = minDeliveryDate.toLocaleDateString('vi-VN', formatOptions)
  const maxStr = maxDeliveryDate.toLocaleDateString('vi-VN', formatOptions)

  return {
    cutoffHour,
    hoursLeft: Math.max(0, hoursLeft),
    minutesLeft: Math.max(0, minutesLeft),
    isToday,
    minDeliveryDate,
    maxDeliveryDate,
    formattedDeliveryRange: `${minStr} - ${maxStr}`,
  }
}
