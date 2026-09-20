import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardPage } from '@/routes/DashboardPage'
import { LoginPage } from '@/routes/auth/Login'
import { OnboardingPage } from '@/routes/auth/Onboarding'
import { KebunPage } from '@/routes/kebun'
import { KeuanganPage } from '@/routes/keuangan'
import { LaporanPage } from '@/routes/laporan'
import { PanduanPage } from '@/routes/panduan'
import { DetailArtikelPage } from '@/routes/panduan/DetailArtikel'
import { PekerjaPage } from '@/routes/pekerja'
import { PengaturanPage } from '@/routes/pengaturan'
import { PeronPage } from '@/routes/peron'

export const router = createBrowserRouter(
  [
    {
      element: <AuthLayout />,
      children: [
        { path: '/login', element: <LoginPage /> },
        { path: '/onboarding', element: <OnboardingPage /> },
      ],
    },
    {
      element: <AppLayout />,
      children: [
        { path: '/', element: <DashboardPage /> },
        { path: '/peron', element: <PeronPage /> },
        { path: '/kebun', element: <KebunPage /> },
        { path: '/pekerja', element: <PekerjaPage /> },
        { path: '/keuangan', element: <KeuanganPage /> },
        { path: '/laporan', element: <LaporanPage /> },
        { path: '/panduan', element: <PanduanPage /> },
        { path: '/panduan/:slug', element: <DetailArtikelPage /> },
        { path: '/pengaturan', element: <PengaturanPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
