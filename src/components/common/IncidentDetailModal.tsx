import React, { useState } from 'react';
import { X, GitCommit, CheckCircle, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';
import { useGlobalFilter } from '../../context/GlobalFilterContext';

export const IncidentDetailModal: React.FC = () => {
  const { selectedLossEvent, setSelectedLossEvent, dataPackage, updateRCARecord } = useGlobalFilter();

  if (!selectedLossEvent) return null;

  // Find linked RCA record if exists
  const rca = dataPackage.rcaRecords.find(
    (r) => r.Loss_Event_ID === selectedLossEvent.Loss_Event_ID || r.RCA_ID === selectedLossEvent.Investigation_ID
  );

  const [editStatus, setEditStatus] = useState<any>(rca?.Status || 'In Progress');
  const [correctiveAction, setCorrectiveAction] = useState(
    rca?.Corrective_Action || 'Implement 2-stage scanning validation during outbound pallet dispatch.'
  );
  const [preventativeAction, setPreventativeAction] = useState(
    rca?.Preventative_Action || 'Configure automatic weight sensor discrepancy threshold in WMS.'
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (rca) {
      updateRCARecord(rca.RCA_ID, {
        Status: editStatus,
        Corrective_Action: correctiveAction,
        Preventative_Action: preventativeAction,
      });
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300">
              <GitCommit size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-900 text-purple-200">
                  {selectedLossEvent.Loss_Event_ID}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {selectedLossEvent.Process_Stage} Stage
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                {selectedLossEvent.Loss_Type}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setSelectedLossEvent(null)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Key Facts Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Facility</span>
              <span className="font-bold text-slate-800">{selectedLossEvent.Hub_ID}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Date</span>
              <span className="font-bold text-slate-800">{selectedLossEvent.Occurrence_Date}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Shift</span>
              <span className="font-bold text-slate-800">{selectedLossEvent.Shift_ID.split(' ')[0]}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Discovered By</span>
              <span className="font-bold text-slate-800 truncate block">{selectedLossEvent.Discovered_By.split(' ')[0]}</span>
            </div>
          </div>

          {/* Financial Loss Reconciliation */}
          <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Financial Loss & Recovery Breakdown</span>
              <span className="text-[11px] text-purple-700 font-semibold">Event Costing</span>
            </h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Gross Loss</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  ₹{selectedLossEvent.Gross_Loss_Value.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Recoverable</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  ₹{selectedLossEvent.Recoverable_Amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Realized Recovery</span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  ₹{selectedLossEvent.Realized_Recovery.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 text-[10px] block">Net Loss</span>
                <span className="font-extrabold text-purple-900 text-sm">
                  ₹{selectedLossEvent.Net_Loss_Value.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Root Cause Details */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-500" />
              <span>Root Cause Analysis ({selectedLossEvent.Root_Cause_Code})</span>
            </h4>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {selectedLossEvent.Root_Cause_Description}
            </p>
          </div>

          {/* 5-Whys Summary */}
          {rca && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <h4 className="font-bold text-slate-800 mb-1.5">5-Whys Diagnostic Chain</h4>
              <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-mono text-[11px]">
                {rca.Five_Whys_Summary}
              </p>
            </div>
          )}

          {/* Action Formulation */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 block">Corrective Action Plan</label>
            <textarea
              rows={2}
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-800 block">Preventative Action (Poka-Yoke / Controls)</label>
            <textarea
              rows={2}
              value={preventativeAction}
              onChange={(e) => setPreventativeAction(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden text-slate-800"
            />
          </div>

          {/* Investigation Status selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Investigation Status:</span>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="bg-white border border-slate-300 font-semibold rounded px-2.5 py-1 text-slate-800 text-xs"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Corrective Action Planned">Corrective Action Planned</option>
                <option value="Validated & Closed">Validated & Closed</option>
              </select>
            </div>
            {isSaved && (
              <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                <CheckCircle size={14} /> Changes saved
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">
            Owner: {selectedLossEvent.Discovered_By}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLossEvent(null)}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Save RCA Updates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
