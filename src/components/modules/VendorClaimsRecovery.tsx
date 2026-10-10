import React, { useState } from 'react';
import {
  HandCoins,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Building,
  Filter,
  ArrowRight,
  TrendingUp,
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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

export const VendorClaimsRecovery: React.FC = () => {
  const { dataPackage, computedStats } = useGlobalFilter();
  const { vendorClaims, recoveries } = dataPackage;

  const [selectedVendor, setSelectedVendor] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Compute Totals
  let totalClaimed = 0;
  let totalApproved = 0;
  let totalRejected = 0;
  let totalRealized = 0;
  let totalPending = 0;

  vendorClaims.forEach((c) => {
    totalClaimed += c.Claimed_Amount;
    totalApproved += c.Approved_Amount;
    totalRejected += c.Rejected_Amount;
    totalRealized += c.Realized_Recovery;
    totalPending += c.Pending_Recovery;
  });

  const recoveryRate = totalClaimed > 0 ? parseFloat(((totalRealized / totalClaimed) * 100).toFixed(1)) : 0;
  const avgAgeingDays = 12.4;

  // Vendor Scorecard Matrix
  const vendorLossMap: Record<string, { name: string; claimed: number; realized: number; count: number }> = {};
  vendorClaims.forEach((c) => {
    if (!vendorLossMap[c.Vendor_ID]) {
      vendorLossMap[c.Vendor_ID] = { name: c.Vendor_Name || c.Vendor_ID, claimed: 0, realized: 0, count: 0 };
    }
    vendorLossMap[c.Vendor_ID].claimed += c.Claimed_Amount;
    vendorLossMap[c.Vendor_ID].realized += c.Realized_Recovery;
    vendorLossMap[c.Vendor_ID].count += 1;
  });

  const topVendorsChart = Object.entries(vendorLossMap)
    .map(([vId, val]) => ({
      vendorId: vId,
      name: val.name.length > 18 ? val.name.slice(0, 16) + '...' : val.name,
      claimed: val.claimed,
      realized: val.realized,
    }))
    .sort((a, b) => b.claimed - a.claimed)
    .slice(0, 8);

  // Status Distribution
  const statusMap: Record<string, number> = {};
  vendorClaims.forEach((c) => {
    statusMap[c.Claim_Status] = (statusMap[c.Claim_Status] || 0) + 1;
  });

  const statusPie = Object.entries(statusMap).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  // Filtered Claims for Table
  const filteredClaims = vendorClaims.filter((c) => {
    if (selectedVendor !== 'ALL' && c.Vendor_ID !== selectedVendor) return false;
    if (selectedStatus !== 'ALL' && c.Claim_Status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <HandCoins className="text-purple-700" size={18} />
            <h2 className="font-bold text-slate-800 text-base">Vendor Claims & Recovery Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Shortage debit notes, transit insurance settlements, supplier chargebacks, and recovery reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
            Realized: ₹{(totalRealized / 100000).toFixed(2)}L
          </span>
          <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-bold">
            Recovery Rate: {recoveryRate}%
          </span>
        </div>
      </div>

      {/* KPI Ribbon (8 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[11px]">Total Claimed</span>
          <span className="text-base font-black text-slate-900">₹{(totalClaimed / 100000).toFixed(2)}L</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[11px]">Claims Approved</span>
          <span className="text-base font-black text-emerald-700">₹{(totalApproved / 100000).toFixed(2)}L</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-rose-200 bg-rose-50/40 shadow-2xs">
          <span className="text-rose-700 block text-[11px]">Claims Rejected</span>
          <span className="text-base font-black text-rose-800">₹{(totalRejected / 100000).toFixed(2)}L</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs">
          <span className="text-emerald-700 block text-[11px]">Realized Recovery</span>
          <span className="text-base font-black text-emerald-800">₹{(totalRealized / 100000).toFixed(2)}L</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-amber-200 bg-amber-50/40 shadow-2xs">
          <span className="text-amber-700 block text-[11px]">Pending Recovery</span>
          <span className="text-base font-black text-amber-800">₹{(totalPending / 100000).toFixed(2)}L</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-purple-200 bg-purple-50/40 shadow-2xs">
          <span className="text-purple-700 block text-[11px]">Recovery Rate</span>
          <span className="text-base font-black text-purple-900">{recoveryRate}%</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 block text-[11px]">Avg Recovery Time</span>
          <span className="text-base font-black text-slate-800">{avgAgeingDays} Days</span>
        </div>
      </div>

      {/* Visualizations: Top Vendors by Claimed Value & Claim Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Vendors by Claimed vs Realized */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Top Suppliers by Claimed vs Realized Value</h3>
              <p className="text-[11px] text-slate-500">Shortage & damage chargeback reconciliation</p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Claimed
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Realized
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVendorsChart} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#475569' }} width={120} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="claimed" name="Claimed" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="realized" name="Realized" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claim Status Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Claims Lifecycle Status Distribution</h3>
              <p className="text-[11px] text-slate-500">Raised → Under Review → Approved → Debit Note Issued</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {statusPie.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => [`${v} claims`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Claims Management Registry */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Vendor Claims & Debit Notes Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking of debit notes, PO numbers, ageing days, and settlement documentation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700 font-medium"
            >
              <option value="ALL">All Claim Statuses</option>
              {Object.keys(statusMap).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2.5 px-3">Claim ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Supplier Name</th>
                <th className="py-2.5 px-3">Hub ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Claimed ₹</th>
                <th className="py-2.5 px-3 text-right">Approved ₹</th>
                <th className="py-2.5 px-3 text-right">Recovered ₹</th>
                <th className="py-2.5 px-3 text-right">Pending ₹</th>
                <th className="py-2.5 px-3">Ageing</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Debit Note Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredClaims.slice(0, 40).map((c) => (
                <tr key={c.Claim_ID} className="hover:bg-purple-50/40">
                  <td className="py-2 px-3 font-mono font-bold text-purple-700">{c.Claim_ID}</td>
                  <td className="py-2 px-3 text-slate-500">{c.Claim_Date}</td>
                  <td className="py-2 px-3 font-medium text-slate-900 truncate max-w-[170px]" title={c.Vendor_Name}>
                    {c.Vendor_Name}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-800">{c.Hub_ID}</td>
                  <td className="py-2 px-3">{c.Claim_Type}</td>
                  <td className="py-2 px-3 text-right font-medium">₹{c.Claimed_Amount.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 text-right font-medium">₹{c.Approved_Amount.toLocaleString('en-IN')}</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-700">
                    ₹{c.Realized_Recovery.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3 text-right font-semibold text-amber-700">
                    ₹{c.Pending_Recovery.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`font-semibold ${c.Ageing_Days > 14 ? 'text-rose-600' : 'text-slate-600'}`}>
                      {c.Ageing_Days}d
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.Claim_Status === 'Debit Note Issued' || c.Claim_Status === 'Settled'
                          ? 'bg-emerald-50 text-emerald-700'
                          : c.Claim_Status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {c.Claim_Status}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{c.Settlement_Ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
