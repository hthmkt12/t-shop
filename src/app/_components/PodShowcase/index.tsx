import React from 'react'
import classes from './index.module.scss'

const VALUE_PROPS = [
  {
    icon: '⚡',
    title: 'In Từ 1 Cái',
    desc: 'Không yêu cầu số lượng tối thiểu. Dù in 1 áo mẫu hay 10,000 áo đồng phục đều phục vụ tận tâm.',
  },
  {
    icon: '🚀',
    title: 'Giao Nhanh 24H - 48H',
    desc: 'Quy trình sản xuất khép kín. Hỗ trợ in hỏa tốc lấy ngay trong ngày tại nội thành.',
  },
  {
    icon: '🛡️',
    title: 'Bảo Hành 50+ Lần Giặt',
    desc: 'Mực in PET nhập khẩu Nhật Bản. Cam kết không bong tróc, nứt gãy hay phai màu.',
  },
  {
    icon: '🔄',
    title: 'Đổi Trả 100% Miễn Phí',
    desc: 'Lỗi in lệch, sai màu sắc hoặc rách vải được xưởng in mới lại 100% trong 7 ngày.',
  },
]

export const PodShowcase: React.FC = () => {
  return (
    <section className={classes.showcaseSection}>
      <div className={classes.container}>
        <div className={classes.grid}>
          {VALUE_PROPS.map((prop, idx) => (
            <div key={idx} className={classes.card}>
              <div className={classes.iconBox}>{prop.icon}</div>
              <div className={classes.textBox}>
                <h4 className={classes.cardTitle}>{prop.title}</h4>
                <p className={classes.cardDesc}>{prop.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
