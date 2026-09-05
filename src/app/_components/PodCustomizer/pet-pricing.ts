/**
 * PET (DTF) Print Pricing Rules
 *
 * Khổ in màng PET nhiệt:
 * - chest_pocket (Logo ngực 10x10cm): Tiêu chuẩn kèm theo áo (+$0.00)
 * - a4 (Khổ A4 21x29.7cm): +$3.00 (300 cents)
 * - a3 (Khổ A3 29.7x42cm): +$6.00 (600 cents)
 *
 * Phụ phí in 2 mặt (Sides):
 * - Nếu in cả 2 mặt (hasFront && hasBack): Phụ phí in mặt thứ hai = +$4.00 (400 cents)
 */

export type PetPrintSize = 'chest_pocket' | 'a4' | 'a3'

export interface PetPrintConfig {
  printSize: PetPrintSize
  printSide: 'front' | 'back' | 'both'
}

export const PET_PRINT_SIZE_SURCHARGES: Record<PetPrintSize, { label: string; surchargeCents: number; desc: string }> = {
  chest_pocket: {
    label: 'Logo Ngực (10x10cm)',
    surchargeCents: 0,
    desc: 'Khổ tiêu chuẩn, phù hợp logo/ngực áo',
  },
  a4: {
    label: 'Khổ A4 (21x30cm)',
    surchargeCents: 300,
    desc: 'Khổ in vừa vặn trước/sau áo (+3.00$)',
  },
  a3: {
    label: 'Khổ A3 (30x42cm)',
    surchargeCents: 600,
    desc: 'Khổ in lớn tràn ngực/lưng áo (+6.00$)',
  },
}

export const SECOND_SIDE_SURCHARGE_CENTS = 400 // +$4.00 khi in cả 2 mặt

/**
 * Tính tổng phụ phí in PET tính bằng Cents
 */
export function calculatePetSurcharge(
  printSize: PetPrintSize = 'chest_pocket',
  hasFront: boolean = false,
  hasBack: boolean = false,
): number {
  const sizeFee = PET_PRINT_SIZE_SURCHARGES[printSize]?.surchargeCents || 0
  const isBothSides = hasFront && hasBack
  const sideFee = isBothSides ? SECOND_SIDE_SURCHARGE_CENTS : 0
  return sizeFee + sideFee
}
