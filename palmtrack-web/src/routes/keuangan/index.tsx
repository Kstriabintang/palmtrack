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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/empty-state'
import { TOTAL_PEMASUKAN_SEPTEMBER_2026, TOTAL_PENGELUARAN_SEPTEMBER_2026, TRANSAKSI_SEPTEMBER_2026, type TransaksiKeuangan } from '@/lib/dummy-transaksi'
import { seedData } from '@/lib/dummy-mode'
import { initials, rupiah, rupiahSingkat } from '@/lib/format'
import { usePersistedState } from '@/lib/use-persisted-state'
import { buildReminderMessage, openWhatsApp } from '@/lib/whatsapp'

const HUTANG_PIUTANG_DUMMY = [
  { pihak: 'Pak Agus Salim', telepon: '0821-9988-7766', jenis: 'Piutang', jumlah: 4200000, status: 'Belum Lunas', jatuhTempo: '25 Sep 2026' },
  { pihak: 'Ibu Ningsih', telepon: '0813-6677-8899', jenis: 'Piutang', jumlah: 6264000, status: 'Belum Lunas', jatuhTempo: '24 Sep 2026' },
  { pihak: 'Toko Tani Makmur', telepon: '0811-2233-9988', jenis: 'Hutang', jumlah: 5800000, status: 'Cicilan Berjalan', jatuhTempo: '30 Sep 2026' },
  { pihak: 'Pak Darmawan', telepon: '0813-5544-3322', jenis: 'Piutang', jumlah: 900000, status: 'Belum Lunas', jatuhTempo: '26 Sep 2026' },
]

const PENGELUARAN_KATEGORI_DUMMY = [
  { kategori: 'Gaji Pekerja', nilai: 42800000, icon: Users },
  { kategori: 'Operasional Peron & Kebun', nilai: 18600000, icon: Wallet },
  { kategori: 'Perawatan (Pupuk & Herbisida)', nilai: 12800000, icon: Sprout },
]

