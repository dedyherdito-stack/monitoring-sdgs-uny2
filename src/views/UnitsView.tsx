import React, { useState } from 'react';
import { Article, SDGClassification, User } from '../types';
import { UNY_FACULTIES_AND_UNITS, SDG_REFERENCES } from '../data/sdgReference';
import { SdgBadge } from '../components/SdgBadge';
import { DEMO_LABEL } from '../data/demoDataset';
import {
  School,
  ShieldAlert,
  FileText,
  CheckCircle2,
  Lock,
  ExternalLink,
  Search,
} from 'lucide-react';

interface UnitsViewProps {
  articles: Article[];
  classifications: SDGClassification[];
  currentUser: User;
}

export const UnitsView: React.FC<UnitsViewProps> = ({
  articles,
  classifications,
  currentUser,
}) => {
  const isOperator = currentUser.role === 'OPERATOR';
  const assignedUnit = currentUser.assignedUnitId;

  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    isOperator && assignedUnit ? assignedUnit : 'FT'
  );

  // Group stats by unit
  const unitStats = UNY_FACULTIES_AND_UNITS.map((unit) => {
    const unitArticles = articles.filter((a) => a.unitId === unit.id);
    const unitArticleIds = new Set(unitArticles.map((a) => a.id));
    const verifiedCls = classifications.filter(
      (c) => unitArticleIds.has(c.articleId) && c.status === 'VERIFIED'
    );

    // Count distinct verified articles
    const verifiedArticleCount = new Set(verifiedCls.map((c) => c.articleId)).size;

    // Top SDGs for this unit
    const sdgFrequency: Record<number, number> = {};
    for (const c of verifiedCls) {
      sdgFrequency[c.sdgNumber] = (sdgFrequency[c.sdgNumber] || 0) + 1;
    }
    const topSdgs = Object.entries(sdgFrequency)
      .map(([num, count]) => ({ sdgNumber: Number(num), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      unit,
      totalArticles: unitArticles.length,
      verifiedArticles: verifiedArticleCount,
      topSdgs,
    };
  });

  // Current active unit for inspection
  const activeUnitStat = unitStats.find((s) => s.unit.id === selectedUnitId) || unitStats[0];
  const unitArticles = articles.filter((a) => a.unitId === selectedUnitId);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded">
              {DEMO_LABEL}
            </span>
            <h1 className="text-xl font-bold text-white">Kontribusi Fakultas & Unit Kerja UNY</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pemetaan capaian publikasi berita Tridharma dan fokus SDGs lintas fakultas, biro, dan lembaga penelitian.
          </p>
        </div>

        {/* RBAC Badge */}
        <div className="flex items-center gap-2">
          {isOperator ? (
            <span className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-1.5 font-medium">
              <Lock size={13} />
              <span>Mode Operator: Terbatas Unit {assignedUnit}</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs flex items-center gap-1.5 font-medium">
              <School size={13} />
              <span>Mode Admin Humas: Akses Seluruh Unit</span>
            </span>
          )}
        </div>
      </div>

      {/* Operator restriction notice if operator tries to view other units */}
      {isOperator && assignedUnit && selectedUnitId !== assignedUnit && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
          <ShieldAlert size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-100 text-sm">
              Akses Unit Lain Terkunci (Aturan Wajib #9)
            </div>
            <p className="mt-1 leading-relaxed text-amber-200/90">
              Anda masuk sebagai <strong>Operator {assignedUnit}</strong>. Sesuai prinsip proteksi privasi dan audit
              multi-fakultas, Anda hanya dapat mengelola dan memvalidasi data untuk unit Anda.
            </p>
            <button
              onClick={() => setSelectedUnitId(assignedUnit)}
              className="mt-2.5 px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
            >
              Kembali ke Unit Saya ({assignedUnit})
            </button>
          </div>
        </div>
      )}

      {/* Units List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {unitStats.map((stat) => {
          const isSelected = selectedUnitId === stat.unit.id;
          const isForbidden = isOperator && assignedUnit && stat.unit.id !== assignedUnit;

          return (
            <div
              key={stat.unit.id}
              onClick={() => {
                if (!isForbidden) setSelectedUnitId(stat.unit.id);
              }}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                isForbidden
                  ? 'bg-slate-900/40 border-slate-800/50 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/50 cursor-pointer'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 cursor-pointer'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center justify-center font-bold text-xs">
                      {stat.unit.code}
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-white leading-tight">
                        {stat.unit.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {stat.unit.type}
                      </span>
                    </div>
                  </div>

                  {isForbidden && (
                    <span title="Akses dibatasi untuk operator lain">
                      <Lock size={14} className="text-slate-500" />
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                  <span>Total Berita: <strong>{stat.totalArticles}</strong></span>
                  <span className="text-emerald-400 font-semibold">
                    {stat.verifiedArticles} Terverifikasi
                  </span>
                </div>
              </div>

              {/* Top SDGs badge preview */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">Fokus Utama:</span>
                {stat.topSdgs.length === 0 ? (
                  <span className="text-[10px] text-slate-500 italic">Belum ada verifikasi</span>
                ) : (
                  stat.topSdgs.map((top) => (
                    <SdgBadge key={top.sdgNumber} sdgNumber={top.sdgNumber} size="sm" showName={false} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Unit Article Stream */}
      {(!isOperator || selectedUnitId === assignedUnit) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-sm text-white">
                Daftar Publikasi Berita: {activeUnitStat.unit.name} ({activeUnitStat.unit.code})
              </h2>
              <p className="text-xs text-slate-400">
                Total {unitArticles.length} artikel terdaftar dalam sistem pemantauan.
              </p>
            </div>
          </div>

          {unitArticles.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Belum ada artikel yang tercatat untuk unit ini dalam dataset demo.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {unitArticles.map((art) => {
                const artCls = classifications.filter((c) => c.articleId === art.id);

                return (
                  <div
                    key={art.id}
                    className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-white text-sm">{art.title}</h4>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          Dipublikasikan: {art.publishedAt} • Penulis: {art.author} • Kategori: {art.category}
                        </div>
                      </div>

                      <a
                        href={art.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 shrink-0 flex items-center gap-1 font-medium"
                      >
                        <span>Sumber</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    <p className="text-slate-300 line-clamp-2 leading-relaxed">
                      {art.bodyText}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-slate-400 text-[11px] font-medium mr-1">Tautan SDG:</span>
                      {artCls.map((c) => (
                        <div key={c.id} className="flex items-center gap-1">
                          <SdgBadge sdgNumber={c.sdgNumber} size="sm" />
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              c.status === 'VERIFIED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
