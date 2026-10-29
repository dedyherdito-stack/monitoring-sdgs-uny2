import React from 'react';
import {
  LayoutDashboard,
  Target,
  LineChart,
  School,
  Newspaper,
  CheckSquare,
  FileSpreadsheet,
  Globe,
  Settings,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export type NavTab =
  | 'home'
  | 'sdgs'
  | 'trends'
  | 'units'
  | 'news'
  | 'validation'
  | 'reports'
  | 'transparency'
  | 'admin'
  | 'ai';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingValidationCount: number;
  userRole: 'ADMIN' | 'OPERATOR';
  operatorUnit?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingValidationCount,
  userRole,
  operatorUnit,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number; adminOnly?: boolean }[] = [
    { id: 'home', label: 'Beranda', icon: LayoutDashboard },
    { id: 'sdgs', label: '17 SDGs & Bukti', icon: Target },
    { id: 'trends', label: 'Tren & Heatmap', icon: LineChart },
    { id: 'units', label: 'Fakultas / Unit', icon: School },
    { id: 'news', label: 'Daftar Berita', icon: Newspaper },
    {
      id: 'validation',
      label: 'Antrean Validasi',
      icon: CheckSquare,
      badge: pendingValidationCount > 0 ? pendingValidationCount : undefined,
    },
    { id: 'reports', label: 'Laporan & Ekspor', icon: FileSpreadsheet },
    { id: 'transparency', label: 'Transparansi Publik', icon: Globe },
    { id: 'ai', label: 'Panel AI Humas', icon: Sparkles },
    { id: 'admin', label: 'Administrasi & Audit', icon: Settings, adminOnly: true },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Scope Info for Operator */}
      {userRole === 'OPERATOR' && operatorUnit && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-blue-950/60 border border-blue-800/40 text-xs">
          <div className="text-[11px] font-medium text-blue-300">Lingkup Akses Unit:</div>
          <div className="font-bold text-white tracking-wide mt-0.5">{operatorUnit}</div>
          <div className="text-[10px] text-blue-400 mt-1">
            Data unit lain dibatasi sesuai Aturan Wajib #9.
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.adminOnly && userRole !== 'ADMIN') {
            return null;
          }

          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info & Official Portal Link */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
        <a
          href="https://www.uny.ac.id/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-md bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="truncate">Portal www.uny.ac.id</span>
          </div>
          <ExternalLink size={12} className="text-slate-400" />
        </a>
        <div className="mt-2 text-center text-[10px] text-slate-400">
          Versi 1.0 (Prototipe Build)
        </div>
      </div>
    </aside>
  );
};
