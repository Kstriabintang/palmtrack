import { KeyRound, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import palmtrackLogo from '@/assets/palmtrack-logo.png'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  activateLicense,
  autoFormatKeyInput,
  DEMO_LICENSE_KEY,
  getLicenseState,
  getStoredLicense,
  isLicenseUsable,
} from '@/lib/license'

export function LoginPage() {
  const navigate = useNavigate()
  const [key, setKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isExpired] = useState(() => getLicenseState() === 'expired')

  useEffect(() => {
    if (isLicenseUsable()) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  function submit(rawKey: string) {
    const result = activateLicense(rawKey)
    if (!result.ok) {
      setError(result.error)
      return
    }
    toast.success('Lisensi berhasil diaktifkan', {
      description: 'Selamat datang kembali di PalmTrack.',
    })
    navigate('/', { replace: true })
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    submit(key)
  }

  const expiredLicense = isExpired ? getStoredLicense() : null

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <img src={palmtrackLogo} alt="PalmTrack" className="mb-1 size-14 rounded-full" />
        <CardTitle>Aktivasi PalmTrack</CardTitle>
        <p className="text-sm text-muted-foreground">
          Masukkan kunci lisensi untuk membuka manajemen sawit Anda.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isExpired && expiredLicense && (
          <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive ring-1 ring-destructive/20">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            <span>
              Lisensi <span className="font-medium">{expiredLicense.key}</span> telah berakhir pada{' '}
              {new Date(expiredLicense.expiresAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              . Masukkan kunci baru untuk melanjutkan.
            </span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="license-key">Kunci Lisensi</Label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="license-key"
                value={key}
                onChange={(event) => {
                  setError(null)
                  setKey(autoFormatKeyInput(event.target.value))
                }}
                placeholder="PLMT-XXXX-XXXX-XXXX"
                className="pl-9 font-mono tracking-wider uppercase"
                maxLength={19}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full">
            Aktifkan Lisensi
          </Button>
        </form>

        <div className="flex items-start gap-2.5 rounded-lg bg-primary/5 px-3 py-2.5 text-xs ring-1 ring-primary/15">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="flex flex-col gap-1.5">
            <span className="text-muted-foreground">
              Ini demo portofolio — coba PalmTrack tanpa perlu lisensi asli:
            </span>
            <button
              type="button"
              onClick={() => submit(DEMO_LICENSE_KEY)}
              className="w-fit rounded-md bg-card px-2 py-1 font-mono text-[13px] font-medium tracking-wide ring-1 ring-border transition-colors hover:bg-muted"
            >
              {DEMO_LICENSE_KEY}
              <span className="ml-2 text-primary">Pakai kunci ini →</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
