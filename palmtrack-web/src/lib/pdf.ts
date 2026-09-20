import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import palmtrackLogo from '@/assets/palmtrack-logo.png'
import { rupiah } from '@/lib/format'

const GREEN: [number, number, number] = [31, 92, 67]
const GREEN_DARK: [number, number, number] = [22, 35, 28]
const GOLD: [number, number, number] = [201, 150, 46]
const CREAM: [number, number, number] = [250, 249, 245]
const MUTED: [number, number, number] = [107, 117, 104]
const BORDER: [number, number, number] = [227, 229, 222]
const RED: [number, number, number] = [193, 68, 58]

interface DocWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number }
}

const PAGE_WIDTH = 210
const MARGIN = 14
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

let cachedLogo: string | null = null

async function loadLogoDataUrl(): Promise<string | null> {
  if (cachedLogo) return cachedLogo
  try {
    const response = await fetch(palmtrackLogo)
    const blob = await response.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    cachedLogo = dataUrl
    return dataUrl
  } catch {
    return null
  }
}

function drawHeader(doc: jsPDF, logoDataUrl: string | null, kicker: string, title: string, meta: string) {
  doc.setFillColor(...GREEN)
  doc.rect(0, 0, PAGE_WIDTH, 34, 'F')
  doc.setFillColor(...GOLD)
  doc.rect(0, 34, PAGE_WIDTH, 1.4, 'F')

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', MARGIN, 8, 18, 18)
    } catch {
      // corrupt/unsupported image data — header still reads fine without it
    }
  }

  const textX = logoDataUrl ? MARGIN + 24 : MARGIN
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(17)
  doc.text('PalmTrack', textX, 17)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(224, 232, 226)
  doc.text('Manajemen Sawit Terpadu', textX, 23)

  doc.setTextColor(...GOLD)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(title, PAGE_WIDTH - MARGIN, 15, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(224, 232, 226)
  doc.text(kicker, PAGE_WIDTH - MARGIN, 21, { align: 'right' })
  doc.text(meta, PAGE_WIDTH - MARGIN, 26, { align: 'right' })
}

function drawFooter(doc: jsPDF, note: string) {
  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page)
    const y = 287
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.2)
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...MUTED)
    doc.text(note, MARGIN, y + 5)
    doc.text(`Halaman ${page} / ${pageCount}`, PAGE_WIDTH - MARGIN, y + 5, { align: 'right' })
  }
}

function fieldRow(doc: jsPDF, x: number, y: number, label: string, value: string) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...MUTED)
  doc.text(label, x, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(...GREEN_DARK)
  doc.text(value, x, y + 5)
}

export interface NotaTimbangData {
  nomorNota: string
  tanggal: string
  waktu: string
  petani: string
  telepon: string
  plat: string
  peron: string
  bruto: number
  tara: number
  netto: number
  harga: number
  total: number
  status: string
}

