import React, { useState } from 'react';
import { Article, SDGClassification, KPISummary } from '../types';
import { SDG_REFERENCES } from '../data/sdgReference';
import { DEMO_LABEL } from '../data/demoDataset';
import {
  Calendar,
  TrendingUp,
  BarChart3,
  Flame,
  Info,
} from 'lucide-react';

interface TrendsViewProps {
  articles: Article[];
  classifications: SDGClassification[];
  kpi: KPISummary;
}

const MONTHS = [
  { key: '01', label: 'Jan' },
  { key: '02', label: 'Feb' },
  { key: '03', label: 'Mar' },
  { key: '04', label: 'Apr' },
  { key: '05', label: 'Mei' },
  { key: '06', label: 'Jun' },
  { key: '07', label: 'Jul' },
  { key: '08', label: 'Ags' },
  { key: '09', label: 'Sep' },
  { key: '10', label: 'Okt' },
  { key: '11', label: 'Nov' },
  { key: '12', label: 'Des' },
];

export const TrendsView: React.FC<TrendsViewProps> = ({
  articles,
  classifications,
  kpi,
}) => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [hoveredCell, setHoveredCell] = useState<{
    sdgNum: number;
    month: string;
    count: number;
  } | null>(null);

  // Build matrix: SDG (1..17) × Month (01..12)
  const heatmapMatrix: Record<number, Record<string, number>> = {};
  for (let i = 1; i <= 17; i++) {
    heatmapMatrix[i] = {};
    for (const m of MONTHS) {
      heatmapMatrix[i][m.key] = 0;
    }
  }

  // Populate matrix with VERIFIED articles
  const verifiedCls = classifications.filter((c) => c.status === 'VERIFIED');
  const articleMap = new Map(articles.map((a) => [a.id, a]));

  for (const c of verifiedCls) {
    const art = articleMap.get(c.articleId);
    if (art && art.publishedAt) {
      const year = art.publishedAt.substring(0, 4);
      const month = art.publishedAt.substring(5, 7);
      if (year === selectedYear && heatmapMatrix[c.sdgNumber] && heatmapMatrix[c.sdgNumber][month] !== undefined) {
        heatmapMatrix[c.sdgNumber][month] += 1;
      }
    }
  }

  // Max count for scaling intensity
  let maxHeat = 1;
  for (let i = 1; i <= 17; i++) {
    for (const m of MONTHS) {
      if (heatmapMatrix[i][m.key] > maxHeat) {
        maxHeat = heatmapMatrix[i][m.key];
      }
    }
  }

  const getHeatColor = (count: number, baseColor: string) => {
    if (count === 0) return 'bg-slate-800/40 text-slate-600';
    const intensity = count / maxHeat;
    if (intensity < 0.3) return 'bg-blue-900/60 text-blue-200 border border-blue-700/50 font-semibold';
    if (intensity < 0.7) return 'bg-blue-600 text-white font-bold';
    return 'bg-amber-500 text-slate-950 font-black shadow-xs';
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
            <h1 className="text-xl font-bold text-white">Tren Waktu & Heatmap 17 SDGs × 12 Bulan</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualisasi intensitas publikasi berita terverifikasi sepanjang tahun untuk mendeteksi kesenjangan dan konsistensi publikasi Tridharma.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Tahun:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
          >
            <option value="2026">2026 (Tahun Berjalan)</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Monthly Aggregate Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-bold text-sm text-white">Tren Bulanan Publikasi & Verifikasi</h2>
            <p className="text-xs text-slate-400">Jumlah total berita terbit vs yang telah lolos verifikasi Humas.</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-slate-300">Total Berita</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-300">Terverifikasi</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-12 gap-2 h-44 items-end pt-4 pb-2 border-b border-slate-800">
          {MONTHS.map((m) => {
            const key = `${selectedYear}-${m.key}`;
            const trend = kpi.monthlyTrends.find((t) => t.monthKey === key) || { total: 0, verified: 0 };
            const maxVal = Math.max(...kpi.monthlyTrends.map((t) => t.total), 5);
            const totalHeight = maxVal > 0 ? (trend.total / maxVal) * 100 : 0;
            const verifiedHeight = maxVal > 0 ? (trend.verified / maxVal) * 100 : 0;

            return (
              <div key={m.key} className="flex flex-col items-center h-full justify-end group">
                <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                  {trend.verified}/{trend.total}
                </div>
                <div className="w-full max-w-[28px] bg-slate-800/80 rounded-t flex flex-col justify-end overflow-hidden h-32 relative">
                  <div
                    style={{ height: `${totalHeight}%` }}
                    className="w-full bg-blue-600/50 rounded-t transition-all duration-300 relative flex flex-col justify-end"
                  >
                    <div
                      style={{ height: `${totalHeight > 0 ? (verifiedHeight / totalHeight) * 100 : 0}%` }}
                      className="w-full bg-emerald-500 rounded-t transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="text-[11px] font-medium text-slate-400 mt-2">{m.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap: 17 SDGs × 12 Months */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-amber-400" />
              <h2 className="font-bold text-sm text-white">Matriks Heatmap (17 SDGs × 12 Bulan)</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Intensitas warna menunjukkan kerapatan bukti berita yang terverifikasi pada masing-masing tujuan per bulan.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Intensitas:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/40 text-slate-400 border border-slate-700">0</span>
            <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-200">Rendah</span>
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold">Sedang</span>
            <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black">Tinggi</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-xs">
            <thead>
              <tr>
                <th className="text-left font-semibold text-slate-400 py-2 pr-3 w-48">Tujuan SDG</th>
                {MONTHS.map((m) => (
                  <th key={m.key} className="text-center font-semibold text-slate-400 py-2 px-1">
                    {m.label}
                  </th>
                ))}
                <th className="text-right font-semibold text-slate-400 py-2 pl-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SDG_REFERENCES.map((sdg) => {
                let rowTotal = 0;
                for (const m of MONTHS) {
                  rowTotal += heatmapMatrix[sdg.number][m.key] || 0;
                }

                return (
                  <tr key={sdg.number} className="hover:bg-slate-800/30 transition">
                    <td className="py-1.5 pr-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0"
                          style={{ backgroundColor: sdg.color, color: sdg.textColor }}
                        >
                          {sdg.number}
                        </span>
                        <span className="truncate text-slate-300 font-medium max-w-[160px]" title={sdg.officialIndonesianName}>
                          {sdg.shortName}
                        </span>
                      </div>
                    </td>

                    {MONTHS.map((m) => {
                      const count = heatmapMatrix[sdg.number][m.key] || 0;
                      return (
                        <td key={m.key} className="p-1 text-center">
                          <div
                            onMouseEnter={() => setHoveredCell({ sdgNum: sdg.number, month: m.label, count })}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`w-full h-7 rounded flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${getHeatColor(
                              count,
                              sdg.color
                            )}`}
                          >
                            {count > 0 ? count : '-'}
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-1.5 pl-3 text-right font-mono font-bold text-slate-200">
                      {rowTotal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Hover inspection tooltip */}
        {hoveredCell && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 flex items-center justify-between">
            <div>
              <strong>SDG {hoveredCell.sdgNum}:</strong> {SDG_REFERENCES[hoveredCell.sdgNum - 1].officialIndonesianName}
            </div>
            <div className="text-blue-300">
              Bulan {hoveredCell.month} {selectedYear}: <strong>{hoveredCell.count} berita terverifikasi</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
