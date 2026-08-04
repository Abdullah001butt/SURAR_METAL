import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9\-_. ]/gi, '-').replace(/\s+/g, '-')
}

async function buildPdfFromElement(element: HTMLElement): Promise<jsPDF> {
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  return pdf
}

export async function exportElementToPdf(element: HTMLElement, filename: string) {
  const pdf = await buildPdfFromElement(element)
  pdf.save(`${sanitizeFilename(filename)}.pdf`)
}

export async function elementToPdfBlob(element: HTMLElement): Promise<Blob> {
  const pdf = await buildPdfFromElement(element)
  return pdf.output('blob')
}

/** Renders each element as its own clean PDF page — no mid-content slicing, unlike exportElementToPdf. */
export async function exportElementsToPdf(elements: HTMLElement[], filename: string) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  for (let i = 0; i < elements.length; i++) {
    const canvas = await html2canvas(elements[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const imgHeight = (canvas.height * pageWidth) / canvas.width

    if (i > 0) pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, Math.min(imgHeight, pageHeight))
  }

  pdf.save(`${sanitizeFilename(filename)}.pdf`)
}
