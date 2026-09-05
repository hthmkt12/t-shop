/**
 * Logic tính toán độ phân giải in thực tế (DPI / PPI) cho công nghệ in PET (DTF).
 *
 * Tiêu chuẩn in màng PET nhiệt:
 * - Vùng in tiêu chuẩn khổ ngực áo / túi: ~30cm chiều rộng (hoặc ~12 inches) tương đương 400px trên canvas preview.
 * - Khổ in vật lý giả định canvas width (400px) = 30cm (~11.81 inches).
 * - DPI thực tế = (Pixel width gốc của ảnh) / (Chiều rộng in vật lý bằng inch).
 * - Chiều rộng in vật lý = (Chiều rộng hiển thị trên canvas tính bằng px / Canvas px per inch).
 */

export const CANVAS_PHYSICAL_WIDTH_INCHES = 11.81 // ~30cm vùng ngực áo chuẩn
export const CANVAS_WIDTH_PX = 400

export type DpiQualityLevel = 'good' | 'warning' | 'poor'

export type DpiAssessment = {
  dpi: number
  quality: DpiQualityLevel
  message: string
  recommendation: string
}

/**
 * Tính DPI thực tế của ảnh đang đặt trên canvas Fabric.js.
 *
 * @param originalWidth Pixel width gốc của file ảnh upload
 * @param originalHeight Pixel height gốc của file ảnh upload
 * @param scaledWidthPx Chiều rộng của ảnh sau khi user scale trên canvas (pixel canvas)
 * @param canvasWidthPx Kích thước canvas (mặc định 400px)
 * @param physicalWidthInches Chiều rộng vật lý tương đương của vùng in (mặc định 11.81 inch ~ 30cm)
 */
export function calculatePrintDpi(
  originalWidth: number,
  originalHeight: number,
  scaledWidthPx: number,
  canvasWidthPx: number = CANVAS_WIDTH_PX,
  physicalWidthInches: number = CANVAS_PHYSICAL_WIDTH_INCHES,
): DpiAssessment {
  if (!originalWidth || !scaledWidthPx || scaledWidthPx <= 0) {
    return {
      dpi: 0,
      quality: 'poor',
      message: 'Không có dữ liệu ảnh',
      recommendation: 'Vui lòng upload ảnh để kiểm tra.',
    }
  }

  // Tỷ lệ inch trên mỗi pixel của canvas
  const inchesPerCanvasPx = physicalWidthInches / canvasWidthPx
  // Kích thước vật lý thực tế của ảnh khi in ra sản phẩm (inch)
  const printWidthInches = scaledWidthPx * inchesPerCanvasPx

  if (printWidthInches <= 0) {
    return {
      dpi: 0,
      quality: 'poor',
      message: 'Kích thước không hợp lệ',
      recommendation: 'Vui lòng chỉnh lại kích thước ảnh.',
    }
  }

  // DPI = Pixel thực tế / Kích thước in vật lý (inch)
  const dpi = Math.round(originalWidth / printWidthInches)

  if (dpi >= 300) {
    return {
      dpi,
      quality: 'good',
      message: 'Chất lượng in xuất sắc (≥300 DPI)',
      recommendation: 'Bản in màng PET sẽ cực kỳ sắc nét, giữ trọn chi tiết.',
    }
  }

  if (dpi >= 150) {
    return {
      dpi,
      quality: 'warning',
      message: `Chất lượng trung bình (${dpi} DPI)`,
      recommendation: 'Bản in chấp nhận được. Thu nhỏ kích thước ảnh trên canvas để nét hơn.',
    }
  }

  return {
    dpi,
    quality: 'poor',
    message: `Độ phân giải thấp (${dpi} DPI - Cảnh báo mờ)`,
    recommendation: 'Ảnh dễ vỡ hạt khi in nhiệt PET. Nên thu nhỏ ảnh hoặc tải file ảnh có độ phân giải cao hơn.',
  }
}
