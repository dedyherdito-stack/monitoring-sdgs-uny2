import {
  Article,
  SDGClassification,
  ValidationRecord,
  AuditLog,
  User,
  SystemConfig,
  Report,
  ValidationDecision,
} from '../types';
import {
  INITIAL_ARTICLES,
  INITIAL_CLASSIFICATIONS,
  INITIAL_VALIDATION_RECORDS,
  INITIAL_AUDIT_LOGS,
  generateContentHash,
} from '../data/demoDataset';

const STORAGE_KEYS = {
  ARTICLES: 'uny_sdg_articles_v1',
  CLASSIFICATIONS: 'uny_sdg_classifications_v1',
  VALIDATIONS: 'uny_sdg_validations_v1',
  AUDIT_LOGS: 'uny_sdg_audit_logs_v1',
  CONFIG: 'uny_sdg_config_v1',
  USER: 'uny_sdg_current_user_v1',
  REPORTS: 'uny_sdg_reports_v1',
};

export const DEFAULT_CONFIG: SystemConfig = {
  confidenceThreshold: 0.85,
  autoEscalateSensitive: true,
  autoEscalateLowMetadata: true,
  minEvidenceForCoverageTarget: 5,
};

export const DEMO_USERS: User[] = [
  {
    id: 'usr-admin-1',
    displayName: 'Dedy Herdito',
    role: 'ADMIN',
    email: 'dedyherdito1@gmail.com',
    active: true,
  },
  {
    id: 'usr-op-ft',
    displayName: 'Staf Humas FT',
    role: 'OPERATOR',
    assignedUnitId: 'FT',
    email: 'humas.ft@uny.ac.id',
    active: true,
  },
  {
    id: 'usr-op-fipp',
    displayName: 'Staf Humas FIPP',
    role: 'OPERATOR',
    assignedUnitId: 'FIPP',
    email: 'humas.fipp@uny.ac.id',
    active: true,
  },
  {
    id: 'usr-op-lppm',
    displayName: 'Staf LPPM UNY',
    role: 'OPERATOR',
    assignedUnitId: 'LPPM',
    email: 'lppm@uny.ac.id',
    active: true,
  },
];

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((l) => l());
}

