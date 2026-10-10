import React from 'react';
import { X, AlertTriangle, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { useGlobalFilter } from '../../context/GlobalFilterContext';

export const NotificationDrawer: React.FC = () => {
  const { isNotificationOpen, setIsNotificationOpen, dataPackage, updateAlertStatus, setActiveTab } =
    useGlobalFilter();

  if (!isNotificationOpen) return null;

  const alerts = dataPackage.alerts;
  const unreadCount = alerts.filter((a) => a.Status !== 'Closed').length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-purple-950 text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-400" size={18} />
            <div>
              <h3 className="font-bold text-sm">Operational Loss Alerts</h3>
              <p className="text-[11px] text-purple-200">
                {unreadCount} active cases requiring investigation
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNotificationOpen(false)}
            className="p-1 rounded hover:bg-purple-900 text-purple-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {alerts.map((alert) => {
            const isCritical = alert.Severity === 'Critical';
            const isHigh = alert.Severity === 'High';
            return (
              <div
                key={alert.Alert_ID}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  alert.Status === 'Closed'
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : isCritical
                    ? 'bg-rose-50/70 border-rose-200 shadow-xs'
                    : isHigh
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-600 text-white'
                        : isHigh
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {alert.Severity} • {alert.Alert_ID}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700">
                    ₹{alert.Financial_Exposure.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="font-semibold text-slate-900 mb-1">{alert.Alert_Type}</div>
                <p className="text-slate-600 mb-2 leading-relaxed">{alert.Reason}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Hub: {alert.Hub_ID}</span>
                  <span>Owner: {alert.Assigned_Owner.split(' ')[0]}</span>
                </div>

                {/* Workflow Actions */}
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Status: {alert.Status}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {alert.Status !== 'Closed' ? (
                      <button
                        onClick={() => updateAlertStatus(alert.Alert_ID, 'Closed', 'Resolved by Senior Manager review')}
                        className="flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold"
                      >
                        <CheckCircle2 size={11} />
                        <span>Close</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => updateAlertStatus(alert.Alert_ID, 'Investigating')}
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-semibold"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              setIsNotificationOpen(false);
              setActiveTab('alerts-investigations');
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Open Alerts & Investigation Center</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
