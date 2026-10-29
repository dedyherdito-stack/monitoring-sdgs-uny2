import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { storageService, DEMO_USERS } from '../services/storageService';
import { unyAdapterService, SourceProbeResult } from '../services/unyAdapterService';
import { DEMO_LABEL } from '../data/demoDataset';
import {
  ShieldAlert,
  Server,
  Globe,
  UserCheck,
  ChevronDown,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onOpenReadinessModal: () => void;
  onOpenNewArticleModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenReadinessModal,
  onOpenNewArticleModal,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [probeResult, setProbeResult] = useState<SourceProbeResult | null>(null);
  const [isProbing, setIsProbing] = useState(false);

  useEffect(() => {
    // Initial probe of www.uny.ac.id
    checkPortalProbe();
  }, []);

  const checkPortalProbe = async () => {
    setIsProbing(true);
    try {
      const res = await unyAdapterService.probeTarget('https://www.uny.ac.id/');
      setProbeResult(res);
    } catch {
      // Ignored
    } finally {
      setIsProbing(false);
    }
  };

  const handleSelectUser = (user: User) => {
    storageService.setCurrentUser(user);
    setShowUserDropdown(false);
  };

  const handleResetData = () => {
    if (confirm('Kembalikan dataset contoh ke kondisi awal DEMO? Semua perubahan validasi sesi ini akan direset.')) {
      storageService.resetToDemo();
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      {/* Top Banner: Mandatory Rule 1 Warning Banner */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-1.5 py-0.5 rounded tracking-wide">
            {DEMO_LABEL}
          </span>
          <span className="text-amber-100/90 font-medium">
            Prototipe AI Media Monitoring Humas UNY — Seluruh berita, nama penulis & angka adalah dataset simulasi.
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-amber-300/80">
          <span className="hidden md:inline">Sumber Data Tunggal: https://www.uny.ac.id/</span>
          <button
            onClick={onOpenReadinessModal}
            className="underline hover:text-white flex items-center gap-1 transition-colors"
          >
            <Info size={13} />
            Status Arsitektur & Kesiapan
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & University Identity with official UNY logo */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0 flex items-center justify-center">
            <img
              src="/assets/aistudio/Logo-UNY-Corel-terbaru_06879512.png"
              alt="Logo Universitas Negeri Yogyakarta"
              className="w-11 h-11 object-contain drop-shadow-md hover:scale-105 transition-transform"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-white">
                Dashboard SDGs UNY
              </h1>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold px-2 py-0.5 rounded">
                Bagian Humas
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Universitas Negeri Yogyakarta • Pemantauan Berita & Bukti Tridharma 17 SDGs
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Source Probe Status */}
          <div
            onClick={checkPortalProbe}
            className="cursor-pointer hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs text-slate-300 hover:bg-slate-700 transition"
            title="Klik untuk ping ulang status portal www.uny.ac.id"
          >
            <Globe size={14} className={isProbing ? 'animate-spin text-amber-400' : 'text-blue-400'} />
            <span className="text-[11px]">Portal UNY:</span>
            {probeResult?.accessible ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                <CheckCircle2 size={12} />
                Online ({probeResult.httpStatus || 200})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-medium">
                <AlertTriangle size={12} />
                Proxy Fallback
              </span>
            )}
          </div>

          {/* Quick Add Article (Demonstrating Crawler / Manual ingestion) */}
          <button
            onClick={onOpenNewArticleModal}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-sm"
          >
            <Server size={14} />
            <span className="hidden sm:inline">Tambah / Uji Berita</span>
          </button>

          {/* Reset Demo button */}
          <button
            onClick={handleResetData}
            title="Reset dataset ke awal demo"
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <RotateCcw size={15} />
          </button>

          {/* Role & User Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-left text-xs transition"
            >
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-blue-300 font-semibold text-xs">
                {currentUser.displayName.charAt(0)}
              </div>
              <div className="hidden md:block">
                <div className="font-semibold text-slate-200 leading-tight">
                  {currentUser.displayName}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      currentUser.role === 'ADMIN' ? 'bg-purple-400' : 'bg-amber-400'
                    }`}
                  />
                  {currentUser.role === 'ADMIN' ? 'Admin Humas Pusat' : `Operator (${currentUser.assignedUnitId})`}
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 z-50 text-xs">
                <div className="px-3 py-1.5 text-[11px] text-slate-400 border-b border-slate-700 font-medium">
                  Simulasi Akun Pengguna (RBAC Aturan #9)
                </div>
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700/60 transition ${
                      user.id === currentUser.id ? 'bg-blue-600/20 text-blue-300' : 'text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{user.displayName}</div>
                      <div className="text-[10px] text-slate-400">
                        {user.role} {user.assignedUnitId ? `• Unit ${user.assignedUnitId}` : '• Akses Semua Unit'}
                      </div>
                    </div>
                    {user.id === currentUser.id && (
                      <UserCheck size={14} className="text-blue-400" />
                    )}
                  </button>
                ))}
                <div className="mt-1 pt-1 border-t border-slate-700 px-3 py-1 text-[10px] text-slate-400">
                  Operator hanya dapat melihat & memvalidasi data unitnya sendiri.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
