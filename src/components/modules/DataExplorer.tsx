import React, { useState, useMemo } from 'react';
import {
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Archive,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Maximize2,
  Minimize2,
  Eye,
} from 'lucide-react';
import { useGlobalFilter } from '../../context/GlobalFilterContext';
import { DATA_DICTIONARY } from '../../data/dataDictionary';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  downloadCompleteDataPackZip,
  exportExecutivePDF,
} from '../../services/exportService';

export const DataExplorer: React.FC = () => {
  const { dataPackage, computedStats } = useGlobalFilter();

  const [activeDatasetKey, setActiveDatasetKey] = useState<string>('lossEvents');
  const [activeSubTab, setActiveSubTab] = useState<'records' | 'dictionary' | 'summaries'>('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Map of 20 downloadable datasets
  const datasetDefinitions: Record<
    string,
    { title: string; category: string; data: any[]; sheetName: string }
  > = {
    lossEvents: { title: '14. Loss Event Master', category: 'Loss & RCA', data: dataPackage.lossEvents, sheetName: 'Loss_Events' },
    rcaRecords: { title: '15. RCA Investigations', category: 'Loss & RCA', data: dataPackage.rcaRecords, sheetName: 'RCA_Tracker' },
    damageExpiry: { title: '13. Damage & Expiry Events', category: 'Loss & RCA', data: dataPackage.damageExpiry, sheetName: 'Damage_Expiry' },
    cycleCounts: { title: '06. Physical Cycle Counts', category: 'Inventory', data: dataPackage.cycleCounts, sheetName: 'Cycle_Count' },
    inventoryMovements: { title: '04. Inventory Transactions', category: 'Inventory', data: dataPackage.inventoryMovements, sheetName: 'Inventory_Movement' },
    inventorySnapshots: { title: '05. Inventory Snapshots', category: 'Inventory', data: dataPackage.inventorySnapshots, sheetName: 'Inventory_Snapshots' },
    grnRecords: { title: '08. GRN & QC Records', category: 'Inbound & Transfers', data: dataPackage.grnRecords, sheetName: 'GRN_Data' },
    transfers: { title: '11. Dispatch & Transfer Records', category: 'Inbound & Transfers', data: dataPackage.transfers, sheetName: 'Transfer_Data' },
    vendorClaims: { title: '16. Vendor Claims', category: 'Recovery', data: dataPackage.vendorClaims, sheetName: 'Vendor_Claims' },
    recoveries: { title: '17. Recovery Transactions', category: 'Recovery', data: dataPackage.recoveries, sheetName: 'Recovery_Data' },
    actions: { title: '20. Action & Savings Tracker', category: 'Actions', data: dataPackage.actions, sheetName: 'Action_Tracker' },
    alerts: { title: '19. Alert Tracker Logs', category: 'Actions', data: dataPackage.alerts, sheetName: 'Alert_Tracker' },
    shifts: { title: '18. Workforce & Shift Data', category: 'Operations', data: dataPackage.shifts, sheetName: 'Shift_Data' },
    temperatureLogs: { title: '19. Cold Chain Temp Logs', category: 'Operations', data: dataPackage.temperatureLogs, sheetName: 'Temperature_Logs' },
    kpiDaily: { title: '15. KPI Daily Reconciled', category: 'Executive', data: dataPackage.kpiDaily, sheetName: 'KPI_Daily' },
    skus: { title: '01. SKU Master', category: 'Master Data', data: dataPackage.skus, sheetName: 'SKU_Master' },
    hubs: { title: '02. Hub Master', category: 'Master Data', data: dataPackage.hubs, sheetName: 'Hub_Master' },
    vendors: { title: '03. Vendor Master', category: 'Master Data', data: dataPackage.vendors, sheetName: 'Vendor_Master' },
    dataDictionary: { title: '00. Data Dictionary', category: 'Master Data', data: DATA_DICTIONARY, sheetName: 'Data_Dictionary' },
  };

  const activeDataset = datasetDefinitions[activeDatasetKey] || datasetDefinitions.lossEvents;
  const rawData = activeDataset.data;

  // Filter and sort active dataset
  const filteredData = useMemo(() => {
    let result = [...rawData];

    // Global keyword search
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) => String(val).toLowerCase().includes(q))
      );
    }

    // Column sorting
    if (sortCol) {
      result.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [rawData, searchTerm, sortCol, sortAsc]);

  // Pagination calculation
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const headers = useMemo(() => {
    if (rawData.length === 0) return [];
    return Object.keys(rawData[0]);
  }, [rawData]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  // Export Handlers
  const handleExportFilteredCSV = () => {
    exportToCSV(filteredData, `${activeDataset.sheetName}_Filtered.csv`);
  };

  const handleExportFullCSV = () => {
    exportToCSV(rawData, `${activeDataset.sheetName}_Full.csv`);
  };

  const handleExportExcel = () => {
    exportToExcel(filteredData, activeDataset.sheetName, `${activeDataset.sheetName}.xlsx`);
  };

  const handleExportJSON = () => {
    exportToJSON(filteredData, `${activeDataset.sheetName}.json`);
  };

  const handleDownloadAllZip = async () => {
    setIsExportingZip(true);
    setZipProgress('Starting compilation of all 20 operational tables...');
    try {
      await downloadCompleteDataPackZip(dataPackage, (msg) => setZipProgress(msg));
    } finally {
      setIsExportingZip(false);
      setZipProgress(null);
    }
  };

  return (
    <div className={`space-y-6 animate-in fade-in duration-200 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Database className="text-purple-700" size={18} />
            <h2 className="font-bold text-slate-800 text-base">Data Explorer & Downloads Center</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct raw data inspect & multi-format export across 20 reconciled quick-commerce tables
          </p>
        </div>

        {/* Big Complete Data Pack ZIP button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAllZip}
            disabled={isExportingZip}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Archive size={15} />
            <span>Download Complete 3-Month Data Pack (ZIP)</span>
          </button>
        </div>
      </div>

      {zipProgress && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center gap-2 animate-pulse">
          <RefreshCw size={14} className="animate-spin text-purple-700" />
          <span>{zipProgress}</span>
        </div>
      )}

      {/* Sub Tabs: Data Explorer vs Data Dictionary vs Summary Reports */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('records')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'records'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database size={14} />
          <span>Raw Table Explorer ({rawData.length} rows)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('dictionary')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'dictionary'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen size={14} />
          <span>Data Dictionary & Business Rules</span>
        </button>
        <button
          onClick={() => setActiveSubTab('summaries')}
          className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'summaries'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet size={14} />
          <span>Pre-Aggregated Summary Reports</span>
        </button>
      </div>

      {/* TAB 1: RAW DATA TABLE EXPLORER */}
      {activeSubTab === 'records' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Dataset Selector */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Dataset:</span>
              <select
                value={activeDatasetKey}
                onChange={(e) => {
                  setActiveDatasetKey(e.target.value);
                  setPage(1);
                  setSortCol(null);
                }}
                className="bg-purple-50 border border-purple-300 font-bold text-purple-900 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
              >
                {Object.entries(datasetDefinitions).map(([key, def]) => (
                  <option key={key} value={key}>
                    {def.title} ({def.data.length.toLocaleString()} rows)
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search within this dataset..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden text-slate-800 w-56"
              />
            </div>

            {/* Export Buttons for Active Dataset */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportFilteredCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                title="Download filtered rows as CSV"
              >
                <Download size={13} className="text-purple-600" />
                <span>CSV</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                title="Download as Excel .xlsx"
              >
                <FileSpreadsheet size={13} className="text-emerald-600" />
                <span>Excel (.xlsx)</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                title="Download as JSON"
              >
                <FileText size={13} className="text-blue-600" />
                <span>JSON</span>
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Table'}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-h-[520px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    {headers.map((h) => (
                      <th
                        key={h}
                        onClick={() => handleSort(h)}
                        className="py-2.5 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1">
                          <span>{h}</span>
                          <ArrowUpDown size={11} className="text-slate-400" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-purple-50/40">
                      {headers.map((h) => {
                        const val = row[h];
                        const isNumber = typeof val === 'number';
                        return (
                          <td
                            key={h}
                            className={`py-2 px-3 whitespace-nowrap ${
                              isNumber ? 'font-mono text-slate-800' : 'text-slate-700'
                            }`}
                          >
                            {typeof val === 'boolean'
                              ? val ? 'TRUE' : 'FALSE'
                              : isNumber
                              ? val.toLocaleString('en-IN')
                              : String(val || '')}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>
                  Showing {(page - 1) * rowsPerPage + 1} to{' '}
                  {Math.min(page * rowsPerPage, totalRecords)} of {totalRecords.toLocaleString()} rows
                </span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs"
                >
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                  <option value={250}>250 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 font-semibold"
                >
                  Previous
                </button>
                <span className="px-2 font-bold text-slate-800">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATA DICTIONARY */}
      {activeSubTab === 'dictionary' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70">
            <h3 className="font-bold text-slate-800 text-sm">System Data Dictionary & Formulas</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact table schemas, data types, primary & foreign keys, and operational business rules
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Table Name</th>
                  <th className="py-2.5 px-3">Column Name</th>
                  <th className="py-2.5 px-3">Data Type</th>
                  <th className="py-2.5 px-3">Key Type</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Business Rule / Calculation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {DATA_DICTIONARY.map((d, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/40">
                    <td className="py-2 px-3 font-mono font-bold text-purple-700">{d.Table_Name}</td>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-900">{d.Column_Name}</td>
                    <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{d.Data_Type}</td>
                    <td className="py-2 px-3">
                      {d.Primary_Foreign_Key && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 font-mono">
                          {d.Primary_Foreign_Key}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">{d.Description}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-600 bg-slate-50/50">
                      {d.Business_Rule_Formula}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRE-AGGREGATED SUMMARY REPORTS */}
      {activeSubTab === 'summaries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Daily Loss Summary',
              desc: 'Aggregated gross loss, net loss, and throughput by day across facilities.',
              data: computedStats.dailyTrend,
              filename: 'Zepto_Daily_Loss_Summary.csv',
            },
            {
              title: 'Hub-wise Loss Benchmarking',
              desc: 'Comparative ranking of all 10 Mother Hubs with loss rates and recoveries.',
              data: computedStats.hubsRanking,
              filename: 'Zepto_Hub_Loss_Summary.csv',
            },
            {
              title: 'SKU-wise Financial Erosion',
              desc: 'Product-level write-off totals and units lost for top 20 items.',
              data: computedStats.skuRanking,
              filename: 'Zepto_SKU_Loss_Summary.csv',
            },
            {
              title: 'Category-wise Loss Pareto',
              desc: 'Cumulative percentage share of loss across all 12 categories.',
              data: computedStats.categoryBreakdown,
              filename: 'Zepto_Category_Loss_Summary.csv',
            },
            {
              title: 'Process Leakage Breakdown',
              desc: 'Inbound through dispatch stage leakage rates and loss values.',
              data: computedStats.processBreakdown,
              filename: 'Zepto_Process_Loss_Summary.csv',
            },
            {
              title: 'Vendor Claims Recovery Report',
              desc: 'Supplier chargebacks, debit notes, and recovery reconciliation.',
              data: dataPackage.vendorClaims,
              filename: 'Zepto_Vendor_Recovery_Summary.csv',
            },
          ].map((rep, idx) => (
            <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">{rep.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{rep.desc}</p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {rep.data.length} records
                </span>
                <button
                  onClick={() => exportToCSV(rep.data, rep.filename)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Download size={13} />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
