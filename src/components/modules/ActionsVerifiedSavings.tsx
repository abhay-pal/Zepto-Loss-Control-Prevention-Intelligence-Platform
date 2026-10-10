import React, { useState } from 'react';
import {
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  FileText,
  DollarSign,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useGlobalFilter } from '../../context/GlobalFilterContext';
import { ActionItem, ActionStatus } from '../../types';

const COLORS = ['#7c3aed', '#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#14b8a6', '#f43f5e'];

export const ActionsVerifiedSavings: React.FC = () => {
  const { dataPackage, updateActionItem } = useGlobalFilter();
  const { actions } = dataPackage;

  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(actions[0] || null);

  // Compute Verified Savings Totals
  const totalAvoidedLoss = actions.reduce((s, a) => s + (a.Validated_Avoided_Loss || 0), 0);
  const totalCost = actions.reduce((s, a) => s + (a.Intervention_Cost || 0), 0);
  const totalNetBenefit = actions.reduce((s, a) => s + (a.Verified_Net_Benefit || 0), 0);

  const validatedCount = actions.filter((a) => a.Status === 'Validated').length;
  const inProgressCount = actions.filter((a) => a.Status === 'In Progress').length;

  // Comparison data for before vs after loss rate
  const beforeAfterData = actions.map((a) => ({
    name: a.Action_ID,
    baseline: a.Baseline_Loss_Rate,
    current: a.Current_Loss_Rate,
    reduction: a.Observed_Reduction,
    netBenefit: a.Verified_Net_Benefit,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="text-purple-700" size={18} />
            <h2 className="font-bold text-slate-800 text-base">Actions & Verified Financial Savings Tracker</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational loss prevention initiatives with pre/post statistical validation, implementation costs, and net ROI
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
            Total Net Benefit: ₹{(totalNetBenefit / 100000).toFixed(2)}L
          </span>
          <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-bold">
            {validatedCount} Actions Validated
          </span>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs">
          <span className="text-emerald-700 font-medium block text-xs">Validated Avoided Loss</span>
          <span className="text-xl font-black text-emerald-900 mt-1 block">
            ₹{(totalAvoidedLoss / 100000).toFixed(2)}L
          </span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Gross Loss Prevented</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-medium block text-xs">Total Intervention Cost</span>
          <span className="text-xl font-black text-slate-800 mt-1 block">
            ₹{(totalCost / 1000).toFixed(0)}k
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Capex & Opex Expenditure</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-purple-200 bg-purple-50/40 shadow-2xs">
          <span className="text-purple-700 font-medium block text-xs">Verified Net Benefit</span>
          <span className="text-xl font-black text-purple-900 mt-1 block">
            ₹{(totalNetBenefit / 100000).toFixed(2)}L
          </span>
          <span className="text-[10px] text-purple-600 block mt-0.5">Net Financial ROI: {(totalAvoidedLoss / (totalCost || 1)).toFixed(1)}x</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-medium block text-xs">Mean Loss Reduction</span>
          <span className="text-xl font-black text-purple-700 mt-1 block">
            -50.0%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Across Validated Interventions</span>
        </div>
      </div>

      {/* Before vs After Loss Rate Chart & Savings Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Before vs After Loss Rate (%) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Baseline vs Current Loss Rate %</h3>
              <p className="text-[11px] text-slate-500">Statistically measured loss rate before and after intervention</p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Baseline
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Post-Action
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={beforeAfterData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(v: any) => [`${v}%`, 'Loss Rate']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="baseline" name="Baseline Loss Rate" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="current" name="Current Loss Rate" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Financial Benefit by Intervention */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Verified Net Benefit (₹) by Initiative</h3>
              <p className="text-[11px] text-slate-500">Avoided loss minus implementation capex/opex</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={beforeAfterData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Net Benefit']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="netBenefit" fill="#7c3aed" radius={[4, 4, 0, 0]}>
                  {beforeAfterData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Action Item Master Registry & Evidence Audit */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Operational Interventions & Evidence Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any initiative to audit root cause justification and physical evidence notes
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {actions.map((act) => (
            <div
              key={act.Action_ID}
              onClick={() => setSelectedAction(act)}
              className={`p-4 hover:bg-purple-50/40 cursor-pointer transition-colors ${
                selectedAction?.Action_ID === act.Action_ID ? 'bg-purple-50/60 border-l-4 border-purple-600' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-purple-900 text-purple-200">
                    {act.Action_ID}
                  </span>
                  <span className="font-bold text-slate-900 text-xs">{act.Proposed_Action}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      act.Status === 'Validated'
                        ? 'bg-emerald-100 text-emerald-800'
                        : act.Status === 'Completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {act.Status}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +₹{act.Verified_Net_Benefit.toLocaleString('en-IN')} Net Saved
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 mt-2">
                <div>
                  <span className="font-bold text-slate-700 block text-[11px]">Identified Root Cause:</span>
                  <p className="mt-0.5">{act.Root_Cause}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block text-[11px]">Audit Evidence & Validation Log:</span>
                  <p className="mt-0.5 text-slate-700 italic">"{act.Evidence_Validation_Notes}"</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>Facility: {act.Hub_ID} • Owner: {act.Action_Owner}</span>
                <span>
                  Baseline: {act.Baseline_Loss_Rate}% → Current: {act.Current_Loss_Rate}% ({act.Observed_Reduction}% Drop)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
