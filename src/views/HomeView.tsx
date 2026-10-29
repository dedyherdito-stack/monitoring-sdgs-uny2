import React from 'react';
import { KPISummary, Article, SDGClassification, User } from '../types';
import { SDG_REFERENCES } from '../data/sdgReference';
import { SdgBadge } from '../components/SdgBadge';
import { DEMO_LABEL } from '../data/demoDataset';
import {
  FileText,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck,
  Scale,
  Sparkles,
} from 'lucide-react';

interface HomeViewProps {
  kpi: KPISummary;
  articles: Article[];
  classifications: SDGClassification[];
  currentUser: User;
  onNavigate: (tab: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  kpi,
  articles,
  classifications,
  currentUser,
  onNavigate,
}) => {
  // Pending review items
  const pendingItems = classifications.filter(
    (c) => c.status === 'SUGGESTED' || c.status === 'ESCALATED_NEEDS_REVIEW'
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 border border-blue-800/40 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded">
              {DEMO_LABEL}
            </span>
            <span className="text-xs text-blue-300 font-medium">
              Bagian Humas, Promosi dan Protokoler UNY
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-white">
            Monitoring Media & Klasifikasi 17 SDGs UNY
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Sistem pengawasan kurasi berita publik www.uny.ac.id, pemetaan otomatis Tridharma ke 17 Tujuan
            Pembangunan Berkelanjutan (SDGs), validasi manusia, dan penyediaan bukti akreditasi internasional.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('validation')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition"
          >
            <Clock size={15} />
            <span>Tinjau Antrean ({pendingItems.length})</span>
          </button>
          <button
            onClick={() => onNavigate('transparency')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs rounded-lg flex items-center gap-2 transition"
          >
            <span>Halaman Publik</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Berita */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Berita Unik</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <FileText size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {kpi.totalUniqueArticles}
            </span>
            <span className="text-xs text-slate-400">artikel</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 size={12} />
            <span>100% dari domain uny.ac.id</span>
          </div>
        </div>

        {/* Card 2: Terkait SDGs & Proporsi */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Berita Terkait SDGs</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Target size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {kpi.sdgRelatedCount}
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              ({kpi.sdgProportion.toFixed(1)}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Proporsi berita publik memuat dampak SDGs
          </div>
        </div>

        {/* Card 3: Tingkat Verifikasi */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tingkat Verifikasi</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {kpi.verificationRate.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">
              ({kpi.verifiedCount}/{kpi.totalUniqueArticles})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-purple-300 font-medium">
            {kpi.unverifiedQueueCount} artikel menunggu peninjauan
          </div>
        </div>

        {/* Card 4: Cakupan SDGs (Target >= 5 bukti per SDG) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cakupan 17 SDGs (≥5 Bukti)</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Award size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {kpi.sdgCoverage17} <span className="text-base text-slate-400 font-normal">/ 17</span>
            </span>
            <span className="text-xs text-amber-400 font-semibold">Tujuan</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Target akreditasi min. 5 bukti per tujuan
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Human-In-The-Loop Quality */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div className="text-slate-400 font-medium">Akurasi Label AI (Uji Manual Reviewer)</div>
          <div className="mt-1 text-xl font-bold text-white">
            {kpi.manualAccuracy > 0 ? `${kpi.manualAccuracy.toFixed(1)}%` : 'Belum dievaluasi'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Persentase rekomendasi model disetujui tanpa perubahan oleh validator Humas ({kpi.reviewedCount} ditinjau).
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div className="text-slate-400 font-medium">Tingkat Koreksi Label Manusia</div>
          <div className="mt-1 text-xl font-bold text-white">
            {kpi.correctionRate > 0 ? `${kpi.correctionRate.toFixed(1)}%` : '0%'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Persentase label yang disesuaikan/ditambah oleh staf Humas saat review manusia.
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div className="text-slate-400 font-medium">Kelengkapan Metadata Berita</div>
          <div className="mt-1 text-xl font-bold text-emerald-400">
            {kpi.metadataCompletenessRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Artikel dengan judul, penulis, tanggal, unit, kategori, isi dan URL kanonis lengkap.
          </div>
        </div>
      </div>

      {/* Alert Banner if there are escalations */}
      {kpi.escalationsCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-100 text-sm">
                Perhatian: Terdapat {kpi.escalationsCount} Item Memerlukan Tinjauan Khusus
              </div>
              <p className="mt-1 text-amber-200/90 leading-relaxed">
                Item dengan tingkat keyakinan AI di bawah ambang batas (default 0.85) atau bertanda isu sensitif/etika
                secara otomatis dieskalasi ke antrean validasi manusia sesuai Aturan Wajib #7.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('validation')}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
          >
            Tinjau Sekarang
          </button>
        </div>
      )}

      {/* Distribution of Articles per SDG */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
          <div>
            <h2 className="font-bold text-sm text-white">Distribusi Berita pada 17 SDGs</h2>
            <p className="text-xs text-slate-400">
              Perbandingan jumlah berita terverifikasi (warna solid) vs usulan AI yang belum divalidasi.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 italic">
            *Catatan: 1 berita dapat memiliki hingga 3 label SDGs.
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {SDG_REFERENCES.map((sdg) => {
            const data = kpi.articlesPerSdg[sdg.number] || { verified: 0, suggested: 0, total: 0 };
            const maxVal = Math.max(
              ...Object.values(kpi.articlesPerSdg).map((d) => d.total),
              5
            );
            const verifiedWidth = maxVal > 0 ? (data.verified / maxVal) * 100 : 0;
            const suggestedWidth = maxVal > 0 ? (data.suggested / maxVal) * 100 : 0;

            return (
              <div key={sdg.number} className="flex items-center gap-3 text-xs">
                <div className="w-48 sm:w-64 shrink-0 flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px]"
                    style={{ backgroundColor: sdg.color, color: sdg.textColor }}
                  >
                    {sdg.number}
                  </span>
                  <span className="truncate text-slate-200" title={sdg.officialIndonesianName}>
                    {sdg.shortName}
                  </span>
                </div>

                {/* Bar */}
                <div className="flex-1 bg-slate-800 h-4 rounded-full overflow-hidden flex">
                  <div
                    style={{
                      width: `${verifiedWidth}%`,
                      backgroundColor: sdg.color,
                    }}
                    title={`Terverifikasi: ${data.verified}`}
                    className="h-full transition-all duration-300"
                  />
                  <div
                    style={{
                      width: `${suggestedWidth}%`,
                      backgroundColor: sdg.color,
                      opacity: 0.35,
                    }}
                    title={`Usulan Model (Belum Divalidasi): ${data.suggested}`}
                    className="h-full transition-all duration-300"
                  />
                </div>

                <div className="w-20 text-right shrink-0 font-mono text-slate-300">
                  <span className="font-bold text-white">{data.verified}</span>
                  {data.suggested > 0 && (
                    <span className="text-slate-400 text-[10px]"> +{data.suggested}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
