import React, { useState } from 'react';
import { UNY_FACULTIES_AND_UNITS } from '../data/sdgReference';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { unyAdapterService } from '../services/unyAdapterService';
import { SdgBadge } from './SdgBadge';
import { X, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { DEMO_LABEL } from '../data/demoDataset';

interface NewArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (articleId: string) => void;
}

export const NewArticleModal: React.FC<NewArticleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('https://www.uny.ac.id/berita/');
  const [author, setAuthor] = useState('Humas UNY');
  const [unitId, setUnitId] = useState('HUMAS');
  const [category, setCategory] = useState('Kegiatan Kampus');
  const [bodyText, setBodyText] = useState('');
  const [isSensitive, setIsSensitive] = useState(false);

  // AI Classification state
  const [isClassifying, setIsClassifying] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<
    { sdgNumber: number; confidenceScore: number; rationale: string }[]
  >([]);
  const [aiSummary, setAiSummary] = useState('');
  const [classificationError, setClassificationError] = useState('');
  const [formError, setFormError] = useState('');

  const handleTestClassify = async () => {
    if (!title.trim()) {
      setClassificationError('Masukkan judul artikel terlebih dahulu.');
      return;
    }
    setClassificationError('');
    setIsClassifying(true);
    try {
      const res = await geminiService.classifyArticle(title, bodyText || title);
      setAiSuggestions(res.classifications);
      setAiSummary(res.overallSummary || '');
      if (res.classifications.some((c) => c.isSensitive)) {
        setIsSensitive(true);
      }
    } catch (err: any) {
      setClassificationError(err.message || 'Gagal melakukan klasifikasi AI.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // URL validation (Rule 2)
    const urlValidation = unyAdapterService.validateCanonicalUrl(sourceUrl);
    if (!urlValidation.isValid) {
      setFormError(urlValidation.error || 'URL harus berasal dari https://www.uny.ac.id/');
      return;
    }

    if (!title.trim() || !bodyText.trim()) {
      setFormError('Judul dan isi cuplikan berita wajib diisi.');
      return;
    }

    try {
      const sdgNumbers = aiSuggestions.map((s) => s.sdgNumber);
      const created = storageService.addArticle({
        title: title.startsWith('[DEMO]') ? title : `[DEMO] ${title}`,
        author: author.trim() || 'Humas UNY',
        publishedAt: new Date().toISOString().substring(0, 10),
        unitId,
        category,
        bodyText,
        sourceUrl: urlValidation.normalizedUrl || sourceUrl.trim(),
        isSensitive,
        sdgNumbers: sdgNumbers.length > 0 ? sdgNumbers : [4], // Default to SDG 4 if not classified
      });

      onSuccess(created.id);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan berita.');
    }
  };

  const handleUseSampleTemplate = () => {
    setTitle('FMIPA UNY Luncurkan Program Kebun Bibit Herbal Konservasi Tanaman Obat Langka');
    setSourceUrl('https://www.uny.ac.id/berita/fmipa-uny-kebun-bibit-herbal-langka');
    setAuthor('Humas FMIPA UNY');
    setUnitId('FMIPA');
    setCategory('Konservasi Lingkungan');
    setBodyText(
      'Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA) Universitas Negeri Yogyakarta meresmikan kebun konservasi plasma nutfah tanaman herbal endemik Jawa. Program ini melibatkan 300 mahasiswa biologi dan masyarakat sekitar Karangmalang untuk budidaya bibit obat tradisional bebas pestisida kimia serta edukasi pemanfaatan bahan alam berkhasiat.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full p-6 text-slate-200 my-8">
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded">
                {DEMO_LABEL}
              </span>
              <h2 className="text-lg font-bold text-white">Tambah / Uji Berita Baru</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Uji pemrosesan pipeline: pengecekan domain uny.ac.id, deduplikasi hash, dan klasifikasi AI Gemini.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUseSampleTemplate}
              className="text-[11px] text-blue-400 hover:underline"
            >
              + Isi dengan contoh artikel Tridharma UNY
            </button>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              URL Sumber Berita (Wajib: https://www.uny.ac.id/...) <span className="text-rose-400">*</span>
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              required
              placeholder="https://www.uny.ac.id/berita/..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Aturan Wajib #2: Sumber data terikat hanya pada www.uny.ac.id.
            </span>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Judul Artikel Berita <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Contoh: UNY Selenggarakan Inovasi Panel Surya..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Penulis / Unit Peliput</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Humas FMIPA UNY"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Fakultas / Unit</label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-blue-500"
              >
                {UNY_FACULTIES_AND_UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.code} - {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Kategori</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Pengabdian Masyarakat / Riset"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Isi Cuplikan Berita <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              required
              placeholder="Tuliskan isi ringkas artikel..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isSensitiveCheckbox"
              checked={isSensitive}
              onChange={(e) => setIsSensitive(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <label htmlFor="isSensitiveCheckbox" className="text-slate-300 text-xs cursor-pointer">
              Tandai sebagai isu sensitif / memerlukan eskalasi tinjauan khusus (PPKS, etika, sanksi)
            </label>
          </div>

          {/* AI Gemini Classification Section */}
          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400" />
                <span className="font-semibold text-white">Klasifikasi AI Gemini (Server-side)</span>
              </div>
              <button
                type="button"
                onClick={handleTestClassify}
                disabled={isClassifying || !title.trim()}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 transition"
              >
                {isClassifying ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    Uji Klasifikasi AI
                  </>
                )}
              </button>
            </div>

            {classificationError && (
              <div className="text-rose-400 text-[11px]">{classificationError}</div>
            )}

            {aiSuggestions.length > 0 && (
              <div className="mt-2 space-y-1.5 pt-2 border-t border-blue-900/50">
                <div className="text-[11px] text-blue-200 font-medium">Hasil Rekomendasi (Maks 3 SDGs):</div>
                <div className="flex flex-wrap gap-1.5">
                  {aiSuggestions.map((s) => (
                    <div key={s.sdgNumber} className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded">
                      <SdgBadge sdgNumber={s.sdgNumber} size="sm" />
                      <span className="text-[11px] text-slate-300 font-mono">
                        {(s.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
                {aiSummary && <p className="text-[11px] text-slate-300 italic">"{aiSummary}"</p>}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition flex items-center gap-1.5"
            >
              <CheckCircle2 size={15} />
              Simpan ke Antrean Berita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
