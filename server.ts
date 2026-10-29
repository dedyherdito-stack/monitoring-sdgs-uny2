import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK with recommended user agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint: Health & Service Status Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!apiKey,
    service: 'Dashboard SDGs UNY Backend Proxy',
    productionReadiness: {
      scheduler: 'STUB - Cron engine belum dikonfigurasi pada serverless run',
      database: 'STUB/MEMORY - Memerlukan Postgres/Cloud SQL permanen',
      auth: 'MOCK/SESSION - Memerlukan SSO UNY (CAS/OAuth2) di server riil',
    },
  });
});

// Endpoint: UNY Portal live probe / fetch adapter
app.post('/api/uny/probe', async (req: Request, res: Response) => {
  const targetUrl = (req.body?.url as string) || 'https://www.uny.ac.id/';
  const startTime = Date.now();

  try {
    // Probe official UNY URL with standard user agent and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HumasUNY-SDG-Monitor/1.0; +https://www.uny.ac.id)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const durationMs = Date.now() - startTime;
    const isOk = response.ok;
    const contentType = response.headers.get('content-type') || 'unknown';

    return res.json({
      success: true,
      url: targetUrl,
      httpStatus: response.status,
      statusText: response.statusText,
      durationMs,
      contentType,
      accessible: isOk,
      methodAvailable: 'Server-side HTTP fetch proxy (mencegah batasan CORS browser)',
      note: isOk
        ? 'Portal publik www.uny.ac.id dapat dijangkau dari server.'
        : `Portal merespons dengan kode ${response.status}.`,
    });
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    return res.json({
      success: false,
      url: targetUrl,
      durationMs,
      accessible: false,
      errorName: error?.name || 'FetchError',
      errorMessage: error?.message || 'Gagal menghubungi portal www.uny.ac.id',
      methodAvailable: 'Server-side HTTP fetch proxy',
      note: 'Koneksi dari runtime dibatasi atau timeout. Dataset contoh bertanda DEMO digunakan sebagai fallback aman.',
    });
  }
});

// Endpoint: Gemini structured classification for SDGs
app.post('/api/gemini/classify', async (req: Request, res: Response) => {
  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY belum dikonfigurasi di environment server.',
      isFallback: true,
    });
  }

  const { title, bodyText } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Judul berita wajib disertakan.' });
  }

  try {
    const prompt = `Analisis artikel berita universitas berikut dari perspektif 17 Sustainable Development Goals (SDGs) PBB:
Judul: ${title}
Isi Cuplikan: ${bodyText || title}

Tentukan maksimal 3 tujuan SDG yang paling relevan (1 sampai 17). Berikan skor keyakinan (confidence score) antara 0.00 hingga 1.00, alasan ringkas (rationale dalam bahasa Indonesia), dan indikasi apakah isu ini sensitif atau memerlukan review khusus (isSensitive).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
        systemInstruction:
          'Anda adalah asisten kurasi berita SDGs untuk Bagian Humas Universitas Negeri Yogyakarta (UNY). Hanya berikan rekomendasi klasifikasi SDG yang berdasar kuat pada konten artikel (maksimal 3 SDGs). Patuhi format JSON Schema yang ditentukan.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classifications: {
              type: Type.ARRAY,
              description: 'Daftar klasifikasi SDG yang relevan (maksimal 3)',
              items: {
                type: Type.OBJECT,
                properties: {
                  sdgNumber: {
                    type: Type.INTEGER,
                    description: 'Nomor SDG dari 1 sampai 17',
                  },
                  confidenceScore: {
                    type: Type.NUMBER,
                    description: 'Tingkat keyakinan model antara 0.0 sampai 1.0',
                  },
                  rationale: {
                    type: Type.STRING,
                    description: 'Penjelasan mengapa berita ini relevan dengan SDG tersebut',
                  },
                  isSensitive: {
                    type: Type.BOOLEAN,
                    description: 'Apakah ada isu sensitif atau perlu review prioritas',
                  },
                },
                required: ['sdgNumber', 'confidenceScore', 'rationale'],
              },
            },
            overallSummary: {
              type: Type.STRING,
              description: 'Ringkasan 1-2 kalimat fokus kontribusi SDG artikel ini',
            },
          },
          required: ['classifications'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    // Validate structure
    const validClassifications = Array.isArray(parsed.classifications)
      ? parsed.classifications
          .filter((c: any) => typeof c.sdgNumber === 'number' && c.sdgNumber >= 1 && c.sdgNumber <= 17)
          .slice(0, 3)
      : [];

    return res.json({
      classifications: validClassifications,
      overallSummary: parsed.overallSummary || '',
      model: 'gemini-3.8-flash',
      classifiedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/classify:', error);
    return res.status(500).json({
      error: 'Terjadi kesalahan saat memproses klasifikasi dengan Gemini AI.',
      details: error?.message || 'Unknown error',
    });
  }
});

// Endpoint: Gemini Q&A based ONLY on verified news
app.post('/api/gemini/ask', async (req: Request, res: Response) => {
  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY belum dikonfigurasi di environment server.',
    });
  }

  const { question, verifiedContext } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Pertanyaan wajib disertakan.' });
  }

  try {
    const prompt = `Gunakan HANYA informasi berita SDGs UNY yang telah terverifikasi berikut ini untuk menjawab pertanyaan pengguna. Jika informasi tidak ada di dalam data konteks, katakan dengan jelas dan jujur bahwa data terverifikasi belum memuat hal tersebut. Jangan mengarang berita atau URL.

KONTEKS BERITA TERVERIFIKASI:
${verifiedContext || 'Tidak ada berita terverifikasi dalam konteks ini.'}

PERTANYAAN PENGGUNA:
${question}

Jawab dengan gaya komunikasi resmi Humas Universitas Negeri Yogyakarta, terstruktur, ramah, dan profesional dalam Bahasa Indonesia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        systemInstruction:
          'Anda adalah asisten Humas Universitas Negeri Yogyakarta untuk pemantauan capaian SDGs. Jawablah strictly grounded pada data berita terverifikasi yang diberikan. Jangan mengarang data.',
      },
    });

    return res.json({
      answer: response.text || 'Tidak dapat memproses jawaban saat ini.',
      timestamp: new Date().toISOString(),
      model: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/ask:', error);
    return res.status(500).json({
      error: 'Gagal mendapatkan jawaban dari Gemini AI.',
      details: error?.message || 'Unknown error',
    });
  }
});

// Endpoint: Gemini Institutional Summary for Press Releases
app.post('/api/gemini/summarize', async (req: Request, res: Response) => {
  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY belum dikonfigurasi di environment server.',
    });
  }

  const { items, periodTitle } = req.body;

  try {
    const prompt = `Buatkan Draf Siaran Pers / Ringkasan Eksekutif Humas UNY untuk periode ${periodTitle || 'Bulan Ini'} berdasarkan capaian berita SDGs terverifikasi berikut:

DAFTAR ARTIKEL:
${JSON.stringify(items, null, 2)}

Format laporan harus mencakup:
1. Tajuk Siaran Pers
2. Ringkasan Capaian Utama (fokus pada SDGs terbanyak)
3. Sorotan Inisiatif Fakultas/Unit
4. Pernyataan Komitmen Berkelanjutan UNY`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    return res.json({
      summaryText: response.text || 'Ringkasan tidak tersedia.',
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Gagal menghasilkan ringkasan.',
      details: error?.message,
    });
  }
});

// Mount Vite or serve static
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Dashboard SDGs UNY] Server running on port ${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
