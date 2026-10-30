import React from 'react';
import { Cog, ShieldCheck, FileCheck, Sliders, MessageSquare, Info } from 'lucide-react';

const DOMAIN_OPTIONS = [
  {
    id: 'Manufacturing Quality Assurance',
    shortName: 'Manufacturing',
    title: 'Manufacturing QA',
    icon: Cog,
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400',
    description: 'Detect micro-scratches, dents, misalignment, weld voids, or missing fasteners.'
  },
  {
    id: 'Workplace Safety & Compliance',
    shortName: 'Safety',
    title: 'Workplace Safety',
    icon: ShieldCheck,
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400',
    description: 'Detect missing PPE (helmets, vests, boots), liquid spills, blocked exits, or OSHA hazards.'
  },
  {
    id: 'Document Intelligence',
    shortName: 'Documents',
    title: 'Document Intelligence',
    icon: FileCheck,
    color: 'from-sky-500/20 to-indigo-500/20 border-sky-500/40 text-sky-400',
    description: 'Verify signatures, stamps, numeric alterations, font irregularities, and legal clauses.'
  }
];

const SUGGESTED_PROMPTS = {
  'Manufacturing Quality Assurance': [
    'Check specifically for rust or micro-pitting on the main gear teeth',
    'Verify if the seal gasket is properly aligned without pinching',
    'Examine fastener torque markings and check for missing screws'
  ],
  'Workplace Safety & Compliance': [
    'Confirm if all personnel in the hazardous area have ANSI certified hard hats',
    'Check walkways for chemical or liquid trip-and-slip hazards',
    'Identify if emergency stop buttons are unblocked and accessible'
  ],
  'Document Intelligence': [
    'Check if the signature in section 4 matches the authorized approval line',
    'Verify whether the invoice total matches itemized line additions',
    'Examine document for evidence of digital copy-pasting or font mismatch'
  ]
};

export default function AnalysisConfigurator({
  domain,
  onDomainChange,
  sensitivity,
  onSensitivityChange,
  customInstructions,
  onCustomInstructionsChange
}) {
  const currentSuggestions = SUGGESTED_PROMPTS[domain] || SUGGESTED_PROMPTS['Manufacturing Quality Assurance'];

  return (
    <div className="space-y-6">
      {/* 1. Target Inspection Domain Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            Target Inspection Domain
          </label>
          <span className="text-xs text-sky-400 font-mono">Multimodal Specialized</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DOMAIN_OPTIONS.map((opt) => {
            const isSelected = domain === opt.id || domain === opt.shortName;
            const Icon = opt.icon;
            return (
              <div
                key={opt.id}
                onClick={() => onDomainChange(opt.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? `bg-slate-800/90 border-sky-500 ring-2 ring-sky-500/30 shadow-lg shadow-sky-500/10`
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-slate-800 border border-slate-700 ${isSelected ? opt.color : 'text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-sm text-slate-200">{opt.title}</h4>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {opt.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Sensitivity Setting */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            Inspection Strictness / Sensitivity
          </label>
          <span className="text-xs font-mono text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            {sensitivity} Threshold
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {['Low', 'Medium', 'High'].map((level) => {
            const isSelected = sensitivity === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => onSensitivityChange(level)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {level}
                <span className="block text-[10px] font-normal opacity-75 mt-0.5">
                  {level === 'Low' && 'Only major breaches'}
                  {level === 'Medium' && 'Standard tolerances'}
                  {level === 'High' && 'Zero-tolerance audit'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Custom Instructions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            Custom Advisory Directives (Optional)
          </label>
          <span className="text-[11px] text-slate-500">Guides Gemini model focus</span>
        </div>

        <textarea
          rows={3}
          value={customInstructions}
          onChange={(e) => onCustomInstructionsChange(e.target.value)}
          placeholder="e.g. Check specifically for rust on the main gear teeth, or verify if helmets comply with ANSI Z89.1..."
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none"
        />

        {/* Suggestion Chips */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1">
            <Info className="w-3 h-3" /> Quick suggestions:
          </span>
          {currentSuggestions.map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onCustomInstructionsChange(promptText)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border border-slate-700 transition-colors text-left truncate max-w-xs"
              title={promptText}
            >
              + {promptText}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

