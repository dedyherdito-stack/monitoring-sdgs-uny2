import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { calculateKPISummary } from './services/kpiService';
import {
  Article,
  SDGClassification,
  ValidationRecord,
  AuditLog,
  SystemConfig,
  Report,
  User,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { ReadinessModal } from './components/ReadinessModal';
import { NewArticleModal } from './components/NewArticleModal';

import { HomeView } from './views/HomeView';
import { SdgsView } from './views/SdgsView';
import { TrendsView } from './views/TrendsView';
import { UnitsView } from './views/UnitsView';
import { NewsListView } from './views/NewsListView';
import { ValidationQueueView } from './views/ValidationQueueView';
import { ReportsView } from './views/ReportsView';
import { PublicTransparencyView } from './views/PublicTransparencyView';
import { AdminView } from './views/AdminView';
import { AiAssistantView } from './views/AiAssistantView';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [classifications, setClassifications] = useState<SDGClassification[]>([]);
  const [validations, setValidations] = useState<ValidationRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [config, setConfig] = useState<SystemConfig>(storageService.getConfig());
  const [currentUser, setCurrentUser] = useState<User>(storageService.getCurrentUser());
  const [reports, setReports] = useState<Report[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Modals
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState(false);
  const [isNewArticleModalOpen, setIsNewArticleModalOpen] = useState(false);

  // Sync state from storage
  const syncState = () => {
    setArticles(storageService.getArticles());
    setClassifications(storageService.getClassifications());
    setValidations(storageService.getValidations());
    setAuditLogs(storageService.getAuditLogs());
    setConfig(storageService.getConfig());
    setCurrentUser(storageService.getCurrentUser());
    setReports(storageService.getReports());
  };

  useEffect(() => {
    syncState();
    const unsubscribe = storageService.subscribe(() => {
      syncState();
    });
    return () => unsubscribe();
  }, []);

  // Compute KPI summary strictly from current state
  const kpi = calculateKPISummary(
    articles,
    classifications,
    validations,
    config.minEvidenceForCoverageTarget || 5
  );

  // Calculate pending validation count for current user scope
  const pendingCount = articles.filter((a) => {
    if (currentUser.role === 'OPERATOR' && currentUser.assignedUnitId && a.unitId !== currentUser.assignedUnitId) {
      return false;
    }
    const artCls = classifications.filter((c) => c.articleId === a.id);
    return artCls.some((c) => c.status === 'SUGGESTED' || c.status === 'ESCALATED_NEEDS_REVIEW');
  }).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Institutional Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenReadinessModal={() => setIsReadinessModalOpen(true)}
        onOpenNewArticleModal={() => setIsNewArticleModalOpen(true)}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingValidationCount={pendingCount}
          userRole={currentUser.role}
          operatorUnit={currentUser.assignedUnitId}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeView
              kpi={kpi}
              articles={articles}
              classifications={classifications}
              currentUser={currentUser}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'sdgs' && (
            <SdgsView
              articles={articles}
              classifications={classifications}
              kpi={kpi}
            />
          )}

          {activeTab === 'trends' && (
            <TrendsView
              articles={articles}
              classifications={classifications}
              kpi={kpi}
            />
          )}

          {activeTab === 'units' && (
            <UnitsView
              articles={articles}
              classifications={classifications}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'news' && (
            <NewsListView
              articles={articles}
              classifications={classifications}
              currentUser={currentUser}
              onNavigateToValidation={() => setActiveTab('validation')}
            />
          )}

          {activeTab === 'validation' && (
            <ValidationQueueView
              articles={articles}
              classifications={classifications}
              validations={validations}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              articles={articles}
              classifications={classifications}
              reports={reports}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'transparency' && (
            <PublicTransparencyView
              articles={articles}
              classifications={classifications}
              kpi={kpi}
            />
          )}

          {activeTab === 'ai' && (
            <AiAssistantView
              articles={articles}
              classifications={classifications}
            />
          )}

          {activeTab === 'admin' && currentUser.role === 'ADMIN' && (
            <AdminView
              config={config}
              auditLogs={auditLogs}
              currentUser={currentUser}
              onOpenReadinessModal={() => setIsReadinessModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Production Readiness Documentation Modal */}
      <ReadinessModal
        isOpen={isReadinessModalOpen}
        onClose={() => setIsReadinessModalOpen(false)}
      />

      {/* Ingest / Test Article Modal */}
      <NewArticleModal
        isOpen={isNewArticleModalOpen}
        onClose={() => setIsNewArticleModalOpen(false)}
        onSuccess={() => {
          setActiveTab('news');
        }}
      />
    </div>
  );
}
