import { zodResolver } from '@hookform/resolvers/zod'
import {
  Activity,
  BadgeInfo,
  Bell,
  Bug,
  Camera,
  CalendarDays,
  CircleCheck,
  CircleUser,
  Database,
  Download,
  Eye,
  EyeOff,
  Globe,
  CalendarClock,
  HelpCircle,
  Info,
  KeyRound,
  Laptop,
  Lightbulb,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Monitor,
  MoreHorizontal,
  Phone,
  Save,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  TrendingUp,
  User,
  UserCog,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'
import { DonutSummary } from '@/components/donut-summary'
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
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { initials } from '@/lib/format'
import {
  activateLicense,
  autoFormatKeyInput,
  daysRemaining,
  getLicenseState,
  getStoredLicense,
  maskKey,
} from '@/lib/license'
import { type PasswordInput, passwordSchema, type ProfilInput, profilSchema } from '@/lib/validations/settings'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

interface ToggleItem {
  id: string
  icon: LucideIcon
  title: string
  description: string
  defaultChecked: boolean
}

const NOTIFICATION_ITEMS: ToggleItem[] = [
  {
    id: 'produksi',
    icon: Mail,
    title: 'Notifikasi Email',
    description: 'Ringkasan produksi dan transaksi peron harian.',
    defaultChecked: true,
  },
  {
    id: 'pembayaran',
    icon: MessageCircle,
    title: 'Notifikasi WhatsApp',
    description: 'Pembaruan pembayaran petani dan gaji pekerja.',
    defaultChecked: true,
  },
  {
    id: 'mingguan',
    icon: CalendarDays,
    title: 'Ringkasan Mingguan',
    description: 'Rekap performa kebun setiap Senin pagi.',
    defaultChecked: false,
  },
  {
    id: 'tunggakan',
    icon: TrendingUp,
    title: 'Peringatan Tunggakan',
    description: 'Notifikasi saat hutang petani mendekati jatuh tempo.',
    defaultChecked: true,
  },
]

const QUICK_PREFS: ToggleItem[] = [
  {
    id: 'quick-email',
    icon: Mail,
    title: 'Notifikasi Email',
    description: 'Terima notifikasi penting melalui email.',
    defaultChecked: true,
  },
  {
    id: 'mode-sederhana',
    icon: Monitor,
    title: 'Mode Sederhana',
    description: 'Tampilkan antarmuka dalam mode sederhana.',
    defaultChecked: false,
  },
]

const BAHASA_LABELS: Record<string, string> = {
  id: 'Indonesia',
  en: 'English',
}

const ZONA_WAKTU_LABELS: Record<string, string> = {
  wib: 'WIB (UTC+7)',
  wita: 'WITA (UTC+8)',
  wit: 'WIT (UTC+9)',
}

const ACTIVE_SESSIONS = [
  { id: 'session-1', device: 'MacBook Pro', icon: Laptop, location: 'Pekanbaru, Indonesia · Chrome on macOS', status: 'Sesi ini', online: true },
  { id: 'session-2', device: 'iPhone 13', icon: Smartphone, location: 'Indonesia · Safari on iOS', status: 'Aktif', online: true },
  { id: 'session-3', device: 'Chrome on macOS', icon: Monitor, location: 'Jakarta, Indonesia · Chrome on macOS', status: '2 jam yang lalu', online: false },
]

const HELP_LINKS = [
  { icon: HelpCircle, title: 'Pusat Bantuan', description: 'Panduan penggunaan dan pertanyaan umum.' },
  { icon: MessageSquare, title: 'Hubungi Dukungan', description: 'Chat langsung dengan tim PalmTrack.' },
  { icon: Bug, title: 'Laporkan Masalah', description: 'Beri tahu kami jika ada yang tidak berjalan semestinya.' },
]

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: Omit<ToggleItem, 'id' | 'defaultChecked'> & { checked: boolean; onCheckedChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={(value: boolean) => {
          onCheckedChange(value)
          toast.success(`${title} ${value ? 'diaktifkan' : 'dimatikan'}`)
        }}
      />
    </div>
  )
}

function InfoRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}

function PasswordField({
  id,
  label,
  registration,
  error,
}: {
  id: string
  label: string
  registration: UseFormRegisterReturn
  error?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type={visible ? 'text' : 'password'} className="pr-9" {...registration} />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

const STRENGTH_CRITERIA = [
  { key: 'length', label: 'Minimal 8 karakter', test: (value: string) => value.length >= 8 },
  { key: 'case', label: 'Huruf besar & kecil', test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { key: 'numberOrSymbol', label: 'Angka atau simbol', test: (value: string) => /[0-9]/.test(value) || /[^A-Za-z0-9]/.test(value) },
] as const

function PasswordStrengthMeter({ value }: { value: string }) {
  if (!value) return null

  const results = STRENGTH_CRITERIA.map((item) => item.test(value))
  const score = results.filter(Boolean).length
  const label = score <= 1 ? 'Lemah' : score === 2 ? 'Sedang' : 'Kuat'
  const barColor = score <= 1 ? 'bg-destructive' : score === 2 ? 'bg-amber-500' : 'bg-primary'
  const labelColor = score <= 1 ? 'text-destructive' : score === 2 ? 'text-amber-600' : 'text-primary'

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-2">
        <span className="text-xs whitespace-nowrap text-muted-foreground">Kekuatan Password</span>
        <div className="flex flex-1 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn('h-1.5 flex-1 rounded-full', i < score ? barColor : 'bg-muted')} />
          ))}
        </div>
        <span className={cn('text-xs font-medium whitespace-nowrap', labelColor)}>{label}</span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {STRENGTH_CRITERIA.map((item, index) => (
          <span
            key={item.key}
            className={cn('flex items-center gap-1 text-xs', results[index] ? 'text-primary' : 'text-muted-foreground')}
          >
            <CircleCheck className="size-3.5" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function comingSoon(subjek: string) {
  toast(subjek, { description: 'Fitur ini akan aktif setelah terhubung ke backend.' })
}

export function PengaturanPage() {
  const user = useAuthStore((state) => state.user)
  const displayName = user?.name ?? 'Ahmad Rizki'
  const displayRole = user ? user.role.replace('_', ' ') : 'Manajer Kebun'
  const [bahasa, setBahasa] = useState('id')
  const [zonaWaktu, setZonaWaktu] = useState('wib')
  const [license, setLicense] = useState(() => getStoredLicense())
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [keyError, setKeyError] = useState<string | null>(null)
  const licenseState = license ? getLicenseState() : 'none'
  const licenseDaysLeft = license ? daysRemaining(license) : 0

  function handlePerpanjangLisensi() {
    const result = activateLicense(newKey)
    if (!result.ok) {
      setKeyError(result.error)
      return
    }
    setLicense(result.license)
    setNewKey('')
    setKeyError(null)
    setLicenseDialogOpen(false)
    toast.success('Lisensi berhasil diperbarui', {
      description: `Berlaku hingga ${new Date(result.license.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
    })
  }

  const [notifChecked, setNotifChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_ITEMS.map((item) => [item.id, item.defaultChecked])),
  )
  const [quickChecked, setQuickChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(QUICK_PREFS.map((item) => [item.id, item.defaultChecked])),
  )

  const notifActiveCount = Object.values(notifChecked).filter(Boolean).length
  const notifTotal = NOTIFICATION_ITEMS.length
  const notifPct = Math.round((notifActiveCount / notifTotal) * 100)

  const profilForm = useForm<ProfilInput>({
    resolver: zodResolver(profilSchema),
    defaultValues: {
      nama: displayName,
      email: user?.email ?? 'ahmad.rizki@palmtrack.id',
      telepon: '0812-3456-7890',
      lokasiKerja: 'Kebun Sukamaju',
    },
  })

  const passwordForm = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { passwordSaatIni: '', passwordBaru: '', konfirmasiPassword: '' },
  })
  const passwordBaru = passwordForm.watch('passwordBaru')

  function onSaveProfil() {
    toast.success('Perubahan profil disimpan', {
      description: 'Fitur ini akan tersinkron ke server setelah terhubung ke backend.',
    })
  }

  function onCancelProfil() {
    profilForm.reset()
    toast('Perubahan dibatalkan')
  }

  function onUpdatePassword() {
    toast.success('Password berhasil divalidasi', {
      description: 'Fitur ini akan aktif setelah terhubung ke backend.',
    })
    passwordForm.reset()
  }

  function onResetNotif() {
    setNotifChecked(Object.fromEntries(NOTIFICATION_ITEMS.map((item) => [item.id, item.defaultChecked])))
    toast('Preferensi notifikasi direset ke default')
  }

  function onSaveNotif() {
    toast.success('Preferensi notifikasi disimpan')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Kelola profil akun, preferensi, dan pengaturan sistem.
        </p>
      </div>

      <Tabs defaultValue="profil">
        <TabsList>
          <TabsTrigger value="profil">
            <User className="size-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifikasi">
            <Bell className="size-4" />
            Notifikasi
          </TabsTrigger>
          <TabsTrigger value="keamanan">
            <ShieldCheck className="size-4" />
            Keamanan
          </TabsTrigger>
          <TabsTrigger value="sistem">
            <BadgeInfo className="size-4" />
            Sistem
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex flex-col gap-4 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    Foto Profil
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <Avatar className="size-16">
                      <AvatarFallback className="bg-primary/10 text-lg text-primary">
                        {initials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
                      <Camera className="size-3.5" />
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-transparent bg-primary/10 text-primary">
                        <span className="mr-1 size-1.5 rounded-full bg-primary" />
                        Foto aktif
                      </Badge>
                      <span className="text-xs text-muted-foreground">Format JPG atau PNG, maksimal 2MB.</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => comingSoon('Unggah foto')}>
                        <Camera />
                        Ganti Foto
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => comingSoon('Hapus foto')}
                      >
                        <Trash2 />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    Informasi Akun
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Informasi dasar akun Anda yang digunakan dalam sistem PalmTrack.
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Lengkap</Label>
                      <Input id="nama" {...profilForm.register('nama')} />
                      {profilForm.formState.errors.nama && (
                        <p className="text-sm text-destructive">{profilForm.formState.errors.nama.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="email" type="email" className="pl-8" {...profilForm.register('email')} />
                      </div>
                      {profilForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{profilForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telepon">Nomor Telepon</Label>
                      <Input id="telepon" {...profilForm.register('telepon')} />
                      {profilForm.formState.errors.telepon && (
                        <p className="text-sm text-destructive">{profilForm.formState.errors.telepon.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Jabatan</Label>
                      <div className="flex h-8 items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{displayRole}</Badge>
                        <span className="text-xs text-muted-foreground">Diatur oleh administrator</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="lokasiKerja">Lokasi Kerja</Label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input id="lokasiKerja" className="pl-8" {...profilForm.register('lokasiKerja')} />
                      </div>
                      {profilForm.formState.errors.lokasiKerja && (
                        <p className="text-sm text-destructive">{profilForm.formState.errors.lokasiKerja.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Bahasa</Label>
                      <Select value={bahasa} onValueChange={(value) => value && setBahasa(value)}>
                        <SelectTrigger className="w-full">
                          <Globe className="size-4 text-muted-foreground" />
                          <SelectValue>{(value: string) => BAHASA_LABELS[value]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="id">Indonesia</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Zona Waktu</Label>
                      <Select value={zonaWaktu} onValueChange={(value) => value && setZonaWaktu(value)}>
                        <SelectTrigger className="w-full">
                          <Smartphone className="size-4 text-muted-foreground" />
                          <SelectValue>{(value: string) => ZONA_WAKTU_LABELS[value]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wib">WIB (UTC+7)</SelectItem>
                          <SelectItem value="wita">WITA (UTC+8)</SelectItem>
                          <SelectItem value="wit">WIT (UTC+9)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="h-fit lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="size-4 text-primary" />
                  Status &amp; Preferensi
                </CardTitle>
                <p className="text-xs text-muted-foreground">Informasi status akun dan preferensi sistem.</p>
              </CardHeader>
              <CardContent className="flex flex-col">
                <div className="divide-y divide-border">
                  <InfoRow icon={CircleUser} label="Status Akun">
                    <StatusBadge status="Aktif" />
                  </InfoRow>
                  <InfoRow icon={CalendarDays} label="Terakhir diperbarui">
                    20 Sep 2026, 16:20
                  </InfoRow>
                  <InfoRow icon={ShieldAlert} label="Autentikasi Dua Faktor (2FA)">
                    <StatusBadge status="Belum Aktif" />
                  </InfoRow>
                  <InfoRow icon={UserCog} label="Role">
                    <span className="capitalize">{displayRole}</span>
                  </InfoRow>
                </div>
                <Separator className="my-2" />
                <div className="divide-y divide-border">
                  {QUICK_PREFS.map((item) => (
                    <ToggleRow
                      key={item.id}
                      {...item}
                      checked={quickChecked[item.id]}
                      onCheckedChange={(value) => setQuickChecked((prev) => ({ ...prev, [item.id]: value }))}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex gap-2">
              <Button type="button" onClick={profilForm.handleSubmit(onSaveProfil)}>
                <Save />
                Simpan Perubahan
              </Button>
              <Button type="button" variant="outline" onClick={onCancelProfil}>
                Batalkan
              </Button>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info className="size-3.5" />
              Perubahan akan segera diterapkan setelah disimpan.
            </span>
          </div>
        </TabsContent>

        <TabsContent value="notifikasi" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                Preferensi Notifikasi
              </CardTitle>
              <p className="text-xs text-muted-foreground">Atur jenis notifikasi yang ingin Anda terima dari PalmTrack.</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-0 px-0">
              <div className="divide-y divide-border px-6">
                {NOTIFICATION_ITEMS.map((item) => (
                  <ToggleRow
                    key={item.id}
                    {...item}
                    checked={notifChecked[item.id]}
                    onCheckedChange={(value) => setNotifChecked((prev) => ({ ...prev, [item.id]: value }))}
                  />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-primary/5 px-6 py-4">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Info className="size-3.5" />
                  Perubahan akan diterapkan otomatis ke akun Anda.
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onResetNotif}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={onSaveNotif}>
                    <Save />
                    Simpan Preferensi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="size-4 text-primary" />
                  Ringkasan Notifikasi
                </CardTitle>
                <p className="text-xs text-muted-foreground">Status notifikasi Anda saat ini.</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <DonutSummary
                  centerValue={`${notifActiveCount}/${notifTotal}`}
                  centerLabel=""
                  data={[
                    { label: 'Aktif', value: notifActiveCount, pct: notifPct, color: 'var(--color-primary)' },
                    { label: 'Nonaktif', value: notifTotal - notifActiveCount, pct: 100 - notifPct, color: 'var(--color-muted-foreground)' },
                  ]}
                />
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Notifikasi aktif</span>
                  <span className="font-semibold">{notifPct}%</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4 ring-1 ring-primary/15">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Tips</span>
                <span className="text-xs text-muted-foreground">
                  Aktifkan notifikasi untuk selalu mendapatkan informasi penting mengenai kebun Anda.
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="keamanan" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  Keamanan Akun
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Lindungi akun Anda dengan password yang kuat dan pengaturan keamanan tambahan.
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Lock className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Ubah Password</span>
                      <span className="text-xs text-muted-foreground">Gunakan password yang unik dan tidak mudah ditebak.</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <PasswordField
                      id="passwordSaatIni"
                      label="Password Saat Ini"
                      registration={passwordForm.register('passwordSaatIni')}
                      error={passwordForm.formState.errors.passwordSaatIni?.message}
                    />
                    <PasswordField
                      id="passwordBaru"
                      label="Password Baru"
                      registration={passwordForm.register('passwordBaru')}
                      error={passwordForm.formState.errors.passwordBaru?.message}
                    />
                    <PasswordStrengthMeter value={passwordBaru ?? ''} />
                    <PasswordField
                      id="konfirmasiPassword"
                      label="Konfirmasi Password Baru"
                      registration={passwordForm.register('konfirmasiPassword')}
                      error={passwordForm.formState.errors.konfirmasiPassword?.message}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="mb-1 flex items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">Verifikasi Tambahan</span>
                      <span className="text-xs text-muted-foreground">Tingkatkan keamanan akun Anda dengan verifikasi tambahan.</span>
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="flex items-start gap-2.5">
                        <Smartphone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">Autentikasi Dua Faktor (2FA)</span>
                          <span className="text-xs text-muted-foreground">Tambahkan lapisan keamanan ekstra pada akun Anda.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status="Belum Aktif" />
                        <Button variant="outline" size="sm" onClick={() => comingSoon('Aktifkan 2FA')}>
                          Aktifkan 2FA
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="flex items-start gap-2.5">
                        <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">Verifikasi Email</span>
                          <span className="text-xs text-muted-foreground">Email Anda telah diverifikasi dan aman.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-transparent bg-primary/10 text-primary">
                          <CircleCheck className="size-3" />
                          Terverifikasi
                        </Badge>
                        <span className="text-sm text-muted-foreground">ahmad.rizki@palmtrack.id</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="flex items-start gap-2.5">
                        <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">Nomor Pemulihan</span>
                          <span className="text-xs text-muted-foreground">Gunakan nomor ini untuk pemulihan akun jika diperlukan.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-transparent bg-primary/10 text-primary">
                          <CircleCheck className="size-3" />
                          Tersedia
                        </Badge>
                        <span className="text-sm text-muted-foreground">+62 812-3456-7890</span>
                        <Button variant="outline" size="sm" onClick={() => comingSoon('Ubah nomor pemulihan')}>
                          Ubah
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={passwordForm.handleSubmit(onUpdatePassword)}>
                    <KeyRound />
                    Perbarui Password
                  </Button>
                  <Button type="button" variant="outline" onClick={() => passwordForm.reset()}>
                    Batalkan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="size-4 text-primary" />
                  Ringkasan Keamanan
                </CardTitle>
                <p className="text-xs text-muted-foreground">Status keamanan akun Anda saat ini.</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-4 rounded-xl bg-primary/5 p-4">
                  <div className="relative size-20 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[{ value: 78 }, { value: 22 }]}
                          dataKey="value"
                          innerRadius={28}
                          outerRadius={38}
                          startAngle={90}
                          endAngle={-270}
                          stroke="none"
                        >
                          <Cell fill="var(--color-primary)" />
                          <Cell fill="var(--color-muted)" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <ShieldCheck className="size-4 text-primary" />
                      <span className="text-sm font-bold">78%</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Keamanan Baik</span>
                    <span className="text-xs text-muted-foreground">
                      Akun Anda terlindungi dengan baik. Aktifkan 2FA untuk keamanan maksimal.
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  <InfoRow icon={Lock} label="Password terakhir diubah">12 Sep 2026</InfoRow>
                  <InfoRow icon={CalendarDays} label="Login terakhir">Hari ini, 09:14</InfoRow>
                  <InfoRow icon={Monitor} label="Perangkat aktif">3 perangkat</InfoRow>
                  <InfoRow icon={ShieldAlert} label="Autentikasi Dua Faktor (2FA)">
                    <StatusBadge status="Belum Aktif" />
                  </InfoRow>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4 ring-1 ring-primary/15">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Tips Keamanan</span>
                    <span className="text-xs text-muted-foreground">
                      Aktifkan autentikasi dua faktor untuk melindungi akun Anda dari akses yang tidak sah.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="size-4 text-primary" />
                    Sesi Aktif
                  </CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">Daftar perangkat yang sedang login ke akun Anda.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => comingSoon('Kelola sesi')}>
                  Kelola sesi
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {ACTIVE_SESSIONS.map((session) => (
                  <div key={session.id} className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-2 hover:bg-muted/60">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <session.icon className="size-4" />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">{session.device}</span>
                        <span className="truncate text-xs text-muted-foreground">{session.location}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={cn('size-1.5 rounded-full', session.online ? 'bg-primary' : 'bg-muted-foreground')} />
                      {session.status === 'Sesi ini' ? (
                        <Badge variant="secondary" className="text-xs">{session.status}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">{session.status}</span>
                      )}
                      {session.status !== 'Sesi ini' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-3.5" /></Button>} />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem variant="destructive" onClick={() => comingSoon(`Keluar dari ${session.device}`)}>
                              Keluar dari perangkat ini
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sistem" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary" />
                Status Lisensi
              </CardTitle>
              {license && (
                <StatusBadge
                  status={
                    licenseState === 'active' ? 'Aktif' : licenseState === 'expiring' ? 'Perlu Perhatian' : 'Belum Aktif'
                  }
                />
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {license ? (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-0.5 rounded-lg bg-muted/50 p-3">
                      <span className="text-xs text-muted-foreground">Kunci Lisensi</span>
                      <span className="font-mono text-sm font-medium">{maskKey(license.key)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 rounded-lg bg-muted/50 p-3">
                      <span className="text-xs text-muted-foreground">Aktif Sejak</span>
                      <span className="text-sm font-medium">
                        {new Date(license.activatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 rounded-lg bg-muted/50 p-3">
                      <span className="text-xs text-muted-foreground">Berlaku Hingga</span>
                      <span className="text-sm font-medium">
                        {new Date(license.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-lg bg-primary/5 px-3 py-2.5 text-sm ring-1 ring-primary/15">
                    <CalendarClock className="size-4 shrink-0 text-primary" />
                    <span>
                      {licenseDaysLeft >= 0
                        ? `${licenseDaysLeft} hari lagi sebelum lisensi berakhir.`
                        : `Lisensi telah berakhir ${Math.abs(licenseDaysLeft)} hari lalu.`}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada lisensi aktif di perangkat ini.</p>
              )}
              <Button variant="outline" className="w-fit" onClick={() => setLicenseDialogOpen(true)}>
                <ShieldCheck />
                Perbarui / Ganti Lisensi
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeInfo className="size-4 text-primary" />
                Tentang Aplikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {[
                { label: 'Versi Aplikasi', value: 'v0.1.0 — Phase 1: Foundation & Peron' },
                { label: 'Dibangun dengan', value: 'React 19, Vite, Laravel 12, PostgreSQL' },
                { label: 'Terakhir Diperbarui', value: '20 September 2026' },
                { label: 'Lisensi', value: 'Proprietary — © 2026 Ksatria Bintang Samudra' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-right font-medium">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-4 text-primary" />
                Penyimpanan Data
              </CardTitle>
              <p className="text-xs text-muted-foreground">Kelola data dan cadangan aplikasi.</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Ruang penyimpanan terpakai</span>
                  <span className="text-muted-foreground">124 MB dari 1 GB</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: '12.4%' }} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => comingSoon('Ekspor data')}>
                  <Download />
                  Ekspor Data
                </Button>
                <Button variant="outline" onClick={() => comingSoon('Buat cadangan')}>
                  <Database />
                  Buat Cadangan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="size-4 text-primary" />
                Bantuan &amp; Dukungan
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {HELP_LINKS.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => comingSoon(item.title)}
                  className="flex w-full items-center gap-3 py-3 text-left hover:bg-muted/60"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-4" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={licenseDialogOpen} onOpenChange={setLicenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Perbarui Lisensi</DialogTitle>
            <DialogDescription>Masukkan kunci lisensi baru untuk memperpanjang atau mengganti aktivasi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-license-key">Kunci Lisensi</Label>
            <Input
              id="new-license-key"
              value={newKey}
              onChange={(event) => {
                setKeyError(null)
                setNewKey(autoFormatKeyInput(event.target.value))
              }}
              placeholder="PLMT-XXXX-XXXX-XXXX"
              className="font-mono tracking-wider uppercase"
              maxLength={19}
              autoComplete="off"
              spellCheck={false}
            />
            {keyError && <p className="text-sm text-destructive">{keyError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLicenseDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handlePerpanjangLisensi}>Aktifkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
