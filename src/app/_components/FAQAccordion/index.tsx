import React from 'react'
import classes from './index.module.scss'

export type FAQItem = {
  q: string
  a: string
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    q: 'Thời gian sản xuất và giao hàng là bao lâu?',
    a: 'Đơn hàng POD thường được sản xuất hoàn thiện trong vòng 2-4 ngày làm việc và giao hàng từ 2-3 ngày sau đó tùy địa chỉ nhận.',
  },
  {
    q: 'Tôi nên upload hình ảnh định dạng và độ phân giải nào?',
    a: 'Nên upload ảnh định dạng PNG (nền trong suốt) hoặc JPG có độ phân giải cao (khuyến nghị 300 DPI) để hình in sắc nét nhất.',
  },
  {
    q: 'Chính sách bảo hành và đổi trả thế nào?',
    a: 'T-Shop cam kết 100% đổi mới hoặc hoàn tiền ngay lập tức nếu sản phẩm in bị lỗi kỹ thuật, lệch màu nghiêm trọng hoặc sai kích thước cam kết.',
  },
  {
    q: 'Tôi có thể in cả mặt trước và mặt sau không?',
    a: 'Có, các sản phẩm áo thun, hoodie và túi tote đều hỗ trợ tùy chỉnh và in độc lập cả mặt trước (Front) lẫn mặt sau (Back).',
  },
]

export const FAQAccordion: React.FC<{ items?: FAQItem[] }> = ({ items = DEFAULT_FAQS }) => {
  return (
    <div className={classes.faqContainer}>
      <h6 className={classes.title}>Câu hỏi thường gặp về Print-on-Demand</h6>
      <div className={classes.list}>
        {items.map((item, idx) => (
          <details key={idx} className={classes.item}>
            <summary className={classes.question}>
              <span>{item.q}</span>
              <span className={classes.arrow}>+</span>
            </summary>
            <div className={classes.answer}>
              <p>{item.a}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
