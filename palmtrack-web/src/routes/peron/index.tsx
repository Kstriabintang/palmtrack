import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  CloudOff,
  CloudUpload,
  Coins,
  Eye,
  Filter,
  ListFilter,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Truck,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'
import { StatCard } from '@/components/stat-card'
import { StatusBadge } from '@/components/status-badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { initials, rupiah } from '@/lib/format'
import { addToQueue, clearQueue, getQueue, type OfflineTimbangEntry } from '@/lib/offline-queue'
import { buildNotaMessage, buildReminderMessage, openWhatsApp } from '@/lib/whatsapp'

const STATS = [
  {
    label: 'Netto Hari Ini',
    value: '12.480 kg',
    hint: '24 transaksi tercatat',
    delta: '+8%',
    icon: BarChart3,
    trend: [9800, 10400, 10900, 11200, 11800, 12100, 12480],
    trendColor: 'var(--color-primary)',
  },
  {
    label: 'Harga TBS Hari Ini',
    value: 'Rp 2.450 / kg',
    hint: 'Naik Rp 50 dari kemarin',
    delta: '+2%',
    icon: Coins,
    tone: 'bg-amber-500/10 text-amber-600',
    trend: [2350, 2350, 2380, 2400, 2400, 2400, 2450],
    trendColor: 'var(--color-amber-500)',
  },
  {
    label: 'Transaksi Hari Ini',
    value: '24 transaksi',
    hint: '3 peron aktif menimbang',
    icon: Receipt,
    tone: 'bg-sky-500/10 text-sky-600',
    trend: [14, 16, 18, 15, 19, 21, 24],
    trendColor: 'var(--color-sky-500)',
  },
  {
    label: 'Hutang Petani',
    value: 'Rp 12,3 jt',
    hint: '8 petani belum lunas',
    icon: Truck,
    tone: 'bg-destructive/10 text-destructive',
    trend: [9.8, 10.5, 11.2, 10.8, 12.1, 11.6, 12.3],
    trendColor: 'var(--color-destructive)',
  },
]

const TIMBANGAN_INITIAL = [
  { waktu: '10:24', petani: 'Bapak Suroto', telepon: '0812-5566-7788', plat: 'KB 1234 XY', peron: 'Peron 1', bruto: 3200, tara: 860, netto: 2340, harga: 2450, status: 'Lunas' },
  { waktu: '09:52', petani: 'Ibu Sari Wulandari', telepon: '0813-2233-4455', plat: 'KB 5678 AB', peron: 'Peron 2', bruto: 2850, tara: 720, netto: 2130, harga: 2450, status: 'Lunas' },
  { waktu: '09:18', petani: 'Pak Agus Salim', telepon: '0821-9988-7766', plat: 'KB 9012 CD', peron: 'Peron 1', bruto: 4100, tara: 1050, netto: 3050, harga: 2450, status: 'Belum Lunas' },
  { waktu: '08:45', petani: 'Pak Slamet Riyadi', telepon: '0852-1122-3344', plat: 'KB 3456 EF', peron: 'Peron 3', bruto: 1980, tara: 510, netto: 1470, harga: 2400, status: 'Lunas' },
  { waktu: '08:12', petani: 'Bapak Suroto', telepon: '0812-5566-7788', plat: 'KB 1234 XY', peron: 'Peron 1', bruto: 2760, tara: 700, netto: 2060, harga: 2400, status: 'Lunas' },
  { waktu: '07:40', petani: 'Ibu Ningsih', telepon: '0813-6677-8899', plat: 'KB 7788 GH', peron: 'Peron 2', bruto: 3500, tara: 890, netto: 2610, harga: 2400, status: 'Belum Lunas' },
  { waktu: '07:15', petani: 'Pak Bambang', telepon: '0821-4455-6677', plat: 'KB 4455 IJ', peron: 'Peron 3', bruto: 2200, tara: 560, netto: 1640, harga: 2400, status: 'Lunas' },
  { waktu: '07:03', petani: 'Pak Yusuf', telepon: '0812-3344-5566', plat: 'KB 6677 KL', peron: 'Peron 1', bruto: 3980, tara: 1020, netto: 2960, harga: 2400, status: 'Lunas' },
]

