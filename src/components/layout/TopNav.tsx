import React, { useState } from 'react';
import {
  RotateCw,
  Bell,
  Download,
  Filter,
  Search,
  Calendar,
  Building,
  SlidersHorizontal,
  FileSpreadsheet,
  FileText,
  Archive,
  X,
  Bookmark,
} from 'lucide-react';
import { useGlobalFilter } from '../../context/GlobalFilterContext';
import { INITIAL_HUBS } from '../../data/initialData';
import { exportToCSV, exportToExcel, exportExecutivePDF, downloadCompleteDataPackZip } from '../../services/exportService';

export const TopNav: React.FC = () => {
  const {
    filters,
    updateFilter,
    resetFilters,
    refreshData,
    isRefreshing,
    computedStats,
    dataPackage,
    setIsNotificationOpen,
    isFilterDrawerOpen,
    setIsFilterDrawerOpen,
    savedViews,
    applySavedView,
    saveCurrentView,
  } = useGlobalFilter();

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSavedViewMenuOpen, setIsSavedViewMenuOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [isSavingView, setIsSavingView] = useState(false);

  const categories = [
    'ALL',
    'Dairy',
    'Fruits & Vegetables',
    'Frozen Foods',
    'Meat & Seafood',
    'Bakery',
    'Grocery',
    'Beverages',
    'Snacks',
    'Personal Care',
    'Household',
    'Baby Care',
    'Health & Wellness',
  ];

  const datePresets = [
    { label: 'Last 3 Months (Full Period)', start: '2026-08-01', end: '2026-10-10' },
    { label: 'Current MTD (Oct 2026)', start: '2026-10-01', end: '2026-10-10' },
    { label: 'September 2026', start: '2026-09-01', end: '2026-09-30' },
    { label: 'August 2026', start: '2026-08-01', end: '2026-08-31' },
    { label: 'Last 14 Days', start: '2026-09-27', end: '2026-10-10' },
    { label: 'Last 7 Days', start: '2026-10-04', end: '2026-10-10' },
  ];

  // Count active non-default filters
  const activeFilterCount = [
    filters.hubId !== 'ALL',
    filters.category !== 'ALL',
    filters.region !== 'ALL',
    filters.process !== 'ALL',
    filters.shift !== 'ALL',
    filters.lossReason !== 'ALL',
    filters.skuSearch.trim() !== '',
    filters.dateRange.label !== 'Last 3 Months (Full Period)',
  ].filter(Boolean).length;

  const handleExportPDF = () => {
    exportExecutivePDF(
      computedStats.kpiSummary,
      computedStats.executiveInsights,
      computedStats.hubsRanking,
      computedStats.categoryBreakdown
    );
    setIsExportMenuOpen(false);
  };

  const handleExportExcel = () => {
    exportToExcel(computedStats.filteredLossEvents, 'Loss_Events', 'Zepto_Loss_Events_Filtered.xlsx');
    setIsExportMenuOpen(false);
  };

  const handleExportCSV = () => {
    exportToCSV(computedStats.filteredLossEvents, 'Zepto_Loss_Events_Filtered.csv');
    setIsExportMenuOpen(false);
  };

  const handleExportDataPack = () => {
    downloadCompleteDataPackZip(dataPackage);
    setIsExportMenuOpen(false);
  };

  const handleSaveViewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newViewName.trim()) {
      saveCurrentView(newViewName.trim());
      setNewViewName('');
      setIsSavingView(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200/90 shadow-xs">
      {/* Top Primary Bar */}
      <div className="h-16 px-4 flex items-center justify-between gap-3">
        {/* Left Section: Hub & Date Range Primary Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Mother Hub Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300/80 rounded-lg px-2.5 py-1.5 text-xs">
            <Building size={14} className="text-purple-700" />
            <span className="font-semibold text-slate-700 hidden sm:inline">Hub:</span>
            <select
              value={filters.hubId}
              onChange={(e) => updateFilter('hubId', e.target.value)}
              className="bg-transparent font-medium text-slate-800 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Mother Hubs (10 Facilities)</option>
              {INITIAL_HUBS.map((h) => (
                <option key={h.Hub_ID} value={h.Hub_ID}>
                  {h.Hub_ID} - {h.City} ({h.Region})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300/80 rounded-lg px-2.5 py-1.5 text-xs">
            <Calendar size={14} className="text-purple-700" />
            <span className="font-semibold text-slate-700 hidden sm:inline">Period:</span>
            <select
              value={filters.dateRange.label}
              onChange={(e) => {
                const found = datePresets.find((p) => p.label === e.target.value);
                if (found) {
                  updateFilter('dateRange', {
                    startDate: found.start,
                    endDate: found.end,
                    label: found.label,
                  });
                }
              }}
              className="bg-transparent font-medium text-slate-800 text-xs focus:outline-hidden cursor-pointer"
            >
              {datePresets.map((p) => (
                <option key={p.label} value={p.label}>
                  {p.label} ({p.start.slice(5)} to {p.end.slice(5)})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-300/80 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="font-semibold text-slate-700">Category:</span>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="bg-transparent font-medium text-slate-800 text-xs focus:outline-hidden cursor-pointer max-w-[140px] truncate"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All Categories (12)' : c}
                </option>
              ))}
            </select>
          </div>

          {/* SKU Quick Search */}
          <div className="relative hidden lg:block">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU name / ID..."
              value={filters.skuSearch}
              onChange={(e) => updateFilter('skuSearch', e.target.value)}
              className="w-48 pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-300/80 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-purple-500 focus:bg-white text-slate-800 placeholder-slate-400"
            />
            {filters.skuSearch && (
              <button
                onClick={() => updateFilter('skuSearch', '')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Actions & Indicators */}
        <div className="flex items-center gap-2">
          {/* Extended Filter Drawer Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activeFilterCount > 0
                ? 'bg-purple-50 border-purple-300 text-purple-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal size={14} className={activeFilterCount > 0 ? 'text-purple-600' : 'text-slate-500'} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Saved Views Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSavedViewMenuOpen(!isSavedViewMenuOpen)}
              className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Saved Filter Views"
            >
              <Bookmark size={15} />
            </button>

            {isSavedViewMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                <div className="font-semibold text-slate-800 px-2 py-1 flex items-center justify-between border-b border-slate-100">
                  <span>Saved Filter Views</span>
                  <button
                    onClick={() => setIsSavingView(true)}
                    className="text-[11px] text-purple-600 hover:underline font-medium"
                  >
                    + Save Current
                  </button>
                </div>

                {isSavingView && (
                  <form onSubmit={handleSaveViewSubmit} className="p-2 border-b border-slate-100">
                    <input
                      type="text"
                      placeholder="View name..."
                      value={newViewName}
                      onChange={(e) => setNewViewName(e.target.value)}
                      className="w-full text-xs p-1.5 border border-purple-300 rounded focus:outline-hidden mb-1.5"
                      autoFocus
                    />
                    <div className="flex gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsSavingView(false)}
                        className="px-2 py-0.5 text-slate-500 text-[10px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2 py-0.5 bg-purple-600 text-white text-[10px] rounded font-medium"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                <div className="py-1 max-h-48 overflow-y-auto space-y-0.5">
                  {savedViews.map((sv) => (
                    <button
                      key={sv.id}
                      onClick={() => {
                        applySavedView(sv);
                        setIsSavedViewMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-medium truncate flex items-center justify-between"
                    >
                      <span>{sv.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Refresh Data Button */}
          <button
            onClick={() => refreshData()}
            disabled={isRefreshing}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-purple-700 transition-colors disabled:opacity-50"
            title="Refresh Data from Google Sheets"
          >
            <RotateCw size={15} className={isRefreshing ? 'animate-spin text-purple-600' : ''} />
          </button>

          {/* Quick Export Menu */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-xs"
            >
              <Download size={14} />
              <span className="hidden md:inline">Export</span>
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                <button
                  onClick={handleExportPDF}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-medium"
                >
                  <FileText size={14} className="text-rose-500" />
                  <span>Executive PDF Report</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-medium"
                >
                  <FileSpreadsheet size={14} className="text-emerald-600" />
                  <span>Excel (.xlsx) Active Dataset</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-medium"
                >
                  <Filter size={14} className="text-blue-500" />
                  <span>CSV Filtered Loss Events</span>
                </button>
                <div className="h-px bg-slate-100 my-1"></div>
                <button
                  onClick={handleExportDataPack}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-medium"
                >
                  <Archive size={14} className="text-amber-500" />
                  <span>Complete 3-Month ZIP Pack</span>
                </button>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Open Notifications & Alerts"
          >
            <Bell size={16} />
            {computedStats.kpiSummary.openInvestigationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {computedStats.kpiSummary.openInvestigationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Drawer / Second Row if Expanded */}
      {isFilterDrawerOpen && (
        <div className="bg-slate-50/90 border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Region */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Region:</span>
              <select
                value={filters.region}
                onChange={(e) => updateFilter('region', e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
              >
                <option value="ALL">All Regions</option>
                <option value="North">North (Delhi, Gurugram)</option>
                <option value="South">South (Bengaluru, Hyd, Chennai)</option>
                <option value="West">West (Mumbai, Pune)</option>
                <option value="East">East (Kolkata)</option>
              </select>
            </div>

            {/* Process Stage */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Process:</span>
              <select
                value={filters.process}
                onChange={(e) => updateFilter('process', e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
              >
                <option value="ALL">All Stages (Inbound to Returns)</option>
                <option value="Inbound">Inbound Dock & QC</option>
                <option value="Putaway">Putaway to Storage</option>
                <option value="Storage">Storage & Cold Rooms</option>
                <option value="Picking">Picking & Staging</option>
                <option value="Dispatch">Dispatch Staging</option>
                <option value="Transfer">Transit to Dark Store</option>
                <option value="Returns">Customer / Dark Store Returns</option>
              </select>
            </div>

            {/* Shift */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Shift:</span>
              <select
                value={filters.shift}
                onChange={(e) => updateFilter('shift', e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
              >
                <option value="ALL">All 3 Shifts</option>
                <option value="Shift 1 (06:00-14:00)">Shift 1 (Morning)</option>
                <option value="Shift 2 (14:00-22:00)">Shift 2 (Evening)</option>
                <option value="Shift 3 (22:00-06:00)">Shift 3 (Night)</option>
              </select>
            </div>

            {/* Loss Category */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Loss Driver:</span>
              <select
                value={filters.lossReason}
                onChange={(e) => updateFilter('lossReason', e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs max-w-[200px]"
              >
                <option value="ALL">All Loss Drivers</option>
                <option value="Unexplained Inventory Shrinkage">Unexplained Shrinkage</option>
                <option value="Physical Damage">Physical Damage</option>
                <option value="Expiry">Expiry & Shelf-Life</option>
                <option value="Inbound Shortage">Inbound Shortage</option>
                <option value="Dispatch / Transfer Shortage">Transfer Shortage</option>
                <option value="Temperature-Related Loss">Temperature Breach</option>
              </select>
            </div>

            {/* User Role Simulation */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Role:</span>
              <select
                value={filters.userRole}
                onChange={(e) => updateFilter('userRole', e.target.value as any)}
                className="bg-white border border-purple-300 text-purple-700 font-semibold rounded px-2 py-1 text-xs"
              >
                <option value="Senior Manager">Senior Manager (Full Access)</option>
                <option value="Hub Manager">Hub Manager</option>
                <option value="Inventory Analyst">Inventory Analyst</option>
                <option value="Loss Prevention Analyst">Loss Prevention Analyst</option>
                <option value="Finance Viewer">Finance Viewer (Read Only)</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="text-xs text-slate-500 hover:text-rose-600 underline font-medium"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="px-3 py-1 bg-purple-600 text-white rounded font-medium text-xs hover:bg-purple-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
