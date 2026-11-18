import React from 'react';
import { Lang } from '../types';
import { SimReadout } from '../utils/physics';

interface Props {
  sim: SimReadout;
  lang: Lang;
  analogyTitle: string;
  analogyText: string;
}

export const WaterValveAnalogy: React.FC<Props> = ({ sim, lang, analogyTitle, analogyText }) => {
  const openRatio = sim.conducting ? Math.min(1, Math.max(0.15, sim.brightness)) : 0;
  const leverAngle = -28 + openRatio * 56; // -28 deg closed, +28 deg fully open

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-5 flex flex-col gap-4">
      <div>
        <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{analogyTitle}</h4>
        <p className="text-sm text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">{analogyText}</p>
      </div>

      <div className="bg-stone-50 dark:bg-stone-950/60 rounded-lg border border-stone-200/80 dark:border-stone-800 p-4" dir="ltr">
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          {/* Main vertical Collector -> Emitter pipe */}
          <rect x="195" y="16" width="56" height="168" rx="4" fill="#cbd5e1" opacity="0.35" stroke="#64748b" strokeWidth="2" />

          {/* Collector water stream */}
          <rect
            x="201"
            y="18"
            width="44"
            height={sim.conducting ? 164 : 74}
            fill="#ef4444"
            opacity={sim.conducting ? 0.35 + openRatio * 0.45 : 0.25}
          />

          {/* Base small push pipe from left */}
          <rect x="40" y="86" width="155" height="24" rx="3" fill="#cbd5e1" opacity="0.35" stroke="#0284c7" strokeWidth="2" />
          <rect
            x="42"
            y="90"
            width={sim.ibUA > 0.1 ? 151 : 40}
            height="16"
            fill="#0284c7"
            opacity={sim.ibUA > 0.1 ? 0.65 : 0.2}
          />

          {/* Rotating Flap / Gate inside transistor */}
          <g transform={`translate(223, 98) rotate(${leverAngle})`}>
            <rect x="-24" y="-5" width="48" height="10" rx="3" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="5" fill="#1c1917" />
          </g>

          {/* Animated flow lines when open */}
          {sim.conducting && (
            <g stroke="#fff" strokeWidth="2.5" strokeDasharray="6 8" className="flow-active" opacity="0.8">
              <line x1="215" y1="22" x2="215" y2="180" />
              <line x1="231" y1="22" x2="231" y2="180" />
              <line x1="48" y1="98" x2="188" y2="98" stroke="#bae6fd" />
            </g>
          )}

          {/* Labels */}
          <text x="264" y="34" fontSize="12" fontWeight="700" fill="#ef4444">
            Collector (C) · {sim.icMA.toFixed(1)} mA
          </text>
          <text x="264" y="176" fontSize="12" fontWeight="700" fill="#10b981">
            Emitter (E) · {(sim.icMA + sim.ibUA / 1000).toFixed(1)} mA
          </text>
          <text x="42" y="76" fontSize="12" fontWeight="700" fill="#0284c7">
            Base (B) · {sim.ibUA.toFixed(1)} µA
          </text>
          <text x="264" y="103" fontSize="11" fill="currentColor" opacity="0.75">
            {sim.conducting
              ? lang === 'fr'
                ? `Clapet ouvert (${Math.round(openRatio * 100)} %)`
                : `الصمّام مفتوح (${Math.round(openRatio * 100)}%)`
              : lang === 'fr'
              ? 'Clapet fermé (I_B insuffisant)'
              : 'الصمّام مغلق (تيار القاعدة غير كافٍ)'}
          </text>
        </svg>
      </div>
    </div>
  );
};