const HUTANG_PETANI = [
  { petani: 'Pak Agus Salim', telepon: '0821-9988-7766', sisa: 4200000, tanggal: '18 Sep 2026', jatuhTempo: '25 Sep 2026', tone: 'bg-primary/10 text-primary' },
  { petani: 'Ibu Ningsih', telepon: '0813-6677-8899', sisa: 3150000, tanggal: '17 Sep 2026', jatuhTempo: '24 Sep 2026', tone: 'bg-sky-500/10 text-sky-600' },
  { petani: 'Pak Bambang', telepon: '0821-4455-6677', sisa: 2750000, tanggal: '16 Sep 2026', jatuhTempo: '23 Sep 2026', tone: 'bg-amber-500/10 text-amber-600' },
  { petani: 'Pak Mulyono', telepon: '0852-7788-9900', sisa: 1850000, tanggal: '15 Sep 2026', jatuhTempo: '22 Sep 2026', tone: 'bg-violet-500/10 text-violet-600' },
  { petani: 'Pak Slamet Riyadi', telepon: '0852-1122-3344', sisa: 1200000, tanggal: '14 Sep 2026', jatuhTempo: '21 Sep 2026', tone: 'bg-rose-500/10 text-rose-600' },
]

const HARGA_PERON = [
  { peron: 'Peron 1', harga: 2450, perubahan: 2 },
  { peron: 'Peron 2', harga: 2450, perubahan: 2 },
  { peron: 'Peron 3', harga: 2400, perubahan: 0 },
]

const DISTRIBUSI_NETTO = [
  { peron: 'Peron 1', kg: 4320, pct: 35, color: 'var(--color-chart-1)' },
  { peron: 'Peron 2', kg: 4200, pct: 34, color: 'var(--color-chart-3)' },
  { peron: 'Peron 3', kg: 3960, pct: 31, color: 'var(--color-chart-4)' },
]

const PERIODE_OPTIONS = ['Hari Ini', '7 Hari Terakhir', 'Bulan Ini']
const STATUS_FILTERS = ['Semua Status', 'Lunas', 'Belum Lunas']

const AVATAR_INITIAL_TONES = [
  'bg-primary/10 text-primary',
  'bg-sky-500/10 text-sky-600',
  'bg-amber-500/10 text-amber-600',
  'bg-violet-500/10 text-violet-600',
  'bg-rose-500/10 text-rose-600',
]

function notifyComingSoon(action: string, petani: string) {
  toast(`${action} — ${petani}`, {
    description: 'Fitur ini akan aktif setelah terhubung ke backend.',
  })
}

const FORM_DEFAULT = { petani: '', telepon: '', plat: '', peron: 'Peron 1', bruto: '', tara: '' }

