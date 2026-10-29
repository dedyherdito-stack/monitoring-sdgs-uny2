import React, { useState } from 'react';
import { Article, SDGClassification, User, ValidationRecord } from '../types';
import { SDG_REFERENCES } from '../data/sdgReference';
import { storageService } from '../services/storageService';
import { SdgBadge } from '../components/SdgBadge';
import { DEMO_LABEL } from '../data/demoDataset';
import {
  CheckSquare,
  CheckCircle2,
  Edit3,
  XCircle,
  AlertTriangle,
  History,
  Info,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface ValidationQueueViewProps {
  articles: Article[];
  classifications: SDGClassification[];
  validations: ValidationRecord[];
  currentUser: User;
}

export const ValidationQueueView: React.FC<ValidationQueueViewProps> = ({
  articles,
  classifications,
  validations,
  currentUser,
}) => {
  const isOperator = currentUser.role === 'OPERATOR';
  const assignedUnit = currentUser.assignedUnitId;

  // Filter queue items: articles with classifications that are NOT verified and NOT rejected
  const articleMap = new Map(articles.map((a) => [a.id, a]));

  const queueArticles = articles.filter((article) => {
    // RBAC: If operator, only show articles belonging to their unit
    if (isOperator && assignedUnit && article.unitId !== assignedUnit) {
      return false;
    }
    const artCls = classifications.filter((c) => c.articleId === article.id);
    return artCls.some(
      (c) => c.status === 'SUGGESTED' || c.status === 'ESCALATED_NEEDS_REVIEW'
    );
  });

  // Selected article to review
  const [activeArticleId, setActiveArticleId] = useState<string | null>(
    queueArticles.length > 0 ? queueArticles[0].id : null
  );

  const activeArticle = queueArticles.find((a) => a.id === activeArticleId) || queueArticles[0];

  // Modify dialog / form state
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [reviewerNote, setReviewerNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // When active article changes, sync selected labels
  React.useEffect(() => {
    if (activeArticle) {
      const cls = classifications.filter((c) => c.articleId === activeArticle.id);
      setSelectedLabels(cls.map((c) => c.sdgNumber).slice(0, 3));
      setReviewerNote('');
      setActionError('');
      setActionSuccess('');
    }
  }, [activeArticleId, activeArticle?.id]);

  const activeClassifications = activeArticle
    ? classifications.filter((c) => c.articleId === activeArticle.id)
    : [];

  const handleToggleSdg = (sdgNum: number) => {
    if (selectedLabels.includes(sdgNum)) {
      setSelectedLabels(selectedLabels.filter((n) => n !== sdgNum));
    } else {
      if (selectedLabels.length >= 3) {
        setActionError('Aturan Wajib #7: Maksimal 3 SDGs per berita.');
        return;
      }
      setActionError('');
      setSelectedLabels([...selectedLabels, sdgNum]);
    }
  };

  const handleApprove = () => {
    if (!activeArticle) return;
    try {
      setActionError('');
      const defaultLabels = activeClassifications.map((c) => c.sdgNumber).slice(0, 3);
      storageService.submitValidation(
        activeArticle.id,
        'APPROVE',
        defaultLabels,
        reviewerNote || 'Disetujui sesuai rekomendasi model oleh Humas.'
      );
      setActionSuccess(`Berita "${activeArticle.title.substring(0, 40)}..." berhasil DISETUJUI.`);
      setReviewerNote('');
    } catch (err: any) {
      setActionError(err.message || 'Gagal menyetujui.');
    }
  };

  const handleModify = () => {
    if (!activeArticle) return;
    if (selectedLabels.length === 0) {
      setActionError('Pilih minimal 1 SDG untuk opsi Ubah. Jika tidak relevan dengan SDG manapun, pilih Tolak.');
      return;
    }
    if (!reviewerNote.trim()) {
      setActionError('Aturan Wajib #7: Catatan reviewer WAJIB diisi saat melakukan modifikasi label.');
      return;
    }
    try {
      setActionError('');
      storageService.submitValidation(
        activeArticle.id,
        'MODIFY',
        selectedLabels,
        reviewerNote.trim()
      );
      setActionSuccess(`Berita berhasil DIUBAH labelnya menjadi SDG ${selectedLabels.join(', ')}.`);
      setReviewerNote('');
    } catch (err: any) {
      setActionError(err.message || 'Gagal menyimpan perubahan.');
    }
  };

  const handleReject = () => {
    if (!activeArticle) return;
    if (!reviewerNote.trim()) {
      setActionError('Aturan Wajib #7: Catatan reviewer WAJIB diisi saat menolak klasifikasi.');
      return;
    }
    try {
      setActionError('');
      storageService.submitValidation(
        activeArticle.id,
        'REJECT',
        [],
        reviewerNote.trim()
      );
      setActionSuccess(`Berita DITOLAK dari keterkaitan SDGs.`);
      setReviewerNote('');
    } catch (err: any) {
      setActionError(err.message || 'Gagal menolak.');
    }
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
            <h1 className="text-xl font-bold text-white">Antrean Validasi Manusia (Human-in-the-Loop)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Peninjauan dan otorisasi kurasi berita sebelum dipublikasikan ke halaman transparansi publik.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Peninjau Aktif:{' '}
          <strong className="text-white">
            {currentUser.displayName} ({currentUser.role})
          </strong>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-white">
            Tutup
          </button>
        </div>
      )}

      {/* Main Split: Queue List vs Active Review Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue items (4 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              <h2 className="font-bold text-sm text-white">Antrean Menunggu ({queueArticles.length})</h2>
            </div>
            {isOperator && assignedUnit && (
              <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                Unit: {assignedUnit}
              </span>
            )}
          </div>

          {queueArticles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <ShieldCheck size={36} className="mx-auto mb-2 text-emerald-500/50" />
              <p className="font-semibold text-slate-300">Semua berita telah tervalidasi!</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Tidak ada artikel yang menunggu peninjauan saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {queueArticles.map((article) => {
                const isSelected = activeArticle?.id === article.id;
                const cls = classifications.filter((c) => c.articleId === article.id);
                const hasEscalation = cls.some((c) => c.status === 'ESCALATED_NEEDS_REVIEW');

                return (
                  <div
                    key={article.id}
                    onClick={() => setActiveArticleId(article.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-950/50 border-blue-500 shadow-sm'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-white line-clamp-2 leading-snug">
                        {article.title}
                      </span>
                      {hasEscalation ? (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                          Eskalasi
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
                          Usulan
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Unit: {article.unitId}</span>
                      <span>{article.publishedAt}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                      {cls.map((c) => (
                        <span
                          key={c.id}
                          className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 border border-slate-700 text-slate-300"
                        >
                          SDG {c.sdgNumber} ({(c.confidenceScore * 100).toFixed(0)}%)
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Review Details & Decision Form (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          {!activeArticle ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              Pilih artikel dari daftar antrean di sebelah kiri untuk memulai peninjauan.
            </div>
          ) : (
            <>
              {/* Header of Active Article */}
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded font-semibold text-[10px]">
                    Unit: {activeArticle.unitId}
                  </span>
                  <span className="text-slate-400 text-xs">{activeArticle.publishedAt}</span>
                  {activeArticle.isSensitive && (
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded font-bold text-[10px]">
                      ISU SENSITIF
                    </span>
                  )}
                </div>

                <h2 className="text-base font-bold text-white mt-1 leading-snug">
                  {activeArticle.title}
                </h2>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-400">
                  <a
                    href={activeArticle.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>{activeArticle.sourceUrl}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Excerpt Body */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">
                  Isi Cuplikan Berita:
                </label>
                <div className="p-3 rounded-lg bg-slate-800/40 text-slate-300 text-xs leading-relaxed max-h-40 overflow-y-auto border border-slate-800">
                  {activeArticle.bodyText}
                </div>
              </div>

              {/* Current AI Model Suggestion */}
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5">
                  Rekomendasi Model AI & Justifikasi:
                </label>
                <div className="space-y-2">
                  {activeClassifications.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SdgBadge sdgNumber={c.sdgNumber} size="sm" />
                          <span className="font-mono text-slate-300">
                            Skor: {(c.confidenceScore * 100).toFixed(0)}%
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">Model: {c.modelName}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] italic">"{c.rationale}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modify SDG Tags (Selection grid) */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-slate-300 text-xs font-semibold mb-1">
                  Pilih Label SDGs Final (Maksimal 3):
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Klik nomor SDG untuk menambah atau mengurangi label target.
                </p>

                <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5">
                  {SDG_REFERENCES.map((sdg) => {
                    const isSelected = selectedLabels.includes(sdg.number);
                    return (
                      <button
                        key={sdg.number}
                        type="button"
                        onClick={() => handleToggleSdg(sdg.number)}
                        style={{
                          backgroundColor: isSelected ? sdg.color : undefined,
                          color: isSelected ? sdg.textColor : undefined,
                        }}
                        className={`py-1.5 px-2 rounded font-bold text-xs transition flex flex-col items-center justify-center border ${
                          isSelected
                            ? 'border-transparent shadow-sm'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                        title={sdg.officialIndonesianName}
                      >
                        <span>{sdg.number}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 text-xs text-slate-300">
                  Label Terpilih ({selectedLabels.length}/3):{' '}
                  {selectedLabels.length === 0 ? (
                    <span className="text-slate-500 italic">Tidak ada (akan ditolak)</span>
                  ) : (
                    <span className="font-bold text-white">
                      SDG {selectedLabels.sort((a, b) => a - b).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Reviewer Note (Mandatory for Modify / Reject) */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">
                  Catatan Reviewer / Alasan Keputusan:
                </label>
                <textarea
                  rows={2}
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  placeholder="Wajib diisi jika Ubah atau Tolak (misal: 'Menambahkan SDG 2 karena terkait program penurunan stunting balita')."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-hidden focus:border-blue-500 placeholder-slate-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Catatan ini hanya tersimpan di log audit internal dan TIDAK akan ditampilkan pada portal publik.
                </span>
              </div>

              {actionError && (
                <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Decision Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-3.5 py-2 rounded-lg bg-rose-950/50 hover:bg-rose-900 border border-rose-800 text-rose-200 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <XCircle size={15} />
                  <span>Tolak Berita</span>
                </button>

                <button
                  type="button"
                  onClick={handleModify}
                  className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Edit3 size={15} />
                  <span>Simpan Perubahan</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 size={16} />
                  <span>Setujui Rekomendasi</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Validation History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <History size={16} className="text-blue-400" />
          <h3 className="font-bold text-sm text-white">Riwayat Keputusan Validasi Humas</h3>
        </div>

        {validations.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada riwayat validasi yang tercatat.
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 text-[10px] uppercase font-semibold">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Peninjau</th>
                  <th className="py-2.5 px-3">ID Berita</th>
                  <th className="py-2.5 px-3">Keputusan</th>
                  <th className="py-2.5 px-3">Label Awal → Akhir</th>
                  <th className="py-2.5 px-3">Catatan Humas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {validations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/20">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {v.decidedAt.replace('T', ' ').substring(0, 16)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 whitespace-nowrap font-medium">
                      {v.reviewerName}
                    </td>
                    <td className="py-2.5 px-3 text-blue-400 font-mono whitespace-nowrap">
                      {v.articleId}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          v.decision === 'APPROVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : v.decision === 'MODIFY'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {v.decision}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono">
                      [{v.previousLabels.join(', ')}] → [{v.finalLabels.join(', ')}]
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={v.note}>
                      {v.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
