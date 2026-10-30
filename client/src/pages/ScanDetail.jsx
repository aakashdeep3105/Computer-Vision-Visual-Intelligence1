import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { scanAPI } from '../services/api';
import AnomalyList from '../components/AnomalyList';
import { 
  ArrowLeft, 
  Trash2, 
  Calendar, 
  Cpu, 
  ShieldAlert, 
  FileCheck, 
  Share2, 
  Download, 
  ScanLine, 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  Sliders,
  MessageSquare
} from 'lucide-react';

export default function ScanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    async function fetchScan() {
      try {
        setError('');
        const res = await scanAPI.getScanById(id);
        if (res.data.success && res.data.scan) {
          setScan(res.data.scan);
        } else {
          setError('Scan not found.');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load visual scan details.');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchScan();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this scan and all associated findings?')) {
      return;
    }
    try {
      await scanAPI.deleteScan(id);
      navigate('/dashboard');
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportJSON = () => {
    if (!scan) return;
    const blob = new Blob([JSON.stringify(scan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VisionInsight-Scan-${scan.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-slate-400">
        <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm">Loading visual intelligence telemetry...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Inspection Scan Not Found</h3>
          <p className="text-xs text-slate-400">{error || 'This scan may have been deleted or belongs to another user.'}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const criticalCount = scan.anomalies?.filter(a => a.severity === 'Critical').length || 0;
  const highCount = scan.anomalies?.filter(a => a.severity === 'High').length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Visual Inspection Report
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                {scan.status}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-mono">
              <span>Scan ID: {scan.id.slice(0, 8)}...</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(scan.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Export JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Delete this analysis"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Analysis Display: Visual Preview & AI Executive Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Input (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Inspection Image Specimen
              </span>
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                {isZoomed ? 'Reset View' : 'Inspect Zoom'}
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={scan.image_url}
                alt="Scan Specimen"
                className={`w-full object-contain bg-slate-950 transition-all duration-300 ${
                  isZoomed ? 'scale-125 cursor-zoom-out h-96' : 'h-80 cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />
            </div>

            {/* Specimen Meta Chips */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Domain</span>
                <span className="font-semibold text-slate-200">{scan.domain}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Strictness</span>
                <span className="font-semibold text-slate-200">{scan.sensitivity || 'Medium'}</span>
              </div>
            </div>

            {scan.custom_instructions && (
              <div className="mt-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                <span className="block text-[10px] text-sky-400 uppercase font-semibold mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Custom Directive
                </span>
                <p className="text-slate-300 italic">"{scan.custom_instructions}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Executive Summary & Anomaly List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Executive Assessment Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Gemini 2.5 AI Executive Assessment
                </h3>
              </div>

              {/* Status Pill */}
              {criticalCount > 0 ? (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  {criticalCount} Critical Concern{criticalCount > 1 ? 's' : ''}
                </span>
              ) : highCount > 0 ? (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {highCount} High Priority
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Nominal Tolerances
                </span>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed pt-1">
              {scan.summary || 'Visual inspection completed with nominal compliance.'}
            </p>
          </div>

          {/* Structured Anomalies Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight">
                Categorized Anomalies & Operational Insights
              </h3>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                {scan.anomalies?.length || 0} findings recorded
              </span>
            </div>

            <AnomalyList anomalies={scan.anomalies || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