export function PeronPage() {
  const [periode, setPeriode] = useState(PERIODE_OPTIONS[0])
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS[0])
  const [query, setQuery] = useState('')
  const [timbangan, setTimbangan] = useState(TIMBANGAN_INITIAL)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(FORM_DEFAULT)

  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const [demoOffline, setDemoOffline] = useState(false)
  const [pending, setPending] = useState<OfflineTimbangEntry[]>([])
  const effectiveOffline = demoOffline || !isOnline
  const wasOfflineRef = useRef(effectiveOffline)

  useEffect(() => {
    setPending(getQueue())
    function handleOnline() {
      setIsOnline(true)
    }
    function handleOffline() {
      setIsOnline(false)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (wasOfflineRef.current && !effectiveOffline) {
      syncPending()
    }
    wasOfflineRef.current = effectiveOffline
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveOffline])

  function syncPending() {
    const queue = getQueue()
    if (queue.length === 0) return
    setTimbangan((prev) => [
      ...queue.map((item) => ({
        waktu: item.waktu,
        petani: item.petani,
        telepon: item.telepon,
        plat: item.plat,
        peron: item.peron,
        bruto: item.bruto,
        tara: item.tara,
        netto: item.netto,
        harga: item.harga,
        status: item.status,
      })),
      ...prev,
    ])
    clearQueue()
    setPending([])
    toast.success(`${queue.length} transaksi berhasil disinkronkan ke server`, {
      description: 'Semua data yang tersimpan offline sudah masuk ke sistem.',
    })
  }

  function handleSubmitTimbang() {
    const bruto = Number(form.bruto)
    const tara = Number(form.tara)
    if (!form.petani || !form.telepon || !form.plat || !bruto || !tara) {
      toast.error('Lengkapi semua field terlebih dahulu')
      return
    }
    if (tara >= bruto) {
      toast.error('Tara harus lebih kecil dari bruto')
      return
    }
    const netto = bruto - tara
    const harga = HARGA_PERON.find((item) => item.peron === form.peron)?.harga ?? 2400
    const waktu = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    if (effectiveOffline) {
      const entry: OfflineTimbangEntry = {
        id: crypto.randomUUID(),
        waktu,
        petani: form.petani,
        telepon: form.telepon,
        plat: form.plat,
        peron: form.peron,
        bruto,
        tara,
        netto,
        harga,
        status: 'Belum Lunas',
        queuedAt: waktu,
      }
      const queue = addToQueue(entry)
      setPending(queue)
      toast('Tersimpan offline', {
        description: 'Transaksi akan otomatis disinkronkan begitu koneksi kembali online.',
        icon: <CloudOff className="size-4" />,
      })
    } else {
      setTimbangan((prev) => [
        { waktu, petani: form.petani, telepon: form.telepon, plat: form.plat, peron: form.peron, bruto, tara, netto, harga, status: 'Belum Lunas' },
        ...prev,
      ])
      toast.success('Transaksi tersimpan')
    }

    setForm(FORM_DEFAULT)
    setDialogOpen(false)
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return timbangan.filter((row) => {
      const matchesQuery = !q || row.petani.toLowerCase().includes(q) || row.plat.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'Semua Status' || row.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter, timbangan])

  const hargaRataRata = Math.round(HARGA_PERON.reduce((sum, item) => sum + item.harga, 0) / HARGA_PERON.length)

  const brutoPreview = Number(form.bruto) || 0
  const taraPreview = Number(form.tara) || 0
  const nettoPreview = Math.max(0, brutoPreview - taraPreview)
  const hargaPreview = HARGA_PERON.find((item) => item.peron === form.peron)?.harga ?? 2400
  const totalPreview = nettoPreview * hargaPreview

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Peron</h1>
          <p className="text-sm text-muted-foreground">
            Input timbang, data petani, dan harga TBS harian.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
            {effectiveOffline ? (
              <WifiOff className="size-4 shrink-0 text-amber-600" />
            ) : (
              <Wifi className="size-4 shrink-0 text-primary" />
            )}
            <span className="text-xs font-medium whitespace-nowrap text-muted-foreground">Mode Offline (Demo)</span>
            <Switch checked={demoOffline} onCheckedChange={setDemoOffline} size="sm" />
          </div>
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
            Input Timbang
          </Button>
        </div>
      </div>

      {pending.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-500/10 p-4 ring-1 ring-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
              <CloudOff className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{pending.length} transaksi menunggu sinkronisasi</span>
              <span className="text-xs text-muted-foreground">
                Tersimpan lokal di perangkat ini — otomatis terkirim saat koneksi online kembali.
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled={effectiveOffline} onClick={syncPending}>
            <RefreshCw className="size-3.5" />
            Sinkronkan Sekarang
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <ListFilter className="size-4 text-primary" />
            Transaksi Timbang Terbaru
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari petani atau kendaraan..."
                className="w-56 pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline"><Filter />Filter</Button>} />
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Status Pembayaran</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_FILTERS.map((option) => (
                  <DropdownMenuItem key={option} onClick={() => setStatusFilter(option)}>
                    {option}
                    {statusFilter === option && <Badge variant="secondary" className="ml-auto">Aktif</Badge>}
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
                <TableHead>Waktu</TableHead>
                <TableHead>Petani</TableHead>
                <TableHead>Kendaraan</TableHead>
                <TableHead>Peron</TableHead>
                <TableHead className="text-right">Bruto</TableHead>
                <TableHead className="text-right">Tara</TableHead>
                <TableHead className="text-right">Netto</TableHead>
                <TableHead className="text-right">Harga/kg</TableHead>
                <TableHead className="text-right">Total Bayar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada transaksi yang cocok dengan pencarian atau filter.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={`${row.plat}-${row.waktu}`}>
                    <TableCell className="text-muted-foreground">{row.waktu}</TableCell>
                    <TableCell className="font-medium">{row.petani}</TableCell>
                    <TableCell className="text-muted-foreground">{row.plat}</TableCell>
                    <TableCell className="text-muted-foreground">{row.peron}</TableCell>
                    <TableCell className="text-right">{row.bruto.toLocaleString('id-ID')} kg</TableCell>
                    <TableCell className="text-right">{row.tara.toLocaleString('id-ID')} kg</TableCell>
                    <TableCell className="text-right font-medium">{row.netto.toLocaleString('id-ID')} kg</TableCell>
                    <TableCell className="text-right">{rupiah(row.harga)}</TableCell>
                    <TableCell className="text-right font-medium">{rupiah(row.netto * row.harga)}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => notifyComingSoon('Lihat detail', row.petani)}>
                            <Eye />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => notifyComingSoon('Cetak nota', row.petani)}>
                            <Printer />
                            Cetak Nota
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-emerald-600 focus:text-emerald-600"
                            onClick={() =>
                              openWhatsApp(
                                row.telepon,
                                buildNotaMessage({
                                  petani: row.petani,
                                  tanggal: '20 September 2026',
                                  waktu: row.waktu,
                                  plat: row.plat,
                                  peron: row.peron,
                                  netto: row.netto,
                                  harga: row.harga,
                                  total: row.netto * row.harga,
                                  status: row.status,
                                }),
                              )
                            }
                          >
                            <MessageCircle />
                            Kirim Nota via WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => notifyComingSoon('Edit transaksi', row.petani)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => notifyComingSoon('Hapus transaksi', row.petani)}>
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
            <CardTitle>Hutang Petani</CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Lihat semua →
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {HUTANG_PETANI.map((item, index) => (
              <div key={item.petani} className="flex items-center justify-between gap-3 rounded-lg px-1.5 py-2 hover:bg-muted/60">
                <div className="flex items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarFallback className={AVATAR_INITIAL_TONES[index % AVATAR_INITIAL_TONES.length]}>
                      {initials(item.petani)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.petani}</span>
                    <span className="text-xs text-muted-foreground">Terakhir transaksi {item.tanggal}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold text-destructive">{rupiah(item.sisa)}</span>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                    onClick={() =>
                      openWhatsApp(
                        item.telepon,
                        buildReminderMessage({ nama: item.petani, sisa: item.sisa, jatuhTempo: item.jatuhTempo }),
                      )
                    }
                  >
                    <MessageCircle className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Harga TBS Hari Ini per Peron</CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Lihat detail →
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Peron</TableHead>
                  <TableHead className="text-right">Harga/kg</TableHead>
                  <TableHead className="text-right">Perubahan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HARGA_PERON.map((item) => (
                  <TableRow key={item.peron}>
                    <TableCell className="font-medium">{item.peron}</TableCell>
                    <TableCell className="text-right">{rupiah(item.harga)}</TableCell>
                    <TableCell className="text-right">
                      {item.perubahan === 0 ? (
                        <span className="text-muted-foreground">− 0%</span>
                      ) : (
                        <span className="text-primary">↑ +{item.perubahan}%</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3 ring-1 ring-primary/15">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-4.5" />
              </div>
              <div className="flex flex-1 items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Harga rata-rata hari ini</span>
                  <span className="text-lg font-semibold tracking-tight">{rupiah(hargaRataRata)} / kg</span>
                </div>
                <Badge variant="outline" className="border-transparent bg-primary/10 text-primary">
                  ↑ +1,7%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Netto per Peron</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative size-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DISTRIBUSI_NETTO}
                      dataKey="kg"
                      nameKey="peron"
                      innerRadius={38}
                      outerRadius={58}
                      paddingAngle={2}
                      stroke="var(--color-card)"
                      strokeWidth={2}
                    >
                      {DISTRIBUSI_NETTO.map((item) => (
                        <Cell key={item.peron} fill={item.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-semibold tracking-tight">12.480 kg</span>
                  <span className="text-[10px] text-muted-foreground">Total Hari Ini</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {DISTRIBUSI_NETTO.map((item) => (
                  <div key={item.peron} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.peron}
                    </span>
                    <span className="text-muted-foreground">
                      {item.kg.toLocaleString('id-ID')} kg · {item.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2.5 text-sm ring-1 ring-primary/15">
              <span className="size-2 shrink-0 rounded-full bg-primary" />
              <span className="font-medium">3 peron aktif</span>
              <span className="text-muted-foreground">· Semua peron beroperasi normal</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Input Timbang Baru</DialogTitle>
            <DialogDescription>
              Catat transaksi timbang TBS dari petani di peron.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {effectiveOffline && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 ring-1 ring-amber-500/20">
                <CloudOff className="size-4 shrink-0" />
                Sedang offline — transaksi akan disimpan lokal dan disinkronkan otomatis nanti.
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="form-petani">Nama Petani</Label>
                <Input
                  id="form-petani"
                  value={form.petani}
                  onChange={(event) => setForm((prev) => ({ ...prev, petani: event.target.value }))}
                  placeholder="Contoh: Pak Slamet"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-telepon">Nomor WhatsApp</Label>
                <Input
                  id="form-telepon"
                  value={form.telepon}
                  onChange={(event) => setForm((prev) => ({ ...prev, telepon: event.target.value }))}
                  placeholder="0812-3456-7890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-plat">Plat Kendaraan</Label>
                <Input
                  id="form-plat"
                  value={form.plat}
                  onChange={(event) => setForm((prev) => ({ ...prev, plat: event.target.value.toUpperCase() }))}
                  placeholder="KB 1234 XY"
                />
              </div>
              <div className="space-y-2">
                <Label>Peron</Label>
                <Select value={form.peron} onValueChange={(value) => value && setForm((prev) => ({ ...prev, peron: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HARGA_PERON.map((item) => (
                      <SelectItem key={item.peron} value={item.peron}>
                        {item.peron}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-bruto">Bruto (kg)</Label>
                <Input
                  id="form-bruto"
                  type="number"
                  inputMode="numeric"
                  value={form.bruto}
                  onChange={(event) => setForm((prev) => ({ ...prev, bruto: event.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-tara">Tara (kg)</Label>
                <Input
                  id="form-tara"
                  type="number"
                  inputMode="numeric"
                  value={form.tara}
                  onChange={(event) => setForm((prev) => ({ ...prev, tara: event.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/50 p-3 text-center">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Netto</span>
                <span className="text-sm font-semibold">{nettoPreview.toLocaleString('id-ID')} kg</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Harga/kg</span>
                <span className="text-sm font-semibold">{rupiah(hargaPreview)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Total Bayar</span>
                <span className="text-sm font-semibold text-primary">{rupiah(totalPreview)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmitTimbang}>
              {effectiveOffline ? <CloudOff /> : <CloudUpload />}
              Simpan Transaksi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
