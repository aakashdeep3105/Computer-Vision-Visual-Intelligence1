import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AuthForm({ type = 'login', onSubmit, loading, error, clearError }) {
  const isRegister = type === 'register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation rules for register
  const hasMinLen = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (clearError) clearError();
    onSubmit({ email, password });
  };

  const handleDemoFill = () => {
    if (clearError) clearError();
    setEmail('demo.operator@visioninsight.ai');
    setPassword('InspectVision2026!');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-rose-200">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Work Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@company.com"
              className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            {!isRegister && (
              <span className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer">
                Forgot password?
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-11 pr-12 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Registration Password Requirements Checklist */}
          {isRegister && (
            <div className="mt-3 space-y-1.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Security Constraints:
              </p>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${hasMinLen ? 'text-emerald-400' : 'text-slate-600'}`}
                />
                <span className={hasMinLen ? 'text-emerald-300' : 'text-slate-500'}>
                  At least 8 characters long
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-600'}`}
                />
                <span className={hasNumber ? 'text-emerald-300' : 'text-slate-500'}>
                  Contains at least 1 numeric digit (0-9)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || (isRegister && (!hasMinLen || !hasNumber))}
          className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950 shadow-lg shadow-sky-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{isRegister ? 'Creating Account...' : 'Authenticating...'}</span>
            </div>
          ) : (
            <>
              <span>{isRegister ? 'Initialize Access' : 'Sign In to Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Fast Demo Autofill Helper */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2 px-3 text-xs font-medium text-slate-400 hover:text-sky-300 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            Auto-fill credentials for Instant Demo
          </button>
        </div>
      </form>
    </div>
  );
}

