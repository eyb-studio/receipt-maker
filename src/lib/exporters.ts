import html2canvas from "html2canvas-pro"
import { jsPDF } from "jspdf"

async function renderCanvas(node: HTMLElement): Promise<HTMLCanvasElement> {
  if (document.fonts && typeof document.fonts.ready?.then === "function") {
    await document.fonts.ready
  }
  const nodeWidth = node.offsetWidth
  const nodeHeight = node.offsetHeight
  return html2canvas(node, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    width: nodeWidth,
    height: nodeHeight,
    windowWidth: Math.max(nodeWidth, 1024),
    windowHeight: Math.max(nodeHeight, 768),
  })
}

export async function exportAsImage(node: HTMLElement, filename: string) {
  const canvas = await renderCanvas(node)
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png", 0.95)
  )
  triggerDownload(blob, `${filename}.png`)
}

export async function exportAsPdf(node: HTMLElement, filename: string) {
  const canvas = await renderCanvas(node)
  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const ratio = canvas.height / canvas.width
  const imgWidth = pageWidth - 48
  const imgHeight = imgWidth * ratio
  if (imgHeight <= pageHeight - 48) {
    pdf.addImage(imgData, "PNG", 24, 24, imgWidth, imgHeight)
  } else {
    const scaled = (pageHeight - 48) / ratio
    const x = (pageWidth - scaled) / 2
    pdf.addImage(imgData, "PNG", x, 24, scaled, pageHeight - 48)
  }
  pdf.save(`${filename}.pdf`)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
