export const podTshirt: any = {
  title: 'Classic Unisex Cotton T-Shirt',
  stripeProductID: '',
  slug: 'classic-unisex-tshirt',
  _status: 'published',
  productType: 'tshirt',
  enableCustomizer: true,
  enableVariants: true,
  price: 2500, // $25.00
  variants: [
    {
      sku: 'TSHIRT-BLK-S',
      title: 'Size S / Black',
      size: 's',
      color: 'Black',
      colorHex: '#131118',
      price: 2500,
      stock: 50,
    },
    {
      sku: 'TSHIRT-BLK-M',
      title: 'Size M / Black',
      size: 'm',
      color: 'Black',
      colorHex: '#131118',
      price: 2500,
      stock: 100,
    },
    {
      sku: 'TSHIRT-BLK-L',
      title: 'Size L / Black',
      size: 'l',
      color: 'Black',
      colorHex: '#131118',
      price: 2700,
      stock: 45,
    },
    {
      sku: 'TSHIRT-WHT-M',
      title: 'Size M / White',
      size: 'm',
      color: 'White',
      colorHex: '#FFFFFF',
      price: 2500,
      stock: 60,
    },
    {
      sku: 'TSHIRT-VLT-M',
      title: 'Size M / Vivid Violet',
      size: 'm',
      color: 'Violet',
      colorHex: '#6C4CF1',
      price: 2900,
      stock: 30,
    },
  ],
  meta: {
    title: 'Classic Unisex Cotton T-Shirt | Custom POD',
    description:
      '100% Ring-spun cotton tee with high-definition DTG print area. Upload your custom design or artwork.',
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
                  text: 'Premium print-on-demand unisex tee made of ultra-soft 100% ring-spun cotton. High-density Direct-to-Garment (DTG) print process guarantees vivid color retention and washing durability.',
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
