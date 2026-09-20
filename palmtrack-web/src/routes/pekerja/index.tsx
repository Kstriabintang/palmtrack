import {
  CalendarCheck,
  CheckCircle2,
  Eye,
  Filter,
  HandCoins,
  ListFilter,
  MoreHorizontal,
  Power,
  Trash2,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
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
import { rupiah } from '@/lib/format'

const JABATAN_OPTIONS = ['Pemanen', 'Perawatan Kebun', 'Pemupukan'] as const
const HARI_KERJA_PERIODE = 26
const PERIODE_AKTIF = 'September 2026'

interface Pekerja {
  id: string
  nama: string
  nik: string
  jabatan: (typeof JABATAN_OPTIONS)[number]
  telepon: string
  upahHarian: number
  tanggalMasuk: string
  status: 'Aktif' | 'Nonaktif'
}

interface GajiRecord {
  pekerjaId: string
  hariKerja: number
  statusBayar: 'Lunas' | 'Belum Dibayar'
}

const PEKERJA_INITIAL: Pekerja[] = [
  { id: 'pk-01', nama: 'Slamet Riyadi', nik: '6171080503880001', jabatan: 'Pemanen', telepon: '0852-1122-3344', upahHarian: 130000, tanggalMasuk: '12 Jan 2023', status: 'Aktif' },
  { id: 'pk-02', nama: 'Dedi Kurniawan', nik: '6171080711890002', jabatan: 'Pemanen', telepon: '0813-4455-1122', upahHarian: 130000, tanggalMasuk: '3 Mar 2023', status: 'Aktif' },
  { id: 'pk-03', nama: 'Ahmad Fauzi', nik: '6171081209910003', jabatan: 'Pemanen', telepon: '0821-7766-3344', upahHarian: 130000, tanggalMasuk: '20 Jun 2023', status: 'Aktif' },
  { id: 'pk-04', nama: 'Wahyu Nugroho', nik: '6171080204870004', jabatan: 'Pemanen', telepon: '0812-9900-1122', upahHarian: 130000, tanggalMasuk: '15 Sep 2023', status: 'Aktif' },
  { id: 'pk-05', nama: 'Rudi Hartono', nik: '6171081108920005', jabatan: 'Pemanen', telepon: '0853-2233-4455', upahHarian: 125000, tanggalMasuk: '2 Nov 2023', status: 'Nonaktif' },
  { id: 'pk-06', nama: 'Eko Prasetyo', nik: '6171080905940006', jabatan: 'Pemupukan', telepon: '0812-6677-8899', upahHarian: 120000, tanggalMasuk: '18 Jan 2024', status: 'Aktif' },
  { id: 'pk-07', nama: 'Joko Susanto', nik: '6171081207860007', jabatan: 'Pemupukan', telepon: '0821-3344-5566', upahHarian: 120000, tanggalMasuk: '9 Feb 2024', status: 'Aktif' },
  { id: 'pk-08', nama: 'Bayu Saputra', nik: '6171080602930008', jabatan: 'Perawatan Kebun', telepon: '0813-7788-9900', upahHarian: 115000, tanggalMasuk: '25 Apr 2024', status: 'Aktif' },
  { id: 'pk-09', nama: 'Candra Gunawan', nik: '6171081003950009', jabatan: 'Perawatan Kebun', telepon: '0852-4455-6677', upahHarian: 115000, tanggalMasuk: '30 Apr 2024', status: 'Aktif' },
  { id: 'pk-10', nama: 'Dimas Setiawan', nik: '6171080801890010', jabatan: 'Perawatan Kebun', telepon: '0821-5566-7788', upahHarian: 115000, tanggalMasuk: '14 Jun 2024', status: 'Aktif' },
  { id: 'pk-11', nama: 'Fajar Pratama', nik: '6171081405910011', jabatan: 'Pemanen', telepon: '0812-1122-3344', upahHarian: 130000, tanggalMasuk: '22 Jul 2024', status: 'Aktif' },
  { id: 'pk-12', nama: 'Guntur Wibowo', nik: '6171080309880012', jabatan: 'Pemanen', telepon: '0853-6677-8899', upahHarian: 130000, tanggalMasuk: '5 Ags 2024', status: 'Aktif' },
  { id: 'pk-13', nama: 'Hadi Santoso', nik: '6171081611930013', jabatan: 'Perawatan Kebun', telepon: '0813-8899-0011', upahHarian: 115000, tanggalMasuk: '19 Sep 2024', status: 'Aktif' },
  { id: 'pk-14', nama: 'Irfan Pranoto', nik: '6171080512900014', jabatan: 'Pemupukan', telepon: '0821-9900-1122', upahHarian: 120000, tanggalMasuk: '1 Nov 2024', status: 'Aktif' },
  { id: 'pk-15', nama: 'Junaidi Maulana', nik: '6171081707940015', jabatan: 'Pemanen', telepon: '0812-2233-4455', upahHarian: 130000, tanggalMasuk: '13 Des 2024', status: 'Aktif' },
  { id: 'pk-16', nama: 'Kurnia Firmansyah', nik: '6171080108920016', jabatan: 'Perawatan Kebun', telepon: '0853-3344-5566', upahHarian: 115000, tanggalMasuk: '27 Jan 2025', status: 'Aktif' },
  { id: 'pk-17', nama: 'Lukman Ramadhan', nik: '6171081910890017', jabatan: 'Pemanen', telepon: '0813-5566-7788', upahHarian: 130000, tanggalMasuk: '8 Mar 2025', status: 'Aktif' },
  { id: 'pk-18', nama: 'Made Saputra', nik: '6171080614950018', jabatan: 'Pemupukan', telepon: '0821-6677-8899', upahHarian: 120000, tanggalMasuk: '16 Mei 2025', status: 'Aktif' },
]

const GAJI_INITIAL: GajiRecord[] = [
  { pekerjaId: 'pk-01', hariKerja: 26, statusBayar: 'Lunas' },
  { pekerjaId: 'pk-02', hariKerja: 25, statusBayar: 'Lunas' },
  { pekerjaId: 'pk-03', hariKerja: 24, statusBayar: 'Belum Dibayar' },
  { pekerjaId: 'pk-04', hariKerja: 26, statusBayar: 'Belum Dibayar' },
  { pekerjaId: 'pk-06', hariKerja: 22, statusBayar: 'Belum Dibayar' },
  { pekerjaId: 'pk-07', hariKerja: 26, statusBayar: 'Lunas' },
  { pekerjaId: 'pk-08', hariKerja: 23, statusBayar: 'Belum Dibayar' },
  { pekerjaId: 'pk-09', hariKerja: 26, statusBayar: 'Belum Dibayar' },
  { pekerjaId: 'pk-10', hariKerja: 20, statusBayar: 'Belum Dibayar' },
  { pekerjaId: 'pk-11', hariKerja: 26, statusBayar: 'Lunas' },
  { pekerjaId: 'pk-12', hariKerja: 25, statusBayar: 'Belum Dibayar' },
  { pekerjaId: 'pk-13', hariKerja: 26, statusBayar: 'Belum Dibayar' },
  { pekerjaId: 'pk-14', hariKerja: 24, statusBayar: 'Belum Dibayar' },
  { pekerjaId: 'pk-15', hariKerja: 26, statusBayar: 'Belum Dibayar' },
  { pekerjaId: 'pk-16', hariKerja: 21, statusBayar: 'Belum Dibayar' },
  { pekerjaId: 'pk-17', hariKerja: 26, statusBayar: 'Belum Dibayar' },
  { pekerjaId: 'pk-18', hariKerja: 26, statusBayar: 'Belum Dibayar' },
]

const STATUS_FILTERS = ['Semua Status', 'Aktif', 'Nonaktif']

const FORM_DEFAULT = { nama: '', nik: '', jabatan: 'Pemanen' as Pekerja['jabatan'], telepon: '', upahHarian: '', tanggalMasuk: '' }

function notifyComingSoon(action: string, nama: string) {
  toast(`${action} — ${nama}`, {
    description: 'Fitur ini akan aktif setelah terhubung ke backend.',
  })
}

export function PekerjaPage() {
  const [pekerja, setPekerja] = useState<Pekerja[]>(PEKERJA_INITIAL)
  const [gaji, setGaji] = useState<GajiRecord[]>(GAJI_INITIAL)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS[0])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(FORM_DEFAULT)

  const pekerjaById = useMemo(() => new Map(pekerja.map((p) => [p.id, p])), [pekerja])

  const stats = useMemo(() => {
    const aktif = pekerja.filter((p) => p.status === 'Aktif')
    const nonaktif = pekerja.length - aktif.length
    const upahRataRata = aktif.length
      ? Math.round(aktif.reduce((sum, p) => sum + p.upahHarian, 0) / aktif.length)
      : 0

    let totalGaji = 0
    let belumDibayar = 0
    let jumlahBelumDibayar = 0
    for (const record of gaji) {
      const worker = pekerjaById.get(record.pekerjaId)
      if (!worker) continue
      const nominal = worker.upahHarian * record.hariKerja
      totalGaji += nominal
      if (record.statusBayar === 'Belum Dibayar') {
        belumDibayar += nominal
        jumlahBelumDibayar += 1
      }
    }

    return { totalPekerja: pekerja.length, aktif: aktif.length, nonaktif, upahRataRata, totalGaji, belumDibayar, jumlahBelumDibayar }
  }, [pekerja, gaji, pekerjaById])

  const filteredPekerja = useMemo(() => {
    const q = query.trim().toLowerCase()
    return pekerja.filter((row) => {
      const matchesQuery = !q || row.nama.toLowerCase().includes(q) || row.nik.includes(q)
      const matchesStatus = statusFilter === 'Semua Status' || row.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [pekerja, query, statusFilter])

  const gajiRows = useMemo(
    () =>
      gaji
        .map((record) => ({ record, worker: pekerjaById.get(record.pekerjaId) }))
        .filter((row): row is { record: GajiRecord; worker: Pekerja } => row.worker?.status === 'Aktif'),
    [gaji, pekerjaById],
  )

  function updateHariKerja(pekerjaId: string, value: number) {
    const clamped = Math.max(0, Math.min(HARI_KERJA_PERIODE, value))
    setGaji((prev) => prev.map((r) => (r.pekerjaId === pekerjaId ? { ...r, hariKerja: clamped } : r)))
  }

  function toggleStatusBayar(pekerjaId: string) {
    setGaji((prev) =>
      prev.map((r) =>
        r.pekerjaId === pekerjaId
          ? { ...r, statusBayar: r.statusBayar === 'Lunas' ? 'Belum Dibayar' : 'Lunas' }
          : r,
      ),
    )
    const worker = pekerjaById.get(pekerjaId)
    if (worker) toast.success(`Status gaji ${worker.nama} diperbarui`)
  }

  function toggleAktif(id: string) {
    setPekerja((prev) => prev.map((p) => (p.id === id ? { ...p, status: p.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : p)))
  }

  function hapusPekerja(id: string, nama: string) {
    setPekerja((prev) => prev.filter((p) => p.id !== id))
    setGaji((prev) => prev.filter((r) => r.pekerjaId !== id))
    toast.success(`${nama} dihapus dari daftar pekerja`)
  }

  function handleTambahPekerja() {
    const upah = Number(form.upahHarian)
    if (!form.nama || !form.telepon || !upah || !form.tanggalMasuk) {
      toast.error('Lengkapi semua field terlebih dahulu')
      return
    }
    const id = `pk-${crypto.randomUUID().slice(0, 8)}`
    const newWorker: Pekerja = {
      id,
      nama: form.nama,
      nik: form.nik || '—',
      jabatan: form.jabatan,
      telepon: form.telepon,
      upahHarian: upah,
      tanggalMasuk: form.tanggalMasuk,
      status: 'Aktif',
    }
    setPekerja((prev) => [newWorker, ...prev])
    setGaji((prev) => [{ pekerjaId: id, hariKerja: HARI_KERJA_PERIODE, statusBayar: 'Belum Dibayar' }, ...prev])
    toast.success('Pekerja ditambahkan', { description: `${newWorker.nama} masuk ke daftar pekerja aktif.` })
    setForm(FORM_DEFAULT)
    setDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pekerja</h1>
          <p className="text-sm text-muted-foreground">
            Daftar pekerja kebun dan rekap gaji bulanan.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus />
          Tambah Pekerja
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Pekerja"
          value={`${stats.totalPekerja} orang`}
          hint={`${stats.aktif} aktif · ${stats.nonaktif} nonaktif`}
          icon={Users}
        />
        <StatCard
          label="Upah Harian Rata-rata"
          value={rupiah(stats.upahRataRata)}
          hint="Dari pekerja berstatus aktif"
          icon={Wallet}
          tone="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          label={`Total Gaji ${PERIODE_AKTIF}`}
          value={rupiah(stats.totalGaji)}
          hint={`Berdasarkan hari kerja tercatat`}
          icon={HandCoins}
          tone="bg-sky-500/10 text-sky-600"
        />
        <StatCard
          label="Belum Dibayar"
          value={rupiah(stats.belumDibayar)}
          hint={`${stats.jumlahBelumDibayar} pekerja menunggu`}
          icon={CalendarCheck}
          tone="bg-destructive/10 text-destructive"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <ListFilter className="size-4 text-primary" />
            Daftar Pekerja
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama atau NIK..."
              className="w-56"
            />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline"><Filter />Filter</Button>} />
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Status Pekerja</DropdownMenuLabel>
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
                <TableHead>Nama</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Tanggal Masuk</TableHead>
                <TableHead className="text-right">Upah Harian</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPekerja.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada pekerja yang cocok dengan pencarian atau filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPekerja.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.nama}</TableCell>
                    <TableCell className="text-muted-foreground">{row.jabatan}</TableCell>
                    <TableCell className="text-muted-foreground">{row.telepon}</TableCell>
                    <TableCell className="text-muted-foreground">{row.tanggalMasuk}</TableCell>
                    <TableCell className="text-right">{rupiah(row.upahHarian)}</TableCell>
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
                          <DropdownMenuItem onClick={() => toggleAktif(row.id)}>
                            <Power />
                            {row.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => hapusPekerja(row.id, row.nama)}>
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

      <Card>
        <CardHeader className="flex flex-col gap-1">
          <CardTitle>Gaji &amp; Kehadiran — {PERIODE_AKTIF}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Isi jumlah hari kerja tiap pekerja (maks. {HARI_KERJA_PERIODE} hari periode ini). Kurangi jika pekerja tidak masuk — gaji dihitung otomatis.
          </p>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="text-right">Upah Harian</TableHead>
                <TableHead className="w-36 text-center">Hari Kerja</TableHead>
                <TableHead className="text-right">Total Gaji</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gajiRows.map(({ record, worker }) => (
                <TableRow key={record.pekerjaId}>
                  <TableCell className="font-medium">{worker.nama}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{rupiah(worker.upahHarian)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={HARI_KERJA_PERIODE}
                        value={record.hariKerja}
                        onChange={(event) => updateHariKerja(record.pekerjaId, Number(event.target.value))}
                        className="h-8 w-16 text-center"
                      />
                      <span className="text-xs text-muted-foreground">/ {HARI_KERJA_PERIODE}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {rupiah(worker.upahHarian * record.hariKerja)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={record.statusBayar} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={record.statusBayar === 'Lunas' ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => toggleStatusBayar(record.pekerjaId)}
                    >
                      <CheckCircle2 className="size-3.5" />
                      {record.statusBayar === 'Lunas' ? 'Batalkan' : 'Tandai Lunas'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pekerja</DialogTitle>
            <DialogDescription>Daftarkan pekerja baru secara manual ke dalam sistem.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="pk-nama">Nama Lengkap</Label>
              <Input
                id="pk-nama"
                value={form.nama}
                onChange={(event) => setForm((prev) => ({ ...prev, nama: event.target.value }))}
                placeholder="Contoh: Budi Santoso"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pk-telepon">Nomor Telepon</Label>
              <Input
                id="pk-telepon"
                value={form.telepon}
                onChange={(event) => setForm((prev) => ({ ...prev, telepon: event.target.value }))}
                placeholder="0812-3456-7890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pk-nik">NIK (opsional)</Label>
              <Input
                id="pk-nik"
                value={form.nik}
                onChange={(event) => setForm((prev) => ({ ...prev, nik: event.target.value }))}
                placeholder="16 digit NIK"
              />
            </div>
            <div className="space-y-2">
              <Label>Jabatan</Label>
              <Select
                value={form.jabatan}
                onValueChange={(value) => value && setForm((prev) => ({ ...prev, jabatan: value as Pekerja['jabatan'] }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JABATAN_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pk-upah">Upah Harian (Rp)</Label>
              <Input
                id="pk-upah"
                type="number"
                inputMode="numeric"
                value={form.upahHarian}
                onChange={(event) => setForm((prev) => ({ ...prev, upahHarian: event.target.value }))}
                placeholder="125000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pk-tanggal">Tanggal Masuk</Label>
              <Input
                id="pk-tanggal"
                value={form.tanggalMasuk}
                onChange={(event) => setForm((prev) => ({ ...prev, tanggalMasuk: event.target.value }))}
                placeholder="20 Sep 2026"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleTambahPekerja}>
              <UserPlus />
              Simpan Pekerja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
