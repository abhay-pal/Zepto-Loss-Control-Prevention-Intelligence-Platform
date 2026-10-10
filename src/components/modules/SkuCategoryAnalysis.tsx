import React, { useState } from 'react';
import {
  Package,
  Search,
  AlertTriangle,
  Flame,
  ArrowUpDown,
  Filter,
  Eye,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from 'recharts';
import { useGlobalFilter } from '../../context/GlobalFilterContext';
import { SKUMaster } from '../../types';

export const SkuCategoryAnalysis: React.FC = () => {
  const { computedStats, dataPackage, setSelectedSKU, filters, updateFilter } = useGlobalFilter();
  const { skuRanking, categoryBreakdown, filteredLossEvents } = computedStats;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVelocity, setSelectedVelocity] = useState('ALL');
  const [filterHighValue, setFilterHighValue] = useState(false);

  // Filtered SKUs for table
  const skusList = dataPackage.skus.map((sku) => {
    const skuEvents = filteredLossEvents.filter((e) => e.SKU_ID === sku.SKU_ID);
    const grossLoss = skuEvents.reduce((s, e) => s + e.Gross_Loss_Value, 0);
    const netLoss = skuEvents.reduce((s, e) => s + e.Net_Loss_Value, 0);
    const unitsLost = skuEvents.reduce((s, e) => s + e.Quantity_Lost, 0);
    const incidentCount = skuEvents.length;
    const handledUnits = 12000;
    const lossPer1k = parseFloat(((unitsLost / handledUnits) * 1000).toFixed(2));

    return {
      ...sku,
      grossLoss,
      netLoss,
      unitsLost,
      incidentCount,
      lossPer1k,
    };
  });

  const filteredSKUs = skusList.filter((sku) => {
    if (selectedVelocity !== 'ALL' && sku.Velocity_Class !== selectedVelocity) return false;
    if (filterHighValue && !sku.High_Value_Flag) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      if (!sku.SKU_ID.toLowerCase().includes(q) && !sku.SKU_Name.toLowerCase().includes(q) && !sku.Category.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => b.grossLoss - a.grossLoss);

  // Scatter plot data: Loss vs Throughput / Price
  const scatterData = skusList.slice(0, 30).map((sku) => ({
    name: sku.SKU_Name,
    skuId: sku.SKU_ID,
    costPrice: sku.Cost_Price,
    grossLoss: sku.grossLoss,
    unitsLost: sku.unitsLost,
    category: sku.Category,
  }));

  // Pareto for top 15 SKUs
  let cumSum = 0;
  const top15 = skuRanking.slice(0, 15);
  const totalTop15Loss = top15.reduce((s, item) => s + item.grossLoss, 0) || 1;
  const skuPareto = top15.map((item) => {
    cumSum += item.grossLoss;
    return {
      name: item.skuId,
      fullName: item.skuName,
      loss: item.grossLoss,
      cumPct: parseFloat(((cumSum / totalTop15Loss) * 100).toFixed(1)),
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Package className="text-purple-700" size={18} />
            <h2 className="font-bold text-slate-800 text-base">SKU & Category Loss Intelligence</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Granular product-level financial erosion, velocity classification, loss per 1,000 units, and SKU Pareto
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden text-slate-800"
            />
          </div>
          <button
            onClick={() => setFilterHighValue(!filterHighValue)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filterHighValue ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            High Value Only
          </button>
        </div>
      </div>

      {/* Visualizations: SKU Pareto & Loss vs Unit Cost Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SKU Pareto Chart */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Top 15 SKU Loss Pareto Curve</h3>
              <p className="text-[11px] text-slate-500">Gross loss & cumulative contribution %</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              Pareto 80/20 Target
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={skuPareto} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-25} textAnchor="end" />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(v: any, name: any) => [name === 'Cumulative %' ? `${v}%` : `₹${Number(v).toLocaleString('en-IN')}`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar yAxisId="left" dataKey="loss" name="Gross Loss" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cumPct" name="Cumulative %" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Risk Matrix: Unit Cost vs Total Loss */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Product Risk Matrix (Cost vs Loss)</h3>
              <p className="text-[11px] text-slate-500">Unit Cost (X-Axis) vs Cumulative Loss Value (Y-Axis)</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="costPrice" name="Unit Cost" unit="₹" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis type="number" dataKey="grossLoss" name="Gross Loss" unit="₹" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-slate-900 text-white rounded-lg text-xs space-y-1">
                          <p className="font-bold text-purple-300">{data.name}</p>
                          <p className="text-slate-300">Unit Cost: ₹{data.costPrice}</p>
                          <p className="text-slate-300">Total Loss: ₹{data.grossLoss.toLocaleString('en-IN')}</p>
                          <p className="text-slate-300">Units Lost: {data.unitsLost}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="SKUs" data={scatterData} fill="#ec4899" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SKU Master Analysis Table with Drawer Trigger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">SKU Level Loss & Risk Register</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any SKU row to open the full inventory movement & incident drill-down drawer
            </p>
          </div>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            {filteredSKUs.length} SKUs Listed
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2.5 px-3">SKU ID</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Storage</th>
                <th className="py-2.5 px-3 text-right">Cost Price</th>
                <th className="py-2.5 px-3 text-right">Units Lost</th>
                <th className="py-2.5 px-3 text-right">Loss / 1k Units</th>
                <th className="py-2.5 px-3 text-right">Gross Loss</th>
                <th className="py-2.5 px-3 text-right">Net Loss</th>
                <th className="py-2.5 px-3 text-center">Class</th>
                <th className="py-2.5 px-3 text-center">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSKUs.map((sku) => (
                <tr
                  key={sku.SKU_ID}
                  onClick={() => setSelectedSKU(sku)}
                  className="hover:bg-purple-50/50 cursor-pointer transition-colors group"
                >
                  <td className="py-2 px-3 font-mono font-bold text-purple-700 group-hover:underline">
                    {sku.SKU_ID}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900">{sku.SKU_Name}</td>
                  <td className="py-2 px-3 text-slate-600">{sku.Category}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        sku.Storage_Type.includes('Chilled')
                          ? 'bg-blue-50 text-blue-700'
                          : sku.Storage_Type.includes('Frozen')
                          ? 'bg-cyan-50 text-cyan-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sku.Storage_Type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-medium">₹{sku.Cost_Price}</td>
                  <td className="py-2 px-3 text-right font-semibold">{sku.unitsLost}</td>
                  <td className="py-2 px-3 text-right font-mono text-purple-700 font-bold">{sku.lossPer1k}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                    ₹{sku.grossLoss.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-purple-800">
                    ₹{sku.netLoss.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3 text-center font-bold">{sku.Velocity_Class}</td>
                  <td className="py-2 px-3 text-center">
                    {sku.High_Risk_Flag ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        HIGH
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Normal</span>
                    )}
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
