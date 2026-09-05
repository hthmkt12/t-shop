import { calculatePrintDpi } from '../../app/_components/PodCustomizer/dpi-calculator'

function runTests() {
  console.log('🧪 Testing Print DPI Calculator for PET Transfer...\n')

  // Test 1: Ảnh 4K (3840px) hiển thị 240px trên canvas (chiếm 60% vùng in)
  const test1 = calculatePrintDpi(3840, 2160, 240)
  console.log('Test 1 (High-res 4K image):', test1)
  if (test1.quality !== 'good' || test1.dpi < 300) {
    throw new Error(`Test 1 Failed: Expected good quality (>=300 DPI), got ${test1.dpi}`)
  }

  // Test 2: Ảnh 1200px hiển thị 240px trên canvas -> in ~7.08 inches -> ~169 DPI
  const test2 = calculatePrintDpi(1200, 1200, 240)
  console.log('Test 2 (Medium 1200px image):', test2)
  if (test2.quality !== 'warning' || test2.dpi < 150 || test2.dpi >= 300) {
    throw new Error(`Test 2 Failed: Expected warning (150-299 DPI), got ${test2.dpi}`)
  }

  // Test 3: Ảnh chụp màn hình / icon nhỏ (300px) scale to 240px trên canvas -> ~42 DPI
  const test3 = calculatePrintDpi(300, 300, 240)
  console.log('Test 3 (Low-res 300px image):', test3)
  if (test3.quality !== 'poor' || test3.dpi >= 150) {
    throw new Error(`Test 3 Failed: Expected poor (<150 DPI), got ${test3.dpi}`)
  }

  // Test 4: Ảnh 1200px nhưng thu nhỏ lại trên canvas còn 80px -> DPI tăng lên
  const test4 = calculatePrintDpi(1200, 1200, 80)
  console.log('Test 4 (Medium image scaled down):', test4)
  if (test4.quality !== 'good' || test4.dpi < 300) {
    throw new Error(`Test 4 Failed: Expected good when scaled down, got ${test4.dpi}`)
  }

  console.log('\n✅ All DPI Calculator tests passed!')
}

runTests()
