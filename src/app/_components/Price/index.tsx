'use client'

import React, { useEffect, useState } from 'react'

import { Product } from '../../../payload/payload-types'

import classes from './index.module.scss'

export const priceFromJSON = (priceJSON: string, quantity: number = 1, raw?: boolean): string => {
  let price = ''

  if (priceJSON) {
    try {
      const parsed = JSON.parse(priceJSON)?.data[0]
      const priceValue = parsed.unit_amount * quantity
      const priceType = parsed.type

      if (raw) return priceValue.toString()

      price = (priceValue / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD', // TODO: use `parsed.currency`
      })

      if (priceType === 'recurring') {
        price += `/${
          parsed.recurring.interval_count > 1
            ? `${parsed.recurring.interval_count} ${parsed.recurring.interval}`
            : parsed.recurring.interval
        }`
      }
    } catch (e) {
      console.error(`Cannot parse priceJSON`) // eslint-disable-line no-console
    }
  }

  return price
}

const formatCents = (amount: number, quantity: number = 1): string =>
  ((amount * quantity) / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })

export const Price: React.FC<{
  product: Product
  quantity?: number
  button?: 'addToCart' | 'removeFromCart' | false
  // Raw amount in cents (e.g. selected variant price). When set, overrides priceJSON.
  priceOverride?: number
}> = props => {
  const {
    product,
    product: { priceJSON } = {},
    button = 'addToCart',
    quantity,
    priceOverride,
  } = props

  const hasOverride = typeof priceOverride === 'number'

  const compute = () => ({
    actualPrice: hasOverride ? formatCents(priceOverride as number) : priceFromJSON(priceJSON),
    withQuantity: hasOverride
      ? formatCents(priceOverride as number, quantity)
      : priceFromJSON(priceJSON, quantity),
  })

  const [price, setPrice] = useState<{
    actualPrice: string
    withQuantity: string
  }>(compute)

  useEffect(() => {
    setPrice(compute())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceJSON, quantity, priceOverride])

  return (
    <div className={classes.actions}>
      {typeof price?.actualPrice !== 'undefined' && price?.withQuantity !== '' && (
        <div className={classes.price}>
          <p>{price?.withQuantity}</p>
        </div>
      )}
    </div>
  )
}
