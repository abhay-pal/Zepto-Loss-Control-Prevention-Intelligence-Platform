import React, { useState } from 'react';
import {
  Repeat,
  ArrowRight,
  Truck,
  CheckCircle,
  PackageCheck,
  AlertOctagon,
  TrendingDown,
  Layers,
  ChevronRight,
  ShieldAlert,
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

interface ProcessStageDetail {
  id: string;
  name: string;
  icon: any;
  unitsProcessed: number;
  unitsRejected: number;
  shortageQty: number;
  damageQty: number;
  discrepancyValue: number;
  confirmedLoss: number;
  leakageRatePct: number;
  openExceptions: number;
  slaBreaches: number;
  description: string;
}

export const ProcessLeakage: React.FC = () => {
  const { computedStats, dataPackage, setSelectedSKU } = useGlobalFilter();
  const { filteredGRN, filteredTransfers, filteredLossEvents } = computedStats;

  const [activeStage, setActiveStage] = useState<string>('Inbound');

  // Compute metrics for each process stage
  const stages: ProcessStageDetail[] = [
    {
      id: 'Inbound',
      name: '1. Inbound & Dock QC',
      icon: Truck,
      unitsProcessed: 840500,
      unitsRejected: 4120,
      shortageQty: 3480,
      damageQty: 640,
      discrepancyValue: 245000,
      confirmedLoss: 185000,
      leakageRatePct: 0.18,
      openExceptions: 8,
      slaBreaches: 2,
      description: 'Vendor delivery unloading, physical PO verification, ASN reconciliation, and temperature dock inspection.',
    },
    {
      id: 'Putaway',
      name: '2. Putaway to Bins',
      icon: Layers,
      unitsProcessed: 836380,
      unitsRejected: 520,
      shortageQty: 480,
      damageQty: 290,
      discrepancyValue: 84000,
      confirmedLoss: 62000,
      leakageRatePct: 0.08,
      openExceptions: 4,
      slaBreaches: 1,
      description: 'Transfer from receiving staging to high-density ambient racks and cold rooms with RF barcode confirmation.',
    },
    {
      id: 'Storage',
      name: '3. Storage & Chilled Chambers',
      icon: PackageCheck,
      unitsProcessed: 835570,
      unitsRejected: 1840,
      shortageQty: 1200,
      damageQty: 780,
      discrepancyValue: 210000,
      confirmedLoss: 165000,
      leakageRatePct: 0.14,
      openExceptions: 11,
      slaBreaches: 3,
      description: 'Inventory holding, cold chain refrigeration continuous monitoring, FEFO expiry rotation, and cycle audits.',
    },
    {
      id: 'Picking',
      name: '4. Picking & Sorting',
      icon: CheckCircle,
      unitsProcessed: 832950,
      unitsRejected: 1420,
      shortageQty: 890,
      damageQty: 1150,
      discrepancyValue: 195000,
      confirmedLoss: 148000,
      leakageRatePct: 0.16,
      openExceptions: 7,
      slaBreaches: 0,
      description: 'Order fulfillment picking into tote crates, scanner barcode checks, and heavy-item separation.',
    },
    {
      id: 'Dispatch',
      name: '5. Dispatch Staging & Loading',
      icon: Repeat,
      unitsProcessed: 830380,
      unitsRejected: 380,
      shortageQty: 310,
      damageQty: 240,
      discrepancyValue: 72000,
      confirmedLoss: 54000,
      leakageRatePct: 0.06,
      openExceptions: 3,
      slaBreaches: 1,
      description: 'Consolidation of outbound crates for feeder Dark Stores, vehicle loading, and security tag sealing.',
    },
    {
      id: 'Transfer',
      name: '6. Dark Store Transfer (Transit)',
      icon: Truck,
      unitsProcessed: 829450,
      unitsRejected: 980,
      shortageQty: 740,
      damageQty: 480,
      discrepancyValue: 142000,
      confirmedLoss: 98000,
      leakageRatePct: 0.11,
      openExceptions: 9,
      slaBreaches: 4,
      description: 'Inter-facility logistics transit from Mother Hub to feeder Dark Stores via dedicated refrigerated delivery vans.',
    },
    {
      id: 'Returns',
      name: '7. Dark Store Returns & QC',
      icon: AlertOctagon,
      unitsProcessed: 14200,
      unitsRejected: 310,
      shortageQty: 180,
      damageQty: 290,
      discrepancyValue: 46000,
      confirmedLoss: 38000,
      leakageRatePct: 0.28,
      openExceptions: 2,
      slaBreaches: 0,
      description: 'Overstock reversal, rejected crate induction, quality triage, scrap write-off, and vendor return to vendor (RTV).',
    },
  ];

  const currentStageObj = stages.find((s) => s.id === activeStage) || stages[0];

  const stageLossData = stages.map((s) => ({
    name: s.name.split('. ')[1] || s.name,
    loss: s.confirmedLoss,
    leakageRate: s.leakageRatePct,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Repeat className="text-purple-700" size={18} />
            <h2 className="font-bold text-slate-800 text-base">End-to-End Process Leakage Analysis</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage-wise inventory velocity & leakage tracking: Inbound Dock → Putaway → Storage → Picking → Dispatch → Transit → Returns
          </p>
        </div>
      </div>

      {/* Interactive Process Flow Stepper */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[760px] gap-2">
          {stages.map((stg, idx) => {
            const Icon = stg.icon;
            const isSelected = activeStage === stg.id;
            return (
              <React.Fragment key={stg.id}>
                <button
                  onClick={() => setActiveStage(stg.id)}
                  className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-purple-900 text-white border-purple-950 shadow-md ring-2 ring-purple-400/50'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon size={16} className={isSelected ? 'text-purple-300' : 'text-purple-700'} />
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-purple-800 text-purple-200' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {stg.leakageRatePct}% Loss
                    </span>
                  </div>
                  <div className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {stg.name}
                  </div>
                  <div className={`text-[11px] mt-1 font-semibold ${isSelected ? 'text-purple-200' : 'text-purple-800'}`}>
                    ₹{(stg.confirmedLoss / 1000).toFixed(0)}k lost
                  </div>
                </button>
                {idx < stages.length - 1 && (
                  <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Deep-Dive Dashboard */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Deep-Dive Diagnostics
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{currentStageObj.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{currentStageObj.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
              {currentStageObj.openExceptions} Open Exceptions
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
              {currentStageObj.slaBreaches} SLA Breaches
            </span>
          </div>
        </div>

        {/* 6 Stage KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[11px]">Units Processed</span>
            <span className="text-base font-black text-slate-900">{currentStageObj.unitsProcessed.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[11px]">Units Rejected</span>
            <span className="text-base font-black text-rose-600">{currentStageObj.unitsRejected.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[11px]">Shortage Qty</span>
            <span className="text-base font-black text-amber-600">{currentStageObj.shortageQty.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[11px]">Damage Qty</span>
            <span className="text-base font-black text-rose-700">{currentStageObj.damageQty.toLocaleString()}</span>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs">
            <span className="text-purple-700 block text-[11px]">Confirmed Loss</span>
            <span className="text-base font-black text-purple-900">₹{currentStageObj.confirmedLoss.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[11px]">Leakage Rate</span>
            <span className="text-base font-black text-purple-800">{currentStageObj.leakageRatePct}%</span>
          </div>
        </div>

        {/* Conditional Transaction Log according to Stage */}
        {activeStage === 'Inbound' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center justify-between">
              <span>Inbound GRN vs Purchase Order Discrepancy Reconciliation</span>
              <span className="text-[11px] text-slate-500">Comparing Invoiced vs Physically Received</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-64">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">GRN ID</th>
                    <th className="py-2 px-3">PO ID</th>
                    <th className="py-2 px-3">Vendor</th>
                    <th className="py-2 px-3">SKU ID</th>
                    <th className="py-2 px-3 text-right">Invoiced Qty</th>
                    <th className="py-2 px-3 text-right">Received Qty</th>
                    <th className="py-2 px-3 text-right">Shortage</th>
                    <th className="py-2 px-3 text-right">Shortage Value</th>
                    <th className="py-2 px-3">QC Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGRN.slice(0, 15).map((grn) => (
                    <tr key={grn.GRN_ID} className="hover:bg-purple-50/40">
                      <td className="py-2 px-3 font-mono font-bold text-purple-700">{grn.GRN_ID}</td>
                      <td className="py-2 px-3 text-slate-500">{grn.PO_ID}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">{grn.Vendor_Name || grn.Vendor_ID}</td>
                      <td className="py-2 px-3 font-mono text-purple-600">{grn.SKU_ID}</td>
                      <td className="py-2 px-3 text-right">{grn.Invoiced_Quantity}</td>
                      <td className="py-2 px-3 text-right">{grn.Physically_Received_Qty}</td>
                      <td className="py-2 px-3 text-right font-bold text-rose-600">{grn.Shortage_Quantity}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{grn.Shortage_Value.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          grn.QC_Status === 'Pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {grn.QC_Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeStage === 'Transfer' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs flex items-center justify-between">
              <span>Dark Store Dispatch & In-Transit Transfer Discrepancy Log</span>
              <span className="text-[11px] text-slate-500">Dispatched from Hub vs Acknowledged Received by Dark Store</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-64">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Transfer ID</th>
                    <th className="py-2 px-3">Dispatch Date</th>
                    <th className="py-2 px-3">Dark Store ID</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3 text-right">Dispatched</th>
                    <th className="py-2 px-3 text-right">Received</th>
                    <th className="py-2 px-3 text-right">Discrepancy</th>
                    <th className="py-2 px-3 text-right">Loss Value</th>
                    <th className="py-2 px-3">Transfer Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransfers.slice(0, 15).map((trf) => (
                    <tr key={trf.Transfer_ID} className="hover:bg-purple-50/40">
                      <td className="py-2 px-3 font-mono font-bold text-purple-700">{trf.Transfer_ID}</td>
                      <td className="py-2 px-3 text-slate-500">{trf.Dispatch_Date}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">{trf.Dark_Store_ID}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{trf.SKU_Name || trf.SKU_ID}</td>
                      <td className="py-2 px-3 text-right">{trf.Dispatched_Qty}</td>
                      <td className="py-2 px-3 text-right">{trf.Received_Qty}</td>
                      <td className="py-2 px-3 text-right font-bold text-rose-600">{trf.Discrepancy_Qty}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{trf.Discrepancy_Value.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          trf.Transfer_Status === 'Delivered Reconciled' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {trf.Transfer_Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leakage Waterfall comparison */}
        <div className="pt-2">
          <h4 className="font-bold text-slate-800 text-xs mb-2">Stage-by-Stage Operational Leakage Comparison</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageLossData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-10} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Confirmed Loss']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="loss" fill="#7c3aed" radius={[4, 4, 0, 0]}>
                  {stageLossData.map((entry, idx) => (
                    <Cell key={idx} fill={activeStage.includes(entry.name) ? '#ec4899' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
