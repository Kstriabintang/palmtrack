import { z } from 'zod'

export const profilSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.email('Email tidak valid'),
  telepon: z.string().min(9, 'Nomor telepon tidak valid'),
  lokasiKerja: z.string().min(1, 'Lokasi kerja wajib diisi'),
})

export type ProfilInput = z.infer<typeof profilSchema>

export const passwordSchema = z
  .object({
    passwordSaatIni: z.string().min(1, 'Wajib diisi'),
    passwordBaru: z.string().min(8, 'Password baru minimal 8 karakter'),
    konfirmasiPassword: z.string().min(1, 'Wajib diisi'),
  })
  .refine((data) => data.passwordBaru === data.konfirmasiPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['konfirmasiPassword'],
  })

export type PasswordInput = z.infer<typeof passwordSchema>
