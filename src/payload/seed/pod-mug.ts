export const podMug: any = {
  title: 'Glossy Ceramic Coffee Mug (11oz / 15oz)',
  stripeProductID: '',
  slug: 'glossy-ceramic-coffee-mug',
  _status: 'published',
  productType: 'mug',
  enableCustomizer: true,
  enableVariants: true,
  price: 1600, // $16.00
  variants: [
    {
      sku: 'MUG-WHT-11OZ',
      title: '11oz / Classic White',
      color: 'White',
      colorHex: '#FFFFFF',
      price: 1600,
      stock: 120,
    },
    {
      sku: 'MUG-WHT-15OZ',
      title: '15oz / Mega White',
      color: 'White',
      colorHex: '#FFFFFF',
      price: 1900,
      stock: 80,
    },
    {
      sku: 'MUG-BLK-11OZ',
      title: '11oz / Matte Black',
      color: 'Black',
      colorHex: '#131118',
      price: 1800,
      stock: 65,
    },
  ],
  meta: {
    title: 'Glossy Ceramic Coffee Mug | Custom Print',
    description:
      'Microwave and dishwasher safe premium ceramic mug with wrap-around full color print.',
    image: '{{PRODUCT_IMAGE}}',
  },
  layout: [
    {
      blockType: 'content',
      columns: [
        {
          size: 'twoThirds',
          richText: [
            {
              children: [
                {
                  text: 'Durable ceramic construction with high-gloss sublimation printing. Resistant to microwave heat and dishwasher cycles without fading.',
                },
              ],
            },
          ],
          link: {
            reference: null,
            url: '',
            label: '',
          },
        },
      ],
    },
  ],
  relatedProducts: [],
}
