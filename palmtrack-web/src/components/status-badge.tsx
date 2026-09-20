import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_TONE: Record<string, string> = {
  // positif / selesai
  Normal: 'bg-primary/10 text-primary',
  Baik: 'bg-primary/10 text-primary',
  'On Track': 'bg-primary/10 text-primary',
  Selesai: 'bg-primary/10 text-primary',
  Lunas: 'bg-primary/10 text-primary',
  Aktif: 'bg-primary/10 text-primary',
  Hadir: 'bg-primary/10 text-primary',
  Pemasukan: 'bg-primary/10 text-primary',
  'Siap Panen': 'bg-primary/10 text-primary',
  // info / terjadwal
  Terjadwal: 'bg-sky-500/10 text-sky-600',
  Diproses: 'bg-sky-500/10 text-sky-600',
  Replanting: 'bg-sky-500/10 text-sky-600',
  // peringatan
  'Perlu Perhatian': 'bg-amber-500/10 text-amber-600',
  'Perlu Persiapan': 'bg-amber-500/10 text-amber-600',
  'Belum Lunas': 'bg-amber-500/10 text-amber-600',
  'Belum Dibayar': 'bg-amber-500/10 text-amber-600',
  'Cicilan Berjalan': 'bg-amber-500/10 text-amber-600',
  Izin: 'bg-amber-500/10 text-amber-600',
  Maintenance: 'bg-amber-500/10 text-amber-600',
  // negatif
  Alpha: 'bg-destructive/10 text-destructive',
  Pengeluaran: 'bg-destructive/10 text-destructive',
  Jatuh_Tempo: 'bg-destructive/10 text-destructive',
  'Belum Aktif': 'bg-destructive/10 text-destructive',
  // netral
  Nonaktif: 'bg-muted text-muted-foreground',
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('border-transparent', STATUS_TONE[status] ?? 'bg-muted text-muted-foreground', className)}
    >
      {status}
    </Badge>
  )
}
