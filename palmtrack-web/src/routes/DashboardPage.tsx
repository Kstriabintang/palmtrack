import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Car,
  CircleAlert,
  Clock,
  Download,
  Plus,
  Sprout,
  Truck,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { StatCard } from '@/components/stat-card'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const STATS = [
  {
    label: 'Produksi Hari Ini',
    value: '12.480 kg',
    hint: '3 peron aktif menimbang',
    delta: '+8%',
    icon: BarChart3,
    tone: 'bg-primary/10 text-primary',
    trend: [5200, 9600, 6400, 11800, 10100, 15600, 12480],
    trendColor: 'var(--color-primary)',
  },
  {
    label: 'Pendapatan Bulan Ini',
    value: 'Rp 186,4 jt',
    hint: '+12% dari bulan lalu',
    delta: '+12%',
    icon: Wallet,
    tone: 'bg-amber-500/10 text-amber-600',
    trend: [142, 138, 151, 149, 163, 158, 171, 179, 186],
    trendColor: 'var(--color-amber-500)',
  },
  {
    label: 'Kebun Aktif',
    value: '5 kebun · 18 blok',
    hint: '142 Ha total luas tanam',
    icon: Sprout,
    tone: 'bg-primary/10 text-primary',
    trend: [14, 15, 16, 16, 17, 18, 18],
    trendColor: 'var(--color-primary)',
  },
  {
    label: 'Tunggakan Petani',
    value: 'Rp 12,3 jt',
    hint: '8 petani belum lunas',
    icon: CircleAlert,
    tone: 'bg-destructive/10 text-destructive',
    trend: [9.8, 10.5, 11.2, 10.8, 12.1, 11.6, 12.3],
    trendColor: 'var(--color-destructive)',
  },
]

const TREN_PRODUKSI = {
  '7 Hari': [
    { label: '14 Sep', kg: 5200 },
    { label: '15 Sep', kg: 9600 },
    { label: '16 Sep', kg: 6400 },
    { label: '17 Sep', kg: 11800 },
    { label: '18 Sep', kg: 10100 },
    { label: '19 Sep', kg: 15600 },
    { label: '20 Sep', kg: 12480 },
  ],
  '30 Hari': [
    { label: '22 Ags', kg: 8400 },
    { label: '27 Ags', kg: 9800 },
    { label: '1 Sep', kg: 7600 },
    { label: '6 Sep', kg: 11200 },
    { label: '11 Sep', kg: 10400 },
    { label: '16 Sep', kg: 13100 },
    { label: '20 Sep', kg: 12480 },
  ],
  '3 Bulan': [
    { label: 'Jul', kg: 9200 },
    { label: 'Ags', kg: 10600 },
    { label: 'Sep', kg: 12480 },
  ],
} as const

type Periode = keyof typeof TREN_PRODUKSI

const JADWAL_PANEN = [
  { blok: 'Blok A3', mandor: 'Pak Herman', tanggal: '21 Sep 2026', jam: '07:00', status: 'Terjadwal' },
  { blok: 'Blok C1', mandor: 'Pak Herman', tanggal: '21 Sep 2026', jam: '13:00', status: 'Terjadwal' },
  { blok: 'Blok B2', mandor: 'Pak Yusuf', tanggal: '20 Sep 2026', jam: '07:00', status: 'Selesai' },
  { blok: 'Blok D4', mandor: 'Pak Yusuf', tanggal: '19 Sep 2026', jam: '13:00', status: 'Selesai' },
]