export const storageService = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getArticles(): Article[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ARTICLES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(INITIAL_ARTICLES));
      return INITIAL_ARTICLES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ARTICLES;
    }
  },

  getClassifications(): SDGClassification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CLASSIFICATIONS, JSON.stringify(INITIAL_CLASSIFICATIONS));
      return INITIAL_CLASSIFICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CLASSIFICATIONS;
    }
  },

  getValidations(): ValidationRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VALIDATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.VALIDATIONS, JSON.stringify(INITIAL_VALIDATION_RECORDS));
      return INITIAL_VALIDATION_RECORDS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_VALIDATION_RECORDS;
    }
  },

  getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  },

  getConfig(): SystemConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USERS[0]));
      return DEMO_USERS[0];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEMO_USERS[0];
    }
  },

  setCurrentUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    this.addAuditLog({
      actorType: 'USER',
      actorId: user.id,
      actorName: user.displayName,
      action: 'SWITCH_USER_ROLE',
      entityType: 'CONFIG',
      entityId: user.id,
      metadata: { role: user.role, unit: user.assignedUnitId || 'ALL' },
    });
    notifyListeners();
  },

  getReports(): Report[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      const initialReports: Report[] = [
        {
          id: 'rep-2026-09',
          title: 'Laporan Capaian SDGs Humas UNY - Periode September 2026',
          periodStart: '2026-09-01',
          periodEnd: '2026-09-30',
          generatedAt: '2026-10-01T09:00:00Z',
          status: 'APPROVED_BY_HUMAS',
          summary: 'Tercatat 3 berita terverifikasi berfokus pada SDG 1 (Tanpa Kemiskinan), SDG 4 (Pendidikan Berkualitas), dan SDG 7 (Energi Bersih).',
          approvedBy: 'Dedy Herdito (Admin Humas)',
          approvedAt: '2026-10-02T10:00:00Z',
          totalArticlesCount: 3,
          verifiedArticlesCount: 3,
          topSdgDistribution: [
            { sdgNumber: 4, count: 1 },
            { sdgNumber: 7, count: 1 },
            { sdgNumber: 1, count: 1 },
          ],
        },
      ];
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(initialReports));
      return initialReports;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  updateConfig(newConfig: Partial<SystemConfig>) {
    const current = this.getConfig();
    const updated = { ...current, ...newConfig };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    const user = this.getCurrentUser();
    this.addAuditLog({
      actorType: 'USER',
      actorId: user.id,
      actorName: user.displayName,
      action: 'UPDATE_SYSTEM_CONFIG',
      entityType: 'CONFIG',
      entityId: 'system_config',
      metadata: updated,
    });
    notifyListeners();
  },

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const current = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...current].slice(0, 100); // keep last 100 logs
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  },

  // Perform Human-in-the-loop validation
  submitValidation(
    articleId: string,
    decision: ValidationDecision,
    finalSdgNumbers: number[],
    note: string
  ) {
    const user = this.getCurrentUser();
    const classifications = this.getClassifications();
    const articles = this.getArticles();

    // Check if operator tries to validate article from another unit
    const article = articles.find((a) => a.id === articleId);
    if (!article) throw new Error('Berita tidak ditemukan.');

    if (user.role === 'OPERATOR' && user.assignedUnitId && article.unitId !== user.assignedUnitId) {
      throw new Error(`Akses ditolak: Operator unit ${user.assignedUnitId} tidak dapat memvalidasi berita unit ${article.unitId}.`);
    }

    if ((decision === 'MODIFY' || decision === 'REJECT') && !note?.trim()) {
      throw new Error('Catatan reviewer wajib diisi untuk keputusan Ubah atau Tolak.');
    }

    // Previous labels for this article
    const currentForArticle = classifications.filter((c) => c.articleId === articleId);
    const prevLabels = currentForArticle.map((c) => c.sdgNumber);

    let updatedClassifications = classifications.filter((c) => c.articleId !== articleId);

    if (decision === 'REJECT') {
      // Mark all previous as REJECTED
      const rejectedList: SDGClassification[] = currentForArticle.map((c) => ({
        ...c,
        status: 'REJECTED' as const,
      }));
      updatedClassifications = [...updatedClassifications, ...rejectedList];
    } else {
      // APPROVE or MODIFY
      // Create verified classification records for finalSdgNumbers (max 3)
      const sanitizedLabels = Array.from(new Set(finalSdgNumbers)).slice(0, 3);
      const newItems: SDGClassification[] = sanitizedLabels.map((num) => {
        const existing = currentForArticle.find((c) => c.sdgNumber === num);
        return {
          id: existing ? existing.id : `cls-${Date.now()}-${num}`,
          articleId,
          sdgNumber: num,
          confidenceScore: existing ? existing.confidenceScore : 1.0, // Human verified
          rationale: note.trim() || existing?.rationale || 'Divalidasi langsung oleh reviewer Bagian Humas.',
          status: 'VERIFIED' as const,
          modelName: existing?.modelName || 'human-validator',
          classifiedAt: new Date().toISOString(),
        };
      });
      updatedClassifications = [...updatedClassifications, ...newItems];
    }

    // Save classifications
    localStorage.setItem(STORAGE_KEYS.CLASSIFICATIONS, JSON.stringify(updatedClassifications));

    // Record validation entry
    const validationRecord: ValidationRecord = {
      id: `val-${Date.now()}`,
      classificationId: currentForArticle[0]?.id || `cls-${Date.now()}`,
      articleId,
      reviewerId: user.id,
      reviewerName: `${user.displayName} (${user.role})`,
      decision,
      previousLabels: prevLabels,
      finalLabels: decision === 'REJECT' ? [] : finalSdgNumbers.slice(0, 3),
      note: note.trim(),
      decidedAt: new Date().toISOString(),
    };

    const validations = this.getValidations();
    localStorage.setItem(STORAGE_KEYS.VALIDATIONS, JSON.stringify([validationRecord, ...validations]));

    // Record Audit Log
    this.addAuditLog({
      actorType: 'USER',
      actorId: user.id,
      actorName: user.displayName,
      action: `VALIDATION_${decision}`,
      entityType: 'ARTICLE',
      entityId: articleId,
      metadata: {
        decision,
        previousLabels: prevLabels,
        finalLabels: decision === 'REJECT' ? [] : finalSdgNumbers,
        note: note.trim(),
      },
    });

    notifyListeners();
    return validationRecord;
  },

  // Add new article manually or from crawler
  addArticle(newArticle: Omit<Article, 'id' | 'fetchedAt' | 'contentHash' | 'sourceStatus'> & { sdgNumbers?: number[] }) {
    const user = this.getCurrentUser();
    const articles = this.getArticles();

    // Canonical URL validation - must be from uny.ac.id
    const trimmedUrl = newArticle.sourceUrl.trim();
    if (!trimmedUrl.startsWith('https://www.uny.ac.id/') && !trimmedUrl.startsWith('http://www.uny.ac.id/')) {
      throw new Error('Aturan Wajib: Sumber data hanya www.uny.ac.id. URL harus diawali dengan https://www.uny.ac.id/');
    }

    // Deduplication check
    const contentHash = generateContentHash(newArticle.title, newArticle.bodyText);
    const duplicateUrl = articles.find((a) => a.sourceUrl.toLowerCase() === trimmedUrl.toLowerCase());
    if (duplicateUrl) {
      throw new Error(`Deduplikasi: Berita dengan URL '${trimmedUrl}' sudah ada dalam sistem (ID: ${duplicateUrl.id}).`);
    }

    const duplicateHash = articles.find((a) => a.contentHash === contentHash);
    if (duplicateHash) {
      throw new Error(`Deduplikasi: Isi berita identik telah ditemukan (Content Hash collision dengan ID: ${duplicateHash.id}).`);
    }

    const articleId = `uny-art-${Date.now().toString().slice(-6)}`;
    const createdArticle: Article = {
      ...newArticle,
      id: articleId,
      sourceUrl: trimmedUrl,
      fetchedAt: new Date().toISOString(),
      contentHash,
      sourceStatus: 'ACTIVE',
    };

    const updatedArticles = [createdArticle, ...articles];
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(updatedArticles));

    // Initial classification if provided
    if (newArticle.sdgNumbers && newArticle.sdgNumbers.length > 0) {
      const classifications = this.getClassifications();
      const config = this.getConfig();
      const initialItems: SDGClassification[] = newArticle.sdgNumbers.slice(0, 3).map((sdgNum) => {
        const score = 0.88;
        const status = score >= config.confidenceThreshold ? 'SUGGESTED' : 'ESCALATED_NEEDS_REVIEW';
        return {
          id: `cls-${Date.now()}-${sdgNum}`,
          articleId,
          sdgNumber: sdgNum,
          confidenceScore: score,
          rationale: 'Klasifikasi awal masukan sistem / uji verifikasi.',
          status,
          modelName: 'gemini-3.8-flash',
          classifiedAt: new Date().toISOString(),
          isSensitive: newArticle.isSensitive,
        };
      });
      localStorage.setItem(STORAGE_KEYS.CLASSIFICATIONS, JSON.stringify([...classifications, ...initialItems]));
    }

    this.addAuditLog({
      actorType: 'USER',
      actorId: user.id,
      actorName: user.displayName,
      action: 'ADD_ARTICLE',
      entityType: 'ARTICLE',
      entityId: articleId,
      metadata: { title: newArticle.title, url: trimmedUrl, hash: contentHash },
    });

    notifyListeners();
    return createdArticle;
  },

  // Save generated report
  saveReport(report: Omit<Report, 'id' | 'generatedAt'>) {
    const user = this.getCurrentUser();
    const reports = this.getReports();
    const newReport: Report = {
      ...report,
      id: `rep-${Date.now()}`,
      generatedAt: new Date().toISOString(),
    };
    const updated = [newReport, ...reports];
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));

    this.addAuditLog({
      actorType: 'USER',
      actorId: user.id,
      actorName: user.displayName,
      action: 'GENERATE_REPORT',
      entityType: 'REPORT',
      entityId: newReport.id,
      metadata: { title: report.title, status: report.status },
    });

    notifyListeners();
    return newReport;
  },

  approveReport(reportId: string) {
    const user = this.getCurrentUser();
    if (user.role !== 'ADMIN') {
      throw new Error('Hanya Admin Humas yang memiliki kewenangan menyetujui laporan resmi.');
    }
    const reports = this.getReports();
    const updated = reports.map((r) =>
      r.id === reportId
        ? {
            ...r,
            status: 'APPROVED_BY_HUMAS' as const,
            approvedBy: `${user.displayName} (Admin Humas)`,
            approvedAt: new Date().toISOString(),
          }
        : r
    );
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));

    this.addAuditLog({
      actorType: 'USER',
      actorId: user.id,
      actorName: user.displayName,
      action: 'APPROVE_REPORT',
      entityType: 'REPORT',
      entityId: reportId,
      metadata: { approver: user.displayName },
    });

    notifyListeners();
  },

  // Reset to initial demo dataset
  resetToDemo() {
    localStorage.removeItem(STORAGE_KEYS.ARTICLES);
    localStorage.removeItem(STORAGE_KEYS.CLASSIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.VALIDATIONS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);

    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(INITIAL_ARTICLES));
    localStorage.setItem(STORAGE_KEYS.CLASSIFICATIONS, JSON.stringify(INITIAL_CLASSIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.VALIDATIONS, JSON.stringify(INITIAL_VALIDATION_RECORDS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));

    notifyListeners();
  },
};
