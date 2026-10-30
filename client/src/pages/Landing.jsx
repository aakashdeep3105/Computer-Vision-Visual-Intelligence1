import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  ScanLine, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  Zap, 
  Database, 
  ArrowRight, 
  Lock,
  Cpu,
  FileCheck,
  ChevronRight,
  Gauge
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-24 py-8">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Next-Generation Visual Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-6">
            Eliminate Visual Bottlenecks with{' '}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-200 bg-clip-text text-transparent">
              Gemini Vision AI
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Upload manufacturing snapshots, facility safety captures, or enterprise documents.
            VisionInsight AI runs multimodal Computer Vision to detect anomalies, quantify severity,
            and generate structured operational action items.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/analyze' : '/register'}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-xl shadow-sky-600/25 transition-all hover:scale-105 flex items-center justify-center gap-2.5"
            >
              <ScanLine className="w-5 h-5" />
              <span>{isAuthenticated ? 'Open Visual Analyzer' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? 'View Console Dashboard' : 'Sign In with Demo'}</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="block text-2xl font-bold font-mono text-white mb-1">99.4%</span>
              <span className="text-xs text-slate-400">Gemini 2.5 Precision</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="block text-2xl font-bold font-mono text-sky-400 mb-1">&lt; 1.2s</span>
              <span className="text-xs text-slate-400">Multimodal Inference</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="block text-2xl font-bold font-mono text-emerald-400 mb-1">100%</span>
              <span className="text-xs text-slate-400">Strict Schema Guarantee</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <span className="block text-2xl font-bold font-mono text-indigo-400 mb-1">PostgreSQL</span>
              <span className="text-xs text-slate-400">Normalized Relational Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Target Domains Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-3">
            Domain-Adaptive Visual Intelligence
          </h2>
          <h3 className="text-3xl font-bold text-white tracking-tight">
            Tuned for Critical Industrial & Operational Workflows
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manufacturing Card */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Manufacturing QA</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Identify surface scratches, geometric misalignment, hairline fractures, missing fasteners, and fabrication anomalies across automated assembly lines.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                Surface Micro-scratch Detection
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                Flange & Bolt Misalignment
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                Dimensional Tolerance Audits
              </li>
            </ul>
          </div>

          {/* Workplace Safety Card */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Workplace Safety & Compliance</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Enforce OSHA standards by automatically scanning job sites for missing hard hats, reflective vests, slippery liquid spills, and hazardous equipment proximity.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                PPE Compliance (Helmets & Vests)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Hazardous Spillage Spotting
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Exit & Fire Lane Obstruction
              </li>
            </ul>
          </div>

          {/* Document Intelligence Card */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-sky-500/40 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Document Intelligence</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Inspect legal contracts, invoices, and certificates. Spot missing signatures, inconsistent font artifacts, date discrepancies, and potential fraud edits.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-sky-400" />
                Missing Signature & Stamp Flagging
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-sky-400" />
                Inconsistent Font & Alteration Audits
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-sky-400" />
                Automated Structured Line Extraction
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Architecture & Security Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-2 block">
              Enterprise Engineering
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Built with Strict Row-Level Data Isolation & Multimodal Reliability
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8">
              Every request is authenticated via signed cryptographic JSON Web Tokens. Database queries strictly scope user data with foreign keys and cascade deletions. Gemini structured output schemas eliminate unstructured hallucination.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold text-white">Cryptographic Isolation</h5>
                  <p className="text-xs text-slate-400">Strict WHERE user_id = $1 SQL parameters.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold text-white">PostgreSQL Normalization</h5>
                  <p className="text-xs text-slate-400">Clean users, scans, and anomalies schemas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA */}
      <section className="text-center py-12 max-w-3xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-white mb-4">
          Ready to Deploy AI-Driven Visual QA?
        </h3>
        <p className="text-sm text-slate-400 mb-8">
          Get started in seconds with our pre-loaded sample specimens or upload your real-world imagery.
        </p>
        <Link
          to={isAuthenticated ? '/analyze' : '/register'}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-xl shadow-sky-600/30 transition-all hover:scale-105"
        >
          <ScanLine className="w-5 h-5" />
          <span>Launch VisionInsight AI</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}

