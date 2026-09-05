'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Footer } from '../../../../payload/payload-types'
import { noHeaderFooterUrls } from '../../../constants'
import { Gutter } from '../../Gutter'

import classes from './index.module.scss'

const FooterComponent = ({ footer }: { footer: Footer }) => {
  const pathname = usePathname()

  return (
    <footer className={noHeaderFooterUrls.includes(pathname) ? classes.hide : classes.footerContainer}>
      {/* Upper Trust Strip */}
      <div className={classes.trustStrip}>
        <Gutter>
          <div className={classes.trustGrid}>
            <div className={classes.trustItem}>
              <span className={classes.trustIcon}>⚡</span>
              <div>
                <strong className={classes.trustTitle}>In Lấy Nhanh 24H</strong>
                <p className={classes.trustSub}>Xưởng sản xuất trực tiếp tại chỗ</p>
              </div>
            </div>

            <div className={classes.trustItem}>
              <span className={classes.trustIcon}>🛡️</span>
              <div>
                <strong className={classes.trustTitle}>Bảo Hành 50 Lần Giặt</strong>
                <p className={classes.trustSub}>Mực in &amp; PET Nhật Bản bền màu</p>
              </div>
            </div>

            <div className={classes.trustItem}>
              <span className={classes.trustIcon}>🚚</span>
              <div>
                <strong className={classes.trustTitle}>Freeship Đơn Từ $50</strong>
                <p className={classes.trustSub}>Giao hàng nhanh toàn quốc</p>
              </div>
            </div>

            <div className={classes.trustItem}>
              <span className={classes.trustIcon}>🔄</span>
              <div>
                <strong className={classes.trustTitle}>Đổi Trả 100% Miễn Phí</strong>
                <p className={classes.trustSub}>Cam kết in lại nếu sai sót lỗi in</p>
              </div>
            </div>
          </div>
        </Gutter>
      </div>

      {/* Main 4-Column Directory */}
      <div className={classes.mainFooter}>
        <Gutter>
          <div className={classes.directoryGrid}>
            {/* Col 1: Brand & Contact */}
            <div className={classes.col}>
              <div className={classes.brandWrap}>
                <Image src="/logo-white.svg" alt="T-Shop logo" width={150} height={42} priority />
                <span className={classes.brandTagline}>XƯỞNG IN PET CHUYÊN NGHIỆP</span>
              </div>
              <p className={classes.aboutText}>
                Hệ thống xưởng in PET Direct-to-Film tiêu chuẩn công nghiệp. Cung cấp giải pháp in ấn trọn gói cho Local Brands, Đồng phục doanh nghiệp, Sự kiện &amp; Sáng tạo cá nhân.
              </p>
              <div className={classes.contactDetails}>
                <div className={classes.contactRow}>
                  <span>📍</span>
                  <span>Trụ sở &amp; Xưởng sản xuất: Hà Nội &amp; TP. Hồ Chí Minh</span>
                </div>
                <div className={classes.contactRow}>
                  <span>📞</span>
                  <span>Hotline / Zalo: <strong>1900 8888</strong> (8:00 - 21:00)</span>
                </div>
                <div className={classes.contactRow}>
                  <span>✉️</span>
                  <span>Báo giá sỉ: <strong>contact@t-shop.vn</strong></span>
                </div>
              </div>
            </div>

            {/* Col 2: Sản phẩm in */}
            <div className={classes.col}>
              <h4 className={classes.colTitle}>Danh Mục Sản Phẩm</h4>
              <ul className={classes.linkList}>
                <li><Link href="/products?category=ao-thun">Áo Thun Phôi Trơn 250 GSM</Link></li>
                <li><Link href="/products?category=hoodie">Áo Hoodie Nỉ Bông 480 GSM</Link></li>
                <li><Link href="/products?category=oversized">Áo Thun Form Rộng Oversize</Link></li>
                <li><Link href="/products?category=tui-canvas">Túi Canvas Mộc 16oz</Link></li>
                <li><Link href="/products?category=ly-su">Ly Sứ Men Mờ In Chuyển Nhiệt</Link></li>
                <li><Link href="/products">Xem tất cả phôi in</Link></li>
              </ul>
            </div>

            {/* Col 3: Dịch vụ & Chính sách */}
            <div className={classes.col}>
              <h4 className={classes.colTitle}>Chính Sách &amp; Hỗ Trợ</h4>
              <ul className={classes.linkList}>
                <li><Link href="/track-order">Tra cứu tiến độ đơn hàng</Link></li>
                <li><Link href="/#calculator">Bảng tính giá sỉ &amp; chiết khấu</Link></li>
                <li><Link href="/#how-it-works">Tiêu chuẩn kỹ thuật file in (300 DPI)</Link></li>
                <li><Link href="/#how-it-works">Chính sách bảo hành 50 lần giặt</Link></li>
                <li><Link href="/terms">Chính sách đổi trả &amp; hoàn tiền</Link></li>
                <li><Link href="/privacy">Chính sách bảo mật thông tin</Link></li>
              </ul>
            </div>

            {/* Col 4: Cam kết thanh toán & Chứng nhận */}
            <div className={classes.col}>
              <h4 className={classes.colTitle}>Thanh Toán &amp; Bảo Mật</h4>
              <p className={classes.paymentSub}>
                Hệ thống thanh toán bảo mật đa kênh qua cổng Stripe quốc tế &amp; QR chuyển khoản trực tiếp.
              </p>

              <div className={classes.paymentBadges}>
                <span className={classes.payBadge}>STRIPE</span>
                <span className={classes.payBadge}>VISA</span>
                <span className={classes.payBadge}>MASTERCARD</span>
                <span className={classes.payBadge}>VIETQR</span>
              </div>

              <div className={classes.newsletterBox}>
                <span className={classes.newsletterTitle}>Nhận Mã Giảm Giá $5 Cho Đơn Đầu</span>
                <div className={classes.newsletterInputWrap}>
                  <input type="email" placeholder="Nhập email của bạn..." className={classes.newsletterInput} />
                  <button type="button" className={classes.newsletterBtn}>Đăng ký</button>
                </div>
              </div>
            </div>
          </div>
        </Gutter>
      </div>

      {/* Bottom Copyright */}
      <div className={classes.bottomBar}>
        <Gutter>
          <div className={classes.bottomWrap}>
            <p className={classes.copyText}>
              &copy; {new Date().getFullYear()} T-Shop. Bản quyền thuộc về Xưởng In PET DTF T-Shop. Toàn bộ hình ảnh &amp; bản quyền công nghệ được bảo hộ.
            </p>
            <div className={classes.legalLinks}>
              <Link href="/terms">Điều khoản sử dụng</Link>
              <span>&bull;</span>
              <Link href="/privacy">Chính sách quyền riêng tư</Link>
              <span>&bull;</span>
              <Link href="/sitemap.xml">Sitemap</Link>
            </div>
          </div>
        </Gutter>
      </div>
    </footer>
  )
}

export default FooterComponent
