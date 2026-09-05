# Phân Tích UI/UX RushOrderTees & Khả Năng Thích Ứng Cho In PET (DTF) Trên t-shop

**Ngày lập:** 2026-09-05  
**Nguồn tham chiếu:** https://www.rushordertees.com/  
**Dự án ứng dụng:** t-shop (Next.js 13.5 App Router, Payload CMS, MongoDB, Fabric.js, Stripe)  
**Công nghệ in lõi:** In PET chuyển nhiệt (Direct-to-Film / DTF) trên đa dạng phôi/vật liệu.

---

## 1. Bản Chất UI/UX RushOrderTees

RushOrderTees tối ưu hóa cho mô hình B2B/B2C đặt in theo nhóm, sự kiện với 4 trụ cột chính:

1. **Cam kết tốc độ & Tối ưu chuyển đổi:**
   - Định vị thời gian giao hàng tức thì: "Rush Shipping", "Free 2-day delivery", "Delivery Date Guarantee".
   - Báo giá ngay (Instant Quote Calculator): Giá cập nhật tự động dựa trên số lượng (Tiered / Bulk volume pricing) và số vị trí in (ngực, lưng, tay áo).

2. **Design Studio Trực Quan (Interactive Customizer):**
   - Hỗ trợ đổi góc nhìn sản phẩm (Front, Back, Left Sleeve, Right Sleeve).
   - Tích hợp công cụ upload ảnh, tự động kiểm tra DPI/độ nét file in.
   - Text editing trực tiếp, đổi màu sắc áo đồng bộ canvas ngay tức thì.
   - Trợ lý AI Design Wizard sinh ý tưởng graphic print-ready nhanh.

3. **Cơ chế Báo giá & Giỏ hàng đa quy mô (Matrix Order Builder):**
   - Bảng ma trận chọn size/màu (Quantity grid: S: 5, M: 10, L: 15...) gom chung 1 design thay vì thêm từng cái vào giỏ hàng.
   - Không giới hạn số lượng tối thiểu (No minimums).

---

## 2. Đặc Thù Công Nghệ In PET (DTF) Tác Động Lên UI/UX

So với Screen Printing (in lụa truyền thống) của RushOrderTees:
- **Số màu in:** In lụa tính giá theo số lượng màu (1 color, 2 colors...). In PET in hệ màu CMYK+White kỹ thuật số, **không giới hạn số lượng màu**, in được dải chuyển màu (gradient) và ảnh chụp sắc nét.  
  -> *UI/UX Impact:* Loại bỏ bộ chọn "Number of ink colors" gây bối rối. Giá chỉ phụ thuộc: **Kích thước bản in PET** (Khổ A4, A3, Logo ngực 10x10cm...) + **Số vị trí in** + **Chất liệu phôi**.
- **Đa dạng vật liệu:** PET in tốt trên Cotton, Polyester, Canvas, Túi tote, Nón, Da, Gỗ/Kim loại phủ nhiệt.  
  -> *UI/UX Impact:* Cần hiển thị catalog chia theo chất liệu và cho phép chọn vùng in chuẩn xác theo từng loại vật liệu.
- **Yêu cầu file in PET:** Cần ảnh nền trong suốt (transparent PNG/SVG/vector), DPI tối thiểu 300DPI để màng PET không bị răng cưa.  
  -> *UI/UX Impact:* Studio phải có bộ warning cảnh báo độ phân giải (Low DPI warning) và công cụ One-click Background Removal.

---

## 3. Challenge Framework (5 Câu Hỏi Cốt Lõi)

| # | Câu hỏi Challenge | RushOrderTees | t-shop (In PET) | Rủi ro nếu áp dụng sai |
|---|---|---|---|---|
| 1 | **Tính giá theo màu in hay diện tích?** | Tính giá theo số lượng màu mực (do in lụa). | Tính giá theo kích thước tem PET (Khổ A4/A3/Logo) và số vị trí in. | Khách hàng hoang mang nếu bắt đếm số màu của file ảnh gradient/full-color. |
| 2 | **Cơ chế đặt hàng đơn chiếc hay ma trận size?** | Ma trận size số lượng lớn (Bulk Size Matrix: S/M/L/XL). | Hybrid: Mua lẻ 1 chiếc hoặc nhập bảng size sỉ chiết khấu bậc thang. | UX cồng kềnh nếu ép khách mua 1 áo phải điền form ma trận. |
| 3 | **Xử lý chất lượng artwork đầu vào?** | Đội ngũ art review thủ công nếu đơn > 15 chiếc. | Kiểm tra kích thước pixel & cảnh báo DPI tự động trên Fabric canvas. | Hàng in ra mờ nhòe, khách khiếu nại chất lượng in PET. |
| 4 | **Đa góc nhìn sản phẩm (Multi-placement)?** | Front, Back, Sleeves riêng biệt. | Front, Back, Custom zone tùy vật liệu (Túi, Nón, Bình giữ nhiệt). | Khách muốn in cả ngực và lưng áo nhưng UI chỉ cho phép in 1 mặt. |
| 5 | **Cam kết ngày giao hàng (Delivery Promise)?** | Bộ đếm ngược ngày giao hàng (Guaranteed delivery date). | Tích hợp tính ngày hoàn thiện in PET + đơn vị vận chuyển. | Hủy đơn hàng do khách mua tặng/sự kiện nhưng không rõ ngày nhận. |

---

## 4. Decision Matrix

| Hạng mục | Cơ chế RushOrderTees | Đề xuất t-shop cho In PET | Quyết định |
|---|---|---|---|
| **Pricing Engine** | Quantity x Color Count | Quantity Tier x Print Size Area (Logo/A4/A3) | **Thay đổi cho chuẩn In PET** |
| **Canvas Studio** | Custom Canvas Engine | Fabric.js đã có trong t-shop (Mở rộng Multi-side & Zone) | **Tận dụng Fabric.js hiện có** |
| **Artwork Quality Gate** | Server check & Art team proof | Client-side DPI Checker + Warning Badge | **Client-side tự động** |
| **Size & Quantity Selection** | Grid table (Size x Color) | Accordion Toggle: Mua lẻ (Single) hoặc Bảng sỉ (Bulk Matrix) | **Hybrid UX** |
| **Trust Signals** | Guaranteed delivery date + BBB badge | Delivery Date Estimator + Cam kết độ bền giặt tem PET | **Áp dụng triệt để** |
