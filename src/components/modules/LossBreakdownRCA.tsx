import React, { useState } from 'react';
import {
  GitBranch,
  Filter,
  Layers,
  ChevronRight,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useGlobalFilter } from '../../context/GlobalFilterContext';
import { LossEvent } from '../../types';

const COLORS = ['#7c3aed', '#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#14b8a6', '#f43f5e', '#8b5cf6', '#64748b'];

export const LossBreakdownRCA: React.FC = () => {
  const { computedStats, dataPackage, setSelectedLossEvent, updateFilter, filters } = useGlobalFilter();
  const { filteredLossEvents } = computedStats;

  // Selected drilldown path
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedHub, setSelectedHub] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);

  // Groupings for multi-dimensional analysis
  const lossByCategory: Record<string, { count: number; gross: number; net: number }> = {};
  const lossByProcess: Record<string, { count: number; gross: number; net: number }> = {};
  const lossByRootCause: Record<string, { count: number; gross: number; net: number }> = {};
  const lossByShift: Record<string, { count: number; gross: number; net: number }> = {};
  const lossByZone: Record<string, { count: number; gross: number; net: number }> = {};

  filteredLossEvents.forEach((evt) => {
    // Category
    if (!lossByCategory[evt.Loss_Type]) lossByCategory[evt.Loss_Type] = { count: 0, gross: 0, net: 0 };
    lossByCategory[evt.Loss_Type].count += 1;
    lossByCategory[evt.Loss_Type].gross += evt.Gross_Loss_Value;
    lossByCategory[evt.Loss_Type].net += evt.Net_Loss_Value;

    // Process
    if (!lossByProcess[evt.Process_Stage]) lossByProcess[evt.Process_Stage] = { count: 0, gross: 0, net: 0 };
    lossByProcess[evt.Process_Stage].count += 1;
    lossByProcess[evt.Process_Stage].gross += evt.Gross_Loss_Value;
    lossByProcess[evt.Process_Stage].net += evt.Net_Loss_Value;

    // Root Cause
    const rc = evt.Root_Cause_Code;
    if (!lossByRootCause[rc]) lossByRootCause[rc] = { count: 0, gross: 0, net: 0 };
    lossByRootCause[rc].count += 1;
    lossByRootCause[rc].gross += evt.Gross_Loss_Value;
    lossByRootCause[rc].net += evt.Net_Loss_Value;

    // Shift
    if (!lossByShift[evt.Shift_ID]) lossByShift[evt.Shift_ID] = { count: 0, gross: 0, net: 0 };
    lossByShift[evt.Shift_ID].count += 1;
    lossByShift[evt.Shift_ID].gross += evt.Gross_Loss_Value;
    lossByShift[evt.Shift_ID].net += evt.Net_Loss_Value;

    // Zone
    if (!lossByZone[evt.Storage_Zone]) lossByZone[evt.Storage_Zone] = { count: 0, gross: 0, net: 0 };
    lossByZone[evt.Storage_Zone].count += 1;
    lossByZone[evt.Storage_Zone].gross += evt.Gross_Loss_Value;
    lossByZone[evt.Storage_Zone].net += evt.Net_Loss_Value;
  });

  const catChartData = Object.entries(lossByCategory)
    .map(([type, val]) => ({
      name: type.length > 18 ? type.slice(0, 16) + '...' : type,
      fullName: type,
      gross: val.gross,
      net: val.net,
      count: val.count,
    }))
    .sort((a, b) => b.gross - a.gross);

  const procChartData = Object.entries(lossByProcess).map(([proc, val]) => ({
    name: proc,
    gross: val.gross,
    net: val.net,
    count: val.count,
  }));

  const rootCauseChartData = Object.entries(lossByRootCause)
    .map(([rc, val]) => ({
      name: rc,
      gross: val.gross,
      count: val.count,
    }))
    .sort((a, b) => b.gross - a.gross)
    .slice(0, 8);

  const shiftChartData = Object.entries(lossByShift).map(([s, val]) => ({
    name: s.split(' ')[0] + ' ' + s.split(' ')[1],
    gross: val.gross,
    count: val.count,
  }));

  // Interactive drill-down filtered list
  const drillDownEvents = filteredLossEvents.filter((evt) => {
    if (selectedCategory && evt.Loss_Type !== selectedCategory) return false;
    if (selectedHub && evt.Hub_ID !== selectedHub) return false;
    if (selectedProcess && evt.Process_Stage !== selectedProcess) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Module Title & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="text-purple-700" size={18} />
            <h2 className="font-bold text-slate-800 text-base">Loss Breakdown & Root Cause Analysis (RCA)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hierarchical diagnostic drill-down across Category, Facility, Process Stage, and 5-Whys Incident Root Causes
          </p>
        </div>

        {/* Drill-down breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedHub(null);
              setSelectedProcess(null);
            }}
            className={`font-semibold hover:text-purple-700 ${!selectedCategory ? 'text-purple-700 underline' : 'text-slate-600'}`}
          >
            All Losses
          </button>
          {selectedCategory && (
            <>
              <ChevronRight size={13} className="text-slate-400" />
              <button
                onClick={() => {
                  setSelectedHub(null);
                  setSelectedProcess(null);
                }}
                className={`font-semibold hover:text-purple-700 ${!selectedHub ? 'text-purple-700 underline' : 'text-slate-600'}`}
              >
                {selectedCategory}
              </button>
            </>
          )}
          {selectedHub && (
            <>
              <ChevronRight size={13} className="text-slate-400" />
              <button
                onClick={() => setSelectedProcess(null)}
                className={`font-semibold hover:text-purple-700 ${!selectedProcess ? 'text-purple-700 underline' : 'text-slate-600'}`}
              >
                {selectedHub}
              </button>
            </>
          )}
          {selectedProcess && (
            <>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="font-bold text-purple-700">{selectedProcess}</span>
            </>
          )}
        </div>
      </div>

      {/* Row 1: Loss by Category & Loss by Process Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Loss by Category Chart */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Loss Distribution by Operational Category</h3>
              <p className="text-[11px] text-slate-500">Click a bar to filter drill-down table below</p>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-[11px] text-purple-700 hover:underline font-bold"
              >
                Clear Filter
              </button>
            )}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={catChartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedCategory(e.activePayload[0].payload.fullName);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#475569' }} width={120} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Loss']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="gross" name="Gross Loss" fill="#7c3aed" radius={[0, 4, 4, 0]} cursor="pointer">
                  {catChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={selectedCategory === entry.fullName ? '#ec4899' : COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loss by Process Stage */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Loss by Operational Process Stage</h3>
              <p className="text-[11px] text-slate-500">Inbound dock receipt to final Dark Store transfer</p>
            </div>
            {selectedProcess && (
              <button
                onClick={() => setSelectedProcess(null)}
                className="text-[11px] text-purple-700 hover:underline font-bold"
              >
                Clear Filter
              </button>
            )}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={procChartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedProcess(e.activePayload[0].payload.name);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Gross Loss']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="gross" fill="#8b5cf6" radius={[4, 4, 0, 0]} cursor="pointer">
                  {procChartData.map((entry, idx) => (
                    <Cell key={idx} fill={selectedProcess === entry.name ? '#f59e0b' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Root Cause Frequency & Shift Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Root Cause Code Distribution */}
        <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Top Root Cause Codes (RCA Master)</h3>
              <p className="text-[11px] text-slate-500">Gross loss attributed by standard diagnostic codes</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rootCauseChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Gross Loss']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="gross" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shift Distribution */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Loss by Shift</h3>
              <p className="text-[11px] text-slate-500">Morning vs Evening vs Night</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shiftChartData}
                  dataKey="gross"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                  paddingAngle={4}
                >
                  {shiftChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Gross Loss']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Drill-Down Table: Incidents & RCA Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>Incident & RCA Drill-Down Registry</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                {drillDownEvents.length} incidents
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any incident to inspect 5-Whys, evidence logs, assigned owner, and update investigation status
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter by Hub inside drilldown */}
            <select
              value={selectedHub || 'ALL'}
              onChange={(e) => setSelectedHub(e.target.value === 'ALL' ? null : e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium"
            >
              <option value="ALL">All Hubs in Drilldown</option>
              {dataPackage.hubs.map((h) => (
                <option key={h.Hub_ID} value={h.Hub_ID}>
                  {h.Hub_ID}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Mother Hub</th>
                <th className="py-2.5 px-3">Loss Type</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Product (SKU)</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Gross (₹)</th>
                <th className="py-2.5 px-3 text-right">Recovery (₹)</th>
                <th className="py-2.5 px-3 text-right">Net (₹)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">RCA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {drillDownEvents.slice(0, 50).map((evt) => (
                <tr
                  key={evt.Loss_Event_ID}
                  onClick={() => setSelectedLossEvent(evt)}
                  className="hover:bg-purple-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3 font-mono font-bold text-purple-700">{evt.Loss_Event_ID}</td>
                  <td className="py-2 px-3 text-slate-500">{evt.Occurrence_Date}</td>
                  <td className="py-2 px-3 font-medium text-slate-800">{evt.Hub_ID}</td>
                  <td className="py-2 px-3 font-medium">{evt.Loss_Type}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {evt.Process_Stage}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900 truncate max-w-[180px]" title={evt.SKU_Name}>
                    {evt.SKU_Name || evt.SKU_ID}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold">{evt.Quantity_Lost}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                    ₹{evt.Gross_Loss_Value.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-emerald-700">
                    ₹{evt.Realized_Recovery.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-purple-800">
                    ₹{evt.Net_Loss_Value.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.Status === 'Confirmed'
                          ? 'bg-slate-100 text-slate-700'
                          : evt.Status === 'Investigating'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {evt.Status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLossEvent(evt);
                      }}
                      className="p-1 rounded hover:bg-purple-100 text-purple-700"
                    >
                      <ExternalLink size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
