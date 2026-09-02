export const podTote: any = {
  title: 'Eco-Friendly Heavy Canvas Tote Bag',
  stripeProductID: '',
  slug: 'heavy-canvas-tote-bag',
  _status: 'published',
  productType: 'tote',
  enableCustomizer: true,
  enableVariants: true,
  price: 2200, // $22.00
  variants: [
    {
      sku: 'TOTE-NATURAL',
      title: 'Standard / Natural Canvas',
      color: 'Natural',
      colorHex: '#F7F6FB',
      price: 2200,
      stock: 85,
    },
    {
      sku: 'TOTE-MIDNIGHT',
      title: 'Standard / Midnight Black',
      color: 'Black',
      colorHex: '#131118',
      price: 2400,
      stock: 60,
    },
  ],
  meta: {
    title: 'Eco-Friendly Heavy Canvas Tote Bag | Custom POD',
    description:
      '100% certified organic heavy cotton canvas tote with reinforced shoulder straps and dual-sided print area.',
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
                  text: 'Sturdy 12oz natural cotton canvas bag featuring reinforced handles and bottom gusset. Perfect everyday carry for groceries, laptops, and art supplies.',
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