const AKTIVITAS = [
  {
    title: 'Produksi tercatat',
    detail: 'Peron 1 · 2.340 kg TBS',
    time: '10:24',
    icon: BarChart3,
    dot: 'bg-primary',
  },
  {
    title: 'Pembayaran diterima',
    detail: 'Dari Bapak Suroto · Rp 2.500.000',
    time: '09:18',
    icon: Wallet,
    dot: 'bg-sky-500',
  },
  {
    title: 'Panen selesai',
    detail: 'Blok B2 · 2,1 ton (Pak Yusuf)',
    time: '08:45',
    icon: Sprout,
    dot: 'bg-primary',
  },
  {
    title: 'Pekerja masuk',
    detail: 'Slamet Riyadi · Kehadiran tercatat',
    time: '07:03',
    icon: UserCheck,
    dot: 'bg-muted-foreground',
  },
]

const STATUS_OPERASIONAL = [
  {
    label: 'Peron Aktif',
    value: '3 / 3',
    hint: 'Semua peron beroperasi',
    status: 'Normal',
    icon: Truck,
  },
  {
    label: 'Pekerja Hadir',
    value: '42 / 46',
    hint: '91% kehadiran',
    status: 'Baik',
    icon: Users,
  },
  {
    label: 'Panen Hari Ini',
    value: '6 blok',
    hint: 'Dari 18 blok total',
    status: 'On Track',
    icon: Sprout,
  },
  {
    label: 'Kendaraan Aktif',
    value: '4 / 5',
    hint: '1 kendaraan maintenance',
    status: 'Perlu Perhatian',
    icon: Car,
  },
]

export function DashboardPage() {
  const [periode, setPeriode] = useState<Periode>('7 Hari')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Pantau produksi, kebun, pembayaran, dan aktivitas operasional hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus />
            Catat Produksi
          </Button>
          <Button variant="outline">
            <Download />
            Download Laporan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tren Produksi</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Produksi TBS {periode.toLowerCase()} terakhir
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              {(Object.keys(TREN_PRODUKSI) as Periode[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriode(p)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors',
                    periode === p
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...TREN_PRODUKSI[periode]]} margin={{ left: 4, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id="produksiFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  ticks={[0, 5000, 10000, 15000, 20000]}
                  domain={[0, 20000]}
                  tickFormatter={(value: number) => value.toLocaleString('id-ID')}
                  className="text-xs fill-muted-foreground"
                />
                <Tooltip
                  formatter={(value) => [`${Number(value).toLocaleString('id-ID')} kg`, 'Produksi']}
                  contentStyle={{
                    borderRadius: 'var(--radius-md)',
                    borderColor: 'var(--color-border)',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="kg"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#produksiFill)"
                  dot={{ r: 4, fill: 'var(--color-primary)', stroke: 'var(--color-card)', strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Jadwal Panen Terdekat</CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Lihat Semua
              <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {JADWAL_PANEN.map((item) => (
              <div
                key={`${item.blok}-${item.jam}`}
                className="flex items-center gap-3 rounded-lg px-1.5 py-2.5 hover:bg-muted/60"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sprout className="size-4.5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{item.blok}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="size-3" />
                    {item.tanggal}
                    <Clock className="ml-1 size-3" />
                    {item.jam}
                  </span>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              Aktivitas Terbaru
            </CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Lihat Semua
              <ArrowRight className="size-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col">
              {AKTIVITAS.map((item, index) => (
                <li key={item.title + item.time} className="relative flex gap-3 pb-5 last:pb-0">
                  {index !== AKTIVITAS.length - 1 && (
                    <span className="absolute top-2.5 left-[7px] h-full w-px bg-border" />
                  )}
                  <span className={`relative z-10 mt-1.5 size-3.5 shrink-0 rounded-full ring-4 ring-card ${item.dot}`} />
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <item.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="flex min-w-0 flex-col">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="truncate text-xs text-muted-foreground">{item.detail}</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Status Operasional</CardTitle>
            <span className="text-xs text-muted-foreground">Terakhir diperbarui 10 menit yang lalu</span>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {STATUS_OPERASIONAL.map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-4.5" />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <span className="text-lg font-semibold tracking-tight">{item.value}</span>
                  <span className="text-xs text-muted-foreground">{item.hint}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
