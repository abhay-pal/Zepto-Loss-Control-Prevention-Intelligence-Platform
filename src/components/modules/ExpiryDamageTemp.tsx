import React, { useState } from 'react';
import {
  ThermometerSnowflake,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Flame,
  CheckCircle,
  PackageX,
  Search,
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

export const ExpiryDamageTemp: React.FC = () => {
  const { dataPackage, computedStats, setSelectedSKU } = useGlobalFilter();
  const { damageExpiry, temperatureLogs } = dataPackage;

  const [activeTab, setActiveTab] = useState<'expiry' | 'damage' | 'temp'>('expiry');

  // Compute Expiry metrics
  const expiredItems = damageExpiry.filter((d) => d.Incident_Type === 'Expiry');
  const nearExpiryItems = damageExpiry.filter((d) => d.Incident_Type === 'Near Expiry At Risk');
  const expiredVal = expiredItems.reduce((s, d) => s + d.Loss_Value, 0);
  const nearExpiryVal = nearExpiryItems.reduce((s, d) => s + d.Loss_Value, 0);

  // Expiry Risk Buckets
  const risk1Day = nearExpiryItems.filter((d) => d.Days_Remaining_Shelf_Life <= 1).reduce((s, d) => s + d.Loss_Value, 0);
  const risk3Day = nearExpiryItems.filter((d) => d.Days_Remaining_Shelf_Life <= 3).reduce((s, d) => s + d.Loss_Value, 0);
  const risk7Day = nearExpiryItems.filter((d) => d.Days_Remaining_Shelf_Life <= 7).reduce((s, d) => s + d.Loss_Value, 0);

  // Damage Reason Breakdown
  const damageReasonMap: Record<string, number> = {};
  damageExpiry.forEach((d) => {
    damageReasonMap[d.Sub_Reason] = (damageReasonMap[d.Sub_Reason] || 0) + d.Loss_Value;
  });

  const damagePareto = Object.entries(damageReasonMap)
    .map(([reason, val]) => ({
      reason,
      value: val,
    }))
    .sort((a, b) => b.value - a.value);

  // Cold Chain Excursion logs
  const excursions = temperatureLogs.filter((t) => t.Excursion_Flag);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <ThermometerSnowflake className="text-purple-700" size={18} />
            <h2 className="font-bold text-slate-800 text-base">Expiry, Damage & Cold-Chain Temperature Intelligence</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Perishable shelf-life monitoring, FEFO adherence, physical damage classification, and IoT cold-room temperature telemetry
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('expiry')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'expiry' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expiry & FEFO Risk
          </button>
          <button
            onClick={() => setActiveTab('damage')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'damage' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Physical Damage
          </button>
          <button
            onClick={() => setActiveTab('temp')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'temp' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Temperature Telemetry ({excursions.length})
          </button>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-white rounded-xl border border-rose-200 bg-rose-50/40 text-xs">
          <span className="text-rose-700 font-medium block text-[11px]">Expired Write-Offs</span>
          <span className="text-base font-black text-rose-900">₹{(expiredVal / 1000).toFixed(1)}k</span>
          <span className="text-[10px] text-rose-600 block mt-0.5">Realized Financial Loss</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-amber-200 bg-amber-50/40 text-xs">
          <span className="text-amber-700 font-medium block text-[11px]">Near-Expiry at Risk</span>
          <span className="text-base font-black text-amber-900">₹{(nearExpiryVal / 1000).toFixed(1)}k</span>
          <span className="text-[10px] text-amber-600 block mt-0.5">Forecast Exposure</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium block text-[11px]">1-Day Expiry Exposure</span>
          <span className="text-base font-black text-rose-700">₹{(risk1Day / 1000).toFixed(1)}k</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Immediate Clearance</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium block text-[11px]">3-Day Expiry Exposure</span>
          <span className="text-base font-black text-amber-700">₹{(risk3Day / 1000).toFixed(1)}k</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Markdown Trigger</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium block text-[11px]">FEFO Compliance %</span>
          <span className="text-base font-black text-emerald-700">97.8%</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">First-Expiry Adherence</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-purple-200 bg-purple-50/40 text-xs">
          <span className="text-purple-700 font-medium block text-[11px]">Cold Chain Breaches</span>
          <span className="text-base font-black text-purple-900">{excursions.length} Incidents</span>
          <span className="text-[10px] text-purple-600 block mt-0.5">Anteroom Alarms</span>
        </div>
      </div>

      {/* Visualizations: Damage Reasons Pareto & Near Expiry Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Damage Pareto */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Physical Damage Root Cause Pareto</h3>
              <p className="text-[11px] text-slate-500">Carton drop, forklift impact, packaging burst, and FEFO misses</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={damagePareto} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="reason" type="category" tick={{ fontSize: 9, fill: '#475569' }} width={130} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Damage Loss']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cold Chain Excursion Telemetry */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Cold Chain IoT Temperature Exceptions</h3>
              <p className="text-[11px] text-slate-500">Chilled (2-8°C) and Frozen (-18°C) chamber breaches</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
              Sensor Alerts
            </span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {excursions.map((log) => (
              <div
                key={log.Log_ID}
                className="p-3 rounded-xl border border-rose-200 bg-rose-50/60 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-700">{log.Hub_ID}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-medium text-slate-600">{log.Timestamp}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[10px] font-semibold text-slate-500">{log.Zone_ID}</span>
                  </div>
                  <p className="text-slate-700 font-medium mt-1">
                    Temperature reached <strong className="text-rose-800">{log.Recorded_Temp_C}°C</strong> (Max limit: {log.Max_Threshold_C}°C) for {log.Excursion_Duration_Mins} mins.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Action: {log.Action_Taken}</p>
                </div>
                <span className="px-2 py-1 bg-rose-600 text-white font-bold rounded text-[10px] uppercase flex-shrink-0">
                  Breach
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Near Expiry & Damage Incident Registry */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Near-Expiry & Damage Registry</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live batch numbers, days of shelf life remaining, and salvage liquidation actions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2.5 px-3">Incident ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Hub ID</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Root Cause</th>
                <th className="py-2.5 px-3">Batch #</th>
                <th className="py-2.5 px-3 text-right">Days Left</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Loss Value</th>
                <th className="py-2.5 px-3">Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {damageExpiry.slice(0, 40).map((item) => (
                <tr key={item.Incident_ID} className="hover:bg-purple-50/40">
                  <td className="py-2 px-3 font-mono font-bold text-purple-700">{item.Incident_ID}</td>
                  <td className="py-2 px-3 text-slate-500">{item.Date}</td>
                  <td className="py-2 px-3 font-medium text-slate-800">{item.Hub_ID}</td>
                  <td
                    className="py-2 px-3 font-medium text-slate-900 hover:text-purple-700 cursor-pointer"
                    onClick={() => {
                      const sku = dataPackage.skus.find((s) => s.SKU_ID === item.SKU_ID);
                      if (sku) setSelectedSKU(sku);
                    }}
                  >
                    {item.SKU_Name || item.SKU_ID}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.Incident_Type === 'Expiry'
                          ? 'bg-rose-100 text-rose-800'
                          : item.Incident_Type === 'Physical Damage'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.Incident_Type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-600">{item.Sub_Reason}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{item.Batch_Number}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-800">{item.Days_Remaining_Shelf_Life}d</td>
                  <td className="py-2 px-3 text-right font-medium">{item.Quantity}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                    ₹{item.Loss_Value.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {item.Action_Taken}
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
