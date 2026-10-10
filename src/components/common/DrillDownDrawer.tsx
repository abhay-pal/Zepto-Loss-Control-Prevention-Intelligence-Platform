import React from 'react';
import { X, Package, AlertCircle, ArrowRight, ShieldAlert, Layers } from 'lucide-react';
import { useGlobalFilter } from '../../context/GlobalFilterContext';

export const DrillDownDrawer: React.FC = () => {
  const { selectedSKU, setSelectedSKU, dataPackage, setSelectedLossEvent } = useGlobalFilter();

  if (!selectedSKU) return null;

  // Filter events for this SKU
  const skuEvents = dataPackage.lossEvents.filter((e) => e.SKU_ID === selectedSKU.SKU_ID);
  const totalGross = skuEvents.reduce((s, e) => s + e.Gross_Loss_Value, 0);
  const totalRecovery = skuEvents.reduce((s, e) => s + e.Realized_Recovery, 0);
  const totalNet = totalGross - totalRecovery;
  const totalUnits = skuEvents.reduce((s, e) => s + e.Quantity_Lost, 0);

  // Snapshot
  const snapshots = dataPackage.inventorySnapshots.filter((s) => s.SKU_ID === selectedSKU.SKU_ID);
  const totalStock = snapshots.reduce((s, snap) => s + snap.Closing_Book_Qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-purple-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-800 text-purple-200">
              <Package size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300">
                  {selectedSKU.SKU_ID}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-800 text-purple-200 font-semibold">
                  {selectedSKU.Category}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white mt-0.5">{selectedSKU.SKU_Name}</h2>
            </div>
          </div>
          <button
            onClick={() => setSelectedSKU(null)}
            className="p-1.5 rounded-lg hover:bg-purple-800 text-purple-200 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Unit Cost (WAC)</span>
              <span className="font-bold text-slate-800">₹{selectedSKU.Cost_Price}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Selling Price</span>
              <span className="font-bold text-slate-800">₹{selectedSKU.Selling_Price}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Storage Protocol</span>
              <span className="font-bold text-slate-800">{selectedSKU.Storage_Type}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Shelf Life</span>
              <span className="font-bold text-slate-800">{selectedSKU.Shelf_Life_Days} Days</span>
            </div>
          </div>

          {/* Financial Loss Aggregation for SKU */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs">
              <span className="text-rose-700 font-medium block text-[11px]">Gross Loss</span>
              <span className="text-sm font-extrabold text-rose-900">₹{totalGross.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <span className="text-emerald-700 font-medium block text-[11px]">Recovery</span>
              <span className="text-sm font-extrabold text-emerald-900">₹{totalRecovery.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs">
              <span className="text-purple-700 font-medium block text-[11px]">Net Loss</span>
              <span className="text-sm font-extrabold text-purple-900">₹{totalNet.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
              <span className="text-amber-700 font-medium block text-[11px]">Units Lost</span>
              <span className="text-sm font-extrabold text-amber-900">{totalUnits} {selectedSKU.UoM}</span>
            </div>
          </div>

          {/* Inventory across Hubs */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers size={14} className="text-slate-500" />
              <span>Current Stock Snapshot Across Hubs (Total: {totalStock.toLocaleString()} units)</span>
            </div>
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-xs">
              {snapshots.slice(0, 8).map((snap, idx) => (
                <div key={idx} className="px-3 py-2 flex items-center justify-between hover:bg-slate-50">
                  <span className="font-semibold text-slate-700">{snap.Hub_ID}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500">Book: {snap.Closing_Book_Qty}</span>
                    <span className="font-bold text-slate-900">₹{snap.Total_Inventory_Value.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident History Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle size={14} className="text-rose-500" />
                <span>Confirmed Loss Incidents ({skuEvents.length} recorded)</span>
              </div>
              <span className="text-[10px] text-slate-500">Click to view Root Cause</span>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
              {skuEvents.length === 0 ? (
                <div className="p-4 text-center text-slate-400">No loss incidents recorded for this SKU.</div>
              ) : (
                skuEvents.map((evt) => (
                  <button
                    key={evt.Loss_Event_ID}
                    onClick={() => setSelectedLossEvent(evt)}
                    className="w-full text-left px-3 py-2.5 hover:bg-purple-50/60 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-700">{evt.Loss_Event_ID}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{evt.Occurrence_Date}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-medium text-slate-700">{evt.Hub_ID}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{evt.Loss_Type} ({evt.Process_Stage})</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <div className="font-bold text-slate-800">₹{evt.Gross_Loss_Value.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-slate-400">{evt.Quantity_Lost} lost</div>
                      </div>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Vel. Class: {selectedSKU.Velocity_Class} • Risk: {selectedSKU.High_Risk_Flag ? 'HIGH RISK' : 'Standard'}
          </span>
          <button
            onClick={() => setSelectedSKU(null)}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-semibold text-slate-700"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
