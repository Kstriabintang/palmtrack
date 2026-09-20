import { BadgeCheck, BookMarked, BookOpen, CalendarDays, Layers, Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '@/components/stat-card'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ARTIKEL, KATEGORI, getKategori } from '@/routes/panduan/data'
import { cn } from '@/lib/utils'

const STATS = [
  { label: 'Total Artikel', value: String(ARTIKEL.length), hint: 'Panduan teknis budidaya', icon: BookOpen },
  { label: 'Kategori', value: String(KATEGORI.length), hint: 'Bibit, tanah, pupuk, hama, teknik', icon: Layers, tone: 'bg-sky-500/10 text-sky-600' },
  {
    label: 'Diperbarui Bulan Ini',
    value: String(ARTIKEL.filter((item) => item.updatedAtSort.startsWith('2026-09')).length),
    hint: 'September 2026',
    icon: CalendarDays,
    tone: 'bg-amber-500/10 text-amber-600',
  },
  { label: 'Sumber Konten', value: 'Tim PalmTrack', hint: 'Dikurasi & diverifikasi berkala', icon: BadgeCheck, tone: 'bg-violet-500/10 text-violet-600' },
]

export function PanduanPage() {
  const [query, setQuery] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState<string | null>(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...ARTIKEL]
      .filter((item) => {
        const matchesQuery = !q || item.judul.toLowerCase().includes(q) || item.ringkasan.toLowerCase().includes(q)
        const matchesKategori = !kategoriFilter || item.kategori === kategoriFilter
        return matchesQuery && matchesKategori
      })
      .sort((a, b) => (a.updatedAtSort < b.updatedAtSort ? 1 : -1))
  }, [query, kategoriFilter])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Panduan Budidaya</h1>
          <p className="text-sm text-muted-foreground">
            Kumpulan pengetahuan teknis budidaya sawit — bibit, tanah, pupuk, hama, dan teknik panen.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/5 py-1.5 pr-4 pl-1.5 ring-1 ring-primary/15">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-3.5" />
          </div>
          <span className="text-xs text-muted-foreground">
            Konten resmi, dikurasi &amp; diperbarui berkala oleh <span className="font-medium text-foreground">Tim PalmTrack</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari judul atau topik artikel..."
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setKategoriFilter(null)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              kategoriFilter === null
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:bg-muted',
            )}
          >
            Semua
          </button>
          {KATEGORI.map((item) => {
            const active = kategoriFilter === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setKategoriFilter(item.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  active ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:bg-muted',
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Tidak ada artikel yang cocok dengan pencarian atau filter.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((item) => {
            const kategori = getKategori(item.kategori)
            return (
              <Link key={item.slug} to={`/panduan/${item.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      {kategori && (
                        <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', kategori.tone)}>
                          <kategori.icon className="size-4.5" />
                        </div>
                      )}
                      {item.isBaru && (
                        <Badge variant="outline" className="border-transparent bg-primary/10 text-primary">
                          <BookMarked className="size-3" />
                          Terbaru
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5">
                      <span className="text-xs text-muted-foreground">{kategori?.label}</span>
                      <h3 className="font-semibold">{item.judul}</h3>
                      <p className="line-clamp-3 text-sm text-muted-foreground">{item.ringkasan}</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      Diperbarui {item.updatedAt}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
