import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { 
  User, 
  Key, 
  Cpu, 
  Database, 
  ShieldCheck, 
  LogOut, 
  Check, 
  Copy, 
  Sliders, 
  Server, 
  ExternalLink,
  Cloud,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'Not Configured';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-sky-400" />
          Settings & Cloud Infrastructure
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your operator identity, Supabase connection, Render backend status, and Vercel link up.
        </p>
      </div>

      <div className="space-y-6">
        {/* User Identity Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold text-lg">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Operator Profile</h3>
              <p className="text-xs text-slate-400">Authenticated account credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Email</span>
              <span className="text-xs font-mono text-slate-200">{user?.email}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">User UUID</span>
                <span className="text-xs font-mono text-slate-200">
                  {user?.id ? `${user.id.slice(0, 14)}...` : 'N/A'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy Full UUID"
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3-Tier Multi-Cloud System Overview */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-sky-400" />
              Connected 3-Tier System Architecture
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Active configuration linking Vercel Client, Render Server, and Supabase Backend.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Client / Vercel */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tier 1: Client</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Vercel
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">React + Vite SPA</p>
              <p className="text-[11px] text-slate-500 truncate">vercel.json link up active</p>
            </div>

            {/* 2. Server / Render */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tier 2: Server</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Render
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">Express API Engine</p>
              <p className="text-[11px] text-slate-500 truncate font-mono">{apiBaseUrl}</p>
            </div>

            {/* 3. Backend / Supabase */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tier 3: Backend</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  isSupabaseConfigured
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  Supabase
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">PostgreSQL & Storage</p>
              <p className="text-[11px] text-slate-500 truncate font-mono">{supabaseUrl}</p>
            </div>
          </div>

          {/* Supabase Integration Details */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Supabase Configuration Status</span>
              </div>
              {isSupabaseConfigured ? (
                <span className="flex items-center gap-1 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Credentials Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Template Mode (Fill in .env)
                </span>
              )}
            </div>

            <p className="text-slate-400 leading-relaxed">
              To connect your live Supabase project to both Client (Vercel) and Backend (Render), set your credentials in <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">client/.env</code> and <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">backend/.env</code>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-slate-400 font-bold mb-1">client/.env (Vercel)</div>
                <div className="text-slate-500">VITE_SUPABASE_URL=https://xyz.supabase.co</div>
                <div className="text-slate-500">VITE_SUPABASE_ANON_KEY=eyJ...anon_key</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1">
                <div className="text-slate-400 font-bold mb-1">backend/.env (Render)</div>
                <div className="text-slate-500">SUPABASE_SERVICE_URL=https://xyz.supabase.co</div>
                <div className="text-slate-500">SUPABASE_ANON_KEY=eyJ...anon_key</div>
                <div className="text-slate-500">SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role_key</div>
                <div className="text-slate-500">DATABASE_URL=postgresql://postgres...</div>
              </div>
            </div>

            <div className="pt-1">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
              >
                <span>Open Supabase Project Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Account Termination & Logout */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">Sign Out of Console</h4>
            <p className="text-xs text-slate-400">Terminates current session and clears local credentials.</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
