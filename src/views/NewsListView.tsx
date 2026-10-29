import React, { useState } from 'react';
import { Article, SDGClassification, User } from '../types';
import { SDG_REFERENCES, UNY_FACULTIES_AND_UNITS } from '../data/sdgReference';
import { SdgBadge } from '../components/SdgBadge';
import { DEMO_LABEL } from '../data/demoDataset';
import {
  Search,
  Filter,
  ExternalLink,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  Hash,
  Eye,
  X,
} from 'lucide-react';

interface NewsListViewProps {
  articles: Article[];
  classifications: SDGClassification[];
  currentUser: User;
  onNavigateToValidation?: (articleId: string) => void;
}

export const NewsListView: React.FC<NewsListViewProps> = ({
  articles,
  classifications,
  currentUser,
  onNavigateToValidation,
}) => {
  const isOperator = currentUser.role === 'OPERATOR';
  const assignedUnit = currentUser.assignedUnitId;

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>(isOperator && assignedUnit ? assignedUnit : 'ALL');
  const [selectedSdg, setSelectedSdg] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');

  // Detail drawer modal state
  const [inspectArticle, setInspectArticle] = useState<Article | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filter application
  const filteredArticles = articles.filter((article) => {
    // RBAC: If operator, only view their own unit
    if (isOperator && assignedUnit && article.unitId !== assignedUnit) {
      return false;
    }

    if (selectedUnit !== 'ALL' && article.unitId !== selectedUnit) {
      return false;
    }

    if (selectedMonth !== 'ALL' && !article.publishedAt.startsWith(selectedMonth)) {
      return false;
    }

    const articleCls = classifications.filter((c) => c.articleId === article.id);

    if (selectedSdg !== 'ALL') {
      const targetSdg = Number(selectedSdg);
      if (!articleCls.some((c) => c.sdgNumber === targetSdg)) {
        return false;
      }
    }

    if (selectedStatus !== 'ALL') {
      if (!articleCls.some((c) => c.status === selectedStatus)) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        article.title.toLowerCase().includes(q) ||
        article.bodyText.toLowerCase().includes(q) ||
        article.author.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q) ||
        article.sourceUrl.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredArticles.length / pageSize) || 1;
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded">
              {DEMO_LABEL}
            </span>
            <h1 className="text-xl font-bold text-white">Daftar Berita & Bukti Publikasi UNY</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Data pemantauan berita dari https://www.uny.ac.id/ lengkap dengan tautan asli kanonis dan verifikasi hash.
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs space-y-3 text-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul, isi, penulis, kategori, atau URL..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-blue-500 placeholder-slate-500"
            />
          </div>

          {/* Unit Filter (Locked if Operator) */}
          <div className="w-full md:w-52">
            <select
              value={selectedUnit}
              disabled={isOperator}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-blue-500 disabled:opacity-60"
            >
              <option value="ALL">Semua Fakultas / Unit</option>
              {UNY_FACULTIES_AND_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.code} - {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* SDG Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedSdg}
              onChange={(e) => {
                setSelectedSdg(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">Semua 17 SDGs</option>
              {SDG_REFERENCES.map((s) => (
                <option key={s.number} value={s.number}>
                  SDG {s.number}: {s.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="VERIFIED">TERVERIFIKASI</option>
              <option value="SUGGESTED">USULAN AI (Pending)</option>
              <option value="ESCALATED_NEEDS_REVIEW">ESKALASI REVIEW</option>
              <option value="REJECTED">DITOLAK</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
          <div>
            Menampilkan <strong>{filteredArticles.length}</strong> berita dari total {articles.length} record.
          </div>
          {(searchQuery || selectedUnit !== 'ALL' || selectedSdg !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedUnit(isOperator && assignedUnit ? assignedUnit : 'ALL');
                setSelectedSdg('ALL');
                setSelectedStatus('ALL');
                setCurrentPage(1);
              }}
              className="text-blue-400 hover:underline"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {paginatedArticles.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Search size={32} className="mx-auto mb-2 opacity-40 text-slate-500" />
            <p className="font-semibold text-slate-300">Tidak ada berita yang cocok dengan kriteria filter.</p>
            <p className="mt-1 text-slate-500">Silakan ubah kata kunci atau setel ulang filter di atas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Judul Berita</th>
                  <th className="py-3 px-4">Unit / Penulis</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Klasifikasi SDGs</th>
                  <th className="py-3 px-4">Status & Hash</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {paginatedArticles.map((article) => {
                  const artCls = classifications.filter((c) => c.articleId === article.id);
                  const isVerified = artCls.some((c) => c.status === 'VERIFIED');
                  const hasEscalation = artCls.some((c) => c.status === 'ESCALATED_NEEDS_REVIEW');

                  return (
                    <tr key={article.id} className="hover:bg-slate-800/30 transition">
                      {/* Title & URL */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-bold text-white text-xs leading-snug line-clamp-2">
                          {article.title}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-400">
                          <a
                            href={article.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline truncate max-w-[280px]"
                            title={article.sourceUrl}
                          >
                            {article.sourceUrl}
                          </a>
                          <ExternalLink size={11} className="shrink-0" />
                        </div>
                      </td>

                      {/* Unit & Author */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {article.unitId}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1 truncate max-w-[130px]">
                          {article.author}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                        {article.publishedAt}
                      </td>

                      {/* SDG Badges */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {artCls.length === 0 ? (
                            <span className="text-[11px] text-slate-500 italic">Belum diklasifikasi</span>
                          ) : (
                            artCls.map((c) => (
                              <SdgBadge key={c.id} sdgNumber={c.sdgNumber} size="sm" showName={false} />
                            ))
                          )}
                        </div>
                      </td>

                      {/* Status & Hash */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 size={11} />
                            VERIFIED
                          </span>
                        ) : hasEscalation ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            <AlertTriangle size={11} />
                            ESKALASI
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <Clock size={11} />
                            SUGGESTED
                          </span>
                        )}

                        <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                          <Hash size={10} />
                          <span>{article.contentHash.substring(0, 15)}...</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setInspectArticle(article)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium inline-flex items-center gap-1 transition"
                        >
                          <Eye size={12} />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Article Detail Modal */}
      {inspectArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full p-6 text-slate-200 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded">
                  {DEMO_LABEL}
                </span>
                <h3 className="text-base font-bold text-white mt-1 leading-snug">
                  {inspectArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectArticle(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-800/60 rounded-lg">
                <div>
                  <span className="text-slate-400 text-[11px] block">Fakultas/Unit:</span>
                  <strong className="text-white">{inspectArticle.unitId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Penulis:</span>
                  <strong className="text-white">{inspectArticle.author}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Tanggal Publikasi:</span>
                  <strong className="text-white">{inspectArticle.publishedAt}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Kategori:</span>
                  <strong className="text-white">{inspectArticle.category}</strong>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-semibold mb-1">
                  URL Sumber Kanonis (uny.ac.id):
                </span>
                <a
                  href={inspectArticle.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline break-all flex items-center gap-1.5"
                >
                  <span>{inspectArticle.sourceUrl}</span>
                  <ExternalLink size={13} className="shrink-0" />
                </a>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-semibold mb-1">Isi Berita:</span>
                <div className="p-3 bg-slate-800/40 rounded-lg text-slate-300 leading-relaxed text-xs max-h-48 overflow-y-auto">
                  {inspectArticle.bodyText}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-semibold mb-2">
                  Rincian Klasifikasi SDGs:
                </span>
                <div className="space-y-2">
                  {classifications
                    .filter((c) => c.articleId === inspectArticle.id)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <SdgBadge sdgNumber={c.sdgNumber} size="sm" />
                            <span className="text-[11px] text-slate-300 font-medium">
                              Skor Keyakinan: {(c.confidenceScore * 100).toFixed(0)}%
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                c.status === 'VERIFIED'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 italic">{c.rationale}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950/60 font-mono text-[11px] text-slate-400 break-all border border-slate-800">
                <strong>Content Hash:</strong> {inspectArticle.contentHash}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectArticle(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
