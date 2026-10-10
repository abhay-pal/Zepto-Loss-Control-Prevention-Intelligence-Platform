import React, { useState } from 'react';
import {
  Building2,
  Users,
  Clock,
  ArrowUpDown,
  Award,
  AlertTriangle,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
  ScatterChart,
  Scatter,
} from 'recharts';
import { useGlobalFilter } from '../../context/GlobalFilterContext';

export const HubZoneShift: React.FC = () => {
  const { dataPackage, computedStats, updateFilter, setActiveTab } = useGlobalFilter();
  const { hubsRanking, filteredLossEvents } = computedStats;

  const [sortBy, setSortBy] = useState<'lossRate' | 'grossLoss' | 'accuracy'>('lossRate');

  // Hub Benchmarking Matrix
  const hubMetrics = dataPackage.hubs.map((hub) => {
    const hubEvts = filteredLossEvents.filter((e) => e.Hub_ID === hub.Hub_ID);
    const gross = hubEvts.reduce((s, e) => s + e.Gross_Loss_Value, 0);
    const rec = hubEvts.reduce((s, e) => s + e.Realized_Recovery, 0);
    const net = gross - rec;

    const shrink = hubEvts.filter((e) => e.Loss_Type === 'Unexplained Inventory Shrinkage').reduce((s, e) => s + e.Gross_Loss_Value, 0);
    const dmg = hubEvts.filter((e) => e.Loss_Type === 'Physical Damage').reduce((s, e) => s + e.Gross_Loss_Value, 0);
    const exp = hubEvts.filter((e) => e.Loss_Type === 'Expiry' || e.Loss_Type === 'Temperature-Related Loss').reduce((s, e) => s + e.Gross_Loss_Value, 0);

    const handledUnits = hub.Associated_Dark_Stores_Count * 65000;
    const lossPer10k = parseFloat(((gross / (handledUnits || 1)) * 10000).toFixed(2));
    const throughput = handledUnits * 95;
    const lossRate = throughput > 0 ? parseFloat(((net / throughput) * 100).toFixed(2)) : 0.42;
    const accuracy = parseFloat((99.2 - lossRate * 0.5).toFixed(2));
    const recoveryRate = gross > 0 ? parseFloat(((rec / gross) * 100).toFixed(1)) : 0;

    return {
      ...hub,
      grossLoss: gross,
      netLoss: net,
      recovery: rec,
      shrinkageLoss: shrink,
      damageLoss: dmg,
      expiryLoss: exp,
      lossRate,
      accuracy,
      recoveryRate,
      lossPer10k,
      handledUnits,
      staffCount: hub.Headcount,
    };
  });

  const sortedHubs = [...hubMetrics].sort((a, b) => {
    if (sortBy === 'lossRate') return a.lossRate - b.lossRate; // Ascending (lower loss rate is better)
    if (sortBy === 'grossLoss') return b.grossLoss - a.grossLoss;
    return b.accuracy - a.accuracy;
  });

  // Shift Performance Aggregation
  const shiftMetrics = [
    { shift: 'Shift 1 (Morning 06:00-14:00)', avgStaff: 32, lossRate: 0.38, damageIncidents: 42, unitsHandled: 420000 },
    { shift: 'Shift 2 (Evening 14:00-22:00)', avgStaff: 36, lossRate: 0.54, damageIncidents: 89, unitsHandled: 580000 },
    { shift: 'Shift 3 (Night 22:00-06:00)', avgStaff: 28, lossRate: 0.46, damageIncidents: 64, unitsHandled: 490000 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="text-purple-700" size={18} />
            <h2 className="font-bold text-slate-800 text-base">Hub, Zone & Shift Operational Performance</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Normalized facility benchmarking, shift-level risk variations, and staff-to-throughput correlation
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Rank by:</span>
          <button
            onClick={() => setSortBy('lossRate')}
            className={`px-2.5 py-1 rounded-lg font-semibold border ${
              sortBy === 'lossRate' ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-white border-slate-300'
            }`}
          >
            Loss Rate %
          </button>
          <button
            onClick={() => setSortBy('grossLoss')}
            className={`px-2.5 py-1 rounded-lg font-semibold border ${
              sortBy === 'grossLoss' ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-white border-slate-300'
            }`}
          >
            Gross Loss ₹
          </button>
        </div>
      </div>

      {/* Visualizations: Hub Loss Rate Comparison & Shift Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Normalized Loss Rate by Hub (%) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Normalized Loss Rate % by Mother Hub</h3>
              <p className="text-[11px] text-slate-500">Net Loss ÷ Handled Throughput Value (Fair benchmark vs Target ≤ 0.40%)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedHubs} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="Hub_ID" tick={{ fontSize: 9, fill: '#64748b' }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(v: any) => [`${v}%`, 'Loss Rate']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="lossRate" radius={[4, 4, 0, 0]}>
                  {sortedHubs.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.lossRate > 0.45 ? '#e11d48' : entry.lossRate < 0.35 ? '#059669' : '#7c3aed'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shift-wise Performance Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Shift Performance & Loss Surge</h3>
              <p className="text-[11px] text-slate-500">Damage incidents & loss rate by 8-hour operational shift</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              Evening Shift Vulnerability
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftMetrics} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="shift" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(v: any, name: any) => [name === 'Damage Incidents' ? `${v} cases` : `${v}%`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="damageIncidents" name="Damage Incidents" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hub Benchmarking Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">10 Mother Hubs Operational Benchmarking Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive scorecard comparing Loss Rate, Accuracy, Staffing, and Dark Store Feeder Coverage
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Hub ID</th>
                <th className="py-2.5 px-3">Facility Name</th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3 text-right">Dark Stores</th>
                <th className="py-2.5 px-3 text-right">Headcount</th>
                <th className="py-2.5 px-3 text-right">Gross Loss</th>
                <th className="py-2.5 px-3 text-right">Realized Recovery</th>
                <th className="py-2.5 px-3 text-right">Net Loss</th>
                <th className="py-2.5 px-3 text-right">Loss Rate %</th>
                <th className="py-2.5 px-3 text-right">Accuracy %</th>
                <th className="py-2.5 px-3 text-right">Recovery Rate %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedHubs.map((hub, idx) => (
                <tr
                  key={hub.Hub_ID}
                  onClick={() => {
                    updateFilter('hubId', hub.Hub_ID);
                    setActiveTab('executive-overview');
                  }}
                  className="hover:bg-purple-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-purple-700">{hub.Hub_ID}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{hub.Hub_Name}</td>
                  <td className="py-2.5 px-3">{hub.Region}</td>
                  <td className="py-2.5 px-3 text-right font-medium">{hub.Associated_Dark_Stores_Count}</td>
                  <td className="py-2.5 px-3 text-right font-medium">{hub.Headcount}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ₹{hub.grossLoss.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                    ₹{hub.recovery.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-purple-900">
                    ₹{hub.netLoss.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        hub.lossRate <= 0.40
                          ? 'bg-emerald-50 text-emerald-700'
                          : hub.lossRate <= 0.48
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {hub.lossRate}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-800">{hub.accuracy}%</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-purple-700">{hub.recoveryRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
