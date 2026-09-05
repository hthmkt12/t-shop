import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import classes from './index.module.scss'

export const FashionPodHero: React.FC = () => {
  return (
    <section className={classes.hero}>
      <div className={classes.container}>
        <div className={classes.grid}>
          {/* Left: Value-driven Commercial Copy */}
          <div className={classes.content}>
            <div className={classes.badge}>
              <span className={classes.badgeDot} />
              <span>XƯỞNG IN PET DIRECT-TO-FILM TRỰC TIẾP &bull; NHẬN TỪ 1 ÁO</span>
            </div>

            <h1 className={classes.title}>
              In Áo & Đồng Phục Theo Yêu Cầu <br />
              <span className={classes.highlightText}>Chuẩn Xưởng &bull; Lấy Nhanh 24H</span>
            </h1>

            <p className={classes.subHeadline}>
              Công nghệ in PET DTF Nhật Bản cao cấp. Màu sắc siêu nét 300+ DPI, không bong tróc, cam kết bảo hành độ bền 50+ lần giặt. Tự do tải hình hoặc thiết kế trực tiếp trên trình duyệt.
            </p>

            <div className={classes.ctaRow}>
              <Link href="/products" className={classes.primaryBtn}>
                ⚡ Bắt đầu thiết kế ngay
              </Link>
              <a href="#bulk-calculator" className={classes.secondaryBtn}>
                📊 Bảng giá sỉ & chiết khấu
              </a>
            </div>

            {/* Trust Strip */}
            <div className={classes.trustRow}>
              <div className={classes.trustItem}>
                <span className={classes.trustIcon}>⭐</span>
                <div>
                  <strong>4.9 / 5.0</strong>
                  <span>(1,200+ đánh giá)</span>
                </div>
              </div>
              <div className={classes.trustDivider} />
              <div className={classes.trustItem}>
                <span className={classes.trustIcon}>🛡️</span>
                <div>
                  <strong>Đổi trả 100%</strong>
                  <span>Nếu lỗi in ấn</span>
                </div>
              </div>
              <div className={classes.trustDivider} />
              <div className={classes.trustItem}>
                <span className={classes.trustIcon}>🚀</span>
                <div>
                  <strong>Giao 24h-48h</strong>
                  <span>Toàn quốc</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Visual POD Mockup & Trust Card */}
          <div className={classes.visualCol}>
            <div className={classes.mockupFrame}>
              <Image
                src="/admin ui/hero/hero-1.png"
                alt="POD Heavyweight Blank & Custom Print"
                width={560}
                height={560}
                className={classes.mockupImg}
                priority
              />

              {/* Floating Guarantee Chip */}
              <div className={classes.floatingChipTop}>
                <span className={classes.chipIcon}>🔥</span>
                <div>
                  <strong>Mực In PET Siêu Mịn</strong>
                  <span>Không nứt gãy co giãn 4 chiều</span>
                </div>
              </div>

              {/* Floating Price Chip */}
              <div className={classes.floatingChipBottom}>
                <span className={classes.chipIcon}>🏷️</span>
                <div>
                  <strong>Chỉ từ $14.50 / áo</strong>
                  <span>Đặt theo nhóm / công ty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
