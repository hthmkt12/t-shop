import React from 'react'
import Link from 'next/link'
import classes from './index.module.scss'

interface PodItem {
  id: string
  name: string
  category: string
  priceSingle: string
  priceBulk: string
  badge: string
  rating: string
  reviewCount: number
  specs: string[]
  colorOptions: string[]
  productSlug: string
}

const POD_ITEMS: PodItem[] = [
  {
    id: 'classic-unisex-tshirt',
    name: 'Áo Thun Classic Cotton 250 GSM',
    category: 'Áo thun',
    priceSingle: '$25.00',
    priceBulk: '$18.75',
    badge: 'Bán chạy nhất',
    rating: '4.9 ★',
    reviewCount: 340,
    specs: ['100% Cotton chải kỹ', 'Định lượng 250 GSM', 'Bề mặt dệt mịn chuẩn in DTF'],
    colorOptions: ['#000000', '#ffffff', '#2c3e50', '#7f8c8d'],
    productSlug: 'classic-unisex-tshirt',
  },
  {
    id: 'heavyweight-fleece-hoodie',
    name: 'Áo Hoodie Nỉ Bông 480 GSM',
    category: 'Hoodie',
    priceSingle: '$48.00',
    priceBulk: '$36.00',
    badge: 'Khổ in A3 lớn',
    rating: '5.0 ★',
    reviewCount: 215,
    specs: ['Nỉ bông 480 GSM dầy dặn', 'Mũ 2 lớp đứng form', 'Túi kangaroo rộng'],
    colorOptions: ['#0A0A0A', '#E8E8E4', '#594A3C'],
    productSlug: 'heavyweight-fleece-hoodie',
  },
  {
    id: 'heavy-canvas-tote-bag',
    name: 'Túi Vải Canvas 16oz',
    category: 'Phụ kiện',
    priceSingle: '$22.00',
    priceBulk: '$16.50',
    badge: 'Độ bền cao',
    rating: '4.8 ★',
    reviewCount: 180,
    specs: ['Canvas mộc dầy 16oz', 'Quai đeo gia cố chịu lực 15kg', 'Ngăn phụ có khóa kéo'],
    colorOptions: ['#E3DAC9', '#1A1A1A'],
    productSlug: 'heavy-canvas-tote-bag',
  },
  {
    id: 'glossy-ceramic-coffee-mug',
    name: 'Ly Sứ Men Mờ In Chuyển Nhiệt',
    category: 'Drinkware',
    priceSingle: '$16.00',
    priceBulk: '$12.00',
    badge: 'Chịu nhiệt tốt',
    rating: '4.9 ★',
    reviewCount: 95,
    specs: ['Dung tích 450ml', 'Men gốm cao cấp', 'An toàn máy rửa bát & vi sóng'],
    colorOptions: ['#2B2B2B', '#EAEAEA'],
    productSlug: 'glossy-ceramic-coffee-mug',
  },
]

export const PodProductCatalog: React.FC = () => {
  return (
    <section className={classes.section}>
      <div className={classes.container}>
        <div className={classes.headerRow}>
          <div>
            <span className={classes.eyebrow}>PHÔI ÁO &amp; SẢN PHẨM IN BÁN CHẠY NHẤT</span>
            <h2 className={classes.title}>Sản Phẩm Được Các Brand Ưa Chuộng</h2>
            <p className={classes.subtitle}>
              Chất liệu vải cao cấp được dệt sợi mịn đặc biệt nhằm tối ưu hóa độ bám dính màng PET và giữ màu tươi sáng vĩnh viễn.
            </p>
          </div>
          <Link href="/products" className={classes.viewAllLink}>
            Xem tất cả phôi áo
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className={classes.grid}>
          {POD_ITEMS.map(item => (
            <div key={item.id} className={classes.card}>
              {/* Card Header Tag */}
              <div className={classes.cardTop}>
                <span className={classes.badge}>{item.badge}</span>
                <span className={classes.ratingBadge}>
                  {item.rating} <small>({item.reviewCount})</small>
                </span>
              </div>

              {/* Visual Box */}
              <div className={classes.visualBox}>
                <div className={classes.productPlaceholder}>
                  <span>{item.name}</span>
                </div>
              </div>

              {/* Info */}
              <div className={classes.infoCol}>
                <span className={classes.categoryTag}>{item.category}</span>
                <h3 className={classes.productName}>{item.name}</h3>

                {/* Specs bullets */}
                <div className={classes.specsList}>
                  {item.specs.map((spec, sIdx) => (
                    <span key={sIdx} className={classes.specTag}>
                      ✓ {spec}
                    </span>
                  ))}
                </div>

                {/* Color swatches */}
                <div className={classes.swatchRow}>
                  {item.colorOptions.map((c, cIdx) => (
                    <span
                      key={cIdx}
                      className={classes.swatchDot}
                      style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #ccc' : undefined }}
                    />
                  ))}
                  <span className={classes.colorCount}>{item.colorOptions.length} màu</span>
                </div>

                {/* Pricing & CTA */}
                <div className={classes.priceRow}>
                  <div>
                    <div className={classes.retailPrice}>
                      Lẻ: <strong>{item.priceSingle}</strong>
                    </div>
                    <div className={classes.bulkPrice}>
                      Sỉ: <strong>{item.priceBulk}</strong>
                    </div>
                  </div>

                  <Link href={`/products/${item.productSlug}`} className={classes.designBtn}>
                    ⚡ Thiết kế ngay
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
