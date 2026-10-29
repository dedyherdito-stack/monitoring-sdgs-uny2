export interface GeminiClassificationResult {
  classifications: {
    sdgNumber: number;
    confidenceScore: number;
    rationale: string;
    isSensitive?: boolean;
  }[];
  overallSummary?: string;
  model: string;
  classifiedAt: string;
  isFallback?: boolean;
  note?: string;
}

export const geminiService = {
  async classifyArticle(title: string, bodyText: string): Promise<GeminiClassificationResult> {
    try {
      const response = await fetch('/api/gemini/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, bodyText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();

      // Client-side validation: must have classifications array, max 3, sdgNumber 1-17
      if (!Array.isArray(data.classifications)) {
        throw new Error('Format keluaran AI tidak valid (missing classifications array).');
      }

      const sanitized = data.classifications
        .filter((c: any) => typeof c.sdgNumber === 'number' && c.sdgNumber >= 1 && c.sdgNumber <= 17)
        .slice(0, 3)
        .map((c: any) => ({
          sdgNumber: c.sdgNumber,
          confidenceScore: Math.min(Math.max(Number(c.confidenceScore) || 0.5, 0), 1),
          rationale: String(c.rationale || 'Alasan klasifikasi tidak disertakan oleh model.'),
          isSensitive: Boolean(c.isSensitive),
        }));

      return {
        classifications: sanitized,
        overallSummary: data.overallSummary || '',
        model: data.model || 'gemini-3.8-flash',
        classifiedAt: data.classifiedAt || new Date().toISOString(),
      };
    } catch (err: any) {
      console.warn('Gemini server-side classify failed, using heuristic rule-based classifier:', err.message);
      // Transparent fallback heuristic based on official UNY keywords
      return this.heuristicFallbackClassify(title, bodyText, err.message);
    }
  },

  async askVerifiedContext(question: string, verifiedContext: string): Promise<string> {
    try {
      const response = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, verifiedContext }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.answer || 'Tidak ada respons dari model.';
    } catch (err: any) {
      return `[Mode Informasi Terbatas]: Pertanyaan Anda tidak dapat diproses oleh Gemini AI server (${err.message}). Berdasarkan data terverifikasi saat ini, silakan periksa rincian pada menu "17 SDGs & Bukti" atau "Daftar Berita".`;
    }
  },

  async generateExecutiveSummary(items: any[], periodTitle: string): Promise<string> {
    try {
      const response = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, periodTitle }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.summaryText || 'Draf ringkasan tidak tersedia.';
    } catch (err: any) {
      return `DRAF SIARAN PERS HUMAS UNY (TEMPLATE OTOMATIS)
Periode: ${periodTitle}

Ringkasan: Berdasarkan pantauan portal www.uny.ac.id, Universitas Negeri Yogyakarta mencatat kontribusi aktif pada pencapaian SDGs melalui kegiatan riset, pengabdian masyarakat, dan kebijakan kampus berkelanjutan. Sebanyak ${items.length} berita terverifikasi menjadi bukti nyata implementasi Tri Dharma Perguruan Tinggi yang berdampak langsung bagi masyarakat.`;
    }
  },

  heuristicFallbackClassify(title: string, bodyText: string, noteReason: string): GeminiClassificationResult {
    const text = `${title} ${bodyText}`.toLowerCase();
    const scored: { sdgNumber: number; score: number; rationale: string }[] = [];

    // Simple keyword rules
    if (text.includes('miskin') || text.includes('bantuan') || text.includes('afirmasi')) {
      scored.push({
        sdgNumber: 1,
        score: 0.88,
        rationale: 'Artikel memuat kata kunci bantuan sosial, beasiswa afirmasi, atau pengentasan kemiskinan.',
      });
    }
    if (text.includes('pangan') || text.includes('gizi') || text.includes('stunting') || text.includes('lapar') || text.includes('tani')) {
      scored.push({
        sdgNumber: 2,
        score: 0.89,
        rationale: 'Berfokus pada ketahanan pangan, gizi, penanganan stunting, atau budidaya pertanian.',
      });
    }
    if (text.includes('sehat') || text.includes('olahraga') || text.includes('fikk') || text.includes('klinik') || text.includes('penyakit')) {
      scored.push({
        sdgNumber: 3,
        score: 0.91,
        rationale: 'Mencakup topik kesehatan masyarakat, kebugaran jasmani, atau aktivitas medis kampus.',
      });
    }
    if (text.includes('pendidikan') || text.includes('guru') || text.includes('fipp') || text.includes('sekolah') || text.includes('belajar')) {
      scored.push({
        sdgNumber: 4,
        score: 0.95,
        rationale: 'Relevan dengan misi utama LPTK UNY dalam peningkatan mutu dan kurikulum pendidikan.',
      });
    }
    if (text.includes('gender') || text.includes('ppks') || text.includes('perempuan')) {
      scored.push({
        sdgNumber: 5,
        score: 0.93,
        rationale: 'Terkait kesetaraan gender dan pencegahan kekerasan berbasis gender.',
      });
    }
    if (text.includes('energi') || text.includes('listrik') || text.includes('surya') || text.includes('garuda')) {
      scored.push({
        sdgNumber: 7,
        score: 0.94,
        rationale: 'Inovasi teknologi energi bersih dan terbarukan ramah lingkungan.',
      });
    }
    if (text.includes('ekonomi') || text.includes('umkm') || text.includes('bisnis') || text.includes('wirausaha')) {
      scored.push({
        sdgNumber: 8,
        score: 0.90,
        rationale: 'Pengembangan wirausaha, inkubasi bisnis, dan penciptaan lapangan kerja produktif.',
      });
    }
    if (text.includes('teknologi') || text.includes('inovasi') || text.includes('paten') || text.includes('robot')) {
      scored.push({
        sdgNumber: 9,
        score: 0.90,
        rationale: 'Penciptaan teknologi terapan, riset laboratorium, dan inovasi industri.',
      });
    }
    if (text.includes('iklim') || text.includes('karbon') || text.includes('bencana')) {
      scored.push({
        sdgNumber: 13,
        score: 0.88,
        rationale: 'Aksi mitigasi perubahan iklim dan adaptasi bencana lingkungan.',
      });
    }
    if (text.includes('pohon') || text.includes('hutan') || text.includes('tanaman') || text.includes('flora')) {
      scored.push({
        sdgNumber: 15,
        score: 0.92,
        rationale: 'Pelestarian ekosistem daratan dan keanekaragaman hayati.',
      });
    }
    if (text.includes('integritas') || text.includes('wbk') || text.includes('hukum') || text.includes('korupsi')) {
      scored.push({
        sdgNumber: 16,
        score: 0.95,
        rationale: 'Penguatan tata kelola institusi, transparansi, dan akuntabilitas publik.',
      });
    }
    if (text.includes('mou') || text.includes('kerja sama') || text.includes('kemitraan') || text.includes('mitra')) {
      scored.push({
        sdgNumber: 17,
        score: 0.92,
        rationale: 'Kemitraan strategis antar-lembaga atau internasional untuk pencapaian SDGs.',
      });
    }

    // Default to SDG 4 if no matches
    if (scored.length === 0) {
      scored.push({
        sdgNumber: 4,
        score: 0.75,
        rationale: 'Diklasifikasikan ke Pendidikan Berkualitas sebagai basis tridharma institusi (perlu verifikasi manual).',
      });
    }

    const top = scored.slice(0, 3);

    return {
      classifications: top.map((s) => ({
        sdgNumber: s.sdgNumber,
        confidenceScore: s.score,
        rationale: s.rationale,
      })),
      overallSummary: 'Klasifikasi dihasilkan oleh mesin aturan heuristik fallback.',
      model: 'heuristic-rule-engine-fallback',
      classifiedAt: new Date().toISOString(),
      isFallback: true,
      note: `Fallback aktif karena: ${noteReason}. Di lingkungan produksi yang dilengkapi GEMINI_API_KEY, Gemini 3.8 Flash akan digunakan secara otomatis.`,
    };
  },
};
