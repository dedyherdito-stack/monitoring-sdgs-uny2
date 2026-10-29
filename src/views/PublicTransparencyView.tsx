import React, { useState } from 'react';
import { Article, SDGClassification, KPISummary } from '../types';
import { SDG_REFERENCES } from '../data/sdgReference';
import { SdgBadge } from '../components/SdgBadge';
import { DEMO_LABEL } from '../data/demoDataset';
import {
  Globe,
  CheckCircle2,
  ExternalLink,
  Search,
  Calendar,
  Building,
  ShieldCheck,
  BookOpen,
  Info,
} from 'lucide-react';

interface PublicTransparencyViewProps {
  articles: Article[];
  classifications: SDGClassification[];
  kpi: KPISummary;
}

export const PublicTransparencyView: React.FC<PublicTransparencyViewProps> = ({
  articles,
  classifications,
  kpi,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSdg, setSelectedSdg] = useState<number | 'ALL'>('ALL');

  // Rule 8 ENFORCEMENT: ONLY verified articles and classifications may be shown here!
  const verifiedClassifications = classifications.filter((c) => c.status === 'VERIFIED');
  const verifiedArticleIds = new Set(verifiedClassifications.map((c) => c.articleId));

  const verifiedArticles = articles.filter((a) => verifiedArticleIds.has(a.id));

  // Search & filter
  const displayedArticles = verifiedArticles.filter((article) => {
    if (selectedSdg !== 'ALL') {
      const artCls = verifiedClassifications.filter((c) => c.articleId === article.id);
      if (!artCls.some((c) => c.sdgNumber === selectedSdg)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(q) ||
        article.bodyText.toLowerCase().includes(q) ||
        article.author.toLowerCase().includes(q) ||
        article.unitId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Public Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded">
            {DEMO_LABEL}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1">
            <Globe size={12} />
            Portal Transparansi Publik Terbuka
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Transparansi Capaian SDGs Universitas Negeri Yogyakarta
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Halaman ini menyajikan seluruh bukti publikasi berita resmi Universitas Negeri Yogyakarta
          yang telah divalidasi oleh Bagian Humas dalam mendukung 17 Tujuan Pembangunan Berkelanjutan
          (SDGs). Informasi ini dapat diakses oleh pemangku kepentingan, asesor akreditasi, dan masyarakat luas.
        </p>

        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <div>
            Pembaruan Terakhir Sistem: <strong>28 Oktober 2026</strong> • Sumber Resmi: <strong>www.uny.ac.id</strong>
          </div>
          <div className="text-emerald-400 flex items-center gap-1 font-medium">
            <ShieldCheck size={14} />
            <span>Kepatuhan Aturan #8: Seluruh konten telah lolos verifikasi humana institusional.</span>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Cards for Public */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Total Berita Terverifikasi</div>
          <div className="mt-1 text-3xl font-black text-white">{kpi.verifiedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Artikel publik terbukti berdampak SDGs</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Tujuan SDGs Terwakili</div>
          <div className="mt-1 text-3xl font-black text-emerald-400">
            {Object.values(kpi.articlesPerSdg).filter((d) => d.verified > 0).length} / 17
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cakupan tujuan aktif di lingkungan UNY</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Fakultas / Unit Terlibat</div>
          <div className="mt-1 text-3xl font-black text-blue-400">
            {new Set(verifiedArticles.map((a) => a.unitId)).size} Unit
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tridharma kolaboratif lintas disiplin ilmu</div>
        </div>
      </div>

      {/* Methodology Section */}
      <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-blue-200 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm text-white">
          <BookOpen size={16} className="text-blue-400" />
          <span>Metodologi Kurasi & Validasi SDGs Humas UNY</span>
        </div>
        <p className="leading-relaxed text-slate-300">
          Setiap publikasi berita yang terbit di portal resmi <strong>www.uny.ac.id</strong> dipantau
          dan dikurasi menggunakan analisis pemrosesan bahasa alami (NLP) berbasis taksonomi 17 SDGs PBB.
          Untuk menjamin akuntabilitas data, seluruh usulan klasifikasi melewati <em>human-in-the-loop review</em> oleh
          tim Humas dan pimpinan fakultas sebelum ditetapkan sebagai bukti terverifikasi.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs space-y-3 text-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam daftar publikasi terverifikasi..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedSdg}
              onChange={(e) => setSelectedSdg(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">Semua 17 Tujuan SDGs</option>
              {SDG_REFERENCES.map((s) => (
                <option key={s.number} value={s.number}>
                  SDG {s.number}: {s.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Verified Articles List */}
      <div className="space-y-3">
        {displayedArticles.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-slate-900 border border-slate-800 rounded-xl">
            Tidak ada publikasi terverifikasi yang cocok dengan pencarian Anda.
          </div>
        ) : (
          displayedArticles.map((article) => {
            const artCls = verifiedClassifications.filter((c) => c.articleId === article.id);

            return (
              <div
                key={article.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {article.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                    <CheckCircle2 size={12} />
                    TERVERIFIKASI
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed text-xs">
                  {article.bodyText}
                </p>

                {/* SDG Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-slate-400 text-[11px] font-medium mr-1">Tujuan Terkait:</span>
                  {artCls.map((c) => (
                    <SdgBadge key={c.id} sdgNumber={c.sdgNumber} size="sm" />
                  ))}
                </div>

                {/* Footer metadata & clickable source link */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px] flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <Building size={12} />
                      {article.unitId}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {article.publishedAt}
                    </span>
                    <span>•</span>
                    <span>Peliput: {article.author}</span>
                  </div>

                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-blue-400 hover:text-blue-300 transition"
                  >
                    <span>Baca di Portal Resmi www.uny.ac.id</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
