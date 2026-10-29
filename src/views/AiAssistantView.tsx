import React, { useState } from 'react';
import { Article, SDGClassification } from '../types';
import { SDG_REFERENCES } from '../data/sdgReference';
import { geminiService, GeminiClassificationResult } from '../services/geminiService';
import { SdgBadge } from '../components/SdgBadge';
import { DEMO_LABEL } from '../data/demoDataset';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Bot,
  ExternalLink,
} from 'lucide-react';

interface AiAssistantViewProps {
  articles: Article[];
  classifications: SDGClassification[];
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  articles,
  classifications,
}) => {
  const [activeTab, setActiveTab] = useState<'qa' | 'classifier' | 'press'>('qa');

  // Grounded Q&A state
  const [question, setQuestion] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaError, setQaError] = useState('');

  // Classifier test state
  const [testTitle, setTestTitle] = useState('');
  const [testBody, setTestBody] = useState('');
  const [classifying, setClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState<GeminiClassificationResult | null>(null);

  // Press Release state
  const [pressSummary, setPressSummary] = useState('');
  const [pressLoading, setPressLoading] = useState(false);

  // Verified context compilation (STRICT RULE: ONLY VERIFIED DATA)
  const verifiedCls = classifications.filter((c) => c.status === 'VERIFIED');
  const verifiedArticleIds = new Set(verifiedCls.map((c) => c.articleId));
  const verifiedArticles = articles.filter((a) => verifiedArticleIds.has(a.id));

  const verifiedContext = verifiedArticles
    .map((a) => {
      const artCls = verifiedCls.filter((c) => c.articleId === a.id);
      const sdgNames = artCls
        .map((c) => {
          const ref = SDG_REFERENCES.find((s) => s.number === c.sdgNumber);
          return `SDG ${c.sdgNumber} (${ref?.officialIndonesianName || ''})`;
        })
        .join(', ');
      return `[ID: ${a.id}] Judul: ${a.title} | Unit: ${a.unitId} | Tanggal: ${a.publishedAt} | URL: ${a.sourceUrl} | SDGs Terverifikasi: ${sdgNames} | Cuplikan: ${a.bodyText}`;
    })
    .join('\n\n');

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setQaLoading(true);
    setQaError('');
    setQaAnswer('');

    try {
      const answer = await geminiService.askVerifiedContext(question.trim(), verifiedContext);
      setQaAnswer(answer);
    } catch (err: any) {
      setQaError(err.message || 'Gagal memproses pertanyaan.');
    } finally {
      setQaLoading(false);
    }
  };

  const handleRunClassifier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) return;

    setClassifying(true);
    try {
      const res = await geminiService.classifyArticle(testTitle, testBody || testTitle);
      setClassificationResult(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setClassifying(false);
    }
  };

  const handleGeneratePressRelease = async () => {
    setPressLoading(true);
    try {
      const res = await geminiService.generateExecutiveSummary(
        verifiedArticles.map((a) => ({
          title: a.title,
          unit: a.unitId,
          date: a.publishedAt,
        })),
        'Oktober 2026'
      );
      setPressSummary(res);
    } catch {
      setPressSummary('Gagal membuat rilis pers.');
    } finally {
      setPressLoading(false);
    }
  };

  const sampleQuestions = [
    'Apa saja kontribusi riset Fakultas Teknik UNY untuk energi bersih?',
    'Bagaimana program penanganan stunting dan kesehatan yang dilakukan UNY?',
    'Fakultas apa saja yang memiliki bukti terverifikasi pada SDG 4 Pendidikan Berkualitas?',
    'Apakah ada program UNY terkait pelestarian ekosistem dan keanekaragaman hayati?',
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded">
              {DEMO_LABEL}
            </span>
            <h1 className="text-xl font-bold text-white">Panel Asisten AI Humas UNY</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dukungan Gemini 3.8 Flash untuk tanya-jawab data terverifikasi (grounded), kurasi JSON terstruktur, dan perumusan siaran pers.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'qa' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tanya-Jawab Terverifikasi
          </button>
          <button
            onClick={() => setActiveTab('classifier')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'classifier' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Uji Klasifikasi AI
          </button>
          <button
            onClick={() => setActiveTab('press')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeTab === 'press' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            Generator Siaran Pers
          </button>
        </div>
      </div>

      {/* Tab 1: Grounded Q&A */}
      {activeTab === 'qa' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs text-xs space-y-4">
            <div className="p-3 bg-blue-950/40 border border-blue-900/40 rounded-lg text-blue-200">
              <strong>Prinsip Anti-Halusinasi Humas:</strong> Model AI diinstruksikan hanya menjawab
              menggunakan {verifiedArticles.length} berita UNY yang telah lolos status <strong>VERIFIED</strong>.
              Jika suatu topik belum memiliki berita terverifikasi, model tidak akan mengarang fakta.
            </div>

            {/* Prompt form */}
            <form onSubmit={handleAsk} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Pertanyaan Anda tentang Capaian SDGs UNY:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Contoh: Apa inovasi energi terbarukan yang telah diverifikasi untuk FT UNY?"
                    className="w-full pl-3 pr-24 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-hidden focus:border-blue-500 placeholder-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={qaLoading || !question.trim()}
                    className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md disabled:opacity-40 flex items-center gap-1.5 transition"
                  >
                    {qaLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    <span>Kirim</span>
                  </button>
                </div>
              </div>

              {/* Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="text-slate-400">Contoh Cepat:</span>
                {sampleQuestions.map((sq, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setQuestion(sq)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </form>

            {qaError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{qaError}</span>
              </div>
            )}

            {/* Answer Display */}
            {qaAnswer && (
              <div className="mt-4 p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs pb-2 border-b border-slate-700/60">
                  <Bot size={16} className="text-amber-400" />
                  <span>Jawaban Resmi Asisten Humas UNY:</span>
                </div>
                <div className="text-slate-200 text-xs leading-relaxed whitespace-pre-line pt-1">
                  {qaAnswer}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Test Classifier */}
      {activeTab === 'classifier' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs text-xs space-y-4">
          <div>
            <h2 className="font-bold text-sm text-white">Simulator Klasifikasi AI (Structured JSON Output)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Uji ketepatan model Gemini 3.8 Flash dalam mengklasifikasikan draf teks berita baru ke taksonomi 17 SDGs dengan batas maksimal 3 tujuan.
            </p>
          </div>

          <form onSubmit={handleRunClassifier} className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Judul Draf Berita:</label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Contoh: UNY Berikan Pelatihan Keterampilan Komputer untuk Difabel di Kulon Progo"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Isi Berita:</label>
              <textarea
                rows={3}
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                placeholder="Isi cuplikan rilis pers yang akan dianalisis..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={classifying || !testTitle.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition disabled:opacity-40"
              >
                {classifying ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    Jalankan Klasifikasi Gemini
                  </>
                )}
              </button>
            </div>
          </form>

          {classificationResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <span className="font-bold text-white text-xs">Hasil Keluaran Model:</span>
                <span className="text-[11px] font-mono text-slate-400">
                  Model: {classificationResult.model}
                </span>
              </div>

              {classificationResult.note && (
                <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/60 p-2 rounded">
                  {classificationResult.note}
                </div>
              )}

              {classificationResult.overallSummary && (
                <p className="text-slate-300 text-xs italic">
                  "{classificationResult.overallSummary}"
                </p>
              )}

              <div className="space-y-2">
                {classificationResult.classifications.map((c) => (
                  <div
                    key={c.sdgNumber}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <SdgBadge sdgNumber={c.sdgNumber} size="sm" />
                      <span className="font-mono font-bold text-amber-400">
                        Skor: {(c.confidenceScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{c.rationale}</p>
                    {c.isSensitive && (
                      <span className="inline-block text-[10px] text-rose-400 font-bold">
                        ⚠️ Terdeteksi Isu Sensitif
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Press Release Generator */}
      {activeTab === 'press' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs text-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-sm text-white">Generator Rilis Pers Humas Capaian SDGs</h2>
              <p className="text-xs text-slate-400">
                Menyusun draf siaran pers resmi berbasis {verifiedArticles.length} berita Tridharma terverifikasi.
              </p>
            </div>
            <button
              onClick={handleGeneratePressRelease}
              disabled={pressLoading || verifiedArticles.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5 transition disabled:opacity-40"
            >
              {pressLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>{pressLoading ? 'Menyusun Rilis...' : 'Buat Draf Rilis Pers'}</span>
            </button>
          </div>

          {pressSummary ? (
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-700">
                <span>DRAF SIARAN PERS RESMI BAGIAN HUMAS UNY</span>
                <span>Siap disebarluaskan ke media mitra</span>
              </div>
              <div className="text-slate-200 text-xs leading-relaxed whitespace-pre-line pt-2">
                {pressSummary}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Klik "Buat Draf Rilis Pers" untuk mengolah seluruh bukti berita terverifikasi menjadi narasi institusional UNY.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
