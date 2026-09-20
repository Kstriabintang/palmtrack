import {
  Eye,
  Filter,
  HandCoins,
  ListFilter,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Pagination } from '@/components/pagination'
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

const STATS = [
  {
    label: 'Total Pekerja',
    value: '46 orang',
    hint: 'Aktif di 5 kebun',
    delta: '+5%',
    icon: Users,
    trend: [40, 41, 42, 43, 44, 45, 46],
    trendColor: 'var(--color-primary)',
  },
  {
    label: 'Hadir Hari Ini',
    value: '42 / 46',
    hint: '91% kehadiran',
    delta: '+3%',
    icon: UserCheck,
    trend: [88, 85, 90, 87, 93, 89, 91],
    trendColor: 'var(--color-primary)',
  },
  {
    label: 'Upah Harian Rata-rata',
    value: 'Rp 125.000',
    hint: 'Sesuai UMK Kalimantan Barat',
    delta: '+2%',
    icon: Wallet,
    tone: 'bg-amber-500/10 text-amber-600',
    trend: [120000, 120000, 122000, 122000, 125000, 125000, 125000],
    trendColor: 'var(--color-amber-500)',
  },
  {
    label: 'Gaji Bulan Ini',
    value: 'Rp 98,4 jt',
    hint: 'Siap dibayar 30 Sep 2026',
    delta: '+8%',
    icon: HandCoins,
    tone: 'bg-sky-500/10 text-sky-600',
    trend: [82, 85, 88, 90, 93, 96, 98.4],
    trendColor: 'var(--color-sky-500)',
  },
]

const BASE_PEKERJA = [
  { nama: 'Herman Wijaya', nik: '6171 08xx xx01', jabatan: 'Mandor', kebun: 'Kebun Sukamaju', upah: 150000, status: 'Aktif' },
  { nama: 'Yusuf Hidayat', nik: '6171 08xx xx02', jabatan: 'Mandor', kebun: 'Kebun Makmur Jaya', upah: 150000, status: 'Aktif' },
  { nama: 'Slamet Riyadi', nik: '6171 08xx xx03', jabatan: 'Pemanen', kebun: 'Kebun Tunas Lestari', upah: 125000, status: 'Aktif' },
  { nama: 'Bambang Sutrisno', nik: '6171 08xx xx04', jabatan: 'Mandor', kebun: 'Kebun Berkah Alam', upah: 150000, status: 'Aktif' },
  { nama: 'Dedi Kurniawan', nik: '6171 08xx xx05', jabatan: 'Pemanen', kebun: 'Kebun Sukamaju', upah: 125000, status: 'Aktif' },
  { nama: 'Ahmad Fauzi', nik: '6171 08xx xx06', jabatan: 'Pemanen', kebun: 'Kebun Sukamaju', upah: 125000, status: 'Aktif' },
  { nama: 'Joko Susanto', nik: '6171 08xx xx07', jabatan: 'Pemupukan', kebun: 'Kebun Makmur Jaya', upah: 120000, status: 'Aktif' },
  { nama: 'Rudi Hartono', nik: '6171 08xx xx08', jabatan: 'Pemanen', kebun: 'Kebun Harapan Sawit', upah: 125000, status: 'Nonaktif' },
  { nama: 'Wahyu Nugroho', nik: '6171 08xx xx09', jabatan: 'Pemanen', kebun: 'Kebun Harapan Sawit', upah: 125000, status: 'Aktif' },
  { nama: 'Eko Prasetyo', nik: '6171 08xx xx10', jabatan: 'Pemupukan', kebun: 'Kebun Berkah Alam', upah: 120000, status: 'Aktif' },
]

const FIRST_NAMES = [
  'Agus', 'Bayu', 'Candra', 'Dimas', 'Erwin', 'Fajar', 'Guntur', 'Hadi', 'Irfan', 'Junaidi',
  'Kurnia', 'Lukman', 'Made', 'Nanang', 'Oscar', 'Putra', 'Rizal', 'Sigit', 'Taufik', 'Umar',
  'Vino', 'Wawan', 'Yanto', 'Zaki', 'Arif', 'Budi', 'Cahyo', 'Deni', 'Edi', 'Firman',
  'Galih', 'Hendra', 'Iwan', 'Jefri', 'Komang', 'Lutfi',
]
const LAST_NAMES = ['Saputra', 'Gunawan', 'Setiawan', 'Pratama', 'Wibowo', 'Santoso', 'Pranoto', 'Maulana', 'Firmansyah', 'Ramadhan']
const KEBUN_LIST = ['Kebun Sukamaju', 'Kebun Makmur Jaya', 'Kebun Harapan Sawit', 'Kebun Tunas Lestari', 'Kebun Berkah Alam']
const JABATAN_CYCLE = ['Pemanen', 'Pemanen', 'Pemupukan', 'Pemanen']

