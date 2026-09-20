import {
  ArrowDown,
  ArrowRight,
  ArrowUpDown,
  BarChart3,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Eye,
  Filter,
  Fuel,
  ListFilter,
  Map as MapIcon,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Ruler,
  Sprout,
  Trash2,
  Truck,
  Users,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { DonutSummary } from '@/components/donut-summary'
import { StatCard } from '@/components/stat-card'
import { StatusBadge } from '@/components/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import type { StatCardProps } from '@/components/stat-card'
import { seedData } from '@/lib/dummy-mode'
import { STATUS_COLOR_VAR, useBlokLahan } from '@/lib/dummy-kebun'
import { rupiah } from '@/lib/format'
import { cn } from '@/lib/utils'

const STATS_DUMMY: StatCardProps[] = [
  {
    label: 'Total Luas Tanam',
    value: '142 Ha',
    hint: '5 kebun aktif',
    icon: Ruler,
    trend: [128, 131, 134, 136, 139, 140, 142],
    trendColor: 'var(--color-primary)',
  },
  {
    label: 'Blok Aktif',
    value: '18 blok',
    hint: 'Tersebar di 5 kebun',
    icon: Sprout,
    trend: [14, 15, 16, 16, 17, 18, 18],
    trendColor: 'var(--color-primary)',
  },
  {
    label: 'Produksi Bulan Ini',
    value: '268.400 kg',
    hint: 'Dari seluruh blok',
    delta: '+6%',
    icon: BarChart3,
    trend: [212000, 224000, 231000, 238000, 249000, 258000, 268400],
    trendColor: 'var(--color-sky-500)',
  },
  {
    label: 'Siap Panen',
    value: '6 blok',
    hint: 'Estimasi 7 hari ke depan',
    icon: CalendarClock,
    tone: 'bg-amber-500/10 text-amber-600',
    trend: [3, 4, 4, 5, 5, 6, 6],
    trendColor: 'var(--color-amber-500)',
  },
]

const JADWAL_PANEN_DUMMY = [
  { blok: 'Blok A3', kebun: 'Kebun Sukamaju', tanggal: '22 Sep 2026', sisaHari: 3, status: 'Siap Panen' },
  { blok: 'Blok C1', kebun: 'Kebun Harapan Sawit', tanggal: '25 Sep 2026', sisaHari: 6, status: 'Siap Panen' },
  { blok: 'Blok B2', kebun: 'Kebun Makmur Jaya', tanggal: '28 Sep 2026', sisaHari: 9, status: 'Perlu Persiapan' },
  { blok: 'Blok D4', kebun: 'Kebun Tunas Lestari', tanggal: '30 Sep 2026', sisaHari: 11, status: 'Siap Panen' },
]

const BIAYA_PERAWATAN_DUMMY = [
  { jenis: 'Pupuk', biaya: 16500000, icon: Sprout, tone: 'bg-primary/10 text-primary' },
  { jenis: 'Transportasi', biaya: 8750000, icon: Truck, tone: 'bg-sky-500/10 text-sky-600' },
  { jenis: 'Tenaga Kerja', biaya: 9200000, icon: Users, tone: 'bg-violet-500/10 text-violet-600' },
  { jenis: 'Perawatan Alat', biaya: 4150000, icon: Wrench, tone: 'bg-amber-500/10 text-amber-600' },
]

const STATUS_BLOK_DUMMY = [
  { label: 'Aktif', value: 14, pct: 78, color: 'var(--color-primary)' },
  { label: 'Perlu Perhatian', value: 1, pct: 6, color: 'var(--color-amber-500)' },
  { label: 'Replanting', value: 1, pct: 6, color: 'var(--color-sky-500)' },
  { label: 'Non-aktif', value: 2, pct: 11, color: 'var(--color-muted-foreground)' },
]

const STATUS_FILTERS = ['Semua Status', 'Aktif', 'Perlu Perhatian', 'Replanting']
const STATUS_OPTIONS = ['Aktif', 'Perlu Perhatian', 'Replanting', 'Non-aktif']
const BLOK_FORM_DEFAULT = { blok: '', kebun: '', luas: '', tanam: String(new Date().getFullYear()), mandor: '', status: 'Aktif' }

type SortKey = 'blok' | 'kebun' | 'luas' | 'tanam' | 'status'

function notifyComingSoon(action: string, blok: string) {
  toast(`${action} — ${blok}`, {
    description: 'Fitur ini akan aktif setelah terhubung ke backend.',
  })
}

function SortableHead({
  label,
  sortKey,
  active,
  direction,
  onSort,
  className,
}: {
  label: string
  sortKey: SortKey
  active: boolean
  direction: 'asc' | 'desc'
  onSort: (key: SortKey) => void
  className?: string
}) {
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        {active ? (
          direction === 'asc' ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
        )}
      </button>
    </TableHead>
  )
}

