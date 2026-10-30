import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, scanAPI } from '../services/api';
import DashboardStatsCard from '../components/DashboardStatsCard';
import ScanHistoryTable from '../components/ScanHistoryTable';
import { 
  ScanLine, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  BarChart3, 
  PieChart, 
  Cpu, 
  ShieldAlert, 
  FileCheck 
} from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalScans: 0,
    criticalAnomalies: 0,
    domainDistribution: [],
    severityDistribution: [],
    recentScans: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    try {
      setError('');
      const res = await dashboardAPI.getMetrics();
      if (res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError('Unable to load aggregate operational metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  const handleDeleteRecentScan = async (id) => {
    try {
      await scanAPI.deleteScan(id);
      fetchMetrics();
    } catch (err) {
      alert('Failed to delete scan: ' + (err.response?.data?.message || err.message));
    }
  };

  // Domain icons mapper
  const getDomainIcon = (name) => {
    if (name.includes('Manufacturing')) return Cpu;
    if (name.includes('Safety')) return ShieldAlert;
    return FileCheck;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-sky-400" />
            Operational Inspection Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time visual telemetry, historical scan records, and anomaly severity statistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors disabled:opacity-50"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-lg shadow-sky-600/25 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>New Visual Scan</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatsCard
          title="Total Scans Logged"
          value={metrics.totalScans}
          subtitle="Processed via Gemini 2.5 Flash"
          icon={Layers}
          colorScheme="sky"
        />

        <DashboardStatsCard
          title="Critical Anomalies"
          value={metrics.criticalAnomalies}
          subtitle={metrics.criticalAnomalies > 0 ? "Immediate mitigation required" : "Zero active critical breaches"}
          icon={AlertTriangle}
          colorScheme={metrics.criticalAnomalies > 0 ? "rose" : "emerald"}
          trend={metrics.criticalAnomalies > 0 ? "High Alert" : "Clear"}
          trendPositive={metrics.criticalAnomalies === 0}
        />

        <DashboardStatsCard
          title="Active Domains"
          value={metrics.domainDistribution.length}
          subtitle="Manufacturing, Safety, Docs"
          icon={Cpu}
          colorScheme="amber"
        />

        <DashboardStatsCard
          title="AI Inspection Engine"
          value="Online"
          subtitle="Multimodal JSON Schema V2"
          icon={CheckCircle2}
          colorScheme="emerald"
        />
      </div>

      {/* Domain & Severity Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-400" />
              Scans by Target Domain
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {metrics.totalScans} total
            </span>
          </div>

          {metrics.domainDistribution.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No domain telemetry available yet.
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.domainDistribution.map((item) => {
                const count = parseInt(item.count || 0);
                const percent = metrics.totalScans > 0 ? Math.round((count / metrics.totalScans) * 100) : 0;
                const Icon = getDomainIcon(item.domain);

                return (
                  <div key={item.domain} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-sky-400" />
                        {item.domain}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {count} scans ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Severity Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Detected Anomalies by Severity
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Categorized
            </span>
          </div>

          {metrics.severityDistribution.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No anomalies registered yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {['Critical', 'High', 'Medium', 'Low'].map((sev) => {
                const found = metrics.severityDistribution.find(s => s.severity === sev);
                const count = found ? parseInt(found.count) : 0;
                const colors = {
                  Critical: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
                  High: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
                  Medium: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
                  Low: 'border-sky-500/30 bg-sky-500/10 text-sky-300'
                };

                return (
                  <div
                    key={sev}
                    className={`p-4 rounded-xl border ${colors[sev]} flex items-center justify-between`}
                  >
                    <div>
                      <span className="block text-[11px] uppercase font-bold tracking-wider opacity-80">
                        {sev}
                      </span>
                      <span className="text-2xl font-bold font-mono">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Scans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Recent Visual Inspections
            </h3>
            <p className="text-xs text-slate-400">
              Quick access to your most recent multimodal visual QA records.
            </p>
          </div>
          <Link
            to="/analyze"
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            + Run New Scan
          </Link>
        </div>

        <ScanHistoryTable
          scans={metrics.recentScans}
          pagination={{ page: 1, totalPages: 1, total: metrics.recentScans.length }}
          onDeleteScan={handleDeleteRecentScan}
          loading={loading}
        />
      </div>
    </div>
  );
}

