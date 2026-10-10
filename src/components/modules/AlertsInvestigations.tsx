import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  UserCheck,
  ChevronRight,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useGlobalFilter } from '../../context/GlobalFilterContext';
import { AlertItem, AlertSeverity, AlertStatus } from '../../types';

export const AlertsInvestigations: React.FC = () => {
  const { dataPackage, updateAlertStatus, setActiveTab } = useGlobalFilter();
  const { alerts } = dataPackage;

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(alerts[0] || null);
  const [investigationNotes, setInvestigationNotes] = useState<string>('');
  const [savedMsg, setSavedMsg] = useState(false);

  const statuses: AlertStatus[] = [
    'New',
    'Assigned',
    'Investigating',
    'RCA Completed',
    'Corrective Action',
    'Validated',
    'Closed',
  ];

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'ALL' && a.Severity !== severityFilter) return false;
    if (statusFilter !== 'ALL' && a.Status !== statusFilter) return false;
    return true;
  });

  const handleStatusChange = (alertId: string, newStatus: AlertStatus) => {
    updateAlertStatus(alertId, newStatus, investigationNotes || undefined);
    if (selectedAlert && selectedAlert.Alert_ID === alertId) {
      setSelectedAlert({ ...selectedAlert, Status: newStatus });
    }
  };

  const handleSaveNotes = () => {
    if (selectedAlert) {
      updateAlertStatus(selectedAlert.Alert_ID, selectedAlert.Status, investigationNotes);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-purple-700" size={18} />
            <h2 className="font-bold text-slate-800 text-base">Alerts & Loss Investigation Center</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active exception alerts, automated loss threshold breaches, and end-to-end investigation workflows
          </p>
        </div>

        {/* Severity filter chips */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setSeverityFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-semibold border ${
              severityFilter === 'ALL' ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-white border-slate-300'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setSeverityFilter('Critical')}
            className={`px-2.5 py-1 rounded-lg font-semibold border ${
              severityFilter === 'Critical' ? 'bg-rose-100 border-rose-300 text-rose-800' : 'bg-white border-slate-300 text-rose-600'
            }`}
          >
            Critical ({alerts.filter((a) => a.Severity === 'Critical').length})
          </button>
          <button
            onClick={() => setSeverityFilter('High')}
            className={`px-2.5 py-1 rounded-lg font-semibold border ${
              severityFilter === 'High' ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-300 text-amber-600'
            }`}
          >
            High ({alerts.filter((a) => a.Severity === 'High').length})
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout: Alert List on Left, Active Investigation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Alert Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700">Active Alert Queue ({filteredAlerts.length})</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-2 py-1 font-medium"
            >
              <option value="ALL">All Statuses</option>
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredAlerts.map((a) => {
              const isSelected = selectedAlert?.Alert_ID === a.Alert_ID;
              const isCritical = a.Severity === 'Critical';
              return (
                <div
                  key={a.Alert_ID}
                  onClick={() => {
                    setSelectedAlert(a);
                    setInvestigationNotes(a.Investigation_Notes || '');
                  }}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/50 shadow-md ring-2 ring-purple-300/60'
                      : 'bg-white border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-600 text-white'
                          : a.Severity === 'High'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {a.Severity} • {a.Alert_ID}
                    </span>
                    <span className="font-extrabold text-slate-900 text-xs">
                      ₹{a.Financial_Exposure.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 mb-1">{a.Alert_Type}</h4>
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">{a.Reason}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    <span>Facility: {a.Hub_ID}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                        a.Status === 'Closed' ? 'bg-slate-100 text-slate-600' : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {a.Status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Investigation Workflow Card */}
        <div className="lg:col-span-7">
          {selectedAlert ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-900 text-purple-200">
                      {selectedAlert.Alert_ID}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                      {selectedAlert.Process_Stage} Stage
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                      {selectedAlert.Severity} Severity
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{selectedAlert.Alert_Type}</h3>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">Financial Exposure</span>
                  <span className="text-lg font-black text-rose-600">
                    ₹{selectedAlert.Financial_Exposure.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Problem Description */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium block text-[11px] mb-1">Alert Trigger Reason:</span>
                <p className="text-slate-800 leading-relaxed">{selectedAlert.Reason}</p>
              </div>

              {/* Case Metadata */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Mother Hub</span>
                  <span className="font-bold text-slate-800">{selectedAlert.Hub_ID}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Assigned Owner</span>
                  <span className="font-bold text-slate-800 truncate block">{selectedAlert.Assigned_Owner}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">SLA Target Date</span>
                  <span className="font-bold text-slate-800">{selectedAlert.Due_Date}</span>
                </div>
              </div>

              {/* Workflow Stepper */}
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2">Investigation Lifecycle Progress</span>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-[11px]">
                  {statuses.map((stg) => {
                    const isCurrent = selectedAlert.Status === stg;
                    return (
                      <button
                        key={stg}
                        onClick={() => handleStatusChange(selectedAlert.Alert_ID, stg)}
                        className={`p-2 rounded-lg font-bold text-center border transition-all ${
                          isCurrent
                            ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-purple-50'
                        }`}
                      >
                        {stg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Investigation Notes & Evidence Log */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Auditor & RCA Investigation Findings</span>
                  {savedMsg && <span className="text-emerald-600 text-[11px] font-bold">Notes saved!</span>}
                </label>
                <textarea
                  rows={4}
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                  placeholder="Record video surveillance findings, shift supervisor interview notes, and corrective actions taken..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-hidden text-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setActiveTab('loss-breakdown-rca')}
                  className="text-xs text-purple-700 hover:underline font-semibold"
                >
                  Jump to 5-Whys RCA Panel →
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedAlert.Alert_ID, 'Closed')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs"
                  >
                    Mark Case Closed
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs shadow-xs"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              Select an alert from the queue to start or review investigation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
