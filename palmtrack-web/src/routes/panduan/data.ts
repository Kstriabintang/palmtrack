import { Bug, FlaskConical, Mountain, Scissors, Sprout, type LucideIcon } from 'lucide-react'

export interface Kategori {
  id: string
  label: string
  icon: LucideIcon
  tone: string
}

export const KATEGORI: Kategori[] = [
  { id: 'bibit', label: 'Bibit & Varietas', icon: Sprout, tone: 'bg-primary/10 text-primary' },
  { id: 'tanah', label: 'Jenis Tanah & Lahan', icon: Mountain, tone: 'bg-amber-500/10 text-amber-600' },
  { id: 'pupuk', label: 'Pupuk & Nutrisi', icon: FlaskConical, tone: 'bg-sky-500/10 text-sky-600' },
  { id: 'hama', label: 'Hama & Penyakit', icon: Bug, tone: 'bg-destructive/10 text-destructive' },
  { id: 'teknik', label: 'Teknik Panen & Perawatan', icon: Scissors, tone: 'bg-violet-500/10 text-violet-600' },
]

export interface Artikel {
  slug: string
  judul: string
  kategori: string
  ringkasan: string
  updatedAt: string
  updatedAtSort: string
  isBaru: boolean
  penulis: string
  sections: { heading: string; body: string[]; list?: string[] }[]
  catatan?: string
}

