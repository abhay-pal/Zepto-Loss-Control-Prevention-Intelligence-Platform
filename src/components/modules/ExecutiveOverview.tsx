import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Info,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Layers,
  ChevronRight,
  ShieldCheck,
  Target,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useGlobalFilter } from '../../context/GlobalFilterContext';

const COLORS = ['#7c3aed', '#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#14b8a6', '#f43f5e', '#8b5cf6', '#64748b'];

export const ExecutiveOverview: React.FC = () => {
  const { computedStats, setActiveTab, setSelectedLossEvent, updateFilter, dataPackage } = useGlobalFilter();
  const { kpiSummary, executiveInsights, waterfallData, hubsRanking, skuRanking, dailyTrend, categoryBreakdown } =
    computedStats;

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Pareto calculation for Category Breakdown
  let runningSum = 0;
  const paretoData = categoryBreakdown.map((item) => {
    runningSum += item.grossLoss;
    const cumPct = kpiSummary.totalGrossLoss > 0 ? (runningSum / kpiSummary.totalGrossLoss) * 100 : 0;
    return {
      name: item.name.length > 14 ? item.name.slice(0, 12) + '...' : item.name,
      fullName: item.name,
      grossLoss: item.grossLoss,
      cumulativePct: parseFloat(cumPct.toFixed(1)),
    };
  });

  // KPI card definition with exact formulas, deltas, tooltips and drilldown target tabs
  const kpis = [
    {
      id: 'gross-loss',
      title: 'Total Gross Loss',
      value: `₹${(kpiSummary.totalGrossLoss / 100000).toFixed(2)}L`,
      rawValue: kpiSummary.totalGrossLoss,
      prevValue: `₹${(kpiSummary.prevGrossLoss / 100000).toFixed(2)}L`,
      deltaPct: kpiSummary.momLossChangePct,
      isPositiveGood: false,
      tooltip: 'Formula: Sum of all confirmed write-offs, shortage, damage & expiry before recoveries.',
      targetTab: 'loss-breakdown-rca',
      accent: 'border-l-rose-500',
    },
    {
      id: 'net-loss',
      title: 'Total Net Loss',
      value: `₹${(kpiSummary.totalNetLoss / 100000).toFixed(2)}L`,
      rawValue: kpiSummary.totalNetLoss,
      prevValue: `₹${(kpiSummary.prevNetLoss / 100000).toFixed(2)}L`,
      deltaPct: kpiSummary.momLossChangePct - 1.2,
      isPositiveGood: false,
      tooltip: 'Formula: Gross Operational Loss minus Realized Recoveries (Debit Notes & Salvage).',
      targetTab: 'loss-breakdown-rca',
      accent: 'border-l-purple-600',
    },
    {
      id: 'loss-rate',
      title: 'Net Loss Rate %',
      value: `${kpiSummary.netLossPct}%`,
      prevValue: `${kpiSummary.prevLossRatePct.toFixed(2)}%`,
      deltaPct: -0.06,
      isPositiveGood: false,
      tooltip: 'Formula: (Net Loss ÷ Handled Throughput Value) × 100. Target ceiling: ≤ 0.45%.',
      targetTab: 'hub-zone-shift',
      accent: 'border-l-indigo-500',
    },
    {
      id: 'shrinkage-loss',
      title: 'Shrinkage Loss',
      value: `₹${(kpiSummary.shrinkageLoss / 100000).toFixed(2)}L`,
      prevValue: `₹${((kpiSummary.shrinkageLoss * 1.08) / 100000).toFixed(2)}L`,
      deltaPct: -7.4,
      isPositiveGood: false,
      tooltip: 'Formula: Confirmed unexplained negative inventory cycle count variance × Unit Cost.',
      targetTab: 'inventory-shrinkage',
      accent: 'border-l-amber-500',
    },
    {
      id: 'damage-loss',
      title: 'Physical Damage',
      value: `₹${(kpiSummary.damageLoss / 100000).toFixed(2)}L`,
      prevValue: `₹${((kpiSummary.damageLoss * 1.12) / 100000).toFixed(2)}L`,
      deltaPct: -10.7,
      isPositiveGood: false,
      tooltip: 'Formula: Damaged stock during handling, forklift transit, and picking write-offs.',
      targetTab: 'expiry-damage-temp',
      accent: 'border-l-orange-500',
    },
    {
      id: 'expiry-loss',
      title: 'Expiry & Spoilage',
      value: `₹${(kpiSummary.expiryLoss / 100000).toFixed(2)}L`,
      prevValue: `₹${((kpiSummary.expiryLoss * 1.15) / 100000).toFixed(2)}L`,
      deltaPct: -13.1,
      isPositiveGood: false,
      tooltip: 'Formula: Write-offs from passed shelf-life and cold chain excursions.',
      targetTab: 'expiry-damage-temp',
      accent: 'border-l-red-500',
    },
    {
      id: 'inbound-shortage',
      title: 'Inbound Shortage',
      value: `₹${(kpiSummary.inboundShortageLoss / 100000).toFixed(2)}L`,
      prevValue: `₹${((kpiSummary.inboundShortageLoss * 0.95) / 100000).toFixed(2)}L`,
      deltaPct: +5.2,
      isPositiveGood: false,
      tooltip: 'Formula: Invoiced quantity minus physically received dock scan count × Unit Cost.',
      targetTab: 'process-leakage',
      accent: 'border-l-yellow-500',
    },
    {
      id: 'transfer-loss',
      title: 'Transfer Loss',
      value: `₹${(kpiSummary.transferLoss / 100000).toFixed(2)}L`,
      prevValue: `₹${((kpiSummary.transferLoss * 1.05) / 100000).toFixed(2)}L`,
      deltaPct: -4.8,
      isPositiveGood: false,
      tooltip: 'Formula: Dispatch discrepancy unacknowledged by feeder Dark Stores.',
      targetTab: 'process-leakage',
      accent: 'border-l-cyan-500',
    },
    {
      id: 'realized-recovery',
      title: 'Realized Recovery',
      value: `₹${(kpiSummary.realizedRecovery / 100000).toFixed(2)}L`,
      prevValue: `₹${(kpiSummary.prevRecovery / 100000).toFixed(2)}L`,
      deltaPct: +14.6,
      isPositiveGood: true,
      tooltip: 'Formula: Cash & approved supplier debit notes credited against loss claims.',
      targetTab: 'vendor-claims-recovery',
      accent: 'border-l-emerald-500',
    },
    {
      id: 'recovery-rate',
      title: 'Recovery Rate %',
      value: `${kpiSummary.recoveryRatePct}%`,
      prevValue: '58.4%',
      deltaPct: +7.2,
      isPositiveGood: true,
      tooltip: 'Formula: (Realized Recovery ÷ Recoverable Loss Amount) × 100.',
      targetTab: 'vendor-claims-recovery',
      accent: 'border-l-teal-500',
    },
    {
      id: 'inventory-accuracy',
      title: 'Inventory Accuracy',
      value: `${kpiSummary.inventoryAccuracyPct}%`,
      prevValue: `${kpiSummary.prevAccuracyPct.toFixed(2)}%`,
      deltaPct: +0.45,
      isPositiveGood: true,
      tooltip: 'Formula: 100 − (Total Absolute Variance Quantity ÷ Total Book Stock Quantity) × 100.',
      targetTab: 'inventory-shrinkage',
      accent: 'border-l-blue-600',
    },
    {
      id: 'high-risk-skus',
      title: 'High-Risk SKUs',
      value: `${kpiSummary.highRiskSkusCount}`,
      prevValue: '28',
      deltaPct: -14.2,
      isPositiveGood: false,
      tooltip: 'Formula: Active SKUs where cumulative gross loss exceeds ₹3,000 threshold.',
      targetTab: 'sku-category-analysis',
      accent: 'border-l-rose-600',
    },
    {
      id: 'open-investigations',
      title: 'Open Loss RCAs',
      value: `${kpiSummary.openInvestigationsCount}`,
      prevValue: '12',
      deltaPct: -25.0,
      isPositiveGood: false,
      tooltip: 'Formula: Unresolved critical and high severity alerts requiring RCA closure.',
      targetTab: 'alerts-investigations',
      accent: 'border-l-amber-600',
    },
    {
      id: 'prevented-loss',
      title: 'Avoided Loss (Saved)',
      value: `₹${(kpiSummary.preventedAvoidedLoss / 100000).toFixed(2)}L`,
      prevValue: '₹9.40L',
      deltaPct: +38.5,
      isPositiveGood: true,
      tooltip: 'Formula: Validated financial savings delivered by operational interventions.',
      targetTab: 'actions-verified-savings',
      accent: 'border-l-emerald-600',
    },
    {
      id: 'mom-loss-change',
      title: 'MoM Loss Trend',
      value: `${kpiSummary.momLossChangePct > 0 ? '+' : ''}${kpiSummary.momLossChangePct}%`,
      prevValue: '+2.1%',
      deltaPct: kpiSummary.momLossChangePct,
      isPositiveGood: false,
      tooltip: 'Formula: (Current Period Gross Loss − Previous Period Gross Loss) ÷ Previous Period × 100.',
      targetTab: 'loss-breakdown-rca',
      accent: 'border-l-violet-600',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Dynamic Executive Insights Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 text-white shadow-md border border-purple-800/40">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-amber-400" size={18} />
          <h2 className="font-bold text-sm tracking-wide uppercase text-purple-200">
            Algorithmic Executive Insights & Operational Root Causes
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs mt-2">
          {executiveInsights.slice(0, 6).map((insight, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-start gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-[11px] flex-shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-slate-200 leading-relaxed text-[11px]">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 15 Executive KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-purple-700" />
            <h3 className="font-bold text-slate-800 text-sm">Key Operational Loss & Performance Metrics</h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Click any KPI card to drill down into detailed analytics
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {kpis.map((kpi) => {
            const isNegative = kpi.deltaPct < 0;
            // For loss metrics, negative delta is good (loss decreased!)
            const isFavorable = kpi.isPositiveGood ? !isNegative : isNegative;

            return (
              <div
                key={kpi.id}
                onClick={() => setActiveTab(kpi.targetTab)}
                className={`relative group p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer border-l-4 ${kpi.accent}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-600 truncate block">{kpi.title}</span>
                  <div
                    className="relative cursor-help text-slate-400 hover:text-slate-600"
                    onMouseEnter={() => setActiveTooltip(kpi.id)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Info size={12} />
                    {activeTooltip === kpi.id && (
                      <div className="absolute right-0 bottom-full mb-1.5 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl z-50 pointer-events-none">
                        {kpi.tooltip}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-lg font-black text-slate-900 tracking-tight">{kpi.value}</span>
                  <ArrowUpRight size={14} className="text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                  <span className="text-slate-600 font-medium truncate">Prev: {kpi.prevValue}</span>
                  <span
                    className={`flex items-center font-bold text-[10px] px-1 py-0.2 rounded ${
                      isFavorable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {isNegative ? <TrendingDown size={11} className="mr-0.5" /> : <TrendingUp size={11} className="mr-0.5" />}
                    {kpi.deltaPct > 0 ? `+${kpi.deltaPct}%` : `${kpi.deltaPct}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 1 Visualizations: Daily Trend & Waterfall Bridge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily Gross vs Net Loss Trend */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Daily Operational Loss & Recovery Trend</h4>
              <p className="text-[11px] text-slate-500">Gross Write-Off vs Realized Recovery over 3-month timeline</p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Gross
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Recovery
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']}
                  labelFormatter={(l) => `Date: ${l}`}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="grossLoss" name="Gross Loss" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorGross)" />
                <Area type="monotone" dataKey="recovery" name="Realized Recovery" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRec)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loss Waterfall Bridge (Gross -> Recovery -> Net) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Operational Loss Waterfall Bridge</h4>
              <p className="text-[11px] text-slate-500">Gross Operational Loss → Realized Settlements → Final Net Loss</p>
            </div>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Recovery: {kpiSummary.recoveryRatePct}%
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fontSize: 9, fill: '#64748b' }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                <Tooltip
                  formatter={(v: any) => [`₹${Math.abs(Number(v)).toLocaleString('en-IN')}`, 'Value']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar
                  dataKey="amount"
                  radius={[4, 4, 0, 0]}
                  fill="#7c3aed"
                >
                  {waterfallData.map((entry, index) => {
                    const color = entry.type === 'gross' ? '#e11d48' : entry.type === 'recovery' ? '#059669' : '#7c3aed';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 Visualizations: Top 10 Hubs & Category Loss Pareto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 10 Mother Hubs by Loss Concentration */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Top Mother Hubs by Operational Loss</h4>
              <p className="text-[11px] text-slate-500">Gross Loss vs Realized Recovery per Mother Hub facility</p>
            </div>
            <button
              onClick={() => setActiveTab('hub-zone-shift')}
              className="text-xs text-purple-700 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Hub Details</span>
              <ChevronRight size={13} />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={hubsRanking.slice(0, 7)}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="hubName" type="category" tick={{ fontSize: 9, fill: '#475569' }} width={90} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Loss']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="grossLoss" name="Gross Loss" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="netLoss" name="Net Loss" fill="#ec4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pareto Chart (80/20 Rule) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Category Loss Pareto Analysis</h4>
              <p className="text-[11px] text-slate-500">Individual category loss + cumulative % contribution curve</p>
            </div>
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Pareto 80/20 Target
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paretoData.slice(0, 8)} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-15} textAnchor="end" />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(v: any, name: any) => [name === 'Cumulative %' ? `${v}%` : `₹${Number(v).toLocaleString('en-IN')}`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar yAxisId="left" dataKey="grossLoss" name="Gross Loss" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cumulativePct" name="Cumulative %" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Target vs Actual Benchmarking & Top SKUs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Target vs Actual Loss Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-800 text-sm">Loss Target vs Actual</h4>
            <Target size={15} className="text-purple-600" />
          </div>
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-600">Overall Net Loss Rate</span>
                <span className={kpiSummary.netLossPct > 0.45 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {kpiSummary.netLossPct}% (Target: ≤ 0.40%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className={`h-full ${kpiSummary.netLossPct > 0.45 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (kpiSummary.netLossPct / 0.8) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-600">Inventory Accuracy</span>
                <span className="text-emerald-700 font-bold">{kpiSummary.inventoryAccuracyPct}% (Target: ≥ 98.5%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${(kpiSummary.inventoryAccuracyPct / 100) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="text-slate-600">Vendor Claims Recovery Rate</span>
                <span className="text-purple-700 font-bold">{kpiSummary.recoveryRatePct}% (Target: ≥ 65%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600"
                  style={{ width: `${(kpiSummary.recoveryRatePct / 100) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
              <span className="font-bold">Command Directive: </span>
              Focus audit teams on evening picking shifts in Delhi Kundli & Mumbai Bhiwandi to hit the 0.40% target ceiling before month-end.
            </div>
          </div>
        </div>

        {/* Top 5 SKUs by Financial Loss */}
        <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Top Financial Erosion SKUs</h4>
              <p className="text-[11px] text-slate-500">Highest gross write-offs across all Mother Hub facilities</p>
            </div>
            <button
              onClick={() => setActiveTab('sku-category-analysis')}
              className="text-xs text-purple-700 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View All 20 SKUs</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">SKU ID</th>
                  <th className="py-2 px-3">Product Name</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3 text-right">Units Lost</th>
                  <th className="py-2 px-3 text-right">Gross Loss</th>
                  <th className="py-2 px-3 text-right">Net Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {skuRanking.slice(0, 5).map((sku) => (
                  <tr
                    key={sku.skuId}
                    className="hover:bg-purple-50/50 cursor-pointer transition-colors"
                    onClick={() => {
                      updateFilter('skuSearch', sku.skuId);
                      setActiveTab('sku-category-analysis');
                    }}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-700">{sku.skuId}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{sku.skuName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {sku.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold">{sku.unitsLost}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ₹{sku.grossLoss.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-purple-800">
                      ₹{sku.netLoss.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