export async function generateNotaTimbangPdf(data: NotaTimbangData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const logo = await loadLogoDataUrl()

  drawHeader(doc, logo, `No. ${data.nomorNota}`, 'NOTA TIMBANG', `${data.tanggal} · ${data.waktu}`)

  let y = 48
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GREEN)
  doc.text('INFORMASI PETANI', MARGIN, y)
  doc.text('INFORMASI TRANSAKSI', MARGIN + 95, y)
  doc.setDrawColor(...BORDER)
  doc.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2)

  y += 10
  fieldRow(doc, MARGIN, y, 'Nama Petani', data.petani)
  fieldRow(doc, MARGIN + 95, y, 'Peron', data.peron)
  y += 14
  fieldRow(doc, MARGIN, y, 'Nomor Telepon', data.telepon)
  fieldRow(doc, MARGIN + 95, y, 'Plat Kendaraan', data.plat)

  y += 16
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Uraian Timbangan', 'Nilai']],
    body: [
      ['Berat Bruto', `${data.bruto.toLocaleString('id-ID')} kg`],
      ['Berat Tara', `${data.tara.toLocaleString('id-ID')} kg`],
      ['Berat Netto', `${data.netto.toLocaleString('id-ID')} kg`],
      ['Harga per kg', rupiah(data.harga)],
    ],
    foot: [['TOTAL BAYAR', rupiah(data.total)]],
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: { top: 3, bottom: 3, left: 2, right: 2 } },
    headStyles: { fillColor: [241, 242, 237], textColor: GREEN_DARK, fontStyle: 'bold' },
    footStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 11 },
    columnStyles: { 1: { halign: 'right' } },
    tableLineColor: BORDER,
    tableLineWidth: 0.1,
  })

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 10

  const isLunas = data.status.toLowerCase() === 'lunas'
  const badgeColor = isLunas ? GREEN : ([201, 138, 46] as [number, number, number])
  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2])
  doc.setDrawColor(badgeColor[0], badgeColor[1], badgeColor[2])
  const badgeText = `Status Pembayaran: ${data.status.toUpperCase()}`
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  const badgeWidth = doc.getTextWidth(badgeText) + 10
  doc.roundedRect(MARGIN, y, badgeWidth, 8, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text(badgeText, MARGIN + 5, y + 5.5)

  y += 16
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('Nota ini adalah bukti sah transaksi timbang TBS di peron PalmTrack. Simpan sebagai referensi pembayaran.', MARGIN, y)

  y += 28
  const sigWidth = 60
  doc.setDrawColor(...MUTED)
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y, MARGIN + sigWidth, y)
  doc.line(PAGE_WIDTH - MARGIN - sigWidth, y, PAGE_WIDTH - MARGIN, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GREEN_DARK)
  doc.text('Petani / Pengirim', MARGIN + sigWidth / 2, y + 5, { align: 'center' })
  doc.text('Petugas Peron', PAGE_WIDTH - MARGIN - sigWidth / 2, y + 5, { align: 'center' })

  drawFooter(doc, `Dicetak otomatis oleh PalmTrack · ${new Date().toLocaleString('id-ID')}`)
  doc.save(`Nota-Timbang-${data.nomorNota}.pdf`)
}

export interface LaporanTransaksiRow {
  tanggal: string
  jenis: string
  kategori: string
  keterangan: string
  jumlah: number
}

export interface LaporanPdfData {
  judul: string
  periode: string
  totalPemasukan: number
  totalPengeluaran: number
  transaksi: LaporanTransaksiRow[]
}

export async function generateLaporanPdf(data: LaporanPdfData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const logo = await loadLogoDataUrl()

  drawHeader(doc, logo, 'Ringkasan Keuangan & Produksi', data.judul.toUpperCase(), `Periode: ${data.periode}`)

  const saldoBersih = data.totalPemasukan - data.totalPengeluaran
  const cards: Array<{ label: string; value: string; color: [number, number, number] }> = [
    { label: 'Total Pemasukan', value: rupiah(data.totalPemasukan), color: GREEN },
    { label: 'Total Pengeluaran', value: rupiah(data.totalPengeluaran), color: RED },
    { label: 'Laba Bersih', value: rupiah(saldoBersih), color: GOLD },
  ]
  const cardWidth = (CONTENT_WIDTH - 8 * 2) / 3
  let cardX = MARGIN
  const cardY = 46
  for (const card of cards) {
    doc.setFillColor(...CREAM)
    doc.setDrawColor(...BORDER)
    doc.roundedRect(cardX, cardY, cardWidth, 22, 2, 2, 'FD')
    doc.setFillColor(card.color[0], card.color[1], card.color[2])
    doc.roundedRect(cardX, cardY, cardWidth, 1.6, 0, 0, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(card.label, cardX + 4, cardY + 9)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11.5)
    doc.setTextColor(...GREEN_DARK)
    doc.text(card.value, cardX + 4, cardY + 17)
    cardX += cardWidth + 8
  }

  autoTable(doc, {
    startY: cardY + 30,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Jumlah']],
    body: data.transaksi.map((row) => [
      row.tanggal,
      row.jenis,
      row.kategori,
      row.keterangan,
      `${row.jumlah < 0 ? '-' : '+'}${rupiah(row.jumlah)}`,
    ]),
    theme: 'striped',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [246, 247, 243] },
    columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } },
    didParseCell: (hook) => {
      if (hook.section === 'body' && hook.column.index === 4) {
        const raw = data.transaksi[hook.row.index]?.jumlah ?? 0
        hook.cell.styles.textColor = raw < 0 ? RED : GREEN
      }
    },
  })

  drawFooter(doc, `Dicetak otomatis oleh PalmTrack · ${new Date().toLocaleString('id-ID')}`)
  doc.save(`${data.judul.replace(/\s+/g, '-')}-${data.periode.replace(/\s+/g, '-')}.pdf`)
}
