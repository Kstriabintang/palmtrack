import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import palmtrackLogo from '@/assets/palmtrack-logo.png'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { type LoginInput, loginSchema } from '@/lib/validations/auth'
import { useAuthStore } from '@/stores/auth-store'
import type { User } from '@/types'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const mutation = useMutation({
    mutationFn: (data: LoginInput) =>
      api.post<{ user: User; token: string }>('/auth/login', data),
    onSuccess: ({ data }) => {
      setAuth(data.user, data.token)
      navigate('/')
    },
    onError: () => toast.error('Login gagal. Periksa kembali email dan password.'),
  })

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <img src={palmtrackLogo} alt="PalmTrack" className="mb-1 size-14 rounded-full" />
        <CardTitle>Masuk ke PalmTrack</CardTitle>
        <p className="text-sm text-muted-foreground">Manajemen sawit dari peron hingga laporan.</p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
