import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  CircleAlert,
  FileText,
  Home,
  LogOut,
  Search,
  Settings,
  Sprout,
  TreePalm,
  Truck,
  User,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import palmtrackLogo from '@/assets/palmtrack-logo.png'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { initials } from '@/lib/format'
import { clearLicense, isLicenseUsable } from '@/lib/license'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth-store'

const NAV_ITEMS = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'Peron', url: '/peron', icon: Truck },
  { title: 'Kebun', url: '/kebun', icon: Sprout },
  { title: 'Pekerja', url: '/pekerja', icon: Users },
  { title: 'Keuangan', url: '/keuangan', icon: Wallet },
  { title: 'Laporan', url: '/laporan', icon: FileText },
  { title: 'Panduan Budidaya', url: '/panduan', icon: BookOpen },
]

const BREADCRUMB_LABELS: Record<string, string> = {
  '/peron': 'Peron',
  '/kebun': 'Kebun',
  '/pekerja': 'Pekerja',
  '/keuangan': 'Keuangan',
  '/laporan': 'Laporan',
  '/panduan': 'Panduan Budidaya',
  '/pengaturan': 'Pengaturan',
}

const today = new Date().toLocaleDateString('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

interface NotificationItem {
  id: string
  icon: LucideIcon
  tone: string
  title: string
  description: string
  time: string
  unread: boolean
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    icon: Wallet,
    tone: 'bg-primary/10 text-primary',
    title: 'Pembayaran diterima',
    description: 'Setoran PKS Ambawang Rp 42.500.000 telah dikonfirmasi.',
    time: '10 menit lalu',
    unread: true,
  },
  {
    id: 'notif-2',
    icon: CircleAlert,
    tone: 'bg-destructive/10 text-destructive',
    title: 'Tunggakan jatuh tempo',
    description: 'Pak Agus Salim jatuh tempo 25 Sep 2026.',
    time: '2 jam lalu',
    unread: true,
  },
  {
    id: 'notif-3',
    icon: Sprout,
    tone: 'bg-sky-500/10 text-sky-600',
    title: 'Jadwal panen besok',
    description: 'Blok A3 dijadwalkan panen mulai pukul 07:00.',
    time: '5 jam lalu',
    unread: true,
  },
  {
    id: 'notif-4',
    icon: FileText,
    tone: 'bg-amber-500/10 text-amber-600',
    title: 'Laporan siap diunduh',
    description: 'Laporan bulanan Agustus 2026 telah tersedia.',
    time: 'Kemarin',
    unread: false,
  },
  {
    id: 'notif-5',
    icon: UserCheck,
    tone: 'bg-violet-500/10 text-violet-600',
    title: 'Pekerja baru ditambahkan',
    description: 'Data pekerja Eko Prasetyo berhasil disimpan.',
    time: '2 hari lalu',
    unread: false,
  },
]

export function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const searchRef = useRef<HTMLInputElement>(null)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const unreadCount = notifications.filter((item) => item.unread).length

  const displayName = user?.name ?? 'Ahmad Rizki'
  const displayRole = user ? user.role.replace('_', ' ') : 'Manajer Kebun'
  const currentLabel =
    BREADCRUMB_LABELS[pathname] ??
    Object.entries(BREADCRUMB_LABELS).find(([path]) => pathname.startsWith(`${path}/`))?.[1]

  const handleLogout = () => {
    logout()
    clearLicense()
    navigate('/login')
  }

  useEffect(() => {
    if (!isLicenseUsable()) {
      navigate('/login', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  function markAsRead(id: string) {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, unread: false } : item)))
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })))
    toast.success('Semua notifikasi ditandai sudah dibaca')
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <img src={palmtrackLogo} alt="PalmTrack" className="size-9 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold text-sidebar-foreground">
                PalmTrack
              </span>
              <span className="truncate text-xs text-sidebar-foreground/55">
                Manajemen Sawit
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="relative">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    item.url === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.url)

                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        size="lg"
                        isActive={isActive}
                        className="text-[0.9rem]"
                        render={<NavLink to={item.url} end={item.url === '/'} />}
                      >
                        <item.icon className="size-4.5" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-72 overflow-hidden opacity-[0.06] group-data-[collapsible=icon]:hidden"
          >
            <TreePalm className="absolute -bottom-10 -left-10 size-56 text-sidebar-foreground" strokeWidth={1} />
            <TreePalm className="absolute -bottom-6 left-28 size-40 text-sidebar-foreground" strokeWidth={1} />
          </div>
        </SidebarContent>

        <SidebarFooter className="gap-0">
          <SidebarSeparator className="mb-2" />
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <Avatar size="sm">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-medium text-sidebar-foreground">
                {displayName}
              </span>
              <span className="truncate text-xs text-sidebar-foreground/55 capitalize">
                {displayRole}
              </span>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<NavLink to="/pengaturan" />}>
                <Settings className="size-4.5" />
                <span>Pengaturan</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut className="size-4.5" />
                <span>Keluar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-card px-4">
          <SidebarTrigger />
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Cari kebun, blok, pekerja, atau laporan..."
              className="pl-9"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
              ⌘K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="relative flex size-8 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
                  >
                    <Bell className="size-4.5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1.5 size-1.5 rounded-full bg-destructive" />
                    )}
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-1.5 py-1">
                  <span className="text-sm font-medium">Notifikasi</span>
                  {unreadCount > 0 && (
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={markAllAsRead}>
                      <CheckCheck className="size-3.5" />
                      Tandai semua dibaca
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="flex max-h-80 flex-col overflow-y-auto">
                  {notifications.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className="items-start gap-2.5 py-2"
                      onClick={() => markAsRead(item.id)}
                    >
                      <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', item.tone)}>
                        <item.icon className="size-4" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="flex items-center gap-1.5 text-sm font-medium">
                          {item.title}
                          {item.unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                        </span>
                        <span className="text-xs text-wrap text-muted-foreground">{item.description}</span>
                        <span className="mt-0.5 text-xs text-muted-foreground/70">{item.time}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-center text-xs text-muted-foreground"
                  onClick={() => toast('Halaman notifikasi akan aktif setelah terhubung ke backend.')}
                >
                  Lihat semua notifikasi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="hidden items-center gap-1.5 text-sm text-muted-foreground capitalize sm:flex">
              <CalendarDays className="size-4" />
              {today}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 rounded-full outline-none">
                <Avatar size="sm">
                  <AvatarFallback>{initials(displayName)}</AvatarFallback>
                </Avatar>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex flex-col px-1.5 py-1">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-xs text-muted-foreground capitalize">{displayRole}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User />
                  Profil Saya
                </DropdownMenuItem>
                <DropdownMenuItem render={<NavLink to="/pengaturan" />}>
                  <Settings />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {currentLabel && (
          <div className="flex items-center gap-1.5 px-6 pt-4 text-sm text-muted-foreground">
            <NavLink to="/" className="hover:text-foreground">
              Dashboard
            </NavLink>
            <span>/</span>
            <span className="text-foreground">{currentLabel}</span>
          </div>
        )}
        <main className="flex-1 bg-background p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
