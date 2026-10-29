export type Role = 'ADMIN' | 'OPERATOR';

export interface User {
  id: string;
  displayName: string;
  role: Role;
  assignedUnitId?: string; // If OPERATOR, restricted to this unit
  email: string;
  active: boolean;
}

export type SourceStatus = 'ACTIVE' | 'ARCHIVED' | 'CORRUPTED';

export interface Article {
  id: string;
  title: string;
  author: string;
  publishedAt: string; // ISO date YYYY-MM-DD
  unitId: string; // Fakultas/Unit ID
  category: string;
  bodyText: string;
  sourceUrl: string; // Must be clickable and start with uny.ac.id
  fetchedAt: string;
  contentHash: string;
  sourceStatus: SourceStatus;
  isSensitive?: boolean;
}

export type ClassificationStatus =
  | 'SUGGESTED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'ESCALATED_NEEDS_REVIEW';

export interface SDGClassification {
  id: string;
  articleId: string;
  sdgNumber: number; // 1 to 17
  confidenceScore: number; // 0.00 to 1.00
  rationale: string;
  status: ClassificationStatus;
  modelName: string; // e.g. "gemini-3.8-flash"
  classifiedAt: string;
  isSensitive?: boolean;
}

export type ValidationDecision = 'APPROVE' | 'MODIFY' | 'REJECT';

export interface ValidationRecord {
  id: string;
  classificationId: string;
  articleId: string;
  reviewerId: string;
  reviewerName: string;
  decision: ValidationDecision;
  previousLabels: number[];
  finalLabels: number[];
  note: string; // Required for MODIFY and REJECT
  decidedAt: string;
}

export interface AgentRun {
  id: string;
  startedAt: string;
  finishedAt: string;
  result: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  fetchedCount: number;
  classifiedCount: number;
  errorSummary?: string;
  retryCount: number;
}

export type ReportStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED_BY_HUMAS';

export interface Report {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  status: ReportStatus;
  summary: string;
  approvedBy?: string;
  approvedAt?: string;
  totalArticlesCount: number;
  verifiedArticlesCount: number;
  topSdgDistribution: { sdgNumber: number; count: number }[];
}

export interface AuditLog {
  id: string;
  actorType: 'USER' | 'AGENT' | 'SYSTEM';
  actorId: string;
  actorName: string;
  action: string;
  entityType: 'ARTICLE' | 'CLASSIFICATION' | 'REPORT' | 'CONFIG' | 'SOURCE_ADAPTER';
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SDGReference {
  number: number;
  officialIndonesianName: string;
  shortName: string;
  keywords: string[];
  description: string;
  color: string;
  textColor: string;
  iconName: string;
}

export interface FacultyUnit {
  id: string;
  code: string;
  name: string;
  type: 'FAKULTAS' | 'LEMBAGA' | 'BIRO' | 'SEKOLAH';
}

export interface SystemConfig {
  confidenceThreshold: number; // default 0.85
  autoEscalateSensitive: boolean;
  autoEscalateLowMetadata: boolean;
  minEvidenceForCoverageTarget: number; // default 5
}

export interface KPISummary {
  totalUniqueArticles: number;
  sdgRelatedCount: number;
  sdgProportion: number; // 0 - 100%
  articlesPerSdg: Record<number, { verified: number; suggested: number; total: number }>;
  sdgCoverage17: number; // count of SDGs with >= 5 verified
  coverageTarget: number;
  verificationRate: number; // 0 - 100%
  verifiedCount: number;
  unverifiedQueueCount: number;
  manualAccuracy: number; // % approved without change among human-reviewed
  correctionRate: number; // % changed by reviewer among human-reviewed
  reviewedCount: number;
  avgProcessingTimeMinutes: number;
  metadataCompletenessRate: number;
  monthlyTrends: {
    monthKey: string; // YYYY-MM
    monthLabel: string;
    total: number;
    verified: number;
  }[];
  escalationsCount: number;
}
