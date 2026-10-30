import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  Wrench, 
  Gauge, 
  Filter,
  CheckCircle
} from 'lucide-react';

const SEVERITY_CONFIG = {
  Critical: {
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    bar: 'bg-rose-500',
    icon: ShieldAlert,
    label: 'Critical Concern'
  },
  High: {
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    bar: 'bg-amber-500',
    icon: AlertTriangle,
    label: 'High Severity'
  },
  Medium: {
    badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    bar: 'bg-yellow-400',
    icon: Info,
    label: 'Moderate Deviation'
  },
  Low: {
    badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    bar: 'bg-sky-500',
    icon: CheckCircle2,
    label: 'Minor Advisory'
  }
};

export default function AnomalyList({ anomalies = [] }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = anomalies.filter((item) => {
    const matchesFilter = filterSeverity === 'ALL' || item.severity === filterSeverity;
    const matchesSearch =
      searchQuery === '' ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.action_required.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Filters and Search toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5" /> Severity Filter:
          </span>
          {['ALL', 'Critical', 'High', 'Medium', 'Low'].map((sev) => {
            const count = sev === 'ALL' ? anomalies.length : anomalies.filter(a => a.severity === sev).length;
            return (
              <button
                key={sev}
                type="button"
                onClick={() => setFilterSeverity(sev)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterSeverity === sev
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sev} ({count})
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter findings..."
          className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 w-full sm:w-48"
        />
      </div>

      {/* Anomaly Cards List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-200 mb-1">
            {anomalies.length === 0 ? 'No Anomalies Detected' : 'No Results Match Filter'}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {anomalies.length === 0
              ? 'The visual input adheres to nominal tolerances and standard operational guidelines.'
              : 'Try adjusting your severity filter or search keywords to view other findings.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, index) => {
            const config = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.Medium;
            const Icon = config.icon;
            const confidencePercent = Math.round((parseFloat(item.confidence_score) || 0) * 100);

            return (
              <div
                key={item.id || index}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-md group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  {/* Title & Badge */}
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${config.badge}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {item.label}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Severity Badge & Confidence Score */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${config.badge}`}
                    >
                      {item.severity}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Gauge className="w-3.5 h-3.5 text-sky-400" />
                      <span>{confidencePercent}% Confidence</span>
                    </div>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${config.bar}`}
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>

                {/* Actionable Human Directive */}
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5 text-xs">
                  <Wrench className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-sky-300 mr-1">Recommended Action:</span>
                    <span className="text-slate-300">{item.action_required}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

