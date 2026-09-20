import {
  Award,
  BarChart3,
  CalendarDays,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  ListFilter,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Sprout,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { StatCard } from '@/components/stat-card'
import { TOTAL_PEMASUKAN_SEPTEMBER_2026, TOTAL_PENGELUARAN_SEPTEMBER_2026, TRANSAKSI_SEPTEMBER_2026 } from '@/lib/dummy-transaksi'
import { generateLaporanPdf } from '@/lib/pdf'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const STATS = [
  {
    label: 'Laporan Bulan Ini',
    value: '12',
    hint: '20% dari bulan lalu',
    delta: '+20%',
    icon: FileText,
    trend: [6, 7, 8, 8, 9, 10, 12],
    trendColor: 'var(--color-primary)',
  },
  {
    label: 'Laporan Tahunan',
    value: '48',
    hint: '14% dari tahun lalu',
    delta: '+14%',
    icon: BarChart3,
    trend: [34, 36, 38, 40, 42, 45, 48],
    trendColor: 'var(--color-primary)',
  },
  {
    label: 'Total Unduhan',
    value: '326',
    hint: '28% dari periode sebelumnya',
    delta: '+28%',
    icon: Download,
    tone: 'bg-violet-500/10 text-violet-600',
    trend: [180, 210, 230, 250, 270, 300, 326],
    trendColor: 'var(--color-violet-500)',
  },
  {
    label: 'Kinerja Bersih',
    value: 'Rp 112,5 jt',
    hint: '12% dari bulan lalu',
    delta: '+12%',
    icon: Award,
    tone: 'bg-amber-500/10 text-amber-600',
    trend: [81, 86, 90, 95, 101, 107, 112.5],
    trendColor: 'var(--color-amber-500)',
  },
]

const TREN_TAHUNAN = [
  { bulan: 'Jan', pendapatan: 142, pengeluaran: 61 },
  { bulan: 'Feb', pendapatan: 138, pengeluaran: 58 },
  { bulan: 'Mar', pendapatan: 151, pengeluaran: 64 },
  { bulan: 'Apr', pendapatan: 149, pengeluaran: 66 },
  { bulan: 'Mei', pendapatan: 163, pengeluaran: 69 },
  { bulan: 'Jun', pendapatan: 158, pengeluaran: 65 },
  { bulan: 'Jul', pendapatan: 171, pengeluaran: 70 },
  { bulan: 'Ags', pendapatan: 179, pengeluaran: 73 },
  { bulan: 'Sep', pendapatan: 186, pengeluaran: 74 },
]

const RIWAYAT_LAPORAN = [
  { nama: 'Laporan Harian Peron', periode: '20 Sep 2026', dibuat: '20 Sep 2026, 16:00', format: 'PDF', icon: FileText, tone: 'bg-primary/10 text-primary' },
  { nama: 'Laporan Bulanan', periode: 'Agustus 2026', dibuat: '1 Sep 2026, 08:00', format: 'PDF & Excel', icon: CalendarDays, tone: 'bg-sky-500/10 text-sky-600' },
  { nama: 'Laporan Gaji Pekerja', periode: 'Agustus 2026', dibuat: '1 Sep 2026, 09:15', format: 'Excel', icon: Users, tone: 'bg-violet-500/10 text-violet-600' },
  { nama: 'Laporan Keuangan', periode: 'Agustus 2026', dibuat: '31 Agustus 2026, 14:30', format: 'PDF', icon: Wallet, tone: 'bg-amber-500/10 text-amber-600' },
  { nama: 'Laporan Produksi Kebun', periode: 'Agustus 2026', dibuat: '31 Agustus 2026, 11:20', format: 'Excel', icon: Sprout, tone: 'bg-primary/10 text-primary' },
]

const PERIODE_OPTIONS = ['September 2026', 'Agustus 2026', 'Juli 2026']
const FORMAT_FILTERS = ['Semua Format', 'PDF', 'Excel', 'PDF & Excel']

function FormatBadge({ format }: { format: string }) {
  const isPdfOnly = format === 'PDF'
  return (
    <Badge
      variant="outline"
      className={cn('border-transparent', isPdfOnly ? 'bg-rose-500/10 text-rose-600' : 'bg-primary/10 text-primary')}
    >
      {format}
    </Badge>
  )
}

function notifyComingSoon(action: string, subjek: string) {
  toast(`${action} — ${subjek}`, {
    description: 'Fitur ini akan aktif setelah terhubung ke backend.',
  })
}

function handleUnduhBulanan() {
  toast.promise(
    generateLaporanPdf({
      judul: 'Laporan Bulanan',
      periode: 'September 2026',
      totalPemasukan: TOTAL_PEMASUKAN_SEPTEMBER_2026,
      totalPengeluaran: TOTAL_PENGELUARAN_SEPTEMBER_2026,
      transaksi: TRANSAKSI_SEPTEMBER_2026,
    }),
    { loading: 'Menyiapkan laporan bulanan...', success: 'Laporan bulanan berhasil diunduh', error: 'Gagal membuat laporan' },
  )
}

function handleUnduhTahunan() {
  const transaksiTahunan = TREN_TAHUNAN.flatMap((item) => [
    {
      tanggal: item.bulan,
      jenis: 'Pemasukan' as const,
      kategori: 'Pendapatan Bulanan',
      keterangan: `Total pendapatan ${item.bulan} 2026`,
      jumlah: item.pendapatan * 1_000_000,
    },
    {
      tanggal: item.bulan,
      jenis: 'Pengeluaran' as const,
      kategori: 'Operasional & Perawatan',
      keterangan: `Total pengeluaran ${item.bulan} 2026`,
      jumlah: -item.pengeluaran * 1_000_000,
    },
  ])
  const totalPemasukan = TREN_TAHUNAN.reduce((sum, item) => sum + item.pendapatan, 0) * 1_000_000
  const totalPengeluaran = TREN_TAHUNAN.reduce((sum, item) => sum + item.pengeluaran, 0) * 1_000_000

  toast.promise(
    generateLaporanPdf({
      judul: 'Laporan Tahunan',
      periode: 'Januari – September 2026',
      totalPemasukan,
      totalPengeluaran,
      transaksi: transaksiTahunan,
    }),
    { loading: 'Menyiapkan laporan tahunan...', success: 'Laporan tahunan berhasil diunduh', error: 'Gagal membuat laporan' },
  )
}

export function LaporanPage() {
  const [periode, setPeriode] = useState(PERIODE_OPTIONS[0])
  const [query, setQuery] = useState('')
  const [formatFilter, setFormatFilter] = useState(FORMAT_FILTERS[0])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return RIWAYAT_LAPORAN.filter((row) => {
      const matchesQuery = !q || row.nama.toLowerCase().includes(q)
      const matchesFormat = formatFilter === 'Semua Format' || row.format === formatFilter
      return matchesQuery && matchesFormat
    })
  }, [query, formatFilter])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Laporan</h1>
          <p className="text-sm text-muted-foreground">
            Unduh ringkasan produksi, keuangan, dan performa kebun.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline">
                  <CalendarDays />
                  {periode}
                  <ChevronDown className="size-3.5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {PERIODE_OPTIONS.map((option) => (
                <DropdownMenuItem key={option} onClick={() => setPeriode(option)}>
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => notifyComingSoon('Buat laporan baru', periode)}>
            <Plus />
            Buat Laporan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="size-4.5" />
            </div>
            <CardTitle>Laporan Bulanan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Rekap produksi, pemasukan, dan pengeluaran untuk periode yang dipilih.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleUnduhBulanan}>
                <FileText />
                Unduh PDF
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => notifyComingSoon('Unduh Excel', 'Laporan Bulanan')}>
                <FileSpreadsheet />
                Unduh Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="size-4.5" />
            </div>
            <CardTitle>Laporan Tahunan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Rekap performa penuh tahun berjalan, periode Januari – Desember.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleUnduhTahunan}>
                <FileText />
                Unduh PDF
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => notifyComingSoon('Unduh Excel', 'Laporan Tahunan')}>
                <FileSpreadsheet />
                Unduh Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Tren Pendapatan vs Pengeluaran</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Dalam juta rupiah, Januari – September 2026</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreVertical className="size-4" /></Button>} />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => notifyComingSoon('Unduh grafik', 'Tren Pendapatan vs Pengeluaran')}>
                <Download />
                Unduh sebagai gambar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => notifyComingSoon('Lihat data mentah', 'Tren Pendapatan vs Pengeluaran')}>
                <Eye />
                Lihat data mentah
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={TREN_TAHUNAN} margin={{ left: 4, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="bulan" tickLine={false} axisLine={false} className="text-xs fill-muted-foreground" />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(value: number) => `${value}`}
                className="text-xs fill-muted-foreground"
              />
              <Tooltip
                formatter={(value, name) => [`Rp ${value} jt`, name === 'pendapatan' ? 'Pendapatan' : 'Pengeluaran']}
                contentStyle={{
                  borderRadius: 'var(--radius-md)',
                  borderColor: 'var(--color-border)',
                  fontSize: 12,
                }}
              />
              <Legend
                formatter={(value) => (value === 'pendapatan' ? 'Pendapatan' : 'Pengeluaran')}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="pendapatan" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <ListFilter className="size-4 text-primary" />
            Riwayat Laporan
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama laporan..."
              className="w-56"
            />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline"><Filter />{formatFilter}<ChevronDown className="size-3.5" /></Button>} />
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Format File</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {FORMAT_FILTERS.map((option) => (
                  <DropdownMenuItem key={option} onClick={() => setFormatFilter(option)}>
                    {option}
                    {formatFilter === option && <Badge variant="secondary" className="ml-auto">Aktif</Badge>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Laporan</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Format</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada laporan yang cocok dengan pencarian atau filter.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.nama + row.periode}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', row.tone)}>
                          <row.icon className="size-4" />
                        </div>
                        <span className="font-medium">{row.nama}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.periode}</TableCell>
                    <TableCell className="text-muted-foreground">{row.dibuat}</TableCell>
                    <TableCell>
                      <FormatBadge format={row.format} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => notifyComingSoon('Unduh laporan', row.nama)}
                        >
                          <Download className="size-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>} />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => notifyComingSoon('Lihat detail', row.nama)}>
                              <Eye />
                              Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => notifyComingSoon('Hapus laporan', row.nama)}>
                              <Trash2 />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
