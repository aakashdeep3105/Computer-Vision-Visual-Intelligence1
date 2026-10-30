import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  X, 
  CheckCircle, 
  Sparkles,
  FileText,
  ShieldAlert,
  Cog
} from 'lucide-react';

// Generates high-fidelity SVG/Canvas specimens for instantaneous one-click testing
function createSpecimenImage(domain) {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');

  if (domain === 'Manufacturing') {
    // Industrial machinery part with scratch and misalignment
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 800, 500);

    // Mechanical plate
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.roundRect(150, 100, 500, 300, 16);
    ctx.fill();

    // Central gear chamber
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(400, 250, 90, 0, Math.PI * 2);
    ctx.fill();

    // Gear teeth
    ctx.fillStyle = '#94a3b8';
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      ctx.beginPath();
      ctx.arc(400 + Math.cos(angle) * 90, 250 + Math.sin(angle) * 90, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bolt holes
    ctx.fillStyle = '#0f172a';
    [ [200, 150], [600, 150], [200, 350], [600, 350] ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
    });

    // Anomaly 1: Linear scratch flaw
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(220, 160);
    ctx.lineTo(310, 230);
    ctx.stroke();

    // Text watermark
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('TURBINE FLANGE SPECIMEN #M-749', 210, 440);
    ctx.fillStyle = '#ef4444';
    ctx.font = '14px monospace';
    ctx.fillText('<< DEFECT: SURFACE SCRATCH DETECTED >>', 210, 465);
  } else if (domain === 'Safety') {
    // Workplace zone with missing safety vest & floor spill
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 800, 500);

    // Industrial floor
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(50, 300, 700, 160);

    // Safety hazard yellow stripe
    ctx.fillStyle = '#eab308';
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(100 + i * 90, 290, 45, 12);
    }

    // Heavy forklift machine outline
    ctx.fillStyle = '#d97706';
    ctx.fillRect(450, 180, 200, 120);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(470, 200, 70, 50);

    // Liquid spill hazard on floor
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(250, 380, 80, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Text annotation
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('FACILITY BAY 4 - WORKPLACE SAFETY SCAN', 160, 80);
    ctx.fillStyle = '#f97316';
    ctx.font = '14px monospace';
    ctx.fillText('WARNING: LIQUID SLIP HAZARD & OPERATOR PPE DEFICIENCY', 160, 110);
  } else {
    // Financial / Corporate Document
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 500);

    // Document border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 40, 680, 420);

    // Header banner
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(90, 70, 620, 45);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('INSPECTION & PROCUREMENT CERTIFICATE', 120, 100);

    // Rows of mock text lines
    ctx.fillStyle = '#64748b';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(100, 150 + i * 35, 450, 12);
      ctx.fillRect(580, 150 + i * 35, 120, 12);
    }

    // Signature box
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(450, 340, 250, 70);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'italic 14px sans-serif';
    ctx.fillText('[X] SIGNATURE REQUIRED - FIELD OMITTED', 460, 380);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

export default function ImageUploader({ image, onImageChange, selectedDomain }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onImageChange(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSelectPreset = (domain) => {
    const specimen = createSpecimenImage(domain);
    onImageChange(specimen);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Source Visual Input (Image)
        </label>
        {image && (
          <button
            type="button"
            onClick={() => onImageChange('')}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Remove Image
          </button>
        )}
      </div>

      {image ? (
        /* Image Preview Box */
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group">
          <img
            src={image}
            alt="Inspection Subject"
            className="w-full h-80 object-contain bg-slate-950/80 p-2"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Payload Ready for Gemini Vision
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-600 transition-colors"
            >
              Replace Photo
            </button>
          </div>
        </div>
      ) : (
        /* Upload Drag-and-Drop Area */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-sky-500 bg-sky-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-900'
          }`}
        >
          <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-sky-400 mb-4 shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h4 className="text-base font-semibold text-slate-200 mb-1">
            Drag and drop your inspection image here
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Supports high-resolution PNG, JPG, JPEG, WEBP (up to 20MB)
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors inline-flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4 text-sky-400" />
            Browse Files from Device
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* One-Click Presets for Fast Verification */}
      <div className="pt-2">
        <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          Or load a pre-configured domain specimen for instant testing:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleSelectPreset('Manufacturing')}
            className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center gap-2 transition-colors text-left"
          >
            <Cog className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">Manufacturing QA Specimen</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('Safety')}
            className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center gap-2 transition-colors text-left"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Safety Compliance Specimen</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('Documents')}
            className="px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center gap-2 transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">Document Audit Specimen</span>
          </button>
        </div>
      </div>
    </div>
  );
}

