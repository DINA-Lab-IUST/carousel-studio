import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import JSZip from 'jszip'

export interface ExportImage {
  name: string
  dataUrl: string
}

/** Rasterize a slide node at its exact pixel size. */
export async function captureSlide(node: HTMLElement, width: number, height: number): Promise<string> {
  await document.fonts?.ready
  return toPng(node, {
    width,
    height,
    pixelRatio: 1,
    cacheBust: true,
    backgroundColor: undefined,
  })
}

export async function buildPdf(images: ExportImage[], width: number, height: number): Promise<Blob> {
  const landscape = width > height
  const orientation = landscape ? 'landscape' : 'portrait'
  const pdf = new jsPDF({ orientation, unit: 'px', format: [width, height], compress: true })

  images.forEach((image, index) => {
    if (index > 0) pdf.addPage([width, height], orientation)
    pdf.addImage(image.dataUrl, 'PNG', 0, 0, width, height)
  })

  return pdf.output('blob')
}

export async function buildZip(images: ExportImage[]): Promise<Blob> {
  const zip = new JSZip()
  images.forEach((image) => {
    zip.file(image.name, image.dataUrl.split(',')[1] ?? '', { base64: true })
  })
  return zip.generateAsync({ type: 'blob' })
}
