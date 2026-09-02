import type { AfterChangeHook } from 'payload/dist/collections/config/types'
import type { Order } from '../../../payload-types'

export const sendOrderConfirmationEmail: AfterChangeHook<Order> = async ({
  doc,
  req,
  operation,
}) => {
  const { payload } = req

  if (operation !== 'create') {
    return
  }

  try {
    let customerEmail: string | undefined

    if (doc.orderedBy) {
      const userId = typeof doc.orderedBy === 'object' ? doc.orderedBy.id : doc.orderedBy
      const user = await payload.findByID({
        collection: 'users',
        id: userId,
      })
      customerEmail = user?.email
    }

    if (!customerEmail) {
      payload.logger.warn(
        `Order #${doc.id} created without identifiable customer email. Skipping email dispatch.`,
      )
      return
    }

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const trackingUrl = `${serverUrl}/track-order?orderId=${doc.id}&email=${encodeURIComponent(
      customerEmail,
    )}`

    const itemsSummary = (doc.items || [])
      .map(item => {
        const title = typeof item.product === 'object' ? item.product.title : 'Custom POD Product'
        const variant = item.variantTitle ? ` (${item.variantTitle})` : ''
        const customText = item.customText ? ` [Custom Text: "${item.customText}"]` : ''
        return `• ${title}${variant}${customText} x ${item.quantity} - $${(
          (item.price || 0) / 100
        ).toFixed(2)}`
      })
      .join('\n')

    const emailSubject = `Your T-Shop Order Confirmation #${doc.id}`
    const emailText = `Thank you for your order!

Order ID: ${doc.id}
Order Total: $${((doc.total || 0) / 100).toFixed(2)}

Items:
${itemsSummary}

You can track production and shipping status in real-time here:
${trackingUrl}

We will notify you once your custom items enter production!`

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #111;">Thank you for your order!</h2>
        <p>Your order <strong>#${doc.id}</strong> has been received and is being processed.</p>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Summary</h3>
          <ul style="padding-left: 20px; line-height: 1.6;">
            ${(doc.items || [])
              .map(item => {
                const title =
                  typeof item.product === 'object' ? item.product.title : 'Custom POD Product'
                const variant = item.variantTitle ? ` (${item.variantTitle})` : ''
                const customText = item.customText
                  ? `<br/><small style="color: #666;">Custom Text: "${item.customText}"</small>`
                  : ''
                const artwork = item.customDesignUrl
                  ? `<br/><small><a href="${item.customDesignUrl}" target="_blank" style="color: #0066cc;">View Custom Artwork</a></small>`
                  : ''
                return `<li><strong>${title}</strong>${variant} x ${item.quantity} - <strong>$${(
                  (item.price || 0) / 100
                ).toFixed(2)}</strong>${customText}${artwork}</li>`
              })
              .join('')}
          </ul>
          <p style="font-size: 16px; margin-bottom: 0;"><strong>Total: $${(
            (doc.total || 0) / 100
          ).toFixed(2)}</strong></p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${trackingUrl}" style="background: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Track Order Status
          </a>
        </div>

        <p style="font-size: 13px; color: #777;">If you have any questions, reply directly to this email or visit our tracking portal.</p>
      </div>
    `

    await payload.sendEmail({
      to: customerEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    })

    payload.logger.info(
      `Order confirmation email sent successfully for order #${doc.id} to ${customerEmail}`,
    )
  } catch (error: unknown) {
    payload.logger.error(`Failed to send order confirmation email for order #${doc.id}: ${error}`)
  }
}
