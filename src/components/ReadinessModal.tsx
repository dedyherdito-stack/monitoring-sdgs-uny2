import React from 'react';
import {
  X,
  AlertTriangle,
  Database,
  Clock,
  KeyRound,
  Bot,
  Globe,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import { DEMO_LABEL } from '../data/demoDataset';

interface ReadinessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadinessModal: React.FC<ReadinessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const items = [
    {
      title: 'Database Permanen (PostgreSQL / Cloud SQL)',
      status: 'STUB / SESI LOCALSTORAGE',
      statusColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
      icon: Database,
      desc: 'Saat ini data disimpan di memori dan localStorage browser untuk keperluan evaluasi prototipe. Untuk deployment produksi Bagian Humas, siapkan instance PostgreSQL atau Cloud SQL dengan skema relasional tabel Article, Classification, Validation, dan AuditLog.',
      configNeeded: 'DATABASE_URL (PostgreSQL connection string), migrasi skema Drizzle/Prisma.',
    },
    {
      title: 'Penjadwal Pengambilan Berita (Cron Scheduler)',
      status: 'MANUAL / PROBE ON-DEMAND',
      statusColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
      icon: Clock,
      desc: 'Aplikasi tidak mengklaim scraper berjalan otomatis 24/7 di latar belakang. Pengambilan saat ini dilakukan melalui endpoint proxy server secara on-demand saat diminta.',
      configNeeded: 'Cloud Scheduler / Linux Crontab (misal: setiap 6 jam) memanggil worker service backend crawler.',
    },
    {
      title: 'Autentikasi Aman & SSO Institusi (UNY CAS/OAuth2)',
      status: 'SIMULASI RBAC ROLE SWITCHER',
      statusColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
      icon: KeyRound,
      desc: 'Pergantian peran Admin Humas dan Operator Fakultas disimulasikan melalui selector pengguna untuk menguji isolasi hak akses data (Aturan #9).',
      configNeeded: 'Integrasi SSO UNY (Central Authentication Service / OAuth2 UPT TIK UNY) dan session cookie HTTP-only.',
    },
    {
      title: 'Mesin AI Gemini 3.8 Flash (Server-Side Proxy)',
      status: 'TERSEDIA VIA BACKEND / FALLBACK HEURISTIK',
      statusColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
      icon: Bot,
      desc: 'Endpoint server-side /api/gemini/classify dan /api/gemini/ask telah diimplementasikan dengan JSON Schema terstruktur tanpa mengekspos API key ke browser. Jika kunci belum diinjeksi, mesin otomatis beralih ke aturan heuristik transparan.',
      configNeeded: 'Pastikan variabel GEMINI_API_KEY terpasang di Google AI Studio Secrets / Cloud Run env.',
    },
    {
      title: 'Sumber Data Tunggal www.uny.ac.id',
      status: 'SERVER HTTP PROXY AKTIF',
      statusColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
      icon: Globe,
      desc: 'Pengecekan live probe ke domain www.uny.ac.id berjalan melalui backend Express untuk menghindari pemblokiran CORS browser. Deduplikasi berbasis URL kanonis dan Content Hash aktif.',
      configNeeded: 'Koordinasi teknis dengan pengelola web uny.ac.id untuk izin crawling dan penyediaan feed RSS resmi.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full p-6 text-slate-200 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded">
                {DEMO_LABEL}
              </span>
              <h2 className="text-lg font-bold text-white">Status Arsitektur & Kesiapan Produksi</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dokumentasi transparansi kepatuhan Aturan Wajib #3 & #10 PRD Humas UNY.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200">
            <strong>Komitmen Kejujuran Teknis:</strong> Prototipe ini berfungsi penuh secara interaktif
            (klasifikasi AI, filter, validasi manusia, audit log, KPI, dan ekspor). Bagian berikut
            merupakan daftar komponen infrastruktur yang perlu dikonfigurasi saat masuk tahap produksi
            penuh universitas.
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-3.5 rounded-lg bg-slate-800/60 border border-slate-700/80">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-blue-400" />
                      <h3 className="font-semibold text-sm text-white">{item.title}</h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{item.desc}</p>
                  <div className="mt-2 text-[11px] text-amber-300/90 bg-slate-900/60 p-2 rounded border border-slate-800">
                    <span className="font-semibold text-slate-400">Konfigurasi yang Diperlukan: </span>
                    {item.configNeeded}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition"
          >
            Tutup Dokumentasi
          </button>
        </div>
      </div>
    </div>
  );
};
