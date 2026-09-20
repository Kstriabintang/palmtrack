import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Eye,
  Filter,
  ListFilter,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  PiggyBank,
  Plus,
  Sprout,
  Trash2,
  TrendingDown,
  Users,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { StatCard } from '@/components/stat-card'
import { StatusBadge } from '@/components/status-badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { initials, rupiah } from '@/lib/format'
import { buildReminderMessage, openWhatsApp } from '@/lib/whatsapp'

const STATS = [
  {
    label: 'Pemasukan Bulan Ini',
    value: 'Rp 186,4 jt',
    hint: '+12% dari bulan lalu',
    delta: '+12%',
    icon: Wallet,
    trend: [142, 138, 151, 149, 163, 158, 171, 179, 186],
    trendColor: 'var(--color-primary)',
  },
  {
    label: 'Pengeluaran Bulan Ini',
    value: 'Rp 74,2 jt',
    hint: 'Turun dari bulan lalu',
    icon: TrendingDown,
    tone: 'bg-amber-500/10 text-amber-600',
    trend: [61, 58, 64, 66, 69, 65, 70, 73, 74.2],
    trendColor: 'var(--color-amber-500)',
  },
  {
    label: 'Saldo Kas',
    value: 'Rp 112,2 jt',
    hint: 'Per 20 September 2026',
    icon: PiggyBank,
    tone: 'bg-sky-500/10 text-sky-600',
    trend: [81, 80, 87, 83, 94, 93, 101, 106, 112.2],
    trendColor: 'var(--color-sky-500)',
  },
  {
    label: 'Hutang & Piutang',
    value: 'Rp 12,3 jt',
    hint: '8 pihak belum lunas',
    icon: CircleAlert,
    tone: 'bg-destructive/10 text-destructive',
    trend: [9.8, 10.5, 11.2, 10.8, 12.1, 11.6, 12.3],
    trendColor: 'var(--color-destructive)',
  },
]

const TRANSAKSI = [
  { tanggal: '20 Sep', jenis: 'Pemasukan', kategori: 'Penjualan TBS', keterangan: 'Setoran PKS Ambawang', jumlah: 42500000 },
  { tanggal: '19 Sep', jenis: 'Pengeluaran', kategori: 'Gaji', keterangan: 'Gaji mingguan pekerja', jumlah: -12600000 },
  { tanggal: '19 Sep', jenis: 'Pengeluaran', kategori: 'Operasional', keterangan: 'Pembelian pupuk NPK', jumlah: -4200000 },
  { tanggal: '18 Sep', jenis: 'Pemasukan', kategori: 'Penjualan TBS', keterangan: 'Setoran PKS Kubu Raya', jumlah: 38200000 },
  { tanggal: '17 Sep', jenis: 'Pengeluaran', kategori: 'Perawatan', keterangan: 'Herbisida Blok C1', jumlah: -1850000 },
  { tanggal: '16 Sep', jenis: 'Pemasukan', kategori: 'Pelunasan Hutang', keterangan: 'Dari Pak Agus Salim', jumlah: 3272500 },
  { tanggal: '15 Sep', jenis: 'Pengeluaran', kategori: 'Perawatan', keterangan: 'Pemupukan Kalium Blok B1', jumlah: -3100000 },
  { tanggal: '14 Sep', jenis: 'Pengeluaran', kategori: 'Operasional', keterangan: 'Pengendalian hama Blok C2', jumlah: -2400000 },
]

const HUTANG_PIUTANG = [
  { pihak: 'Pak Agus Salim', telepon: '0821-9988-7766', jenis: 'Piutang', jumlah: 4200000, status: 'Belum Lunas', jatuhTempo: '25 Sep 2026' },
  { pihak: 'Ibu Ningsih', telepon: '0813-6677-8899', jenis: 'Piutang', jumlah: 6264000, status: 'Belum Lunas', jatuhTempo: '24 Sep 2026' },
  { pihak: 'Toko Tani Makmur', telepon: '0811-2233-9988', jenis: 'Hutang', jumlah: 5800000, status: 'Cicilan Berjalan', jatuhTempo: '30 Sep 2026' },
  { pihak: 'Pak Darmawan', telepon: '0813-5544-3322', jenis: 'Piutang', jumlah: 900000, status: 'Belum Lunas', jatuhTempo: '26 Sep 2026' },
]

const PENGELUARAN_KATEGORI = [
  { kategori: 'Gaji Pekerja', nilai: 42800000, icon: Users },
  { kategori: 'Operasional Peron & Kebun', nilai: 18600000, icon: Wallet },
  { kategori: 'Perawatan (Pupuk & Herbisida)', nilai: 12800000, icon: Sprout },
]

