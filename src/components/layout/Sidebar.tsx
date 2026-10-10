import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Layers,
  Repeat,
  Package,
  Building2,
  ThermometerSnowflake,
  HandCoins,
  ShieldAlert,
  TrendingDown,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useGlobalFilter } from '../../context/GlobalFilterContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { activeTab, setActiveTab, computedStats, dataPackage } = useGlobalFilter();

  const openAlertsCount = computedStats.kpiSummary.openInvestigationsCount;
  const openActionsCount = dataPackage.actions.filter((a) => a.Status !== 'Validated').length;

  const navItems = [
    { id: 'executive-overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'loss-breakdown-rca', label: 'Loss Breakdown & RCA', icon: GitBranch },
    { id: 'inventory-shrinkage', label: 'Inventory Shrinkage', icon: Layers },
    { id: 'process-leakage', label: 'Process Leakage', icon: Repeat },
    { id: 'sku-category-analysis', label: 'SKU & Category Analysis', icon: Package },
    { id: 'hub-zone-shift', label: 'Hub, Zone & Shift', icon: Building2 },
    { id: 'expiry-damage-temp', label: 'Expiry, Damage & Temp', icon: ThermometerSnowflake },
    { id: 'vendor-claims-recovery', label: 'Vendor Claims & Recovery', icon: HandCoins },
    {
      id: 'alerts-investigations',
      label: 'Alerts & Investigations',
      icon: ShieldAlert,
      badge: openAlertsCount > 0 ? openAlertsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'actions-verified-savings',
      label: 'Actions & Savings',
      icon: TrendingDown,
      badge: openActionsCount > 0 ? openActionsCount : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    { id: 'data-explorer', label: 'Data Explorer & Downloads', icon: Database },
    { id: 'settings-admin', label: 'Settings & Data Mgmt', icon: Settings },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-slate-950 text-slate-100 flex flex-col transition-all duration-300 z-30 border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/90">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/30 flex-shrink-0">
            <span className="font-black text-xl text-white tracking-tighter">Z</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">zepto</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-purple-900/70 text-purple-300 border border-purple-700/50">
                  Mother Hub
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium truncate">
                Loss Control & Analytics
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Internal Concept Demo Banner */}
      {!collapsed && (
        <div className="mx-3 mt-3 p-2 rounded-lg bg-purple-950/40 border border-purple-800/40 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] leading-tight text-purple-200">
            <span className="font-semibold text-purple-300">Internal Concept Demo</span>
            <p className="text-slate-400 text-[10px] mt-0.5">
              Synthetic Quick-Commerce Data • Google Sheets DB Ready
            </p>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={18}
                className={`flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && (
                <div className="flex-1 text-left flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom User / Role Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-900/80 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-200">
              SM
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-white truncate">Senior Manager</span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Loss Control Intelligence
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-purple-900/80 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-200">
              SM
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
