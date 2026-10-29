import React, { useState } from 'react';
import { Article, SDGClassification, Report, User } from '../types';
import { SDG_REFERENCES } from '../data/sdgReference';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { DEMO_LABEL } from '../data/demoDataset';
import {
  FileSpreadsheet,
  Download,
  CheckCircle,
  FileText,
  Clock,
  Printer,
  Sparkles,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface ReportsViewProps {
  articles: Article[];
  classifications: SDGClassification[];
  reports: Report[];
  currentUser: User;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  articles,
  classifications,
  reports,
  currentUser,
}) => {
  const [periodTitle, setPeriodTitle] = useState('Oktober 2026');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [summaryText, setSummaryText] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    reports.length > 0 ? reports[0].id : null
  );

  // Filter verified articles in selected period
  const verifiedInPeriod = articles.filter((a) => {
    if (a.publishedAt < startDate || a.publishedAt > endDate) return false;
    const artCls = classifications.filter((c) => c.articleId === a.id);
    return artCls.some((c) => c.status === 'VERIFIED');
  });

  // Calculate top SDGs for this period
  const sdgCounts: Record<number, number> = {};
  for (const art of verifiedInPeriod) {
    const artCls = classifications.filter((c) => c.articleId === art.id && c.status === 'VERIFIED');
    for (const c of artCls) {
      sdgCounts[c.sdgNumber] = (sdgCounts[c.sdgNumber] || 0) + 1;
    }
  }

  const topSdgs = Object.entries(sdgCounts)
    .map(([num, count]) => ({ sdgNumber: Number(num), count }))
    .sort((a, b) => b.count - a.count);

  const handleGenerateAiDraft = async () => {
    setIsGeneratingAi(true);
    try {
      const summary = await geminiService.generateExecutiveSummary(
        verifiedInPeriod.map((a) => ({
          title: a.title,
          unit: a.unitId,
          date: a.publishedAt,
        })),
        periodTitle
      );
      setSummaryText(summary);
    } catch {
      setSummaryText('Gagal menghasilkan ringkasan AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveReport = () => {
    const newRep = storageService.saveReport({
      title: `Laporan Capaian SDGs Humas UNY - Periode ${periodTitle}`,
      periodStart: startDate,
      periodEnd: endDate,
      status: 'PENDING_APPROVAL',
      summary:
        summaryText ||
        `Tercatat ${verifiedInPeriod.length} berita Tridharma terverifikasi memenuhi standar SDGs PBB pada periode ${periodTitle}.`,
      totalArticlesCount: verifiedInPeriod.length,
      verifiedArticlesCount: verifiedInPeriod.length,
      topSdgDistribution: topSdgs.slice(0, 5),
    });
    setSelectedReportId(newRep.id);
  };

  const handleApproveReport = (reportId: string) => {
    try {
      storageService.approveReport(reportId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Export CSV
  const handleExportAllVerifiedCSV = () => {
    const headers = [
      'ID Berita',
      'Judul Artikel',
      'Penulis / Peliput',
      'Fakultas / Unit',
      'Tanggal Terbit',
      'Kategori',
      'URL Sumber www.uny.ac.id',
      'Label SDGs Terverifikasi',
      'Content Hash',
    ];

    const rows = verifiedInPeriod.map((a) => {
      const artCls = classifications
        .filter((c) => c.articleId === a.id && c.status === 'VERIFIED')
        .map((c) => `SDG ${c.sdgNumber}`)
        .join('; ');

      return [
        `"${a.id}"`,
        `"${a.title.replace(/"/g, '""')}"`,
        `"${a.author.replace(/"/g, '""')}"`,
        `"${a.unitId}"`,
        `"${a.publishedAt}"`,
        `"${a.category}"`,
        `"${a.sourceUrl}"`,
        `"${artCls}"`,
        `"${a.contentHash}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_SDGs_UNY_${periodTitle.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded">
              {DEMO_LABEL}
            </span>
            <h1 className="text-xl font-bold text-white">Laporan & Ekspor Bukti Tridharma SDGs</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Penyusunan berkas bukti terakreditasi, status persetujuan Humas, dan ekspor data CSV untuk THE Impact Ranking.
          </p>
        </div>

        <button
          onClick={handleExportAllVerifiedCSV}
          disabled={verifiedInPeriod.length === 0}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-sm"
        >
          <Download size={15} />
          <span>Unduh Bukti Terverifikasi (.CSV)</span>
        </button>
      </div>

      {/* Report Generator Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
        <h2 className="font-bold text-sm text-white pb-2 border-b border-slate-800 flex items-center gap-2">
          <Calendar size={16} className="text-blue-400" />
          <span>Generator Draf Laporan Baru</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Nama / Judul Periode</label>
            <input
              type="text"
              value={periodTitle}
              onChange={(e) => setPeriodTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Tanggal Selesai</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        {/* AI Assisted Press Summary */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-slate-300 font-semibold">
              Ringkasan Eksekutif / Siaran Pers Humas:
            </label>
            <button
              type="button"
              onClick={handleGenerateAiDraft}
              disabled={isGeneratingAi || verifiedInPeriod.length === 0}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium disabled:opacity-40"
            >
              <Sparkles size={13} />
              <span>{isGeneratingAi ? 'Menyusun...' : 'Susun Otomatis dengan AI'}</span>
            </button>
          </div>
          <textarea
            rows={3}
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            placeholder="Tuliskan narasi capaian atau gunakan tombol 'Susun Otomatis dengan AI' di atas..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-blue-500 leading-relaxed placeholder-slate-500"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-slate-400">
            Total bukti terverifikasi pada periode ini: <strong className="text-white">{verifiedInPeriod.length} artikel</strong>
          </div>
          <button
            onClick={handleSaveReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
          >
            Simpan Sebagai Draf Laporan
          </button>
        </div>
      </div>

      {/* Saved Reports & Formal Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reports Archive List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-white pb-2 border-b border-slate-800">
            Daftar Arsip Laporan
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {reports.map((r) => {
              const isSelected = selectedReportId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReportId(r.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-500 shadow-xs'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-white line-clamp-1">{r.title}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                        r.status === 'APPROVED_BY_HUMAS'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {r.status === 'APPROVED_BY_HUMAS' ? 'DISETUJUI' : 'MENUNGGU ACC'}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {r.periodStart} s.d. {r.periodEnd}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formal Preview Sheet (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xs text-xs space-y-4">
          {currentReport ? (
            <>
              {/* Institutional Header */}
              <div className="pb-4 border-b border-slate-800 flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/aistudio/Logo-UNY-Corel-terbaru_06879512.png"
                    alt="Logo UNY"
                    className="w-12 h-12 object-contain shrink-0"
                  />
                  <div>
                    <div className="text-[10px] tracking-widest uppercase font-bold text-blue-400">
                      UNIVERSITAS NEGERI YOGYAKARTA • BAGIAN HUMAS
                    </div>
                    <h3 className="text-base font-extrabold text-white mt-0.5">
                      {currentReport.title}
                    </h3>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Periode: {currentReport.periodStart} sampai {currentReport.periodEnd}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    title="Cetak Laporan"
                  >
                    <Printer size={15} />
                  </button>
                  {currentUser.role === 'ADMIN' && currentReport.status !== 'APPROVED_BY_HUMAS' && (
                    <button
                      onClick={() => handleApproveReport(currentReport.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition"
                    >
                      <CheckCircle size={14} />
                      <span>Setujui Laporan (Humas)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Banner */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                  currentReport.status === 'APPROVED_BY_HUMAS'
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                    : 'bg-amber-950/40 border-amber-800 text-amber-200'
                }`}
              >
                <div>
                  <strong>Status Dokumen: </strong>
                  {currentReport.status === 'APPROVED_BY_HUMAS'
                    ? 'Disetujui Resmi oleh Pimpinan Humas UNY'
                    : 'Draf Dokumen - Menunggu Persetujuan Pimpinan Humas'}
                </div>
                {currentReport.approvedBy && (
                  <span className="text-[11px]">
                    Disetujui: {currentReport.approvedBy} ({currentReport.approvedAt?.substring(0, 10)})
                  </span>
                )}
              </div>

              {/* Executive Summary */}
              <div>
                <h4 className="font-bold text-white text-xs mb-1">Ringkasan Eksekutif Humas:</h4>
                <div className="p-3.5 rounded-lg bg-slate-800/40 text-slate-300 leading-relaxed border border-slate-800 whitespace-pre-line">
                  {currentReport.summary}
                </div>
              </div>

              {/* Top SDGs in report */}
              <div>
                <h4 className="font-bold text-white text-xs mb-2">Distribusi Capaian Utama SDGs:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentReport.topSdgDistribution?.map((item) => {
                    const sdgRef = SDG_REFERENCES.find((s) => s.number === item.sdgNumber);
                    return (
                      <div
                        key={item.sdgNumber}
                        className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px]"
                            style={{
                              backgroundColor: sdgRef?.color || '#0B3C5D',
                              color: sdgRef?.textColor || '#FFF',
                            }}
                          >
                            {item.sdgNumber}
                          </span>
                          <span className="text-slate-200 truncate max-w-[120px]">
                            {sdgRef?.shortName}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-white">{item.count} bukti</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Dokumen dicetak secara digital dari Sistem Media Monitoring UNY</span>
                <span>{DEMO_LABEL}</span>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400">Pilih laporan dari arsip.</div>
          )}
        </div>
      </div>
    </div>
  );
};