export const ARTIKEL: Artikel[] = [
  {
    slug: 'sumber-bibit-bersertifikat',
    judul: 'Sumber Bibit Sawit Bersertifikat di Indonesia',
    kategori: 'bibit',
    ringkasan: 'Kenali produsen benih sawit unggul bersertifikat resmi sebelum melakukan replanting atau penanaman baru.',
    updatedAt: '18 September 2026',
    updatedAtSort: '2026-09-18',
    isBaru: true,
    penulis: 'Tim Agronomi PalmTrack',
    sections: [
      {
        heading: 'Kenapa Bibit Bersertifikat Penting',
        body: [
          'Bibit kelapa sawit yang tidak bersertifikat berisiko tinggi menghasilkan tanaman dengan produktivitas rendah dan tidak seragam, karena asal-usul indukannya tidak terjamin. Investasi di awal (bibit) menentukan hasil kebun selama 20-25 tahun ke depan, jadi jangan pernah kompromi di tahap ini.',
          'Bibit resmi juga dilengkapi dokumen legalitas yang penting untuk keperluan sertifikasi ISPO di kemudian hari.',
        ],
      },
      {
        heading: 'Sumber Benih Resmi yang Umum Digunakan',
        body: ['Beberapa produsen benih sawit bersertifikat yang sudah dikenal luas di Indonesia:'],
        list: [
          'PPKS (Pusat Penelitian Kelapa Sawit) Medan — lembaga riset resmi di bawah kementerian',
          'Socfindo',
          'Asian Agri (varietas Topaz)',
          'PT London Sumatra Indonesia (Lonsum)',
          'Dami Mas Sejahtera',
        ],
      },
      {
        heading: 'Tips Memilih Bibit',
        body: ['Selalu minta dan simpan sertifikat sumber benih dari penjual. Hindari membeli kecambah tanpa label resmi atau dari penjual yang tidak bisa menunjukkan asal indukan — harga murah biasanya berbanding lurus dengan risiko.'],
      },
    ],
    catatan: 'Rekomendasi varietas spesifik untuk kondisi tanah tiap blok akan dilengkapi di sini setelah evaluasi lapangan bersama PPL — bagian ini akan terus diperbarui.',
  },
  {
    slug: 'kesesuaian-lahan-sawit',
    judul: 'Kesesuaian Lahan untuk Tanaman Sawit',
    kategori: 'tanah',
    ringkasan: 'Panduan dasar menilai kesesuaian jenis tanah sebelum penanaman atau replanting blok baru.',
    updatedAt: '5 September 2026',
    updatedAtSort: '2026-09-05',
    isBaru: true,
    penulis: 'Tim Agronomi PalmTrack',
    sections: [
      {
        heading: 'Faktor Utama Kesesuaian Lahan',
        body: ['Sebelum menanam atau melakukan replanting, ada beberapa faktor tanah yang perlu dievaluasi:'],
        list: [
          'Tekstur dan struktur tanah (idealnya lempung berpasir, drainase baik)',
          'Kedalaman muka air tanah — hindari lahan yang terlalu tergenang',
          'Tingkat keasaman (pH) tanah, umumnya sawit tumbuh baik di pH 4–6',
          'Ketebalan lapisan gambut, jika lahan berupa gambut',
        ],
      },
      {
        heading: 'Jenis Tanah Umum di Kalimantan Barat',
        body: [
          'Wilayah operasional kita mencakup beberapa jenis tanah: tanah mineral mineral podsolik, tanah aluvial di dekat sungai, dan sebagian area gambut. Masing-masing punya pertimbangan berbeda — lahan gambut misalnya butuh manajemen tata air (water management) yang lebih ketat agar tidak terlalu kering di musim kemarau atau tergenang di musim hujan.',
        ],
      },
      {
        heading: 'Rekomendasi',
        body: ['Lakukan uji tanah sederhana (pH, tekstur) sebelum menentukan blok tanam baru, dan konsultasikan dengan Penyuluh Pertanian Lapangan (PPL) setempat untuk hasil yang lebih akurat.'],
      },
    ],
    catatan: 'Catatan kondisi tanah aktual per blok akan dilampirkan di sini setelah hasil uji lab masing-masing kebun tersedia.',
  },
  {
    slug: 'panduan-dasar-pemupukan',
    judul: 'Panduan Dasar Program Pemupukan Sawit',
    kategori: 'pupuk',
    ringkasan: 'Prinsip umum jadwal dan jenis pupuk berdasarkan umur tanaman — sesuaikan dosis dengan hasil analisis daun dan tanah.',
    updatedAt: '20 Agustus 2026',
    updatedAtSort: '2026-08-20',
    isBaru: false,
    penulis: 'Tim Agronomi PalmTrack',
    sections: [
      {
        heading: 'Unsur Hara Utama',
        body: ['Tanaman sawit membutuhkan unsur hara makro (Nitrogen, Fosfor, Kalium, Magnesium) dan mikro (Boron, dll) dalam proporsi yang berbeda tergantung fase pertumbuhannya — Tanaman Belum Menghasilkan (TBM) vs Tanaman Menghasilkan (TM).'],
      },
      {
        heading: 'Prinsip Umum Jadwal Pemupukan',
        body: [
          'Secara umum, pemupukan dilakukan 2-4 kali per tahun, dengan dosis dan komposisi yang berbeda antara fase TBM dan TM. Pemupukan pada musim yang terlalu kering atau terlalu basah sebaiknya dihindari karena penyerapan hara oleh akar menjadi tidak optimal.',
        ],
      },
      {
        heading: 'Pentingnya Analisis Daun (LSU)',
        body: [
          'Jangan menentukan dosis pupuk hanya berdasarkan kebiasaan atau perkiraan. Analisis daun (Leaf Sampling Unit) secara rutin memberikan data akurat tentang kekurangan/kelebihan unsur hara di tiap blok, sehingga pemupukan bisa lebih presisi dan efisien secara biaya.',
        ],
      },
    ],
    catatan: 'Tabel dosis pupuk per blok (kg/pohon/tahun) akan diisi di sini berdasarkan hasil analisis daun terbaru — jangan gunakan angka umum sebagai acuan pasti tanpa verifikasi lapangan.',
  },
  {
    slug: 'mengenal-ganoderma',
    judul: 'Mengenal Penyakit Ganoderma pada Sawit',
    kategori: 'hama',
    ringkasan: 'Penyakit busuk pangkal batang adalah salah satu ancaman paling merugikan di perkebunan sawit Indonesia — kenali gejala awal dan langkah pencegahannya.',
    updatedAt: '2 September 2026',
    updatedAtSort: '2026-09-02',
    isBaru: true,
    penulis: 'Tim Agronomi PalmTrack',
    sections: [
      {
        heading: 'Apa itu Ganoderma',
        body: ['Ganoderma boninense adalah jamur patogen penyebab utama penyakit Busuk Pangkal Batang (BPB), salah satu penyakit paling merusak pada tanaman sawit di Indonesia. Penyakit ini menyerang jaringan pembuluh di pangkal batang dan dapat menyebabkan kematian pohon.'],
      },
      {
        heading: 'Gejala yang Perlu Diwaspadai',
        body: ['Kenali tanda-tanda awal berikut agar penanganan bisa dilakukan sedini mungkin:'],
        list: [
          'Daun tombak (daun muda) tidak membuka sempurna',
          'Daun-daun bagian bawah menguning kemudian layu',
          'Munculnya tubuh buah jamur (bracket) berwarna kecoklatan di pangkal batang',
          'Pertumbuhan tanaman tampak terhambat dibanding pohon sekitarnya',
        ],
      },
      {
        heading: 'Langkah Pencegahan Umum',
        body: [
          'Sanitasi kebun secara rutin, terutama membersihkan sisa tunggul dan bahan organik yang bisa menjadi sumber infeksi. Hindari melukai akar atau pangkal batang saat perawatan. Lakukan pemeriksaan blok secara berkala agar pohon terinfeksi bisa segera diisolasi sebelum menular ke pohon sekitarnya.',
        ],
      },
    ],
    catatan: 'Peta sebaran blok yang pernah terindikasi Ganoderma dan riwayat penanganannya akan dicatat di sini agar mudah dipantau dari waktu ke waktu.',
  },
  {
    slug: 'standar-kematangan-panen',
    judul: 'Standar Kematangan Panen TBS (Tandan Buah Segar)',
    kategori: 'teknik',
    ringkasan: 'Memanen di waktu yang tepat menentukan kualitas dan rendemen minyak — kenali ciri kematangan optimal sebelum tandan dipotong.',
    updatedAt: '15 Agustus 2026',
    updatedAtSort: '2026-08-15',
    isBaru: false,
    penulis: 'Tim Agronomi PalmTrack',
    sections: [
      {
        heading: 'Fraksi Kematangan TBS',
        body: [
          'Industri sawit menggunakan sistem fraksi (0–5) untuk menilai tingkat kematangan tandan berdasarkan jumlah brondolan yang lepas secara alami. Fraksi 0 berarti belum matang (belum ada brondolan lepas), sedangkan fraksi 5 berarti terlalu matang (lewat masak). Fraksi 1–3 umumnya dianggap sebagai standar mutu panen yang ideal untuk diterima di PKS.',
        ],
      },
      {
        heading: 'Ciri Visual Kematangan Optimal',
        body: ['Panen sebaiknya dilakukan saat tandan menunjukkan tanda-tanda berikut:'],
        list: [
          'Terdapat brondolan lepas alami di piringan (minimal 5-10 butir per tandan)',
          'Warna kulit buah berubah dari hitam kehijauan menjadi jingga kemerahan',
          'Tandan mulai mengeluarkan aroma khas matang',
        ],
      },
      {
        heading: 'Rotasi Panen',
        body: ['Rotasi panen ideal umumnya berkisar 7–10 hari sekali per blok, disesuaikan dengan kondisi musim dan kepadatan buah matang. Rotasi yang terlalu jarang berisiko meningkatkan buah lewat masak (fraksi tinggi) yang menurunkan rendemen minyak.'],
      },
    ],
    catatan: 'Jadwal rotasi panen aktual per blok bisa dilihat di modul Kebun → Jadwal Panen.',
  },
]

export function getKategori(id: string) {
  return KATEGORI.find((item) => item.id === id)
}
