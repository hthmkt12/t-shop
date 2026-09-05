import React from 'react'
import classes from './index.module.scss'

const REVIEWS = [
  {
    name: 'Nguyễn Tuấn Anh',
    role: 'Founder, Urban Streetwear Brand',
    stars: 5,
    date: '3 ngày trước',
    comment: 'Chất lượng in PET DTF ở đây đỉnh thật sự! Hình in mịn, không dày cộm như in decal cao su và test giặt máy 5 lần vẫn y nguyên không nứt. Sẽ đặt tiếp 300 áo cho BST mới.',
    productName: 'Heavyweight Cotton Hoodie 480 GSM',
    verified: true,
  },
  {
    name: 'Trần Minh Thư',
    role: 'Trưởng ban đối ngoại, Tech Club HCM',
    stars: 5,
    date: '1 tuần trước',
    comment: 'Cần áo gấp cho sự kiện hackathon, xưởng hỗ trợ in hỏa tốc và giao trong 24h đúng hẹn. Màu logo gradient lên cực chuẩn, vải áo dày dặn form đẹp.',
    productName: 'Classic Fit Cotton T-Shirt 250 GSM',
    verified: true,
  },
  {
    name: 'Hoàng Long',
    role: 'Quản lý, Chuỗi Cafe & Roastery',
    stars: 5,
    date: '2 tuần trước',
    comment: 'Bảng tính giá sỉ rõ ràng, chiết khấu tốt cho đơn đồng phục nhân viên. Đóng gói cẩn thận từng áo có kèm hướng dẫn bảo quản giặt ủi rất chuyên nghiệp.',
    productName: 'Premium Oversized Tee 320 GSM',
    verified: true,
  },
]

export const CustomerReviews: React.FC = () => {
  return (
    <section className={classes.reviewsSection}>
      <div className={classes.container}>
        <div className={classes.header}>
          <div className={classes.eyebrow}>ĐÁNH GIÁ THỰC TẾ TỪ KHÁCH HÀNG &bull; 1,200+ ĐƠN ĐÃ IN</div>
          <h2 className={classes.title}>Khách Hàng Nói Gì Về T-Shop?</h2>
          <p className={classes.sub}>
            Sự tin tưởng của hơn 500+ thương hiệu thời trang, doanh nghiệp và cộng đồng trên khắp cả nước.
          </p>
        </div>

        <div className={classes.grid}>
          {REVIEWS.map((rev, idx) => (
            <div key={idx} className={classes.reviewCard}>
              <div className={classes.topRow}>
                <div className={classes.stars}>
                  {'★'.repeat(rev.stars)}
                </div>
                <span className={classes.date}>{rev.date}</span>
              </div>

              <p className={classes.comment}>"{rev.comment}"</p>

              <div className={classes.metaBlock}>
                <div className={classes.productTag}>
                  <span>Đã in: </span>
                  <strong>{rev.productName}</strong>
                </div>

                <div className={classes.authorRow}>
                  <div className={classes.avatarCircle}>
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <strong className={classes.authorName}>{rev.name}</strong>
                    <span className={classes.authorRole}>{rev.role}</span>
                  </div>
                  {rev.verified && (
                    <span className={classes.verifiedBadge} title="Đã mua & in tại xưởng">
                      ✓ Đã xác thực
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
