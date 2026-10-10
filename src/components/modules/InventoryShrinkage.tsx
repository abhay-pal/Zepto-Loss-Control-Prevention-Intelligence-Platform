import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  Search,
  Filter,
  Eye,
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
} from 'recharts';
import { useGlobalFilter } from '../../context/GlobalFilterContext';

export const InventoryShrinkage: React.FC = () => {
  const { computedStats, dataPackage, setSelectedSKU } = useGlobalFilter();
  const { filteredCycleCounts } = computedStats;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');

  // Compute Shrinkage KPIs
  let totalBookQty = 0;
  let totalPhysQty = 0;
  let negVarQty = 0;
  let posVarQty = 0;
  let confirmedShrinkageVal = 0;
  let pendingRecountCount = 0;

  filteredCycleCounts.forEach((c) => {
    totalBookQty += c.Book_Quantity;
    totalPhysQty += c.Physical_Quantity;
    if (c.Variance_Quantity < 0) {
      negVarQty += Math.abs(c.Variance_Quantity);
      confirmedShrinkageVal += c.Variance_Value;
    } else if (c.Variance_Quantity > 0) {
      posVarQty += c.Variance_Quantity;
    }
    if (c.Recount_Status === 'Pending Recount') pendingRecountCount++;
  });

  const accuracyPct = totalBookQty > 0 ? Math.max(90, Math.min(99.9, 100 - (negVarQty / totalBookQty) * 100)) : 98.8;
  const cycleCountCompliance = 96.4; // 96.4% completed schedule

  // Zone Breakdown
  const zoneMap: Record<string, { book: number; phys: number; varianceVal: number }> = {};
  filteredCycleCounts.forEach((c) => {
    const z = c.Zone_ID;
    if (!zoneMap[z]) zoneMap[z] = { book: 0, phys: 0, varianceVal: 0 };
    zoneMap[z].book += c.Book_Quantity;
    zoneMap[z].phys += c.Physical_Quantity;
    if (c.Variance_Quantity < 0) zoneMap[z].varianceVal += c.Variance_Value;
  });

  const zoneChartData = Object.entries(zoneMap).map(([zone, val]) => ({
    zone,
    book: val.book,
    physical: val.phys,
    shrinkageVal: val.varianceVal,
  }));

  // Top Shrinkage SKUs
  const skuShrinkMap: Record<string, { name: string; qty: number; value: number }> = {};
  filteredCycleCounts.forEach((c) => {
    if (c.Variance_Quantity < 0) {
      if (!skuShrinkMap[c.SKU_ID]) {
        skuShrinkMap[c.SKU_ID] = { name: c.SKU_Name || c.SKU_ID, qty: 0, value: 0 };
      }
      skuShrinkMap[c.SKU_ID].qty += Math.abs(c.Variance_Quantity);
      skuShrinkMap[c.SKU_ID].value += c.Variance_Value;
    }
  });

  const topShrinkageSkus = Object.entries(skuShrinkMap)
    .map(([skuId, val]) => ({
      skuId,
      name: val.name.length > 20 ? val.name.slice(0, 18) + '...' : val.name,
      fullName: val.name,
      qty: val.qty,
      value: val.value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Filtered Table Records
  const tableRecords = filteredCycleCounts.filter((c) => {
    if (selectedZone !== 'ALL' && c.Zone_ID !== selectedZone) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const sId = c.SKU_ID.toLowerCase();
      const sNm = (c.SKU_Name || '').toLowerCase();
      const cId = c.Count_ID.toLowerCase();
      if (!sId.includes(q) && !sNm.includes(q) && !cId.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="text-purple-700" size={18} />
            <h2 className="font-bold text-slate-800 text-base">Inventory Accuracy & Shrinkage Intelligence</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical cycle counts, book-to-physical variance reconciliations, and unaccounted stock shrinkage
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
            <CheckCircle2 size={13} />
            Accuracy: {accuracyPct.toFixed(2)}%
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
            Compliance: {cycleCountCompliance}%
          </span>
        </div>
      </div>

      {/* 8 Shrinkage KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">Book Stock</span>
          <span className="text-base font-black text-slate-900">{totalBookQty.toLocaleString()}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">Physical Count</span>
          <span className="text-base font-black text-slate-900">{totalPhysQty.toLocaleString()}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-rose-200 bg-rose-50/40 shadow-2xs">
          <span className="text-[11px] text-rose-700 font-medium block">Negative Variance</span>
          <span className="text-base font-black text-rose-800">-{negVarQty.toLocaleString()} units</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-blue-200 bg-blue-50/40 shadow-2xs">
          <span className="text-[11px] text-blue-700 font-medium block">Positive Found</span>
          <span className="text-base font-black text-blue-800">+{posVarQty.toLocaleString()} units</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-purple-200 bg-purple-50/40 shadow-2xs">
          <span className="text-[11px] text-purple-700 font-medium block">Shrinkage Value</span>
          <span className="text-base font-black text-purple-900">₹{(confirmedShrinkageVal / 1000).toFixed(1)}k</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">Cycle Compliance</span>
          <span className="text-base font-black text-emerald-700">{cycleCountCompliance}%</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-amber-200 bg-amber-50/40 shadow-2xs">
          <span className="text-[11px] text-amber-700 font-medium block">Pending Recounts</span>
          <span className="text-base font-black text-amber-800">{pendingRecountCount}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium block">Repeat Discrepancy</span>
          <span className="text-base font-black text-slate-700">14 SKUs</span>
        </div>
      </div>

      {/* Visualizations: Top Shrinkage SKUs & Zone-wise Variance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 10 Shrinkage SKUs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Top 10 SKUs by Shrinkage Value</h3>
              <p className="text-[11px] text-slate-500">Unexplained negative count variances by product</p>
            </div>
            <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
              High Shrinkage Exposure
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topShrinkageSkus} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#475569' }} width={120} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Shrinkage Loss']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone-wise Stock Variance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Zone-wise Shrinkage Loss</h3>
              <p className="text-[11px] text-slate-500">Cold Room C vs Deep Freeze F vs Ambient Racks</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneChartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="zone" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Shrinkage Value']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="shrinkageVal" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cycle Count Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Cycle Count & Physical Audit Register</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed audit trail showing Book vs Physical Stock, Recount Status, and Auditor Sign-Off
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Count ID / SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden text-slate-800"
              />
            </div>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium"
            >
              <option value="ALL">All Storage Zones</option>
              {Object.keys(zoneMap).map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2.5 px-3">Count ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Hub ID</th>
                <th className="py-2.5 px-3">Storage Zone</th>
                <th className="py-2.5 px-3">SKU ID</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-right">Book Qty</th>
                <th className="py-2.5 px-3 text-right">Physical Qty</th>
                <th className="py-2.5 px-3 text-right">Variance Qty</th>
                <th className="py-2.5 px-3 text-right">Variance Value</th>
                <th className="py-2.5 px-3">Auditor</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tableRecords.slice(0, 50).map((c) => (
                <tr key={c.Count_ID} className="hover:bg-purple-50/40 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-purple-700">{c.Count_ID}</td>
                  <td className="py-2 px-3 text-slate-500">{c.Count_Date}</td>
                  <td className="py-2 px-3 font-medium text-slate-800">{c.Hub_ID}</td>
                  <td className="py-2 px-3">{c.Zone_ID}</td>
                  <td
                    className="py-2 px-3 font-mono text-purple-600 font-bold hover:underline cursor-pointer"
                    onClick={() => {
                      const sku = dataPackage.skus.find((s) => s.SKU_ID === c.SKU_ID);
                      if (sku) setSelectedSKU(sku);
                    }}
                  >
                    {c.SKU_ID}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900 truncate max-w-[160px]" title={c.SKU_Name}>
                    {c.SKU_Name || c.SKU_ID}
                  </td>
                  <td className="py-2 px-3 text-right font-medium">{c.Book_Quantity}</td>
                  <td className="py-2 px-3 text-right font-medium">{c.Physical_Quantity}</td>
                  <td
                    className={`py-2 px-3 text-right font-bold ${
                      c.Variance_Quantity < 0 ? 'text-rose-600' : c.Variance_Quantity > 0 ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  >
                    {c.Variance_Quantity > 0 ? `+${c.Variance_Quantity}` : c.Variance_Quantity}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                    ₹{c.Variance_Value.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3 text-slate-500 truncate max-w-[100px]">{c.Auditor_ID}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.Recount_Status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : c.Recount_Status === 'Pending Recount'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {c.Recount_Status}
                    </span>
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
