import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Trash2, 
  AlertOctagon, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ScanHistoryTable({
  scans = [],
  pagination = { page: 1, totalPages: 1 },
  onPageChange,
  onDeleteScan,
  loading
}) {
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const confirmDelete = async () => {
    if (deleteTargetId && onDeleteScan) {
      await onDeleteScan(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Retrieving inspection registry...</p>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 text-sky-400 flex items-center justify-center mx-auto mb-4">
          <Layers className="w-7 h-7" />
        </div>
        <h4 className="text-base font-semibold text-white mb-1">
          No Scans Recorded Yet
        </h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
          Upload an inspection specimen from manufacturing, safety, or documents to trigger multimodal AI anomaly detection.
        </p>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all"
        >
          <span>Initiate First Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70 shadow-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Specimen Preview</th>
              <th className="py-3.5 px-4">Domain Context</th>
              <th className="py-3.5 px-4">Findings & Severity</th>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {scans.map((scan) => {
              const anomalyCount = parseInt(scan.anomaly_count || 0);
              const criticalCount = parseInt(scan.critical_count || 0);

              return (
                <tr
                  key={scan.id}
                  className="hover:bg-slate-800/50 transition-colors group"
                >
                  {/* Thumbnail */}
                  <td className="py-3 px-4">
                    <Link to={`/scans/${scan.id}`} className="block">
                      <div className="w-14 h-12 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-sky-500/50 transition-colors">
                        {scan.image_url ? (
                          <img
                            src={scan.image_url}
                            alt="Scan Thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Layers className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                    </Link>
                  </td>

                  {/* Domain */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-200 block text-xs">
                      {scan.domain}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {scan.sensitivity || 'Medium'} Sensitivity
                    </span>
                  </td>

                  {/* Findings */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {anomalyCount > 0 ? (
                        <>
                          <span className="px-2 py-0.5 rounded-md font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {anomalyCount} {anomalyCount === 1 ? 'Anomaly' : 'Anomalies'}
                          </span>
                          {criticalCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                              <AlertOctagon className="w-3 h-3 text-rose-400" />
                              {criticalCount} Critical
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Passed (Nominal)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="py-3 px-4 text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatDate(scan.created_at)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/scans/${scan.id}`}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-sky-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
                        title="View Full AI Report"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(scan.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                        title="Delete Scan Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <span className="text-xs text-slate-400">
            Page <span className="text-white font-mono">{pagination.page}</span> of{' '}
            <span className="text-white font-mono">{pagination.totalPages}</span> ({pagination.total} total scans)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">
              Delete Inspection Scan?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This action will permanently delete this scan record along with all associated AI-detected anomalies from your database. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

