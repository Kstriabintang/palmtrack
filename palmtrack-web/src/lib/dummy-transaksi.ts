export interface TransaksiKeuangan {
  tanggal: string
  jenis: 'Pemasukan' | 'Pengeluaran'
  kategori: string
  keterangan: string
  jumlah: number
}

export const TRANSAKSI_SEPTEMBER_2026: TransaksiKeuangan[] = [
  { tanggal: '20 Sep', jenis: 'Pemasukan', kategori: 'Penjualan TBS', keterangan: 'Setoran PKS Tembilahan', jumlah: 42500000 },
  { tanggal: '19 Sep', jenis: 'Pengeluaran', kategori: 'Gaji', keterangan: 'Gaji mingguan pekerja', jumlah: -12600000 },
  { tanggal: '19 Sep', jenis: 'Pengeluaran', kategori: 'Operasional', keterangan: 'Pembelian pupuk NPK', jumlah: -4200000 },
  { tanggal: '18 Sep', jenis: 'Pemasukan', kategori: 'Penjualan TBS', keterangan: 'Setoran PKS Enok', jumlah: 38200000 },
  { tanggal: '17 Sep', jenis: 'Pengeluaran', kategori: 'Perawatan', keterangan: 'Herbisida Blok C1', jumlah: -1850000 },
  { tanggal: '16 Sep', jenis: 'Pemasukan', kategori: 'Pelunasan Hutang', keterangan: 'Dari Pak Agus Salim', jumlah: 3272500 },
  { tanggal: '15 Sep', jenis: 'Pengeluaran', kategori: 'Perawatan', keterangan: 'Pemupukan Kalium Blok B1', jumlah: -3100000 },
  { tanggal: '14 Sep', jenis: 'Pengeluaran', kategori: 'Operasional', keterangan: 'Pengendalian hama Blok C2', jumlah: -2400000 },
]

export const TOTAL_PEMASUKAN_SEPTEMBER_2026 = 186_400_000
export const TOTAL_PENGELUARAN_SEPTEMBER_2026 = 74_200_000
