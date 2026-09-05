'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

import { Header } from '../../../../payload/payload-types'
import { noHeaderFooterUrls } from '../../../constants'
import { Gutter } from '../../Gutter'
import { HeaderNav } from '../Nav'

import classes from './index.module.scss'

const CATEGORY_SHORTCUTS = [
  { label: 'Tất cả sản phẩm', href: '/products' },
  { label: 'Áo thun phôi trơn', href: '/products?category=t-shirts' },
  { label: 'Áo Hoodie & Nỉ', href: '/products?category=hoodies' },
  { label: 'Túi vải & Phụ kiện', href: '/products?category=accessories' },
  { label: 'Bảng giá đặt sỉ', href: '/#bulk-calculator' },
  { label: 'Công nghệ in PET DTF', href: '/#pet-tech' },
]

export const HeaderComponent = ({ header }: { header: Header }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [showPromo, setShowPromo] = useState(true)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  if (noHeaderFooterUrls.includes(pathname)) return null

  return (
    <header className={classes.headerWrapper}>
      {/* 1. Top Announcement Promo Bar (Vistaprint / RushOrderTees style) */}
      {showPromo && (
        <div className={classes.promoBar}>
          <div className={classes.promoContent}>
            <span className={classes.promoIcon}>🚚</span>
            <span className={classes.promoText}>
              <strong>Miễn phí giao hàng</strong> toàn quốc đơn từ $50 &bull;
              <span className={classes.highlightTag}> In lấy ngay 24h</span> &bull;
              Cam kết độ bền <strong>50+ lần giặt</strong> không bong tróc
            </span>
          </div>
          <div className={classes.promoActions}>
            <span className={classes.hotlineText}>📞 Hotline / Zalo: <strong>1900 8888</strong></span>
            <button
              type="button"
              className={classes.closePromoBtn}
              onClick={() => setShowPromo(false)}
              aria-label="Đóng thông báo"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Commercial Header */}
      <nav className={classes.mainHeader}>
        <Gutter className={classes.wrap}>
          {/* Brand Logo & Slogan */}
          <Link href="/" className={classes.logoLink}>
            <div className={classes.brandWrap}>
              <Image
                src="/logo-black.svg"
                alt="T-Shop logo"
                width={140}
                height={40}
                className={classes.logoLight}
                priority
              />
              <Image
                src="/logo-white.svg"
                alt="T-Shop logo"
                width={140}
                height={40}
                className={classes.logoDark}
                priority
              />
              <span className={classes.brandTagline}>XƯỞNG IN PET CHUYÊN NGHIỆP</span>
            </div>
          </Link>

          {/* Search Bar with Icon */}
          <form onSubmit={handleSearch} className={classes.searchForm}>
            <input
              type="text"
              placeholder="Tìm kiếm phôi áo, hoodie, phụ kiện in PET..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={classes.searchInput}
            />
            <button type="submit" className={classes.searchBtn} aria-label="Tìm kiếm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          {/* Quick Actions & Header Nav */}
          <div className={classes.rightActions}>
            <Link href="/track-order" className={classes.trackOrderLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>Tra cứu đơn</span>
            </Link>

            <HeaderNav header={header} />
          </div>
        </Gutter>
      </nav>

      {/* 3. Category Sub-Navigation Bar */}
      <div className={classes.categoryBar}>
        <Gutter className={classes.categoryWrap}>
          <div className={classes.categoryList}>
            {CATEGORY_SHORTCUTS.map((item, idx) => (
              <Link key={idx} href={item.href} className={classes.categoryItem}>
                {item.label}
              </Link>
            ))}
          </div>
          <Link href="/products" className={classes.instantDesignBtn}>
            ⚡ Bắt đầu thiết kế áo
          </Link>
        </Gutter>
      </div>
    </header>
  )
}

export default HeaderComponent
