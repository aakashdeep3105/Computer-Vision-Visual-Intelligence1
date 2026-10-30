import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scanAPI } from '../services/api';
import ImageUploader from '../components/ImageUploader';
import AnalysisConfigurator from '../components/AnalysisConfigurator';
import { 
  ScanLine, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  Cpu, 
  ShieldCheck, 
  FileText,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function Analyze() {
  const navigate = useNavigate();

  const [image, setImage] = useState('');
  const [domain, setDomain] = useState('Manufacturing Quality Assurance');
  const [sensitivity, setSensitivity] = useState('Medium');
  const [customInstructions, setCustomInstructions] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState('');

  const handleStartAnalysis = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please provide or upload an image specimen before starting analysis.');
      return;
    }

    setError('');
    setAnalyzing(true);
    setAnalysisStep(1); // Uploading & encoding

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 900);

    try {
      const response = await scanAPI.analyze({
        image,
        domain,
        sensitivity,
        custom_instructions: customInstructions
      });

      clearInterval(stepInterval);
      setAnalysisStep(4); // Finished

      if (response.data.success && response.data.scan?.id) {
        setTimeout(() => {
          navigate(`/scans/${response.data.scan.id}`);
        }, 600);
      } else {
        throw new Error(response.data.message || 'Analysis did not return valid result');
      }
    } catch (err) {
      clearInterval(stepInterval);
      setAnalyzing(false);
      setAnalysisStep(0);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to complete multimodal AI inspection. Please try again.'
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold mb-3 border border-sky-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal Visual Inspection Studio</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          New Computer Vision Analysis
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Upload an industrial photo, workplace snapshot, or scanned document. Gemini 2.5 Flash will automatically analyze defects, assess severity, and provide operational instructions.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="flex-1 font-medium">{error}</p>
        </div>
      )}

      {/* Main Upload & Config Form */}
      <form onSubmit={handleStartAnalysis} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Uploader (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <ImageUploader
              image={image}
              onImageChange={(val) => {
                setImage(val);
                if (error) setError('');
              }}
              selectedDomain={domain}
            />
          </div>

          {/* Right Column: Domain, Sensitivity & Directives (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
            <AnalysisConfigurator
              domain={domain}
              onDomainChange={setDomain}
              sensitivity={sensitivity}
              onSensitivityChange={setSensitivity}
              customInstructions={customInstructions}
              onCustomInstructionsChange={setCustomInstructions}
            />

            {/* Submit Action Bar */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={analyzing || !image}
                className="w-full py-4 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-xl shadow-sky-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] flex items-center justify-center gap-2.5"
              >
                {analyzing ? (
                  <div className="flex items-center gap-2.5">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Processing with Gemini Vision...</span>
                  </div>
                ) : (
                  <>
                    <ScanLine className="w-5 h-5" />
                    <span>Run AI Vision Inspection</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {!image && (
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Please upload an image or select a specimen above to begin.
                </p>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Modal / Overlay Processing Feedback while Gemini is evaluating */}
      {analyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Top scanning beam line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-400 to-sky-500 animate-pulse" />

            <div className="relative mx-auto w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
              <ScanLine className="w-10 h-10 text-sky-400 animate-pulse" />
              <div className="absolute inset-0 rounded-2xl border-2 border-sky-500/40 animate-ping opacity-30" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Gemini Vision Analysis in Progress
              </h3>
              <p className="text-xs text-slate-400">
                Evaluating visual vectors against {domain} standards.
              </p>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-2.5 text-left text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 1 ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span className={analysisStep >= 1 ? 'text-slate-200' : 'text-slate-500'}>
                  Encoding visual payload (Base64)
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 2 ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span className={analysisStep >= 2 ? 'text-slate-200' : 'text-slate-500'}>
                  Streaming to Gemini 2.5 Flash model
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 3 ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span className={analysisStep >= 3 ? 'text-slate-200' : 'text-slate-500'}>
                  Enforcing strict JSON schema & scoring
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className={`w-4 h-4 ${analysisStep >= 4 ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span className={analysisStep >= 4 ? 'text-slate-200' : 'text-slate-500'}>
                  Persisting relational record to PostgreSQL
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

