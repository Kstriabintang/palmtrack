import { GState, jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import palmtrackLogo from '@/assets/palmtrack-logo.png'
import { getBusinessProfile } from '@/lib/business'
import { isDemoMode } from '@/lib/dummy-mode'
import { rupiah } from '@/lib/format'

const GREEN: [number, number, number] = [31, 92, 67]
const GREEN_DARK: [number, number, number] = [22, 35, 28]
const GOLD: [number, number, number] = [201, 150, 46]
const CREAM: [number, number, number] = [250, 249, 245]
const INFO_BG: [number, number, number] = [241, 242, 237]
const MUTED: [number, number, number] = [107, 117, 104]
const BORDER: [number, number, number] = [227, 229, 222]
const RED: [number, number, number] = [193, 68, 58]

interface DocWithAutoTable extends jsPDF {
  lastAutoTable: { finalY: number }
}

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN = 14
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const FOOTER_Y = 284
const OVERFLOW_LIMIT = 281
const FRAME_TOP = 46

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

function businessName(): string {
  if (isDemoMode()) return 'PalmTrack Demo — Portofolio'
  return getBusinessProfile()?.namaUsaha ?? 'Usaha Sawit'
}

function documentNumber(prefix: string): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${y}${m}${d}-${rand}`
}

function drawWatermark(doc: jsPDF, logoDataUrl: string | null) {
  if (!logoDataUrl) return
  const pageCount = doc.getNumberOfPages()
  const size = 130
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page)
    doc.saveGraphicsState()
    doc.setGState(new GState({ opacity: 0.045 }))
    doc.addImage(logoDataUrl, 'PNG', (PAGE_WIDTH - size) / 2, (PAGE_HEIGHT - size) / 2, size, size)
    doc.restoreGraphicsState()
  }
}

function drawFrame(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page)
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.3)
    doc.rect(8, FRAME_TOP, PAGE_WIDTH - 16, FOOTER_Y - FRAME_TOP - 4)
  }
}

function drawHeader(
  doc: jsPDF,
  logoDataUrl: string | null,
  kicker: string,
  title: string,
  meta: string,
  docNumber: string,
) {
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

  doc.setFillColor(...INFO_BG)
  doc.rect(0, 35.4, PAGE_WIDTH, 8.6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GREEN_DARK)
  doc.text(`Untuk: ${businessName()}`, MARGIN, 41)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...MUTED)
  doc.text(`No. Dokumen: ${docNumber}`, PAGE_WIDTH - MARGIN, 41, { align: 'right' })
}

function drawFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  const printedAt = new Date().toLocaleString('id-ID')
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page)
    doc.setDrawColor(...BORDER)
    doc.setLineWidth(0.2)
    doc.line(MARGIN, FOOTER_Y, PAGE_WIDTH - MARGIN, FOOTER_Y)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7)
    doc.setTextColor(...MUTED)
    doc.text('Dokumen dihasilkan otomatis oleh sistem PalmTrack dan bersifat rahasia untuk internal usaha.', MARGIN, FOOTER_Y + 4.5)
    doc.setFont('helvetica', 'normal')
    doc.text(`Dicetak ${printedAt}`, MARGIN, FOOTER_Y + 9)
    doc.text(`Halaman ${page} / ${pageCount}`, PAGE_WIDTH - MARGIN, FOOTER_Y + 9, { align: 'right' })
  }
}

function sectionTitle(doc: jsPDF, x: number, y: number, title: string) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...GREEN)
  doc.text(title.toUpperCase(), x, y)
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.6)
  const textWidth = doc.getTextWidth(title.toUpperCase())
  doc.line(x, y + 1.5, x + textWidth, y + 1.5)
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

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed <= OVERFLOW_LIMIT) return y
  doc.addPage()
  return 50
}

function drawSignatureBlock(doc: jsPDF, y: number, leftLabel: string, rightLabel: string) {
  const sigWidth = 60
  doc.setDrawColor(...MUTED)
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y, MARGIN + sigWidth, y)
  doc.line(PAGE_WIDTH - MARGIN - sigWidth, y, PAGE_WIDTH - MARGIN, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GREEN_DARK)
  doc.text(leftLabel, MARGIN + sigWidth / 2, y + 5, { align: 'center' })
  doc.text(rightLabel, PAGE_WIDTH - MARGIN - sigWidth / 2, y + 5, { align: 'center' })
}

/** Single signatory block for reports — this app has one owner-user, not a preparer/approver pair. */
function drawOwnerSignature(doc: jsPDF, y: number, namaUsaha: string) {
  const sigWidth = 65
  const x = PAGE_WIDTH - MARGIN - sigWidth

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...MUTED)
  const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(tanggal, x + sigWidth, y, { align: 'right' })

  doc.setDrawColor(...MUTED)
  doc.setLineWidth(0.2)
  doc.line(x, y + 14, x + sigWidth, y + 14)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GREEN_DARK)
  doc.text('Pemilik Usaha', x + sigWidth / 2, y + 18.5, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...MUTED)
  doc.text(namaUsaha, x + sigWidth / 2, y + 22.5, { align: 'center' })
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

  drawHeader(doc, logo, 'Bukti Transaksi Timbang TBS', 'NOTA TIMBANG', `${data.tanggal} · ${data.waktu}`, data.nomorNota)

  let y = 54
  sectionTitle(doc, MARGIN, y, 'Informasi Petani')
  sectionTitle(doc, MARGIN + 95, y, 'Informasi Transaksi')

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
    headStyles: { fillColor: INFO_BG, textColor: GREEN_DARK, fontStyle: 'bold' },
    footStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 11 },
    columnStyles: { 1: { halign: 'right' } },
    tableLineColor: BORDER,
    tableLineWidth: 0.1,
  })

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 10

  const isLunas = data.status.toLowerCase() === 'lunas'
  // Matches the app's status-badge.tsx convention: a light tint of the
  // status color as fill, with the solid color as text — not a solid chip.
  const badgeTint: [number, number, number] = isLunas ? [234, 239, 236] : [254, 240, 232]
  const badgeText_: [number, number, number] = isLunas ? GREEN : [217, 119, 6]
  const badgeText = `Status Pembayaran: ${data.status.toUpperCase()}`
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  const badgeWidth = doc.getTextWidth(badgeText) + 10
  doc.setFillColor(...badgeTint)
  doc.roundedRect(MARGIN, y, badgeWidth, 8, 2, 2, 'F')
  doc.setTextColor(...badgeText_)
  doc.text(badgeText, MARGIN + 5, y + 5.5)

  y += 16
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('Nota ini adalah bukti sah transaksi timbang TBS di peron PalmTrack. Simpan sebagai referensi pembayaran.', MARGIN, y)

  y += 30
  drawSignatureBlock(doc, y, 'Petani / Pengirim', 'Petugas Peron')

  drawFrame(doc)
  drawWatermark(doc, logo)
  drawFooter(doc)
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

  const prefix = data.judul
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
  const docNumber = documentNumber(prefix || 'LAP')

  drawHeader(doc, logo, 'Ringkasan Keuangan & Produksi', data.judul.toUpperCase(), `Periode: ${data.periode}`, docNumber)

  const saldoBersih = data.totalPemasukan - data.totalPengeluaran
  const marginPct = data.totalPemasukan > 0 ? (saldoBersih / data.totalPemasukan) * 100 : 0

  const cards: Array<{ label: string; value: string; color: [number, number, number] }> = [
    { label: 'Total Pemasukan', value: rupiah(data.totalPemasukan), color: GREEN },
    { label: 'Total Pengeluaran', value: rupiah(data.totalPengeluaran), color: RED },
    { label: 'Laba Bersih', value: rupiah(saldoBersih), color: GOLD },
    { label: 'Margin Laba', value: `${marginPct.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`, color: saldoBersih >= 0 ? GREEN : RED },
  ]
  const cardGap = 6
  const cardWidth = (CONTENT_WIDTH - cardGap * 3) / 4
  let cardX = MARGIN
  const cardY = 50
  for (const card of cards) {
    doc.setFillColor(...CREAM)
    doc.setDrawColor(...BORDER)
    doc.roundedRect(cardX, cardY, cardWidth, 24, 2, 2, 'FD')
    doc.setFillColor(card.color[0], card.color[1], card.color[2])
    doc.roundedRect(cardX, cardY, cardWidth, 1.6, 0, 0, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...MUTED)
    doc.text(card.label, cardX + 4, cardY + 10)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...GREEN_DARK)
    doc.text(card.value, cardX + 4, cardY + 18)
    cardX += cardWidth + cardGap
  }

  let y = cardY + 24 + 10
  sectionTitle(doc, MARGIN, y, 'Rincian Transaksi')
  y += 4

  const totalJumlah = data.transaksi.reduce((sum, row) => sum + row.jumlah, 0)
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Jumlah']],
    body: data.transaksi.map((row) => [
      row.tanggal,
      row.jenis,
      row.kategori,
      row.keterangan,
      `${row.jumlah < 0 ? '-' : '+'}${rupiah(row.jumlah)}`,
    ]),
    foot: [['', '', '', 'SELISIH BERSIH', `${totalJumlah < 0 ? '-' : '+'}${rupiah(totalJumlah)}`]],
    theme: 'striped',
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.6 },
    headStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [246, 247, 243] },
    columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } },
    footStyles: { fillColor: GREEN_DARK, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'right' },
    didParseCell: (hook) => {
      if (hook.section === 'body' && hook.column.index === 4) {
        const raw = data.transaksi[hook.row.index]?.jumlah ?? 0
        hook.cell.styles.textColor = raw < 0 ? RED : GREEN
      }
    },
  })

  y = (doc as DocWithAutoTable).lastAutoTable.finalY + 12

  const kategoriTotals = data.transaksi
    .filter((row) => row.jumlah < 0)
    .reduce<Record<string, number>>((acc, row) => {
      acc[row.kategori] = (acc[row.kategori] ?? 0) + Math.abs(row.jumlah)
      return acc
    }, {})
  const kategoriEntries = Object.entries(kategoriTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const maxKategori = Math.max(...kategoriEntries.map(([, nilai]) => nilai), 1)

  if (kategoriEntries.length > 0) {
    y = ensureSpace(doc, y, 14 + kategoriEntries.length * 8)
    sectionTitle(doc, MARGIN, y, 'Pengeluaran per Kategori')
    y += 8
    const barX = MARGIN + 62
    const barMaxWidth = CONTENT_WIDTH - 62 - 34
    for (const [kategori, nilai] of kategoriEntries) {
      const pct = data.totalPengeluaran > 0 ? (nilai / data.totalPengeluaran) * 100 : 0
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...GREEN_DARK)
      doc.text(kategori, MARGIN, y + 3.5, { maxWidth: 58 })
      doc.setFillColor(...INFO_BG)
      doc.roundedRect(barX, y, barMaxWidth, 4, 1, 1, 'F')
      doc.setFillColor(...GOLD)
      doc.roundedRect(barX, y, Math.max(2, (nilai / maxKategori) * barMaxWidth), 4, 1, 1, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...MUTED)
      doc.text(`${rupiah(nilai)} (${pct.toLocaleString('id-ID', { maximumFractionDigits: 0 })}%)`, PAGE_WIDTH - MARGIN, y + 3.5, { align: 'right' })
      y += 8
    }
    y += 6
  }

  const insights: Array<{ text: string; color: [number, number, number] }> = [
    { text: `• ${data.transaksi.length} transaksi tercatat pada periode ini.`, color: GREEN_DARK },
  ]
  if (kategoriEntries.length > 0) {
    const [topKategori, topNilai] = kategoriEntries[0]
    const topPct = data.totalPengeluaran > 0 ? (topNilai / data.totalPengeluaran) * 100 : 0
    insights.push({
      text: `• Kategori pengeluaran terbesar: ${topKategori} — ${rupiah(topNilai)} (${topPct.toLocaleString('id-ID', { maximumFractionDigits: 0 })}% dari total pengeluaran).`,
      color: GREEN_DARK,
    })
  }
  insights.push({
    text: `• Margin laba bersih periode ini: ${marginPct.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%.`,
    color: GREEN_DARK,
  })
  if (saldoBersih < 0) {
    insights.push({ text: '• Perhatian: pengeluaran melebihi pemasukan pada periode ini.', color: RED })
  }

  y = ensureSpace(doc, y, 9 + insights.length * 6.5)
  sectionTitle(doc, MARGIN, y, 'Ringkasan')
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  for (const insight of insights) {
    doc.setTextColor(insight.color[0], insight.color[1], insight.color[2])
    doc.text(insight.text, MARGIN, y, { maxWidth: CONTENT_WIDTH })
    y += 6.5
  }

  y = ensureSpace(doc, y + 6, 24)
  drawOwnerSignature(doc, y, businessName())

  drawFrame(doc)
  drawWatermark(doc, logo)
  drawFooter(doc)
  doc.save(`${data.judul.replace(/\s+/g, '-')}-${data.periode.replace(/\s+/g, '-')}.pdf`)
}
