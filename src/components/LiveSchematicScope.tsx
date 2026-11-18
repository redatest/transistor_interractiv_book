import React from 'react';
import { Lang } from '../types';
import { IMAX_9V, SimParams, SimReadout } from '../utils/physics';

interface Props {
  params: SimParams;
  sim: SimReadout;
  lang: Lang;
}

export const LiveSchematicScope: React.FC<Props> = ({ params, sim, lang }) => {
  const isPnp = params.chapterId === 2 && params.transistorType === 'PNP';
  const flowSpeed = sim.conducting
    ? `${Math.max(0.28, 1.3 - sim.brightness * 0.95).toFixed(2)}s`
    : '1.2s';

  // Generate dynamic oscilloscope / transfer curve path based on chapter
  const renderCurve = () => {
    const W = 280;
    const H = 150;
    const padL = 32;
    const padB = 24;
    const padT = 16;
    const padR = 14;
    const gw = W - padL - padR;
    const gh = H - padT - padB;

    // Ch 9: Live AC Sine Wave + Clipping visualization
    if (params.chapterId === 9) {
      const vc = sim.vc; // 0.2 .. 5.0 V
      const amp = params.acSignalOn ? 2.1 : 0.4;
      const pts: string[] = [];
      let clipped = false;
      for (let i = 0; i <= 60; i++) {
        const t = (i / 60) * Math.PI * 4;
        const raw = vc + amp * Math.sin(t);
        if (raw > 4.95 || raw < 0.25) clipped = true;
        const vClamped = Math.max(0.2, Math.min(5.0, raw));
        const x = padL + (i / 60) * gw;
        const y = padT + gh - (vClamped / 5.0) * gh;
        pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      const qY = padT + gh - (vc / 5.0) * gh;
      const midY = padT + gh / 2;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
          <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
          {/* Ideal 2.5V dashed line */}
          <line x1={padL} y1={midY} x2={padL + gw} y2={midY} stroke="#10b981" strokeDasharray="4 3" strokeWidth="1.2" />
          <text x={padL - 4} y={midY + 3} textAnchor="end" fontSize="9" fill="#10b981" fontFamily="monospace">
            2.5V
          </text>
          <text x={padL - 4} y={padT + 6} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.6" fontFamily="monospace">
            5V
          </text>
          <text x={padL - 4} y={padT + gh} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.6" fontFamily="monospace">
            0V
          </text>
          {/* Q-point baseline */}
          <line x1={padL} y1={qY} x2={padL + gw} y2={qY} stroke="#38bdf8" strokeDasharray="2 2" strokeWidth="1" opacity="0.7" />
          {/* Output sinewave */}
          <path
            d={pts.join(' ')}
            fill="none"
            stroke={clipped && params.acSignalOn ? '#ef4444' : '#f59e0b'}
            strokeWidth="2.4"
          />
          <text x={padL + 6} y={H - 6} fontSize="10" fill="currentColor" opacity="0.8">
            {clipped && params.acSignalOn
              ? lang === 'fr'
                ? 'Écrêtage ! Centrez V_C à 2,5 V'
                : 'تشوّه قصّ! قرّب V_C إلى 2.5V'
              : lang === 'fr'
              ? `Point Q : V_C = ${vc.toFixed(2)} V`
              : `نقطة التشغيل: V_C = ${vc.toFixed(2)} V`}
          </text>
        </svg>
      );
    }

    // Ch 3: Capacitor Charging Exponential
    if (params.chapterId === 3) {
      const ptsI: string[] = [];
      const ptsV: string[] = [];
      for (let i = 0; i <= 40; i++) {
        const u = i / 40;
        const vCap = 1 - Math.exp(-4.2 * u);
        const iBase = Math.exp(-4.2 * u);
        const x = padL + u * gw;
        ptsV.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(padT + gh - vCap * gh).toFixed(1)}`);
        ptsI.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(padT + gh - iBase * gh).toFixed(1)}`);
      }
      const curX = padL + Math.min(1, params.capCharge) * gw;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
          <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
          <path d={ptsV.join(' ')} fill="none" stroke="#38bdf8" strokeWidth="2.2" />
          <path d={ptsI.join(' ')} fill="none" stroke="#f59e0b" strokeWidth="2.2" />
          <line x1={curX} y1={padT} x2={curX} y2={padT + gh} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x={padL} y={H - 6} fontSize="9.5" fill="#38bdf8">
            V_cap(t)
          </text>
          <text x={padL + 60} y={H - 6} fontSize="9.5" fill="#f59e0b">
            I_B(t) / LED
          </text>
        </svg>
      );
    }

    // Ch 6: Multivibrator Square Waves
    if (params.chapterId === 6) {
      const phase = params.oscPhase % 2;
      const pts1 = `M ${padL} ${padT + gh * 0.2} H ${padL + gw * 0.25} V ${padT + gh * 0.85} H ${padL + gw * 0.5} V ${padT + gh * 0.2} H ${padL + gw * 0.75} V ${padT + gh * 0.85} H ${padL + gw}`;
      const pts2 = `M ${padL} ${padT + gh * 0.85} H ${padL + gw * 0.25} V ${padT + gh * 0.2} H ${padL + gw * 0.5} V ${padT + gh * 0.85} H ${padL + gw * 0.75} V ${padT + gh * 0.2} H ${padL + gw}`;
      const markerX = padL + (phase === 0 ? 0.125 : 0.375) * gw;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
          <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
          <path d={pts1} fill="none" stroke="#ef4444" strokeWidth="2.2" />
          <path d={pts2} fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.8" />
          <line x1={markerX} y1={padT} x2={markerX} y2={padT + gh} stroke="#fde047" strokeWidth="1.8" />
          <text x={padL} y={H - 6} fontSize="9.5" fill="#ef4444">
            Q1 (LED1)
          </text>
          <text x={padL + 75} y={H - 6} fontSize="9.5" fill="#22c55e">
            Q2 (LED2)
          </text>
        </svg>
      );
    }

    // Ch 7: Voltage Boost Spike Waveform (1.5V -> >3.4V)
    if (params.chapterId === 7) {
      const vBaseY = padT + gh - (params.cellVoltage / 4.5) * gh;
      const vPeak = params.exampleId === 'charge-pump' ? params.cellVoltage + 1.0 : params.cellVoltage >= 0.85 ? 3.5 : params.cellVoltage;
      const vPeakY = padT + gh - (Math.min(4.4, vPeak) / 4.5) * gh;
      const ledY = padT + gh - (3.2 / 4.5) * gh;
      const wave =
        params.exampleId === 'charge-pump'
          ? `M ${padL} ${vBaseY} H ${padL + gw * 0.45} V ${vPeakY} H ${padL + gw * 0.9} V ${vBaseY} H ${padL + gw}`
          : `M ${padL} ${vBaseY} L ${padL + gw * 0.25} ${vBaseY} L ${padL + gw * 0.3} ${vPeakY} L ${padL + gw * 0.45} ${vBaseY} L ${padL + gw * 0.65} ${vBaseY} L ${padL + gw * 0.7} ${vPeakY} L ${padL + gw * 0.85} ${vBaseY} H ${padL + gw}`;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
          <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
          <line x1={padL} y1={ledY} x2={padL + gw} y2={ledY} stroke="#10b981" strokeDasharray="4 3" strokeWidth="1.2" />
          <text x={padL - 4} y={ledY + 3} textAnchor="end" fontSize="8.5" fill="#10b981" fontFamily="monospace">
            3.2V
          </text>
          <text x={padL - 4} y={vBaseY + 3} textAnchor="end" fontSize="8.5" fill="currentColor" opacity="0.7" fontFamily="monospace">
            {params.cellVoltage.toFixed(1)}V
          </text>
          <path d={wave} fill="none" stroke="#f59e0b" strokeWidth="2.4" />
          <text x={padL} y={H - 6} fontSize="9.5" fill="#f59e0b">
            V_pic = {vPeak.toFixed(1)} V
          </text>
        </svg>
      );
    }

    // Ch 8 Solar Hysteresis or Constant Current Curve
    if (params.chapterId === 8) {
      if (params.exampleId === 'constant-current') {
        const curY = padT + gh - Math.min(1, sim.icMA / 40) * gh;
        return (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
            <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
            <line x1={padL} y1={curY} x2={padL + gw} y2={curY} stroke="#10b981" strokeWidth="2.5" />
            <circle
              cx={padL + ((params.supplyV - 6) / 9) * gw}
              cy={curY}
              r="5"
              fill="#f59e0b"
              stroke="#fff"
              strokeWidth="1.5"
            />
            <text x={padL - 4} y={curY + 3} textAnchor="end" fontSize="9" fill="#10b981" fontFamily="monospace">
              {sim.icMA.toFixed(0)}mA
            </text>
            <text x={padL} y={H - 6} fontSize="9.5" fill="currentColor" opacity="0.8">
              6V → 15V : I_LED = {sim.icMA.toFixed(1)} mA
            </text>
          </svg>
        );
      }
      // Hysteresis Loop
      const x125 = padL + ((12.5 - 11) / 3.5) * gw;
      const x137 = padL + ((13.7 - 11) / 3.5) * gw;
      const yOn = padT + gh * 0.22;
      const yOff = padT + gh * 0.82;
      const curX = padL + ((params.battVoltage - 11) / 3.5) * gw;
      const curY = params.solarDiverted ? yOff : yOn;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
          <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
          <path
            d={`M ${padL} ${yOn} H ${x137} V ${yOff} H ${padL + gw} M ${x137} ${yOff} H ${x125} V ${yOn}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.2"
          />
          <circle cx={curX} cy={curY} r="5.5" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
          <text x={x125} y={H - 6} textAnchor="middle" fontSize="9" fill="#10b981" fontFamily="monospace">
            12.5V
          </text>
          <text x={x137} y={H - 6} textAnchor="middle" fontSize="9" fill="#ef4444" fontFamily="monospace">
            13.7V
          </text>
        </svg>
      );
    }

    // Default (Ch 1, 2, 4, 5): Linear + Saturation Transfer Curve I_C vs I_B
    const satX = padL + gw * 0.55;
    const topY = padT + 10;
    const botY = padT + gh;
    const ratio = Math.min(1, sim.icMA / IMAX_9V);
    const dotX = padL + Math.min(1, ratio * 0.55) * gw;
    const dotY = botY - ratio * (botY - topY);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
        <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
        {/* Curve: linear ramp then saturation flat top */}
        <path
          d={`M ${padL} ${botY} L ${satX} ${topY} L ${padL + gw} ${topY}`}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2.5"
        />
        <line x1={satX} y1={padT} x2={satX} y2={botY} stroke="currentColor" strokeOpacity="0.2" strokeDasharray="3 3" />
        <circle cx={dotX} cy={dotY} r="5.5" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
        <text x={padL - 4} y={topY + 4} textAnchor="end" fontSize="8.5" fill="currentColor" opacity="0.7" fontFamily="monospace">
          {IMAX_9V.toFixed(0)}mA
        </text>
        <text x={padL} y={H - 6} fontSize="9.5" fill="currentColor" opacity="0.8">
          I_C = β·I_B ({lang === 'fr' ? 'pente β' : 'الميل β'}) → {lang === 'fr' ? 'Saturation' : 'تشبّع'}
        </text>
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {/* Schematic SVG */}
      <div className="xl:col-span-7 schematic-grid rounded-xl border border-stone-200 dark:border-stone-800 p-4 flex flex-col justify-between min-h-[300px]">
        <div className="flex items-center justify-between text-xs font-mono-num text-stone-500 dark:text-stone-400 mb-2">
          <span>{lang === 'fr' ? 'SCHÉMA ÉLECTRONIQUE EN DIRECT' : 'المخطط الكهربائي الحيّ'}</span>
          <span className="text-sky-600 dark:text-sky-400">
            {isPnp ? 'BC557 (PNP)' : 'BC547 (NPN)'}
          </span>
        </div>

        <svg
          viewBox="0 0 360 220"
          className="w-full h-auto max-h-[250px]"
          direction="ltr"
          style={{ '--flow-speed': flowSpeed } as React.CSSProperties}
        >
          {/* Power Rails */}
          <line x1="30" y1="26" x2="310" y2="26" stroke="#d97706" strokeWidth="2.2" />
          <line x1="30" y1="196" x2="310" y2="196" stroke="#475569" strokeWidth="2.2" />

          {/* Battery symbol on left */}
          <line x1="30" y1="26" x2="30" y2="96" stroke="currentColor" strokeWidth="2" opacity="0.7" />
          <line x1="18" y1="96" x2="42" y2="96" stroke="currentColor" strokeWidth="2.5" />
          <line x1="23" y1="106" x2="37" y2="106" stroke="currentColor" strokeWidth="2.5" />
          <line x1="18" y1="116" x2="42" y2="116" stroke="currentColor" strokeWidth="2.5" />
          <line x1="23" y1="126" x2="37" y2="126" stroke="currentColor" strokeWidth="2.5" />
          <line x1="30" y1="126" x2="30" y2="196" stroke="currentColor" strokeWidth="2" opacity="0.7" />
          <text x="12" y="90" fontSize="11" fontWeight="700" fill="#d97706">
            {params.chapterId === 2 && params.batteryReversed ? '−' : '+'}
          </text>
          <text x="12" y="138" fontSize="11" fontWeight="700" fill="#64748b">
            {params.chapterId === 2 && params.batteryReversed ? '+' : '−'}
          </text>
          <text x="48" y="115" fontSize="11" fontFamily="monospace" fill="currentColor" fontWeight="600">
            {params.chapterId === 7 ? `${params.cellVoltage.toFixed(1)}V` : params.chapterId === 9 ? '5V' : '9V'}
          </text>

          {/* Collector Branch: Load + LED + Resistor */}
          <line x1="230" y1="26" x2="230" y2="44" stroke="#ef4444" strokeWidth="2" />
          {/* Resistor Box */}
          <rect x="222" y="44" width="16" height="34" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="245" y="65" fontSize="10" fontFamily="monospace" fill="currentColor">
            {params.chapterId === 9 ? 'RL 22k' : '220R'}
          </text>
          <line x1="230" y1="78" x2="230" y2="96" stroke="#ef4444" strokeWidth="2" />

          {/* LED symbol */}
          <polygon
            points="220,96 240,96 230,114"
            fill={sim.conducting ? '#f59e0b' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          />
          <line x1="220" y1="114" x2="240" y2="114" stroke="currentColor" strokeWidth="2" />
          {sim.conducting && (
            <g stroke="#f59e0b" strokeWidth="1.5">
              <line x1="244" y1="100" x2="254" y2="94" />
              <line x1="244" y1="108" x2="254" y2="102" />
            </g>
          )}
          <line x1="230" y1="114" x2="230" y2="138" stroke="#ef4444" strokeWidth="2" />

          {/* Animated Collector Current */}
          {sim.conducting && (
            <line
              x1="230"
              y1="26"
              x2="230"
              y2="138"
              stroke="#ef4444"
              strokeWidth="3"
              className="flow-active"
              opacity="0.7"
            />
          )}

          {/* Base Branch */}
          <line x1="110" y1="26" x2="110" y2="152" stroke="#0284c7" strokeWidth="1.8" opacity="0.5" />
          <rect x="128" y="144" width="38" height="16" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="147" y="138" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="currentColor">
            {params.chapterId === 9 ? 'RB' : 'R_base'}
          </text>
          <line x1="110" y1="152" x2="128" y2="152" stroke="#0284c7" strokeWidth="2" />
          <line x1="166" y1="152" x2="210" y2="152" stroke="#0284c7" strokeWidth="2" />
          {(sim.conducting || sim.ibUA > 0.1) && (
            <line
              x1="110"
              y1="152"
              x2="210"
              y2="152"
              stroke="#0284c7"
              strokeWidth="3"
              className="flow-active"
            />
          )}

          {/* Transistor Circle Symbol */}
          <circle cx="226" cy="152" r="20" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <line x1="218" y1="140" x2="218" y2="164" stroke="currentColor" strokeWidth="3" />
          <line x1="210" y1="152" x2="218" y2="152" stroke="#0284c7" strokeWidth="2.2" />
          <line x1="218" y1="146" x2="230" y2="138" stroke="#ef4444" strokeWidth="2.2" />
          <line x1="218" y1="158" x2="230" y2="168" stroke="#10b981" strokeWidth="2.2" />
          {/* Emitter Arrow */}
          {isPnp ? (
            <polygon points="219,158 227,160 223,166" fill="#10b981" />
          ) : (
            <polygon points="230,168 222,166 226,160" fill="#10b981" />
          )}

          {/* Emitter to GND */}
          <line x1="230" y1="168" x2="230" y2="196" stroke="#10b981" strokeWidth="2.2" />
          {sim.conducting && (
            <line x1="230" y1="168" x2="230" y2="196" stroke="#10b981" strokeWidth="3.2" className="flow-active" />
          )}

          {/* Live Node Voltage Readouts */}
          <g fontFamily="monospace" fontSize="10" fontWeight="600">
            <text x="254" y="138" fill="#ef4444">
              V_C = {sim.vc.toFixed(2)}V
            </text>
            <text x="172" y="172" fill="#0284c7">
              I_B {sim.ibUA.toFixed(1)}µA
            </text>
            <text x="254" y="160" fill="#10b981">
              I_C {sim.icMA.toFixed(1)}mA
            </text>
          </g>
        </svg>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono-num pt-2 border-t border-stone-200/70 dark:border-stone-800">
          <span className="text-sky-600 dark:text-sky-400">● Base (B): {sim.vbe.toFixed(2)} V</span>
          <span className="text-rose-600 dark:text-rose-400">● Collecteur (C): {sim.vc.toFixed(2)} V</span>
          <span className="text-emerald-600 dark:text-emerald-400">● Gain β: ×{sim.betaEff.toLocaleString('fr-FR')}</span>
        </div>
      </div>

      {/* Oscilloscope / Transfer Graph */}
      <div className="xl:col-span-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-mono-num text-stone-500 dark:text-stone-400 mb-2">
          <span>
            {params.chapterId === 9 || params.chapterId === 6 || params.chapterId === 7 || params.chapterId === 3
              ? lang === 'fr'
                ? 'OSCILLOSCOPE TEMPS RÉEL'
                : 'راسم الإشارة اللحظي'
              : lang === 'fr'
              ? 'COURBE CARACTÉRISTIQUE'
              : 'المنحنى المميّز'}
          </span>
          <span className="text-amber-600 dark:text-amber-400">
            {sim.conducting ? (lang === 'fr' ? 'ACTIF' : 'نشط') : lang === 'fr' ? 'BLOQUÉ' : 'مقطوع'}
          </span>
        </div>

        <div className="my-auto">{renderCurve()}</div>

        <div className="text-xs text-stone-600 dark:text-stone-400 pt-2 border-t border-stone-200/70 dark:border-stone-800 leading-relaxed">
          {lang === 'fr' ? sim.statusFr : sim.statusAr}
        </div>
      </div>
    </div>
  );
};
