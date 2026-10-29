import { Article, SDGClassification, ValidationRecord, AuditLog } from '../types';

export const DEMO_LABEL = 'DEMO—BUKAN DATA RIIL UNY';

// Simple deterministic string hasher for deduplication and content hashing
export function generateContentHash(title: string, bodyText: string): string {
  let hash = 0;
  const str = `${title.trim()}|${bodyText.trim()}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'sha256_' + Math.abs(hash).toString(16).padStart(8, '0');
}

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'uny-art-001',
    title: '[DEMO] UNY Berdayakan Desa Tertinggal di Gunungkidul Melalui Pelatihan Wirausaha Jamur Tiram',
    author: 'Tim Humas & LPPM UNY',
    publishedAt: '2026-09-15',
    unitId: 'LPPM',
    category: 'Pengabdian Masyarakat',
    bodyText: 'Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM) Universitas Negeri Yogyakarta menerjunkan tim dosen dan mahasiswa dalam program pemberdayaan ekonomi masyarakat rentan di kawasan Gunungkidul. Melalui pelatihan budidaya jamur tiram dan pembuatan kemasan modern, kelompok keluarga pra-sejahtera binaan berhasil meningkatkan pendapatan rumah tangga hingga 40%.',
    sourceUrl: 'https://www.uny.ac.id/berita/pemberdayaan-desa-gunungkidul-jamur-tiram',
    fetchedAt: '2026-09-15T10:30:00Z',
    contentHash: generateContentHash(
      '[DEMO] UNY Berdayakan Desa Tertinggal di Gunungkidul Melalui Pelatihan Wirausaha Jamur Tiram',
      'LPPM UNY menerjunkan tim dosen...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-002',
    title: '[DEMO] Tim Garuda UNY Rancang Mobil Listrik Hemat Energi Bertenaga Surya untuk Kompetisi Dunia',
    author: 'Humas FT UNY',
    publishedAt: '2026-09-22',
    unitId: 'FT',
    category: 'Inovasi Teknologi',
    bodyText: 'Fakultas Teknik UNY meluncurkan prototipe terbaru mobil listrik bertenaga surya karya mahasiswa Garuda UNY Team. Kendaraan ini menggunakan material serat karbon ringan dengan efisiensi panel surya 24.5%, siap mewakili Indonesia di ajang World Solar Challenge. Rektor mengapresiasi terobosan riset energi bersih ini.',
    sourceUrl: 'https://www.uny.ac.id/berita/garuda-uny-mobil-listrik-surya-wsc',
    fetchedAt: '2026-09-22T14:15:00Z',
    contentHash: generateContentHash(
      '[DEMO] Tim Garuda UNY Rancang Mobil Listrik Hemat Energi Bertenaga Surya untuk Kompetisi Dunia',
      'Fakultas Teknik UNY meluncurkan prototipe terbaru...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-003',
    title: '[DEMO] FIPP UNY Gandeng Kemendikdasmen Latih 500 Guru Sekolah Dasar Inklusi se-Jawa Tengah',
    author: 'Subbag Kerja Sama FIPP',
    publishedAt: '2026-09-28',
    unitId: 'FIPP',
    category: 'Pendidikan',
    bodyText: 'Fakultas Ilmu Pendidikan dan Psikologi (FIPP) UNY menyelenggarakan lokakarya nasional strategi pembelajaran berdiferensiasi bagi 500 guru SD inklusi. Pelatihan berfokus pada penyusunan modul ajar adaptif bagi peserta didik berkebutuhan khusus agar memiliki hak dan kesempatan belajar setara di sekolah reguler.',
    sourceUrl: 'https://www.uny.ac.id/berita/fipp-uny-latih-500-guru-sd-inklusi',
    fetchedAt: '2026-09-28T09:00:00Z',
    contentHash: generateContentHash(
      '[DEMO] FIPP UNY Gandeng Kemendikdasmen Latih 500 Guru Sekolah Dasar Inklusi se-Jawa Tengah',
      'FIPP UNY menyelenggarakan lokakarya...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-004',
    title: '[DEMO] Cegah Stunting di Bantul, FIKK UNY Kembangkan Program Olahraga Balita dan Pemenuhan Gizi Protein Ikan',
    author: 'Departemen Promosi Kesehatan FIKK',
    publishedAt: '2026-10-02',
    unitId: 'FIKK',
    category: 'Kesehatan Masyarakat',
    bodyText: 'Dosen Fakultas Ilmu Keolahragaan dan Kesehatan (FIKK) UNY berkolaborasi dengan Puskesmas Kretek meluncurkan panduan stimulasi motorik balita dan menu makanan padat gizi berbahan dasar olahan lele lokal. Intervensi ini berhasil menurunkan angka risiko balita stunting di 3 desa percontohan.',
    sourceUrl: 'https://www.uny.ac.id/berita/fikk-cegah-stunting-olahraga-balita',
    fetchedAt: '2026-10-02T11:45:00Z',
    contentHash: generateContentHash(
      '[DEMO] Cegah Stunting di Bantul, FIKK UNY Kembangkan Program Olahraga Balita dan Pemenuhan Gizi Protein Ikan',
      'Dosen FIKK UNY berkolaborasi dengan Puskesmas...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-005',
    title: '[DEMO] Satgas PPKS UNY Luncurkan Kampanye Kampus Aman Bebas Kekerasan Berbasis Gender',
    author: 'Satgas PPKS & Humas',
    publishedAt: '2026-10-05',
    unitId: 'HUMAS',
    category: 'Tata Kelola Kampus',
    bodyText: 'Universitas Negeri Yogyakarta mempertegas komitmen zero-tolerance terhadap kekerasan seksual dengan meluncurkan kanal aduan digital terenkripsi dan rangkaian sosialisasi anti-perundungan gender di seluruh fakultas bagi 8.000 mahasiswa baru.',
    sourceUrl: 'https://www.uny.ac.id/berita/satgas-ppks-kampanye-kampus-aman-gender',
    fetchedAt: '2026-10-05T08:20:00Z',
    contentHash: generateContentHash(
      '[DEMO] Satgas PPKS UNY Luncurkan Kampanye Kampus Aman Bebas Kekerasan Berbasis Gender',
      'UNY mempertegas komitmen zero-tolerance...'
    ),
    sourceStatus: 'ACTIVE',
    isSensitive: true,
  },
  {
    id: 'uny-art-006',
    title: '[DEMO] FMIPA Kembangkan Sistem Filtrasi Air Hujan Cerdas untuk Kebutuhan Air Bersih Asrama Mahasiswa',
    author: 'Tim Laboratorium Kimia FMIPA',
    publishedAt: '2026-10-09',
    unitId: 'FMIPA',
    category: 'Riset Lingkungan',
    bodyText: 'Peneliti FMIPA UNY berhasil menguji coba instalasi pemanen air hujan (rainwater harvesting) berbasis zeolit alam teraktivasi dan membran mikrofiltrasi. Sistem ini menyediakan pasokan air bersih higienis siap minum untuk 400 penghuni asrama kampus Karangmalang.',
    sourceUrl: 'https://www.uny.ac.id/berita/fmipa-filtrasi-air-hujan-cerdas-asrama',
    fetchedAt: '2026-10-09T13:10:00Z',
    contentHash: generateContentHash(
      '[DEMO] FMIPA Kembangkan Sistem Filtrasi Air Hujan Cerdas untuk Kebutuhan Air Bersih Asrama Mahasiswa',
      'Peneliti FMIPA UNY berhasil menguji coba...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-007',
    title: '[DEMO] Inkubator Bisnis FEB UNY Fasilitasi Sertifikasi Halal dan Ekspor Produk 45 UMKM Kuliner DIY',
    author: 'Pusat Kewirausahaan FEB',
    publishedAt: '2026-10-12',
    unitId: 'FEB',
    category: 'Ekonomi & Bisnis',
    bodyText: 'Fakultas Ekonomi dan Bisnis (FEB) UNY memberikan pendampingan intensif bagi 45 pelaku usaha mikro, kecil, dan menengah binaan. Program meliputi standardisasi manajemen keuangan digital, uji lab gizi pangan, dan sertifikasi halal gratis guna meningkatkan daya saing pasar internasional.',
    sourceUrl: 'https://www.uny.ac.id/berita/feb-fasilitasi-sertifikasi-halal-umkm',
    fetchedAt: '2026-10-12T16:00:00Z',
    contentHash: generateContentHash(
      '[DEMO] Inkubator Bisnis FEB UNY Fasilitasi Sertifikasi Halal dan Ekspor Produk 45 UMKM Kuliner DIY',
      'FEB UNY memberikan pendampingan intensif...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-008',
    title: '[DEMO] Fakultas Vokasi UNY Kampus Wates Resmikan Sentra Daur Ulang Plastik dan Pupuk Kompos Organik',
    author: 'Humas Fakultas Vokasi',
    publishedAt: '2026-10-15',
    unitId: 'FV',
    category: 'Pengelolaan Lingkungan',
    bodyText: 'Fakultas Vokasi UNY di Wates Kulon Progo mendirikan fasilitas pengelolaan sampah terpadu (TPS-3R). Fasilitas ini mengolah residu kantin menjadi kompos bernilai ekonomis serta mencacah limbah plastik botol untuk bahan baku filamen 3D printing mahasiswa teknik.',
    sourceUrl: 'https://www.uny.ac.id/berita/vokasi-uny-sentra-daur-ulang-sampah',
    fetchedAt: '2026-10-15T10:05:00Z',
    contentHash: generateContentHash(
      '[DEMO] Fakultas Vokasi UNY Kampus Wates Resmikan Sentra Daur Ulang Plastik dan Pupuk Kompos Organik',
      'Fakultas Vokasi mendirikan fasilitas TPS-3R...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-009',
    title: '[DEMO] Dosen Biologi FMIPA UNY Teliti Dampak Mikroplastik pada Ekosistem Pesisir Pantai Glagah',
    author: 'Kelompok Riset Kelautan FMIPA',
    publishedAt: '2026-10-18',
    unitId: 'FMIPA',
    category: 'Penelitian',
    bodyText: 'Riset multidisiplin FMIPA UNY memetakan sebaran mikroplastik pada biota kerang dan ikan di muara Sungai Serang dan Pantai Glagah Kulon Progo. Rekomendasi kebijakan konservasi diserahkan langsung kepada Dinas Lingkungan Hidup DIY.',
    sourceUrl: 'https://www.uny.ac.id/berita/fmipa-riset-mikroplastik-pantai-glagah',
    fetchedAt: '2026-10-18T14:40:00Z',
    contentHash: generateContentHash(
      '[DEMO] Dosen Biologi FMIPA UNY Teliti Dampak Mikroplastik pada Ekosistem Pesisir Pantai Glagah',
      'Riset multidisiplin FMIPA UNY memetakan...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-010',
    title: '[DEMO] Mahasiswa KKN UNY Tanam 2.000 Bibit Pohon Endemik di Lereng Gunung Merapi untuk Konservasi Air',
    author: 'LPPM - Pusat Pengabdian KKN',
    publishedAt: '2026-10-20',
    unitId: 'LPPM',
    category: 'Pengabdian Masyarakat',
    bodyText: 'Sebanyak 150 mahasiswa KKN UNY bersama warga Cangkringan Sleman menanam pohon bibit gayam dan beringin di kawasan tangkapan air hulu Merapi. Kegiatan ini bertujuan merestorasi ekosistem hutan lindung pasca erupsi dan menjaga debit mata air bersih desa.',
    sourceUrl: 'https://www.uny.ac.id/berita/kkn-uny-tanam-2000-pohon-merapi',
    fetchedAt: '2026-10-20T09:30:00Z',
    contentHash: generateContentHash(
      '[DEMO] Mahasiswa KKN UNY Tanam 2.000 Bibit Pohon Endemik di Lereng Gunung Merapi untuk Konservasi Air',
      'Mahasiswa KKN UNY menanam bibit pohon gayam...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-011',
    title: '[DEMO] FISHIPOL UNY Raih Predikat Zona Integritas Wilayah Bebas dari Korupsi (WBK) dari Kemenpan RB',
    author: 'Tim Reformasi Birokrasi FISHIPOL',
    publishedAt: '2026-10-22',
    unitId: 'FISHIPOL',
    category: 'Tata Kelola',
    bodyText: 'Fakultas Ilmu Sosial, Hukum, dan Ilmu Politik (FISHIPOL) UNY sukses mengimplementasikan sistem pelayanan terpadu berbasis digital, whistleblowing system transparan, serta audit akuntabilitas publik yang ketat.',
    sourceUrl: 'https://www.uny.ac.id/berita/fishipol-raih-predikat-wbk-kemenpanrb',
    fetchedAt: '2026-10-22T15:15:00Z',
    contentHash: generateContentHash(
      '[DEMO] FISHIPOL UNY Raih Predikat Zona Integritas Wilayah Bebas dari Korupsi (WBK) dari Kemenpan RB',
      'FISHIPOL UNY sukses mengimplementasikan...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-012',
    title: '[DEMO] UNY Perluas Kemitraan Strategis dengan University of Sydney untuk Program Riset SDGs Bersama',
    author: 'Kantor Urusan Internasional UNY',
    publishedAt: '2026-10-24',
    unitId: 'HUMAS',
    category: 'Kerja Sama Internasional',
    bodyText: 'Rektor UNY menandatangani Memorandum of Understanding (MoU) dengan delegasi University of Sydney Australia. Kerja sama mencakup pendanaan hibah riset bersama bidang energi terbarukan, pertukaran profesor, dan beasiswa master pendidikan sains.',
    sourceUrl: 'https://www.uny.ac.id/berita/uny-sydney-mou-riset-sdgs',
    fetchedAt: '2026-10-24T12:00:00Z',
    contentHash: generateContentHash(
      '[DEMO] UNY Perluas Kemitraan Strategis dengan University of Sydney untuk Program Riset SDGs Bersama',
      'Rektor UNY menandatangani MoU...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-013',
    title: '[DEMO] FBSB UNY Selenggarakan Festival Budaya Wayang Kulit Ramah Disabilitas dan Anak',
    author: 'Humas FBSB UNY',
    publishedAt: '2026-10-25',
    unitId: 'FBSB',
    category: 'Seni dan Budaya',
    bodyText: 'Fakultas Bahasa, Seni, dan Budaya (FBSB) menggelar pergelaran wayang kulit dengan penyedia juru bahasa isyarat (JBI) dan takarir layar langsung bagi penonton tunarungu. Acara juga menampilkan dalang cilik bertema perdamaian dan kerukunan.',
    sourceUrl: 'https://www.uny.ac.id/berita/fbsb-festival-wayang-inklusif-ramah-disabilitas',
    fetchedAt: '2026-10-25T17:30:00Z',
    contentHash: generateContentHash(
      '[DEMO] FBSB UNY Selenggarakan Festival Budaya Wayang Kulit Ramah Disabilitas dan Anak',
      'FBSB menggelar pergelaran wayang inklusif...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-014',
    title: '[DEMO] Inovasi Smart Greenhouse FT UNY Tingkatkan Panen Cabai Petani Lereng Merbabu saat Musim Kemarau Basah',
    author: 'Lab Otomasi Pertanian FT',
    publishedAt: '2026-10-26',
    unitId: 'FT',
    category: 'Teknologi Terapan',
    bodyText: 'Dosen Teknik Elektro UNY memasang greenhouse dengan sensor IoT pengatur kelembaban tanah dan mikroklimat otomatis di perkebunan cabai binaan. Hasil panen meningkat 35% dan bebas dari hama patek tanpa pestisida berlebih.',
    sourceUrl: 'https://www.uny.ac.id/berita/ft-smart-greenhouse-petani-cabai',
    fetchedAt: '2026-10-26T08:45:00Z',
    contentHash: generateContentHash(
      '[DEMO] Inovasi Smart Greenhouse FT UNY Tingkatkan Panen Cabai Petani Lereng Merbabu saat Musim Kemarau Basah',
      'Dosen Teknik Elektro memasang greenhouse...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-015',
    title: '[DEMO] Rektorat UNY Alokasikan 20% Kursi Mahasiswa Baru 2026 untuk Beasiswa KIP Kuliah Jalur 3T',
    author: 'Direktorat Akademik & Kemahasiswaan',
    publishedAt: '2026-10-27',
    unitId: 'HUMAS',
    category: 'Kebijakan Akademik',
    bodyText: 'UNY memastikan akses pendidikan tinggi yang inklusif dengan menambah kuota penerima beasiswa KIP Kuliah bagi putra-putri daerah terdepan, terluar, dan tertinggal (3T) serta santri berprestasi dari latar belakang prasejahtera.',
    sourceUrl: 'https://www.uny.ac.id/berita/uny-alokasikan-beasiswa-kip-kuliah-jalur-3t',
    fetchedAt: '2026-10-27T10:00:00Z',
    contentHash: generateContentHash(
      '[DEMO] Rektorat UNY Alokasikan 20% Kursi Mahasiswa Baru 2026 untuk Beasiswa KIP Kuliah Jalur 3T',
      'UNY memastikan akses pendidikan tinggi...'
    ),
    sourceStatus: 'ACTIVE',
  },
  {
    id: 'uny-art-016',
    title: '[DEMO] Pengaduan Pelanggaran Etika Akademik: Tim Pemeriksa Independen Bentuk Komite Ad-Hoc',
    author: 'Biro Hukum dan Tata Kelola UNY',
    publishedAt: '2026-10-27',
    unitId: 'HUMAS',
    category: 'Integritas Akademik',
    bodyText: 'Menanggapi laporan dugaan pelanggaran integritas penulisan jurnal, Senat Akademik membentuk komite etik independen untuk memeriksa seluruh dokumen secara transparan sesuai standar kode etik institusi.',
    sourceUrl: 'https://www.uny.ac.id/berita/pemeriksaan-etika-akademik-komite-adhoc',
    fetchedAt: '2026-10-27T14:00:00Z',
    contentHash: generateContentHash(
      '[DEMO] Pengaduan Pelanggaran Etika Akademik: Tim Pemeriksa Independen Bentuk Komite Ad-Hoc',
      'Senat Akademik membentuk komite...'
    ),
    sourceStatus: 'ACTIVE',
    isSensitive: true,
  },
];

export const INITIAL_CLASSIFICATIONS: SDGClassification[] = [
  // art-001 (LPPM - Jamur tiram Gunungkidul)
  {
    id: 'cls-001-a',
    articleId: 'uny-art-001',
    sdgNumber: 1, // Tanpa Kemiskinan
    confidenceScore: 0.94,
    rationale: 'Program secara langsung ditujukan untuk memberdayakan kelompok pra-sejahtera dan mendongkrak pendapatan keluarga.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-09-15T11:00:00Z',
  },
  {
    id: 'cls-001-b',
    articleId: 'uny-art-001',
    sdgNumber: 8, // Pekerjaan Layak & Pertumbuhan Ekonomi
    confidenceScore: 0.88,
    rationale: 'Menciptakan wirausaha desa mandiri dan peluang kerja produktif sektor agrobisnis lokal.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-09-15T11:00:00Z',
  },

  // art-002 (FT - Mobil Listrik Surya Garuda)
  {
    id: 'cls-002-a',
    articleId: 'uny-art-002',
    sdgNumber: 7, // Energi Bersih
    confidenceScore: 0.96,
    rationale: 'Inovasi memanfaatkan energi surya dan kendaraan listrik tanpa emisi karbon langsung.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-09-22T14:30:00Z',
  },
  {
    id: 'cls-002-b',
    articleId: 'uny-art-002',
    sdgNumber: 9, // Industri, Inovasi & Infrastruktur
    confidenceScore: 0.92,
    rationale: 'Pengembangan teknologi material komposit serat karbon dan efisiensi sistem tenaga listrik.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-09-22T14:30:00Z',
  },
  {
    id: 'cls-002-c',
    articleId: 'uny-art-002',
    sdgNumber: 13, // Penanganan Perubahan Iklim
    confidenceScore: 0.86,
    rationale: 'Kontribusi transisi teknologi dekarbonisasi transportasi untuk menekan emisi gas rumah kaca.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-09-22T14:30:00Z',
  },

  // art-003 (FIPP - Guru Inklusi)
  {
    id: 'cls-003-a',
    articleId: 'uny-art-003',
    sdgNumber: 4, // Pendidikan Berkualitas
    confidenceScore: 0.98,
    rationale: 'Pelatihan 500 guru untuk metode pengajaran inklusif dan peningkatan mutu pendidikan dasar.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-09-28T09:30:00Z',
  },
  {
    id: 'cls-003-b',
    articleId: 'uny-art-003',
    sdgNumber: 10, // Berkurangnya Kesenjangan
    confidenceScore: 0.91,
    rationale: 'Memastikan anak berkebutuhan khusus mendapatkan fasilitas dan perhatian setara di sekolah.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-09-28T09:30:00Z',
  },

  // art-004 (FIKK - Cegah Stunting)
  {
    id: 'cls-004-a',
    articleId: 'uny-art-004',
    sdgNumber: 2, // Tanpa Kelaparan / Gizi Baik
    confidenceScore: 0.92,
    rationale: 'Intervensi nutrisi protein ikan air tawar terbukti menurunkan prevalensi stunting balita.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-02T12:00:00Z',
  },
  {
    id: 'cls-004-b',
    articleId: 'uny-art-004',
    sdgNumber: 3, // Kehidupan Sehat & Sejahtera
    confidenceScore: 0.95,
    rationale: 'Stimulasi motorik olahraga dan penguatan kesehatan balita serta ibu hamil di posyandu.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-02T12:00:00Z',
  },

  // art-005 (HUMAS - PPKS Kampus Aman Gender)
  {
    id: 'cls-005-a',
    articleId: 'uny-art-005',
    sdgNumber: 5, // Kesetaraan Gender
    confidenceScore: 0.97,
    rationale: 'Pencegahan dan penanganan kekerasan seksual untuk lingkungan kampus yang adil gender.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-05T08:45:00Z',
    isSensitive: true,
  },
  {
    id: 'cls-005-b',
    articleId: 'uny-art-005',
    sdgNumber: 16, // Perdamaian, Keadilan & Kelembagaan Tangguh
    confidenceScore: 0.89,
    rationale: 'Penegakan tata kelola kampus yang aman, beretika, dan taat hukum.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-05T08:45:00Z',
    isSensitive: true,
  },

  // art-006 (FMIPA - Filtrasi Air Hujan)
  {
    id: 'cls-006-a',
    articleId: 'uny-art-006',
    sdgNumber: 6, // Air Bersih & Sanitasi
    confidenceScore: 0.96,
    rationale: 'Pemanfaatan rainwater harvesting dan teknologi membran zeolit untuk suplai air minum asrama.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-09T13:30:00Z',
  },
  {
    id: 'cls-006-b',
    articleId: 'uny-art-006',
    sdgNumber: 11, // Kota & Permukiman Berkelanjutan
    confidenceScore: 0.87,
    rationale: 'Infrastruktur kampus hijau yang efisien dalam mengelola sumber daya alam.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-09T13:30:00Z',
  },

  // art-007 (FEB - UMKM Halal & Ekspor)
  {
    id: 'cls-007-a',
    articleId: 'uny-art-007',
    sdgNumber: 8, // Pekerjaan Layak & Ekonomi
    confidenceScore: 0.93,
    rationale: 'Dukungan fasilitas UMKM untuk menjangkau pasar ekspor dan sertifikasi halal.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-12T16:30:00Z',
  },
  {
    id: 'cls-007-b',
    articleId: 'uny-art-007',
    sdgNumber: 9, // Industri & Inovasi
    confidenceScore: 0.81,
    rationale: 'Inkubasi bisnis kampus dan standardisasi mutu produk olahan makanan.',
    status: 'SUGGESTED', // Below threshold 0.85 -> in validation queue
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-12T16:30:00Z',
  },

  // art-008 (FV - TPS3R Daur Ulang)
  {
    id: 'cls-008-a',
    articleId: 'uny-art-008',
    sdgNumber: 12, // Konsumsi & Produksi Bertanggung Jawab
    confidenceScore: 0.95,
    rationale: 'Pengelolaan sampah 3R kampus terintegrasi, pembuatan kompos, dan daur ulang plastik botol.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-15T10:30:00Z',
  },
  {
    id: 'cls-008-b',
    articleId: 'uny-art-008',
    sdgNumber: 11, // Komunitas Berkelanjutan
    confidenceScore: 0.84,
    rationale: 'Lingkungan kampus hijau bebas sampah di area Wates Kulon Progo.',
    status: 'SUGGESTED', // below 0.85
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-15T10:30:00Z',
  },

  // art-009 (FMIPA - Mikroplastik Lautan Glagah)
  {
    id: 'cls-009-a',
    articleId: 'uny-art-009',
    sdgNumber: 14, // Ekosistem Lautan
    confidenceScore: 0.96,
    rationale: 'Penelitian kelautan langsung mengenai dampak pencemaran mikroplastik pada biota pesisir selatan.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-18T15:00:00Z',
  },

  // art-010 (LPPM - Tanam Pohon Merapi)
  {
    id: 'cls-010-a',
    articleId: 'uny-art-010',
    sdgNumber: 15, // Ekosistem Daratan
    confidenceScore: 0.96,
    rationale: 'Penanaman 2.000 pohon endemik untuk restorasi biodiversitas hutan lindung lereng Merapi.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'cls-010-b',
    articleId: 'uny-art-010',
    sdgNumber: 6, // Air Bersih
    confidenceScore: 0.88,
    rationale: 'Konservasi daerah tangkapan air guna memelihara kestabilan mata air warga.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-20T10:00:00Z',
  },

  // art-011 (FISHIPOL - WBK)
  {
    id: 'cls-011-a',
    articleId: 'uny-art-011',
    sdgNumber: 16, // Perdamaian, Keadilan & Kelembagaan Tangguh
    confidenceScore: 0.98,
    rationale: 'Pencapaian Zona Integritas Wilayah Bebas Korupsi memperkuat akuntabilitas institusi publik.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-22T15:30:00Z',
  },

  // art-012 (HUMAS - Kerja Sama Sydney)
  {
    id: 'cls-012-a',
    articleId: 'uny-art-012',
    sdgNumber: 17, // Kemitraan untuk Mencapai Tujuan
    confidenceScore: 0.98,
    rationale: 'Kemitraan internasional bilateral pendidikan tinggi untuk riset bersama tema SDGs.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-24T12:30:00Z',
  },

  // art-013 (FBSB - Wayang Inklusif Disabilitas)
  {
    id: 'cls-013-a',
    articleId: 'uny-art-013',
    sdgNumber: 10, // Berkurangnya Kesenjangan
    confidenceScore: 0.91,
    rationale: 'Menjamin aksesibilitas penonton disabilitas tunarungu terhadap pertunjukan seni tradisi.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-25T18:00:00Z',
  },
  {
    id: 'cls-013-b',
    articleId: 'uny-art-013',
    sdgNumber: 11, // Komunitas Berkelanjutan (Pelestarian Budaya)
    confidenceScore: 0.89,
    rationale: 'Pelestarian warisan budaya lokal wayang kulit secara berkelanjutan dan ramah anak.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-25T18:00:00Z',
  },

  // art-014 (FT - Smart Greenhouse)
  {
    id: 'cls-014-a',
    articleId: 'uny-art-014',
    sdgNumber: 2, // Tanpa Kelaparan
    confidenceScore: 0.90,
    rationale: 'Peningkatan produktivitas hasil tani cabai dan ketahanan pangan saat kemarau basah.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-26T09:00:00Z',
  },
  {
    id: 'cls-014-b',
    articleId: 'uny-art-014',
    sdgNumber: 9, // Industri & Inovasi
    confidenceScore: 0.88,
    rationale: 'Penerapan teknologi sensor IoT cerdas bagi petani hortikultura binaan.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-26T09:00:00Z',
  },

  // art-015 (HUMAS - Beasiswa 3T KIP)
  {
    id: 'cls-015-a',
    articleId: 'uny-art-015',
    sdgNumber: 1, // Tanpa Kemiskinan
    confidenceScore: 0.83, // Below 0.85 -> queue
    rationale: 'Bantuan pembiayaan pendidikan kuliah bagi mahasiswa keluarga tidak mampu.',
    status: 'SUGGESTED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-27T10:30:00Z',
  },
  {
    id: 'cls-015-b',
    articleId: 'uny-art-015',
    sdgNumber: 4, // Pendidikan Berkualitas
    confidenceScore: 0.92,
    rationale: 'Pemerataan kesempatan kuliah di perguruan tinggi negeri unggul.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-27T10:30:00Z',
  },
  {
    id: 'cls-015-c',
    articleId: 'uny-art-015',
    sdgNumber: 10, // Berkurangnya Kesenjangan
    confidenceScore: 0.95,
    rationale: 'Alokasi khusus 20% bagi putra-putri daerah 3T memangkas disparitas wilayah.',
    status: 'VERIFIED',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-27T10:30:00Z',
  },

  // art-016 (HUMAS - Isu Sensitif Etika Akademik)
  {
    id: 'cls-016-a',
    articleId: 'uny-art-016',
    sdgNumber: 16, // Perdamaian, Keadilan & Kelembagaan Tangguh
    confidenceScore: 0.79, // Sensitive & low score -> ESCALATED
    rationale: 'Pemeriksaan kepatuhan etik publikasi dan integritas kelembagaan pendidikan tinggi.',
    status: 'ESCALATED_NEEDS_REVIEW',
    modelName: 'gemini-3.8-flash',
    classifiedAt: '2026-10-27T14:30:00Z',
    isSensitive: true,
  },
];

export const INITIAL_VALIDATION_RECORDS: ValidationRecord[] = [
  {
    id: 'val-001',
    classificationId: 'cls-001-a',
    articleId: 'uny-art-001',
    reviewerId: 'usr-admin-1',
    reviewerName: 'Dedy Herdito (Admin Humas)',
    decision: 'APPROVE',
    previousLabels: [1, 8],
    finalLabels: [1, 8],
    note: 'Sesuai dengan dokumen LPPM UNY mengenai pemberdayaan desa binaan.',
    decidedAt: '2026-09-16T08:30:00Z',
  },
  {
    id: 'val-002',
    classificationId: 'cls-002-a',
    articleId: 'uny-art-002',
    reviewerId: 'usr-admin-1',
    reviewerName: 'Dedy Herdito (Admin Humas)',
    decision: 'APPROVE',
    previousLabels: [7, 9, 13],
    finalLabels: [7, 9, 13],
    note: 'Inovasi mobil surya Garuda memenuhi indikator SDG 7, 9, dan 13 secara valid.',
    decidedAt: '2026-09-23T09:00:00Z',
  },
  {
    id: 'val-003',
    classificationId: 'cls-003-a',
    articleId: 'uny-art-003',
    reviewerId: 'usr-admin-1',
    reviewerName: 'Dedy Herdito (Admin Humas)',
    decision: 'APPROVE',
    previousLabels: [4, 10],
    finalLabels: [4, 10],
    note: 'Data pelatihan guru inklusi cocok sebagai bukti THE Impact SDG 4.',
    decidedAt: '2026-09-29T10:15:00Z',
  },
  {
    id: 'val-004',
    classificationId: 'cls-004-a',
    articleId: 'uny-art-004',
    reviewerId: 'usr-admin-1',
    reviewerName: 'Dedy Herdito (Admin Humas)',
    decision: 'MODIFY',
    previousLabels: [3],
    finalLabels: [2, 3],
    note: 'Menambahkan SDG 2 (Tanpa Kelaparan/Gizi) karena fokus intervensi penurunan stunting balita.',
    decidedAt: '2026-10-03T11:00:00Z',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    actorType: 'SYSTEM',
    actorId: 'system',
    actorName: 'Inisialisasi Sistem',
    action: 'SYSTEM_BOOTSTRAP',
    entityType: 'CONFIG',
    entityId: 'config-default',
    timestamp: '2026-09-01T00:00:00Z',
    metadata: { threshold: 0.85, label: DEMO_LABEL },
  },
  {
    id: 'log-002',
    actorType: 'AGENT',
    actorId: 'gemini-3.8-flash',
    actorName: 'Agent Klasifikasi Gemini AI',
    action: 'AUTO_CLASSIFY_BATCH',
    entityType: 'ARTICLE',
    entityId: 'batch-2026-09',
    timestamp: '2026-09-15T11:00:00Z',
    metadata: { count: 3, model: 'gemini-3.8-flash' },
  },
  {
    id: 'log-003',
    actorType: 'USER',
    actorId: 'usr-admin-1',
    actorName: 'Dedy Herdito (Admin Humas)',
    action: 'VERIFY_ARTICLE',
    entityType: 'ARTICLE',
    entityId: 'uny-art-001',
    timestamp: '2026-09-16T08:30:00Z',
    metadata: { decision: 'APPROVE', labels: [1, 8] },
  },
  {
    id: 'log-004',
    actorType: 'USER',
    actorId: 'usr-admin-1',
    actorName: 'Dedy Herdito (Admin Humas)',
    action: 'MODIFY_CLASSIFICATION',
    entityType: 'ARTICLE',
    entityId: 'uny-art-004',
    timestamp: '2026-10-03T11:00:00Z',
    metadata: { decision: 'MODIFY', addedSdg: 2, note: 'Menambahkan SDG 2 intervensi stunting' },
  },
];
