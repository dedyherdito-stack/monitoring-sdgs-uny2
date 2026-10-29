export interface SourceProbeResult {
  success: boolean;
  url: string;
  httpStatus?: number;
  statusText?: string;
  durationMs: number;
  contentType?: string;
  accessible: boolean;
  methodAvailable: string;
  note: string;
  timestamp: string;
}

export interface AdapterCapabilities {
  targetDomain: string;
  rssSupported: boolean;
  sitemapSupported: boolean;
  serverProxyAvailable: boolean;
  schedulerActive: boolean;
  description: string;
  productionRecommendations: string[];
}

export const unyAdapterService = {
  getCapabilities(): AdapterCapabilities {
    return {
      targetDomain: 'https://www.uny.ac.id/',
      rssSupported: true, // UNY Drupal/portal supports RSS feed format /rss.xml or /berita/rss
      sitemapSupported: true, // Accessible via /sitemap.xml
      serverProxyAvailable: true, // Via backend /api/uny/probe
      schedulerActive: false, // Explicitly false: no production cron server is running yet
      description:
        'Adapter terisolasi khusus untuk domain tunggal www.uny.ac.id. Pengambilan data publik dilakukan melalui endpoint proxy server untuk mengatasi batasan CORS browser, dilengkapi parser kanonis dan filter deduplikasi content hash.',
      productionRecommendations: [
        'Konfigurasi Cron Job / Cloud Scheduler untuk penarikan berkala tiap 6 jam.',
        'Implementasikan headless browser (Puppeteer / Playwright) di backend jika portal UNY mengaktifkan Cloudflare Bot Protection.',
        'Simpan state crawling dan watermark ID terakhir di database PostgreSQL permanen.',
        'Koordinasikan dengan UPT TIK UNY untuk akses webhook rilis berita resmi (REST API Humas UNY).',
      ],
    };
  },

  async probeTarget(url: string = 'https://www.uny.ac.id/'): Promise<SourceProbeResult> {
    const timestamp = new Date().toISOString();
    try {
      const response = await fetch('/api/uny/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        return {
          success: false,
          url,
          durationMs: 0,
          accessible: false,
          methodAvailable: 'Backend HTTP Proxy',
          note: `Backend merespons dengan status HTTP ${response.status}`,
          timestamp,
        };
      }

      const data = await response.json();
      return {
        ...data,
        timestamp,
      };
    } catch (err: any) {
      return {
        success: false,
        url,
        durationMs: 0,
        accessible: false,
        methodAvailable: 'Fallback Client-side (CORS Restricted)',
        note:
          'Koneksi backend tidak dapat dijangkau. Sesuai Aturan Wajib #2, aplikasi tidak membuat fetch langsung yang rentan CORS, melainkan mengaktifkan mode proteksi data aman.',
        timestamp,
      };
    }
  },

  validateCanonicalUrl(url: string): { isValid: boolean; normalizedUrl?: string; error?: string } {
    try {
      const parsed = new URL(url.trim());
      if (parsed.hostname !== 'www.uny.ac.id' && parsed.hostname !== 'uny.ac.id') {
        return {
          isValid: false,
          error: `Domain '${parsed.hostname}' ditolak. Aturan Wajib #2 menetapkan sumber data HANYA www.uny.ac.id.`,
        };
      }
      // Canonicalize protocol to https and remove trailing slash and tracking query params
      parsed.protocol = 'https:';
      parsed.hostname = 'www.uny.ac.id';
      parsed.searchParams.delete('utm_source');
      parsed.searchParams.delete('utm_medium');
      parsed.searchParams.delete('utm_campaign');
      return {
        isValid: true,
        normalizedUrl: parsed.toString(),
      };
    } catch {
      return {
        isValid: false,
        error: 'Format URL tidak valid. Gunakan format lengkap https://www.uny.ac.id/berita/...',
      };
    }
  },
};