export function KebunPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS[0])
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'blok', direction: 'asc' })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(BLOK_FORM_DEFAULT)

  const [BLOK_LAHAN, setBlokLahan] = useBlokLahan()
  const JADWAL_PANEN = seedData(JADWAL_PANEN_DUMMY, [] as typeof JADWAL_PANEN_DUMMY)
  const BIAYA_PERAWATAN = seedData(BIAYA_PERAWATAN_DUMMY, [] as typeof BIAYA_PERAWATAN_DUMMY)

  const totalLuasReal = BLOK_LAHAN.reduce((sum, b) => sum + b.luas, 0)
  const blokAktifReal = BLOK_LAHAN.filter((b) => b.status === 'Aktif').length
  const kebunCountReal = new Set(BLOK_LAHAN.map((b) => b.kebun)).size
  const STATS = seedData(STATS_DUMMY, [
    { label: 'Total Luas Tanam', value: `${totalLuasReal.toLocaleString('id-ID')} Ha`, hint: kebunCountReal > 0 ? `${kebunCountReal} kebun` : 'Belum ada kebun', icon: Ruler },
    { label: 'Blok Aktif', value: `${blokAktifReal} blok`, hint: BLOK_LAHAN.length > 0 ? `Dari ${BLOK_LAHAN.length} blok total` : 'Belum ada blok', icon: Sprout },
    { label: 'Produksi Bulan Ini', value: '0 kg', hint: 'Dari seluruh blok', icon: BarChart3, tone: 'bg-sky-500/10 text-sky-600' },
    { label: 'Siap Panen', value: '0 blok', hint: 'Belum ada jadwal panen', icon: CalendarClock, tone: 'bg-amber-500/10 text-amber-600' },
  ] as StatCardProps[])

  const statusBlokReal = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const b of BLOK_LAHAN) counts[b.status] = (counts[b.status] ?? 0) + 1
    const total = BLOK_LAHAN.length || 1
    return Object.entries(counts).map(([label, value]) => ({
      label,
      value,
      pct: Math.round((value / total) * 100),
      color: STATUS_COLOR_VAR[label] ?? STATUS_COLOR_VAR['Non-aktif'],
    }))
  }, [BLOK_LAHAN])
  const STATUS_BLOK = seedData(STATUS_BLOK_DUMMY, statusBlokReal)

  function handleGambarDenah(blokName: string) {
    navigate('/peta', { state: { drawBlok: blokName } })
  }

  function handleTambahBlok() {
    const luas = Number(form.luas)
    const tanam = Number(form.tanam)
    if (!form.blok || !form.kebun || !luas || !tanam) {
      toast.error('Lengkapi nama blok, kebun, luas, dan tahun tanam')
      return
    }
    setBlokLahan((prev) => [...prev, { blok: form.blok, kebun: form.kebun, luas, tanam, mandor: form.mandor || '—', status: form.status }])
    toast.success('Blok ditambahkan', { description: `Gambar denahnya di Peta Kebun kapan saja lewat menu aksi.` })
    setForm(BLOK_FORM_DEFAULT)
    setDialogOpen(false)
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = BLOK_LAHAN.filter((row) => {
      const matchesQuery = !q || row.blok.toLowerCase().includes(q) || row.kebun.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'Semua Status' || row.status === statusFilter
      return matchesQuery && matchesStatus
    })

    const sorted = [...filtered].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1
      const av = a[sort.key]
      const bv = b[sort.key]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })

    return sorted
  }, [query, statusFilter, sort, BLOK_LAHAN])

  function handleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' },
    )
  }

  const totalBiaya = BIAYA_PERAWATAN.reduce((sum, item) => sum + item.biaya, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kebun</h1>
          <p className="text-sm text-muted-foreground">
            Data blok lahan, jadwal panen, dan biaya perawatan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/peta')}>
            <MapIcon />
            Peta Kebun
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus />
            Tambah Blok
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
          <CardTitle className="flex items-center gap-2">
            <ListFilter className="size-4 text-primary" />
            Data Blok Lahan
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari blok atau kebun..."
              className="w-52"
            />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline"><Filter />Filter</Button>} />
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Status Blok</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_FILTERS.map((option) => (
                  <DropdownMenuItem key={option} onClick={() => setStatusFilter(option)}>
                    {option}
                    {statusFilter === option && <Badge variant="secondary" className="ml-auto">Aktif</Badge>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-xs whitespace-nowrap text-muted-foreground">Menampilkan {rows.length} dari {BLOK_LAHAN.length} blok</span>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead label="Blok" sortKey="blok" active={sort.key === 'blok'} direction={sort.direction} onSort={handleSort} />
                <SortableHead label="Kebun" sortKey="kebun" active={sort.key === 'kebun'} direction={sort.direction} onSort={handleSort} />
                <SortableHead label="Luas" sortKey="luas" active={sort.key === 'luas'} direction={sort.direction} onSort={handleSort} className="text-right" />
                <SortableHead label="Tahun Tanam" sortKey="tanam" active={sort.key === 'tanam'} direction={sort.direction} onSort={handleSort} className="text-right" />
                <TableHead>Mandor</TableHead>
                <SortableHead label="Status" sortKey="status" active={sort.key === 'status'} direction={sort.direction} onSort={handleSort} />
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BLOK_LAHAN.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      icon={Sprout}
                      title="Belum ada blok lahan"
                      description="Tambahkan blok pertama untuk mulai mencatat luas tanam dan jadwal panen kebunmu."
                      actionLabel="Tambah Blok"
                      onAction={() => notifyComingSoon('Tambah blok', 'Kebun')}
                    />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada blok yang cocok dengan pencarian atau filter.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.blok}>
                    <TableCell className="font-medium">{row.blok}</TableCell>
                    <TableCell className="text-muted-foreground">{row.kebun}</TableCell>
                    <TableCell className="text-right">{row.luas} Ha</TableCell>
                    <TableCell className="text-right">{row.tanam}</TableCell>
                    <TableCell className="text-muted-foreground">{row.mandor}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => notifyComingSoon('Lihat detail', row.blok)}>
                            <Eye />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGambarDenah(row.blok)}>
                            <MapPin />
                            {row.polygon ? 'Gambar Ulang Denah' : 'Gambar Denah di Peta'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => notifyComingSoon('Edit blok', row.blok)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setBlokLahan((prev) => prev.filter((b) => b.blok !== row.blok))
                              toast.success(`${row.blok} dihapus`)
                            }}
                          >
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              Jadwal Panen Terdekat
            </CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Lihat semua <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {JADWAL_PANEN.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">Belum ada jadwal panen.</p>
            )}
            {JADWAL_PANEN.map((item) => (
              <div key={item.blok} className="flex items-center gap-3 rounded-lg px-1.5 py-2.5 hover:bg-muted/60">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sprout className="size-4.5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{item.blok}</span>
                  <span className="text-xs text-muted-foreground">{item.kebun}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="size-3" />
                    {item.tanggal} · {item.sisaHari} hari lagi
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Fuel className="size-4 text-primary" />
              Biaya Perawatan Bulan Ini
            </CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Lihat detail <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              {BIAYA_PERAWATAN.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">Belum ada biaya perawatan tercatat.</p>
              )}
              {BIAYA_PERAWATAN.map((item) => (
                <div key={item.jenis} className="flex items-center justify-between gap-3 rounded-lg px-1.5 py-2 hover:bg-muted/60">
                  <div className="flex items-center gap-2.5">
                    <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', item.tone)}>
                      <item.icon className="size-4" />
                    </div>
                    <span className="text-sm font-medium">{item.jenis}</span>
                  </div>
                  <span className="text-sm font-semibold">{rupiah(item.biaya)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3 ring-1 ring-primary/15">
              <div className="flex flex-1 items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Total Biaya</span>
                  <span className="text-lg font-semibold tracking-tight">Rp {(totalBiaya / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt</span>
                </div>
                {BIAYA_PERAWATAN.length > 0 && (
                  <Badge variant="outline" className="border-transparent bg-primary/10 text-primary">
                    <ArrowDown className="size-3" />
                    -12% dari bulan lalu
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Status Blok</CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Lihat detail <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DonutSummary data={STATUS_BLOK} centerValue={`${BLOK_LAHAN.length} blok`} centerLabel="Total Blok" valueSuffix=" blok" />
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2.5 text-sm ring-1 ring-primary/15">
              <span className="font-medium">
                {STATUS_BLOK.length === 0 ? 'Belum ada data status blok' : 'Sebagian besar blok dalam kondisi aktif'}
              </span>
              <ArrowRight className="ml-auto size-4 shrink-0 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Blok Lahan</DialogTitle>
            <DialogDescription>
              Daftarkan blok baru, lalu gambar batas lahannya di Peta Kebun kapan saja.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bl-blok">Nama Blok</Label>
              <Input
                id="bl-blok"
                value={form.blok}
                onChange={(event) => setForm((prev) => ({ ...prev, blok: event.target.value }))}
                placeholder="Contoh: Blok F1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bl-kebun">Nama Kebun</Label>
              <Input
                id="bl-kebun"
                value={form.kebun}
                onChange={(event) => setForm((prev) => ({ ...prev, kebun: event.target.value }))}
                placeholder="Contoh: Kebun Sukamaju"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bl-luas">Perkiraan Luas (Ha)</Label>
              <Input
                id="bl-luas"
                type="number"
                inputMode="decimal"
                value={form.luas}
                onChange={(event) => setForm((prev) => ({ ...prev, luas: event.target.value }))}
                placeholder="8.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bl-tanam">Tahun Tanam</Label>
              <Input
                id="bl-tanam"
                type="number"
                inputMode="numeric"
                value={form.tanam}
                onChange={(event) => setForm((prev) => ({ ...prev, tanam: event.target.value }))}
                placeholder="2020"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bl-mandor">Mandor (opsional)</Label>
              <Input
                id="bl-mandor"
                value={form.mandor}
                onChange={(event) => setForm((prev) => ({ ...prev, mandor: event.target.value }))}
                placeholder="Contoh: Pak Herman"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => value && setForm((prev) => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleTambahBlok}>
              <Plus />
              Simpan Blok
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