const PERIODE_OPTIONS = ['September 2026', 'Agustus 2026', 'Juli 2026']
const JENIS_FILTERS = ['Semua Jenis', 'Pemasukan', 'Pengeluaran']

const AVATAR_TONES = [
  'bg-primary/10 text-primary',
  'bg-sky-500/10 text-sky-600',
  'bg-amber-500/10 text-amber-600',
  'bg-violet-500/10 text-violet-600',
]

function notifyComingSoon(action: string, subjek: string) {
  toast(`${action} — ${subjek}`, {
    description: 'Fitur ini akan aktif setelah terhubung ke backend.',
  })
}

export function KeuanganPage() {
  const [periode, setPeriode] = useState(PERIODE_OPTIONS[0])
  const [ringkasanPeriode, setRingkasanPeriode] = useState('Bulan Ini')
  const [jenisFilter, setJenisFilter] = useState(JENIS_FILTERS[0])
  const [query, setQuery] = useState('')

  const totalPengeluaran = PENGELUARAN_KATEGORI.reduce((sum, item) => sum + item.nilai, 0)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TRANSAKSI.filter((row) => {
      const matchesQuery =
        !q || row.keterangan.toLowerCase().includes(q) || row.kategori.toLowerCase().includes(q)
      const matchesJenis = jenisFilter === 'Semua Jenis' || row.jenis === jenisFilter
      return matchesQuery && matchesJenis
    })
  }, [query, jenisFilter])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Keuangan</h1>
          <p className="text-sm text-muted-foreground">
            Pemasukan, pengeluaran, dan hutang piutang.
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
          <Button>
            <Plus />
            Catat Transaksi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListFilter className="size-4 text-primary" />
              Transaksi Terbaru
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Daftar transaksi keuangan terbaru</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari transaksi..."
              className="w-48"
            />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline"><Filter />Filter</Button>} />
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Jenis Transaksi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {JENIS_FILTERS.map((option) => (
                  <DropdownMenuItem key={option} onClick={() => setJenisFilter(option)}>
                    {option}
                    {jenisFilter === option && <Badge variant="secondary" className="ml-auto">Aktif</Badge>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs whitespace-nowrap">
              Lihat Semua <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada transaksi yang cocok dengan pencarian atau filter.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.tanggal + row.keterangan}>
                    <TableCell className="text-muted-foreground">{row.tanggal}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.jenis} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.kategori}</TableCell>
                    <TableCell>{row.keterangan}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${row.jumlah < 0 ? 'text-destructive' : 'text-primary'}`}
                    >
                      {row.jumlah < 0 ? '-' : '+'}
                      {rupiah(row.jumlah)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => notifyComingSoon('Lihat detail', row.keterangan)}>
                            <Eye />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => notifyComingSoon('Edit transaksi', row.keterangan)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => notifyComingSoon('Hapus transaksi', row.keterangan)}>
                            <Trash2 />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Hutang & Piutang</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Daftar petani dengan hutang dan piutang</p>
            </div>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Lihat Semua <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {HUTANG_PIUTANG.map((item, index) => (
              <div key={item.pihak} className="flex items-center justify-between gap-3 rounded-lg px-1.5 py-2 hover:bg-muted/60">
                <div className="flex items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarFallback className={AVATAR_TONES[index % AVATAR_TONES.length]}>
                      {initials(item.pihak)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.pihak}</span>
                    <span className="text-xs text-muted-foreground">{item.jenis}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{rupiah(item.jumlah)}</span>
                  <StatusBadge status={item.status} />
                  {item.jenis === 'Piutang' && item.status === 'Belum Lunas' && (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                      onClick={() =>
                        openWhatsApp(
                          item.telepon,
                          buildReminderMessage({ nama: item.pihak, sisa: item.jumlah, jatuhTempo: item.jatuhTempo }),
                        )
                      }
                    >
                      <MessageCircle className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pengeluaran per Kategori</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Total pengeluaran bulan ini berdasarkan kategori</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm">
                    {ringkasanPeriode}
                    <ChevronDown className="size-3.5" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                {['Bulan Ini', 'Bulan Lalu', '3 Bulan Terakhir'].map((option) => (
                  <DropdownMenuItem key={option} onClick={() => setRingkasanPeriode(option)}>
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {PENGELUARAN_KATEGORI.map((item) => {
              const pct = Math.round((item.nilai / totalPengeluaran) * 100)
              return (
                <div key={item.kategori} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-medium">
                      <item.icon className="size-3.5 text-muted-foreground" />
                      {item.kategori}
                    </span>
                    <span className="text-muted-foreground">{rupiah(item.nilai)} · {pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
