'use client'

import React, { createContext, useContext, useEffect } from 'react'

export type AnalyticsEvent =
  | {
      name: 'view_item'
      params: {
        item_id: string
        item_name: string
        price?: number
        category?: string
      }
    }
  | {
      name: 'customize_pod'
      params: {
        item_id: string
        item_name: string
        has_artwork: boolean
        has_text: boolean
        text_length?: number
      }
    }
  | {
      name: 'add_to_cart'
      params: {
        item_id: string
        item_name: string
        price?: number
        quantity: number
        sku?: string
        variant_title?: string
        is_customized?: boolean
      }
    }
  | {
      name: 'begin_checkout'
      params: {
        item_count: number
        value: number
        currency?: string
      }
    }
  | {
      name: 'purchase'
      params: {
        transaction_id: string
        value?: number
        currency?: string
        item_count?: number
      }
    }

type AnalyticsContextType = {
  trackEvent: (event: AnalyticsEvent) => void
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  trackEvent: () => {},
})

declare global {
  interface Window {
    dataLayer?: any[]
    fbq?: (...args: any[]) => void
    gtag?: (...args: any[]) => void
  }
}

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const trackEvent = (event: AnalyticsEvent) => {
    if (typeof window === 'undefined') return

    // 1. Dispatch to GA4 / GTM dataLayer
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: event.name,
      ...event.params,
    })

    // 2. Dispatch to Meta Pixel if present
    if (typeof window.fbq === 'function') {
      if (event.name === 'view_item') {
        window.fbq('track', 'ViewContent', {
          content_ids: [event.params.item_id],
          content_name: event.params.item_name,
          value: event.params.price,
          currency: 'USD',
        })
      } else if (event.name === 'customize_pod') {
        window.fbq('trackCustom', 'CustomizePOD', event.params)
      } else if (event.name === 'add_to_cart') {
        window.fbq('track', 'AddToCart', {
          content_ids: [event.params.item_id],
          content_name: event.params.item_name,
          value: (event.params.price || 0) * event.params.quantity,
          currency: 'USD',
        })
      } else if (event.name === 'begin_checkout') {
        window.fbq('track', 'InitiateCheckout', {
          num_items: event.params.item_count,
          value: event.params.value,
          currency: event.params.currency || 'USD',
        })
      } else if (event.name === 'purchase') {
        window.fbq('track', 'Purchase', {
          content_ids: [event.params.transaction_id],
          value: event.params.value || 0,
          currency: event.params.currency || 'USD',
        })
      }
    }

    // 3. Dispatch to standard gtag if initialized
    if (typeof window.gtag === 'function') {
      window.gtag('event', event.name, event.params)
    }

    // 4. Debug in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[Analytics Event: ${event.name}]`, event.params)
    }
  }

  return <AnalyticsContext.Provider value={{ trackEvent }}>{children}</AnalyticsContext.Provider>
}

export const useAnalytics = () => useContext(AnalyticsContext)
