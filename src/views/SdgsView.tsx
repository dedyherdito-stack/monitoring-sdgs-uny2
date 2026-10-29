import React, { useState } from 'react';
import { SDG_REFERENCES } from '../data/sdgReference';
import { Article, SDGClassification, KPISummary } from '../types';
import { SdgBadge } from '../components/SdgBadge';
import { DEMO_LABEL } from '../data/demoDataset';
import {
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building,
  FileCheck,
  AlertCircle,
  Download,
} from 'lucide-react';

interface SdgsViewProps {
  articles: Article[];
  classifications: SDGClassification[];
  kpi: KPISummary;
}

export const SdgsView: React.FC<SdgsViewProps> = ({
  articles,
  classifications,
  kpi,
}) => {
  const [selectedSdg, setSelectedSdg] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');

  const currentSdgRef = SDG_REFERENCES.find((s) => s.number === selectedSdg)!;

  // Filter verified articles for this SDG
  const verifiedClassificationsForSdg = classifications.filter(
    (c) => c.sdgNumber === selectedSdg && c.status === 'VERIFIED'
  );
  const verifiedArticleIds = new Set(verifiedClassificationsForSdg.map((c) => c.articleId));

  const evidenceArticles = articles.filter((a) => verifiedArticleIds.has(a.id));

  // Search filter
  const filteredEvidence = evidenceArticles.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.bodyText.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q) ||
      a.unitId.toLowerCase().includes(q)
    );
  });

  // Export evidence CSV for current SDG
  const handleExportSdgEvidence = () => {
    const headers = ['ID Berita', 'Judul Berita', 'Penulis', 'Fakultas/Unit', 'Tanggal Publikasi', 'URL Sumber uny.ac.id', 'Label'];
    const rows = evidenceArticles.map((a) => [
      `"${a.id}"`,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.author.replace(/"/g, '""')}"`,
      `"${a.unitId}"`,
      `"${a.publishedAt}"`,
      `"${a.sourceUrl}"`,
      `"SDG ${selectedSdg} - ${currentSdgRef.shortName}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `UNY_SDG_${selectedSdg}_Evidence_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded">
              {DEMO_LABEL}
            </span>
            <h1 className="text-xl font-bold text-white">17 SDGs & Daftar Bukti Terverifikasi</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pilih tujuan SDG untuk meninjau deskripsi resmi, kata kunci Tridharma, dan seluruh bukti berita UNY yang telah lolos validasi.
          </p>
        </div>

        <button
          onClick={handleExportSdgEvidence}
          disabled={evidenceArticles.length === 0}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-2 transition disabled:opacity-50"
        >
          <Download size={14} />
          <span>Ekspor Bukti SDG {selectedSdg} (.CSV)</span>
        </button>
      </div>

      {/* 17 SDGs Interactive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {SDG_REFERENCES.map((sdg) => {
          const stats = kpi.articlesPerSdg[sdg.number] || { verified: 0, suggested: 0, total: 0 };
          const isSelected = selectedSdg === sdg.number;
          const meetsTarget = stats.verified >= 5;

          return (
            <button
              key={sdg.number}
              onClick={() => setSelectedSdg(sdg.number)}
              style={{
                borderColor: isSelected ? sdg.color : 'transparent',
                backgroundColor: isSelected ? `${sdg.color}15` : undefined,
              }}
              className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between h-28 relative group ${
                isSelected
                  ? 'shadow-md ring-1 ring-blue-500/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs shadow-xs"
                  style={{ backgroundColor: sdg.color, color: sdg.textColor }}
                >
                  {sdg.number}
                </span>

                {meetsTarget ? (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    title="Target minimum 5 bukti terpenuhi"
                  >
                    Target OK
                  </span>
                ) : (
                  <span
                    className="text-[10px] font-medium text-slate-400"
                    title="Target: minimal 5 bukti terverifikasi"
                  >
                    {stats.verified}/5 bukti
                  </span>
                )}
              </div>

              <div>
                <div className="font-bold text-xs text-slate-200 line-clamp-1 group-hover:text-white">
                  {sdg.shortName}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
                  <span>{stats.verified} Terverifikasi</span>
                  {stats.suggested > 0 && (
                    <span className="text-amber-400 font-mono">+{stats.suggested}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected SDG Detail Card */}
      <div
        className="rounded-xl border p-5 shadow-sm text-slate-200"
        style={{
          borderColor: `${currentSdgRef.color}50`,
          backgroundColor: '#0f172a',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-md"
              style={{
                backgroundColor: currentSdgRef.color,
                color: currentSdgRef.textColor,
              }}
            >
              {currentSdgRef.number}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  SDG {currentSdgRef.number}: {currentSdgRef.officialIndonesianName}
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
                {currentSdgRef.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-center">
              <div className="text-lg font-extrabold text-white">
                {evidenceArticles.length}
              </div>
              <div className="text-[10px] text-slate-400">Bukti Terverifikasi</div>
            </div>
          </div>
        </div>

        {/* Keywords */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Kata Kunci Tridharma UNY:</span>
          {currentSdgRef.keywords.map((kw, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-300"
            >
              #{kw}
            </span>
          ))}
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-white">
              Daftar Bukti Terverifikasi (SDG {selectedSdg})
            </h3>
            <p className="text-xs text-slate-400">
              Menampilkan {filteredEvidence.length} artikel yang telah lolos validasi manusia.
            </p>
          </div>

          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam bukti SDG ini..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {filteredEvidence.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <FileCheck size={36} className="mx-auto mb-2 opacity-40 text-slate-500" />
            <p className="font-medium">Belum ada berita terverifikasi untuk SDG {selectedSdg}.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Gunakan menu "Antrean Validasi" untuk menyetujui artikel atau tambahkan berita baru.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredEvidence.map((article) => {
              const matchedClassification = classifications.find(
                (c) => c.articleId === article.id && c.sdgNumber === selectedSdg && c.status === 'VERIFIED'
              );

              return (
                <div
                  key={article.id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-sm text-white leading-snug">
                      {article.title}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                      <CheckCircle2 size={12} />
                      VERIFIED
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {article.bodyText}
                  </p>

                  {matchedClassification?.rationale && (
                    <div className="text-[11px] text-blue-300 bg-blue-950/40 border border-blue-900/40 px-3 py-1.5 rounded-lg">
                      <span className="font-semibold text-blue-200">Justifikasi Humas: </span>
                      {matchedClassification.rationale}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Building size={12} />
                        Unit: <strong className="text-slate-300 font-semibold">{article.unitId}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {article.publishedAt}
                      </span>
                      <span>•</span>
                      <span>Oleh: {article.author}</span>
                    </div>

                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition"
                    >
                      <span>Buka Tautan Sumber</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
