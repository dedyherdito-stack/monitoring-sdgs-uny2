import React, { useState } from 'react';
import { SystemConfig, AuditLog, User } from '../types';
import { storageService } from '../services/storageService';
import { unyAdapterService, SourceProbeResult } from '../services/unyAdapterService';
import { DEMO_LABEL } from '../data/demoDataset';
import {
  Settings,
  ShieldCheck,
  Sliders,
  History,
  Globe,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface AdminViewProps {
  config: SystemConfig;
  auditLogs: AuditLog[];
  currentUser: User;
  onOpenReadinessModal: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  config,
  auditLogs,
  currentUser,
  onOpenReadinessModal,
}) => {
  const [threshold, setThreshold] = useState(config.confidenceThreshold);
  const [autoEscalateSensitive, setAutoEscalateSensitive] = useState(config.autoEscalateSensitive);
  const [minCoverageTarget, setMinCoverageTarget] = useState(config.minEvidenceForCoverageTarget);
  const [saveMessage, setSaveMessage] = useState('');

  // Source probe state
  const [probeResult, setProbeResult] = useState<SourceProbeResult | null>(null);
  const [isProbing, setIsProbing] = useState(false);

  // Audit filter state
  const [auditFilter, setAuditFilter] = useState('ALL');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateConfig({
      confidenceThreshold: Number(threshold),
      autoEscalateSensitive,
      minEvidenceForCoverageTarget: Number(minCoverageTarget),
    });
    setSaveMessage('Konfigurasi sistem berhasil disimpan dan dicatat ke Audit Log.');
    setTimeout(() => setSaveMessage(''), 4000);
  };

  const handleRunSourceProbe = async () => {
    setIsProbing(true);
    try {
      const res = await unyAdapterService.probeTarget('https://www.uny.ac.id/');
      setProbeResult(res);
      storageService.addAuditLog({
        actorType: 'USER',
        actorId: currentUser.id,
        actorName: currentUser.displayName,
        action: 'PROBE_SOURCE_ADAPTER',
        entityType: 'SOURCE_ADAPTER',
        entityId: 'https://www.uny.ac.id/',
        metadata: { success: res.success, httpStatus: res.httpStatus },
      });
    } catch {
      // Handled in service
    } finally {
      setIsProbing(false);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (auditFilter === 'ALL') return true;
    return log.actorType === auditFilter;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded">
              {DEMO_LABEL}
            </span>
            <h1 className="text-xl font-bold text-white">Administrasi, Tata Kelola & Audit Sistem</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi parameter ambang AI, monitoring status sumber portal www.uny.ac.id, dan log audit kepatuhan.
          </p>
        </div>

        <button
          onClick={onOpenReadinessModal}
          className="px-3.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <Info size={14} />
          <span>Buka Status Kesiapan Produksi (Rule 3 & 10)</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Two-column layout for Config & Source Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: System Config Form (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders size={16} className="text-blue-400" />
            <h2 className="font-bold text-sm text-white">Parameter Ambang Klasifikasi AI</h2>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">
                  Ambang Keyakinan Otomatis (Confidence Threshold)
                </label>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {(threshold * 100).toFixed(0)}% ({threshold})
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Aturan Wajib #7: Ambang awal adalah 0.85. Usulan klasifikasi dengan skor di bawah ambang ini
                secara otomatis dialihkan ke antrean validasi manusia.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">
                  Target Minimum Bukti Terverifikasi per SDG
                </label>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {minCoverageTarget} Bukti
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="20"
                value={minCoverageTarget}
                onChange={(e) => setMinCoverageTarget(parseInt(e.target.value, 10) || 5)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Digunakan untuk menghitung metrik Cakupan 17 SDGs pada dasbor eksekutif.
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoEscalateSensitive}
                  onChange={(e) => setAutoEscalateSensitive(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 mt-0.5"
                />
                <span className="text-slate-300 text-xs">
                  <strong>Eskalasi Otomatis Isu Sensitif:</strong> Wajibkan validasi manusia dua mata bila artikel
                  berkaitan dengan PPKS, sanksi etik, atau isu kelembagaan tinggi.
                </span>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </form>
        </div>

        {/* Right: Source Adapter Probe & Diagnostic (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-emerald-400" />
              <h2 className="font-bold text-sm text-white">Status Sumber Data (www.uny.ac.id)</h2>
            </div>
            <button
              onClick={handleRunSourceProbe}
              disabled={isProbing}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw size={12} className={isProbing ? 'animate-spin' : ''} />
              <span>{isProbing ? 'Menguji...' : 'Uji Probe Sekarang'}</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target Domain Tunggal:</span>
              <strong className="text-white">https://www.uny.ac.id/</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Metode Pengambilan:</span>
              <span className="text-blue-300 font-medium">Server-Side Proxy (Mencegah CORS)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status Penjadwal (Cron):</span>
              <span className="text-amber-400 font-medium">STUB / Manual On-Demand (Rule #3)</span>
            </div>
          </div>

          {probeResult ? (
            <div
              className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                probeResult.accessible
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-800 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>Hasil Probe Terakhir:</span>
                <span>{probeResult.durationMs} ms</span>
              </div>
              <div>
                <strong>Status Akses: </strong>
                {probeResult.accessible
                  ? `Berhasil dijangkau (HTTP ${probeResult.httpStatus || 200})`
                  : 'Fallback aktif (Runtime network limit)'}
              </div>
              <p className="text-[11px] opacity-90">{probeResult.note}</p>
            </div>
          ) : (
            <div className="p-3 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-lg">
              Klik tombol "Uji Probe Sekarang" untuk memeriksa keterjangkauan live portal UNY dari backend.
            </div>
          )}

          <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded border border-slate-800">
            <strong>Catatan Kepatuhan Aturan #2:</strong> Sistem tidak pernah melakukan web-scrape ke domain luar selain uny.ac.id. URL non-UNY akan ditolak oleh validator kanonis.
          </div>
        </div>
      </div>

      {/* Audit Log Table (Rule 9) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-3 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <History size={16} className="text-purple-400" />
            <h2 className="font-bold text-sm text-white">Log Audit Kepatuhan Sistem ({auditLogs.length} Entri)</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Filter Pelaku:</span>
            <select
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs"
            >
              <option value="ALL">Semua Pelaku</option>
              <option value="USER">Pengguna (Humas/Operator)</option>
              <option value="AGENT">AI Agent Gemini</option>
              <option value="SYSTEM">Sistem</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Waktu (UTC)</th>
                <th className="py-2.5 px-3">Pelaku</th>
                <th className="py-2.5 px-3">Tindakan</th>
                <th className="py-2.5 px-3">Tipe Entitas</th>
                <th className="py-2.5 px-3">ID Entitas</th>
                <th className="py-2.5 px-3">Metadata Rincian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                    {log.timestamp.replace('T', ' ').substring(0, 19)}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap text-slate-200">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold mr-1.5 ${
                        log.actorType === 'USER'
                          ? 'bg-blue-500/20 text-blue-300'
                          : log.actorType === 'AGENT'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {log.actorType}
                    </span>
                    {log.actorName}
                  </td>
                  <td className="py-2 px-3 text-amber-300 font-bold whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-2 px-3 text-slate-300 whitespace-nowrap">
                    {log.entityType}
                  </td>
                  <td className="py-2 px-3 text-blue-400 whitespace-nowrap">
                    {log.entityId}
                  </td>
                  <td className="py-2 px-3 text-slate-400 max-w-xs truncate" title={JSON.stringify(log.metadata)}>
                    {log.metadata ? JSON.stringify(log.metadata) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