const JENIS_OPTIONS = ['Pemasukan', 'Pengeluaran'] as const
const FORM_DEFAULT = { jenis: 'Pemasukan' as (typeof JENIS_OPTIONS)[number], kategori: '', keterangan: '', jumlah: '' }

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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(FORM_DEFAULT)

  const [transaksi, setTransaksi] = usePersistedState<TransaksiKeuangan[]>('transaksi', () =>
    seedData(TRANSAKSI_SEPTEMBER_2026, []),
  )
  const HUTANG_PIUTANG = seedData(HUTANG_PIUTANG_DUMMY, [] as typeof HUTANG_PIUTANG_DUMMY)
  const TOTAL_HUTANG_PIUTANG = HUTANG_PIUTANG.reduce((sum, item) => sum + item.jumlah, 0)

  const pemasukanReal = transaksi.filter((t) => t.jenis === 'Pemasukan').reduce((sum, t) => sum + t.jumlah, 0)
  const pengeluaranReal = transaksi.filter((t) => t.jenis === 'Pengeluaran').reduce((sum, t) => sum + Math.abs(t.jumlah), 0)
  const totalPemasukan = seedData(TOTAL_PEMASUKAN_SEPTEMBER_2026, pemasukanReal)
  const totalPengeluaran = seedData(TOTAL_PENGELUARAN_SEPTEMBER_2026, pengeluaranReal)
  const saldoKas = totalPemasukan - totalPengeluaran

  const PENGELUARAN_KATEGORI = seedData(
    PENGELUARAN_KATEGORI_DUMMY,
    Object.values(
      transaksi
        .filter((t) => t.jenis === 'Pengeluaran')
        .reduce<Record<string, { kategori: string; nilai: number; icon: typeof Wallet }>>((acc, t) => {
          acc[t.kategori] ??= { kategori: t.kategori, nilai: 0, icon: Wallet }
          acc[t.kategori].nilai += Math.abs(t.jumlah)
          return acc
        }, {}),
    ).sort((a, b) => b.nilai - a.nilai),
  )

  const STATS = [
    {
      label: 'Pemasukan Bulan Ini',
      value: rupiahSingkat(totalPemasukan),
      hint: seedData('+12% dari bulan lalu', 'Total transaksi tercatat'),
      delta: seedData('+12%', undefined),
      icon: Wallet,
    },
    {
      label: 'Pengeluaran Bulan Ini',
      value: rupiahSingkat(totalPengeluaran),
      hint: seedData('Turun dari bulan lalu', 'Total transaksi tercatat'),
      icon: TrendingDown,
      tone: 'bg-amber-500/10 text-amber-600',
    },
    {
      label: 'Saldo Kas',
      value: rupiahSingkat(saldoKas),
      hint: 'Pemasukan dikurangi pengeluaran',
      icon: PiggyBank,
      tone: 'bg-sky-500/10 text-sky-600',
    },
    {
      label: 'Hutang & Piutang',
      value: rupiahSingkat(TOTAL_HUTANG_PIUTANG),
      hint: HUTANG_PIUTANG.length > 0 ? `Dari ${HUTANG_PIUTANG.length} pihak` : 'Belum ada catatan',
      icon: CircleAlert,
      tone: 'bg-destructive/10 text-destructive',
    },
  ]

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return transaksi.filter((row) => {
      const matchesQuery =
        !q || row.keterangan.toLowerCase().includes(q) || row.kategori.toLowerCase().includes(q)
      const matchesJenis = jenisFilter === 'Semua Jenis' || row.jenis === jenisFilter
      return matchesQuery && matchesJenis
    })
  }, [query, jenisFilter, transaksi])

  function handleCatatTransaksi() {
    const jumlah = Number(form.jumlah)
    if (!form.kategori || !form.keterangan || !jumlah) {
      toast.error('Lengkapi semua field terlebih dahulu')
      return
    }
    const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    const entry: TransaksiKeuangan = {
      tanggal,
      jenis: form.jenis,
      kategori: form.kategori,
      keterangan: form.keterangan,
      jumlah: form.jenis === 'Pengeluaran' ? -Math.abs(jumlah) : Math.abs(jumlah),
    }
    setTransaksi((prev) => [entry, ...prev])
    toast.success('Transaksi tercatat')
    setForm(FORM_DEFAULT)
    setDialogOpen(false)
  }

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
          <Button onClick={() => setDialogOpen(true)}>
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
              {transaksi.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <EmptyState
                      icon={Wallet}
                      title="Belum ada transaksi keuangan"
                      description="Catat pemasukan atau pengeluaran pertama untuk mulai memantau kas usahamu."
                      actionLabel="Catat Transaksi"
                      onAction={() => setDialogOpen(true)}
                    />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
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
            {HUTANG_PIUTANG.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">Belum ada catatan hutang atau piutang.</p>
            )}
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
            {PENGELUARAN_KATEGORI.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">Belum ada pengeluaran tercatat.</p>
            )}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Transaksi Baru</DialogTitle>
            <DialogDescription>Catat pemasukan atau pengeluaran usaha hari ini.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Jenis</Label>
              <Select
                value={form.jenis}
                onValueChange={(value) => value && setForm((prev) => ({ ...prev, jenis: value as (typeof JENIS_OPTIONS)[number] }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tr-jumlah">Jumlah (Rp)</Label>
              <Input
                id="tr-jumlah"
                type="number"
                inputMode="numeric"
                value={form.jumlah}
                onChange={(event) => setForm((prev) => ({ ...prev, jumlah: event.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tr-kategori">Kategori</Label>
              <Input
                id="tr-kategori"
                value={form.kategori}
                onChange={(event) => setForm((prev) => ({ ...prev, kategori: event.target.value }))}
                placeholder="Contoh: Penjualan TBS, Operasional, Gaji"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tr-keterangan">Keterangan</Label>
              <Input
                id="tr-keterangan"
                value={form.keterangan}
                onChange={(event) => setForm((prev) => ({ ...prev, keterangan: event.target.value }))}
                placeholder="Contoh: Setoran PKS Ambawang"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCatatTransaksi}>
              <Plus />
              Simpan Transaksi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
