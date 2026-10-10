import React, { useState } from 'react';
import { GlobalFilterProvider, useGlobalFilter } from './context/GlobalFilterContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { DrillDownDrawer } from './components/common/DrillDownDrawer';
import { IncidentDetailModal } from './components/common/IncidentDetailModal';

// Modules
import { ExecutiveOverview } from './components/modules/ExecutiveOverview';
import { LossBreakdownRCA } from './components/modules/LossBreakdownRCA';
import { InventoryShrinkage } from './components/modules/InventoryShrinkage';
import { ProcessLeakage } from './components/modules/ProcessLeakage';
import { SkuCategoryAnalysis } from './components/modules/SkuCategoryAnalysis';
import { HubZoneShift } from './components/modules/HubZoneShift';
import { ExpiryDamageTemp } from './components/modules/ExpiryDamageTemp';
import { VendorClaimsRecovery } from './components/modules/VendorClaimsRecovery';
import { AlertsInvestigations } from './components/modules/AlertsInvestigations';
import { ActionsVerifiedSavings } from './components/modules/ActionsVerifiedSavings';
import { DataExplorer } from './components/modules/DataExplorer';
import { SettingsAdmin } from './components/modules/SettingsAdmin';

const DashboardContent: React.FC = () => {
  const { activeTab, dataSource, syncError, isRefreshing, refreshData } = useGlobalFilter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderModule = () => {
    switch (activeTab) {
      case 'executive-overview':
        return <ExecutiveOverview />;
      case 'loss-breakdown-rca':
        return <LossBreakdownRCA />;
      case 'inventory-shrinkage':
        return <InventoryShrinkage />;
      case 'process-leakage':
        return <ProcessLeakage />;
      case 'sku-category-analysis':
        return <SkuCategoryAnalysis />;
      case 'hub-zone-shift':
        return <HubZoneShift />;
      case 'expiry-damage-temp':
        return <ExpiryDamageTemp />;
      case 'vendor-claims-recovery':
        return <VendorClaimsRecovery />;
      case 'alerts-investigations':
        return <AlertsInvestigations />;
      case 'actions-verified-savings':
        return <ActionsVerifiedSavings />;
      case 'data-explorer':
        return <DataExplorer />;
      case 'settings-admin':
        return <SettingsAdmin />;
      default:
        return <ExecutiveOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100/70 overflow-hidden font-sans text-slate-900">
      {/* Left Collapsible Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Top Navigation */}
        <TopNav />

        <div className={dataSource === 'google_sheets' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'} style={{padding:'7px 16px',fontSize:12,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <span>{dataSource === 'google_sheets' ? 'Live Google Sheets data' : 'SYNTHETIC DEMO DATA — not synced with Google Sheets'}{syncError ? ` · ${syncError}` : ''}</span>
          <button onClick={() => void refreshData()} disabled={isRefreshing} style={{fontWeight:700,whiteSpace:'nowrap'}}>{isRefreshing ? 'Syncing…' : 'Refresh Data'}</button>
        </div>
        {/* Scrollable Module Workspace */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-7">
          <div className="max-w-7xl mx-auto">{renderModule()}</div>
        </main>
      </div>

      {/* Global Slide-In Panels & Modals */}
      <NotificationDrawer />
      <DrillDownDrawer />
      <IncidentDetailModal />
    </div>
  );
};

export default function App() {
  return (
    <GlobalFilterProvider>
      <DashboardContent />
    </GlobalFilterProvider>
  );
}
