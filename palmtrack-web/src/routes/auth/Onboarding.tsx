import { Sprout, Tractor } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import palmtrackLogo from '@/assets/palmtrack-logo.png'
import { isOnboarded, saveBusinessProfile } from '@/lib/business'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isDemoMode } from '@/lib/dummy-mode'
import { isLicenseUsable } from '@/lib/license'

export function OnboardingPage() {
  const navigate = useNavigate()
  const [namaUsaha, setNamaUsaha] = useState('')
  const [hargaTbs, setHargaTbs] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLicenseUsable()) {
      navigate('/login', { replace: true })
      return
    }
    if (isDemoMode() || isOnboarded()) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const harga = Number(hargaTbs)
    if (!namaUsaha.trim() || !harga) {
      setError('Lengkapi nama usaha dan harga TBS terlebih dahulu.')
      return
    }
    saveBusinessProfile({ namaUsaha: namaUsaha.trim(), hargaTbsAwal: harga })
    toast.success('PalmTrack siap dipakai', { description: `Selamat datang, ${namaUsaha.trim()}!` })
    navigate('/', { replace: true })
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <img src={palmtrackLogo} alt="PalmTrack" className="mb-1 size-14 rounded-full" />
        <CardTitle>Selamat Datang di PalmTrack</CardTitle>
        <p className="text-sm text-muted-foreground">
          Isi 2 info singkat ini untuk mulai — bisa diubah lagi kapan saja nanti.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="nama-usaha">Nama Usaha / Kebun</Label>
            <div className="relative">
              <Tractor className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="nama-usaha"
                value={namaUsaha}
                onChange={(event) => {
                  setError(null)
                  setNamaUsaha(event.target.value)
                }}
                placeholder="Contoh: Kebun Sawit Makmur Jaya"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="harga-tbs">Harga TBS Hari Ini (per kg)</Label>
            <div className="relative">
              <Sprout className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="harga-tbs"
                type="number"
                inputMode="numeric"
                value={hargaTbs}
                onChange={(event) => {
                  setError(null)
                  setHargaTbs(event.target.value)
                }}
                placeholder="2450"
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">Ini harga di Peron 1 — bisa diperbarui kapan saja dari halaman Peron.</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">
            Mulai Pakai PalmTrack
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
