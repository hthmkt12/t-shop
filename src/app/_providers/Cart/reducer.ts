import type { CartItems, Product } from '../../../payload/payload-types'

export type CartItem = CartItems[0] & {
  sku?: string
  variantTitle?: string
  customDesignUrl?: string
  customText?: string
}

interface CartType {
  items?: CartItem[]
}

type CartAction =
  | {
      type: 'SET_CART'
      payload: CartType
    }
  | {
      type: 'MERGE_CART'
      payload: CartType
    }
  | {
      type: 'ADD_ITEM'
      payload: CartItem
    }
  | {
      type: 'DELETE_ITEM'
      payload: { product: Product; sku?: string } | Product
    }
  | {
      type: 'CLEAR_CART'
    }

export const cartReducer = (cart: CartType, action: CartAction): CartType => {
  switch (action.type) {
    case 'SET_CART': {
      return action.payload
    }

    case 'MERGE_CART': {
      const { payload: incomingCart } = action

      const syncedItems: CartItem[] = [
        ...(cart?.items || []),
        ...(incomingCart?.items || []),
      ].reduce((acc: CartItem[], item) => {
        const productId = typeof item.product === 'string' ? item.product : item?.product?.id
        const itemSku = (item as any)?.sku || ''

        const indexInAcc = acc.findIndex(accItem => {
          const accProductId =
            typeof accItem.product === 'string' ? accItem.product : accItem?.product?.id
          const accSku = (accItem as any)?.sku || ''
          return accProductId === productId && accSku === itemSku
        })

        if (indexInAcc > -1) {
          acc[indexInAcc] = {
            ...acc[indexInAcc],
          }
        } else {
          acc.push(item)
        }
        return acc
      }, [])

      return {
        ...cart,
        items: syncedItems,
      }
    }

    case 'ADD_ITEM': {
      const { payload: incomingItem } = action
      const productId =
        typeof incomingItem.product === 'string' ? incomingItem.product : incomingItem?.product?.id
      const incomingSku = (incomingItem as any)?.sku || ''

      const indexInCart = cart?.items?.findIndex(item => {
        const itemProductId = typeof item.product === 'string' ? item.product : item?.product?.id
        const itemSku = (item as any)?.sku || ''
        return itemProductId === productId && itemSku === incomingSku
      })

      let withAddedItem = [...(cart?.items || [])]

      if (indexInCart === -1) {
        withAddedItem.push(incomingItem)
      } else if (typeof indexInCart === 'number' && indexInCart > -1) {
        withAddedItem[indexInCart] = {
          ...withAddedItem[indexInCart],
          quantity: (incomingItem.quantity || 0) > 0 ? incomingItem.quantity : undefined,
        }
      }

      return {
        ...cart,
        items: withAddedItem,
      }
    }

    case 'DELETE_ITEM': {
      const { payload } = action
      const incomingProduct = (payload as any)?.id
        ? (payload as Product)
        : (payload as any)?.product
      const incomingSku = (payload as any)?.sku
      const withDeletedItem = { ...cart }

      const indexInCart = cart?.items?.findIndex(item => {
        const itemProductId = typeof item.product === 'string' ? item.product : item?.product?.id
        const matchProduct = itemProductId === incomingProduct?.id
        if (!matchProduct) return false
        if (incomingSku !== undefined) {
          return (item as any)?.sku === incomingSku
        }
        return true
      })

      if (typeof indexInCart === 'number' && withDeletedItem.items && indexInCart > -1) {
        withDeletedItem.items.splice(indexInCart, 1)
      }

      return withDeletedItem
    }

    case 'CLEAR_CART': {
      return {
        ...cart,
        items: [],
      }
    }

    default: {
      return cart
    }
  }
}
