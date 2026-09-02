'use client'

import React from 'react'

import { AuthProvider } from '../_providers/Auth'
import { CartProvider } from '../_providers/Cart'
import { ThemeProvider } from './Theme'
import { FilterProvider } from './Filter'
import { AnalyticsProvider } from './Analytics'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FilterProvider>
          <CartProvider>
            <AnalyticsProvider>{children}</AnalyticsProvider>
          </CartProvider>
        </FilterProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
