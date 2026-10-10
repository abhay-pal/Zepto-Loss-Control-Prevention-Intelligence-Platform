import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  FilterState,
  UserRole,
  LossEvent,
  AlertItem,
  ActionItem,
  RCATracker,
  SKUMaster,
} from '../types';
import { generateSyntheticDataset, GeneratedDataPackage } from '../data/dataGenerator';
import { filterAndComputeMetrics, FilteredDataStats } from '../services/kpiEngine';

interface SavedFilterView {
  id: string;
  name: string;
  filters: FilterState;
}

interface GlobalContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  dataPackage: GeneratedDataPackage;
  computedStats: FilteredDataStats;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Drill-down states
  selectedSKU: SKUMaster | null;
  setSelectedSKU: (sku: SKUMaster | null) => void;
  selectedLossEvent: LossEvent | null;
  setSelectedLossEvent: (event: LossEvent | null) => void;
  // Modals & Panels
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  isFilterDrawerOpen: boolean;
  setIsFilterDrawerOpen: (open: boolean) => void;
  // Data Mutation Handlers
  updateAlertStatus: (alertId: string, newStatus: any, notes?: string) => void;
  updateActionItem: (actionId: string, updates: Partial<ActionItem>) => void;
  updateRCARecord: (rcaId: string, updates: Partial<RCATracker>) => void;
  regenerateData: (seed?: number) => void;
  refreshData: () => Promise<void>;
  isRefreshing: boolean;
  savedViews: SavedFilterView[];
  saveCurrentView: (name: string) => void;
  applySavedView: (view: SavedFilterView) => void;
  deleteSavedView: (id: string) => void;
}

const DEFAULT_FILTERS: FilterState = {
  hubId: 'ALL',
  dateRange: {
    startDate: '2026-08-01',
    endDate: '2026-10-10',
    label: 'Last 3 Months (Full Period)',
  },
  region: 'ALL',
  category: 'ALL',
  skuSearch: '',
  process: 'ALL',
  shift: 'ALL',
  lossReason: 'ALL',
  userRole: 'Senior Manager',
};

const GlobalFilterContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(() => {
    const saved = localStorage.getItem('zepto_active_filters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_FILTERS;
  });

  const [activeTab, setActiveTab] = useState<string>('executive-overview');
  const [dataPackage, setDataPackage] = useState<GeneratedDataPackage>(() => generateSyntheticDataset(20261010));
  const [selectedSKU, setSelectedSKU] = useState<SKUMaster | null>(null);
  const [selectedLossEvent, setSelectedLossEvent] = useState<LossEvent | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [savedViews, setSavedViews] = useState<SavedFilterView[]>(() => {
    return [
      {
        id: 'view-1',
        name: 'Dairy Cold-Chain Risk',
        filters: { ...DEFAULT_FILTERS, category: 'Dairy' },
      },
      {
        id: 'view-2',
        name: 'Delhi Kundli Focus',
        filters: { ...DEFAULT_FILTERS, hubId: 'MH-DEL-01' },
      },
      {
        id: 'view-3',
        name: 'Inbound Discrepancies',
        filters: { ...DEFAULT_FILTERS, process: 'Inbound', lossReason: 'Inbound Shortage' },
      },
      {
        id: 'view-4',
        name: 'Current MTD (Oct 2026)',
        filters: {
          ...DEFAULT_FILTERS,
          dateRange: { startDate: '2026-10-01', endDate: '2026-10-10', label: 'Current Month-to-Date' },
        },
      },
    ];
  });

  // Persist active filters
  useEffect(() => {
    localStorage.setItem('zepto_active_filters', JSON.stringify(filters));
  }, [filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const updateAlertStatus = (alertId: string, newStatus: any, notes?: string) => {
    setDataPackage((prev) => {
      const updatedAlerts = prev.alerts.map((a) => {
        if (a.Alert_ID === alertId) {
          return {
            ...a,
            Status: newStatus,
            Investigation_Notes: notes !== undefined ? notes : a.Investigation_Notes,
          };
        }
        return a;
      });
      return { ...prev, alerts: updatedAlerts };
    });
  };

  const updateActionItem = (actionId: string, updates: Partial<ActionItem>) => {
    setDataPackage((prev) => {
      const updated = prev.actions.map((act) => {
        if (act.Action_ID === actionId) {
          return { ...act, ...updates };
        }
        return act;
      });
      return { ...prev, actions: updated };
    });
  };

  const updateRCARecord = (rcaId: string, updates: Partial<RCATracker>) => {
    setDataPackage((prev) => {
      const updated = prev.rcaRecords.map((rca) => {
        if (rca.RCA_ID === rcaId) {
          return { ...rca, ...updates };
        }
        return rca;
      });
      return { ...prev, rcaRecords: updated };
    });
  };

  const regenerateData = (seed: number = Date.now()) => {
    const newPkg = generateSyntheticDataset(seed);
    setDataPackage(newPkg);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await new Promise((res) => setTimeout(res, 800));
    // Simulate real-time re-sync
    setIsRefreshing(false);
  };

  const saveCurrentView = (name: string) => {
    const newView: SavedFilterView = {
      id: `view-${Date.now()}`,
      name,
      filters: { ...filters },
    };
    setSavedViews((prev) => [...prev, newView]);
  };

  const applySavedView = (view: SavedFilterView) => {
    setFilters(view.filters);
  };

  const deleteSavedView = (id: string) => {
    setSavedViews((prev) => prev.filter((v) => v.id !== id));
  };

  // Centralized computed metrics, reactive to filter & data changes
  const computedStats = useMemo(() => {
    return filterAndComputeMetrics(
      dataPackage.lossEvents,
      dataPackage.cycleCounts,
      dataPackage.grnRecords,
      dataPackage.transfers,
      dataPackage.alerts,
      dataPackage.actions,
      filters
    );
  }, [dataPackage, filters]);

  return (
    <GlobalFilterContext.Provider
      value={{
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        dataPackage,
        computedStats,
        activeTab,
        setActiveTab,
        selectedSKU,
        setSelectedSKU,
        selectedLossEvent,
        setSelectedLossEvent,
        isNotificationOpen,
        setIsNotificationOpen,
        isFilterDrawerOpen,
        setIsFilterDrawerOpen,
        updateAlertStatus,
        updateActionItem,
        updateRCARecord,
        regenerateData,
        refreshData,
        isRefreshing,
        savedViews,
        saveCurrentView,
        applySavedView,
        deleteSavedView,
      }}
    >
      {children}
    </GlobalFilterContext.Provider>
  );
};

export const useGlobalFilter = () => {
  const context = useContext(GlobalFilterContext);
  if (!context) {
    throw new Error('useGlobalFilter must be used within a GlobalFilterProvider');
  }
  return context;
};