const GENERATED_PEKERJA = FIRST_NAMES.map((first, i) => {
  const jabatan = JABATAN_CYCLE[i % JABATAN_CYCLE.length]
  return {
    nama: `${first} ${LAST_NAMES[i % LAST_NAMES.length]}`,
    nik: `6171 08xx xx${String(i + 11).padStart(2, '0')}`,
    jabatan,
    kebun: KEBUN_LIST[i % KEBUN_LIST.length],
    upah: jabatan === 'Pemupukan' ? 120000 : 125000,
    status: (i + 1) % 17 === 0 ? 'Nonaktif' : 'Aktif',
  }
})

const PEKERJA = [...BASE_PEKERJA, ...GENERATED_PEKERJA]

const ABSENSI = [
  { nama: 'Herman Wijaya', blok: 'Kebun Sukamaju', status: 'Hadir' },
  { nama: 'Joko Susanto', blok: 'Blok B1', status: 'Hadir' },
  { nama: 'Slamet Riyadi', blok: 'Blok D3', status: 'Hadir' },
  { nama: 'Rudi Hartono', blok: 'Blok C2', status: 'Alpha' },
  { nama: 'Dedi Kurniawan', blok: 'Blok A2', status: 'Hadir' },
  { nama: 'Wahyu Nugroho', blok: 'Blok C1', status: 'Hadir' },
  { nama: 'Ahmad Fauzi', blok: 'Blok A2', status: 'Izin' },
  { nama: 'Eko Prasetyo', blok: 'Blok E1', status: 'Hadir' },
]

const KEHADIRAN_KEBUN = [
  { kebun: 'Kebun Sukamaju', hadir: 9, total: 10 },
  { kebun: 'Kebun Makmur Jaya', hadir: 8, total: 9 },
  { kebun: 'Kebun Harapan Sawit', hadir: 7, total: 9 },
  { kebun: 'Kebun Tunas Lestari', hadir: 8, total: 8 },
  { kebun: 'Kebun Berkah Alam', hadir: 10, total: 10 },
]

const STATUS_FILTERS = ['Semua Status', 'Aktif', 'Nonaktif']
const PER_PAGE = 10

const AVATAR_TONES = [
  'bg-primary/10 text-primary',
  'bg-sky-500/10 text-sky-600',
  'bg-amber-500/10 text-amber-600',
  'bg-violet-500/10 text-violet-600',
  'bg-rose-500/10 text-rose-600',
]

function notifyComingSoon(action: string, nama: string) {
  toast(`${action} — ${nama}`, {
    description: 'Fitur ini akan aktif setelah terhubung ke backend.',
  })
}

export function PekerjaPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS[0])
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PEKERJA.filter((row) => {
      const matchesQuery =
        !q || row.nama.toLowerCase().includes(q) || row.nik.toLowerCase().includes(q) || row.kebun.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'Semua Status' || row.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const rows = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  function updateQuery(value: string) {
    setQuery(value)
    setPage(1)
  }

  function updateStatusFilter(value: string) {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pekerja</h1>
          <p className="text-sm text-muted-foreground">
            Data SDM, absensi harian, dan rekap gaji.
          </p>
        </div>
        <Button>
          <UserPlus />
          Tambah Pekerja
        </Button>
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
            Data Pekerja
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Cari nama, NIK, atau kebun..."
              className="w-56"
            />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline"><Filter />Filter</Button>} />
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Status Pekerja</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_FILTERS.map((option) => (
                  <DropdownMenuItem key={option} onClick={() => updateStatusFilter(option)}>
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
                <TableHead>Nama</TableHead>
                <TableHead>NIK</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Kebun</TableHead>
                <TableHead className="text-right">Upah Harian</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada pekerja yang cocok dengan pencarian atau filter.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.nik}>
                    <TableCell className="font-medium">{row.nama}</TableCell>
                    <TableCell className="text-muted-foreground">{row.nik}</TableCell>
                    <TableCell className="text-muted-foreground">{row.jabatan}</TableCell>
                    <TableCell className="text-muted-foreground">{row.kebun}</TableCell>
                    <TableCell className="text-right">{rupiah(row.upah)}</TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>} />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => notifyComingSoon('Lihat detail', row.nama)}>
                            <Eye />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => notifyComingSoon('Edit pekerja', row.nama)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => notifyComingSoon('Hapus pekerja', row.nama)}>
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
          <div className="flex items-center justify-between px-4 pt-4">
            <span className="text-xs text-muted-foreground">
              Menampilkan {rows.length} dari {filtered.length} pekerja
            </span>
            <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Absensi Hari Ini</CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Lihat semua →
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {ABSENSI.map((item, index) => (
              <div key={item.nama} className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-2 hover:bg-muted/60">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarFallback className={AVATAR_TONES[index % AVATAR_TONES.length]}>
                      {initials(item.nama)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{item.nama}</span>
                    <span className="truncate text-xs text-muted-foreground">{item.blok}</span>
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Kehadiran per Kebun</CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Lihat detail →
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {KEHADIRAN_KEBUN.map((item) => {
              const pct = Math.round((item.hadir / item.total) * 100)
              return (
                <div key={item.kebun} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.kebun}</span>
                    <span className="text-muted-foreground">{item.hadir}/{item.total} · {pct}%</span>
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
