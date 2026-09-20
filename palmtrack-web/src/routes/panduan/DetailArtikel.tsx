import { ArrowLeft, BadgeCheck, CalendarDays, Lightbulb } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ARTIKEL, getKategori } from '@/routes/panduan/data'
import { cn } from '@/lib/utils'

export function DetailArtikelPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const artikel = ARTIKEL.find((item) => item.slug === slug)

  if (!artikel) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Artikel tidak ditemukan.</p>
        <Button variant="outline" onClick={() => navigate('/panduan')}>
          <ArrowLeft />
          Kembali ke Panduan Budidaya
        </Button>
      </div>
    )
  }

  const kategori = getKategori(artikel.kategori)
  const terkait = ARTIKEL.filter((item) => item.kategori === artikel.kategori && item.slug !== artikel.slug).slice(0, 3)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link to="/panduan" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Kembali ke Panduan Budidaya
      </Link>

      <div className="flex flex-col gap-3">
        {kategori && (
          <Badge variant="outline" className={cn('w-fit border-transparent', kategori.tone)}>
            <kategori.icon className="size-3.5" />
            {kategori.label}
          </Badge>
        )}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{artikel.judul}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BadgeCheck className="size-4 text-primary" />
            {artikel.penulis}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            Diperbarui {artikel.updatedAt}
          </span>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6">
          {artikel.sections.map((section) => (
            <div key={section.heading} className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="flex flex-col gap-1.5 pl-1">
                  {section.list.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {artikel.catatan && (
            <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4 ring-1 ring-primary/15">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Akan terus diperbarui</span>
                <span className="text-sm text-muted-foreground">{artikel.catatan}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {terkait.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Artikel terkait</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {terkait.map((item) => (
              <Link key={item.slug} to={`/panduan/${item.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col gap-1">
                    <span className="line-clamp-2 text-sm font-medium">{item.judul}</span>
                    <span className="text-xs text-muted-foreground">Diperbarui {item.updatedAt}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
