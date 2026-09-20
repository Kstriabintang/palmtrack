export function whatsappLink(phone: string, message: string) {
  const normalized = phone.replace(/[^0-9]/g, '').replace(/^0/, '62')
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export function openWhatsApp(phone: string, message: string) {
  window.open(whatsappLink(phone, message), '_blank', 'noopener,noreferrer')
}

export function buildNotaMessage(params: {
  petani: string
  tanggal: string
  waktu: string
  plat: string
  peron: string
  netto: number
  harga: number
  total: number
  status: string
}) {
  return [
    `Halo ${params.petani},`,
    '',
    'Berikut rincian timbangan TBS Anda di PalmTrack:',
    `📅 Tanggal: ${params.tanggal}, ${params.waktu}`,
    `🚛 Kendaraan: ${params.plat} (${params.peron})`,
    `⚖️ Netto: ${params.netto.toLocaleString('id-ID')} kg`,
    `💰 Harga: Rp ${params.harga.toLocaleString('id-ID')}/kg`,
    `💵 Total Bayar: Rp ${params.total.toLocaleString('id-ID')}`,
    `✅ Status: ${params.status}`,
    '',
    'Terima kasih atas kerja samanya.',
    '- PalmTrack',
  ].join('\n')
}

export function buildReminderMessage(params: { nama: string; sisa: number; jatuhTempo: string }) {
  return [
    `Halo ${params.nama},`,
    '',
    'Ini pengingat ramah dari PalmTrack mengenai sisa hutang Anda:',
    `💰 Sisa tagihan: Rp ${params.sisa.toLocaleString('id-ID')}`,
    `📅 Jatuh tempo: ${params.jatuhTempo}`,
    '',
    'Mohon segera dilunasi ke peron terdekat. Terima kasih atas perhatiannya.',
    '- PalmTrack',
  ].join('\n')
}
