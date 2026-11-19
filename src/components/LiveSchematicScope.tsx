import React from 'react';
import { Lang } from '../types';
import { IMAX_9V, SimParams, SimReadout } from '../utils/physics';

interface Props {
  params: SimParams;
  sim: SimReadout;
  lang: Lang;
}

/* Reusable schematic NPN or PNP transistor symbol */
const BjtSymbol: React.FC<{
  cx: number;
  cy: number;
  isPnp?: boolean;
  label?: string;
  active?: boolean;
}> = ({ cx, cy, isPnp = false, label, active = false }) => {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r="18"
        fill={active ? 'rgba(245, 158, 11, 0.12)' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      />
      {/* Base vertical bar */}
      <line x1={cx - 7} y1={cy - 10} x2={cx - 7} y2={cy + 10} stroke="currentColor" strokeWidth="2.8" />
      {/* Base lead */}
      <line x1={cx - 18} y1={cy} x2={cx - 7} y2={cy} stroke="#0284c7" strokeWidth="2" />
      {/* Top leg (C for NPN, E for PNP) */}
      <line x1={cx - 7} y1={cy - 5} x2={cx + 7} y2={cy - 14} stroke="#ef4444" strokeWidth="2" />
      {/* Bottom leg (E for NPN, C for PNP) */}
      <line x1={cx - 7} y1={cy + 5} x2={cx + 7} y2={cy + 14} stroke="#10b981" strokeWidth="2" />
      {/* Emitter arrow */}
      {isPnp ? (
        <polygon points={`${cx - 5},${cy - 6} ${cx + 3},${cy - 8} ${cx},${cy - 13}`} fill="#10b981" />
      ) : (
        <polygon points={`${cx + 7},${cy + 14} ${cx - 1},${cy + 12} ${cx + 3},${cy + 7}`} fill="#10b981" />
      )}
      {label && (
        <text x={cx + 22} y={cy + 4} fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="currentColor">
          {label}
        </text>
      )}
    </g>
  );
};

export const LiveSchematicScope: React.FC<Props> = ({ params, sim, lang }) => {
  const cid = params.catalogId;
  const isPnp =
    (cid === 'simplest-tester' || (!cid && params.chapterId === 2)) &&
    params.transistorType === 'PNP';
  const flowSpeed = sim.conducting
    ? `${Math.max(0.28, 1.3 - sim.brightness * 0.95).toFixed(2)}s`
    : '1.2s';

  const isSelfBias = cid === 'self-bias-ce' || (!cid && params.chapterId === 9);
  const isCapScene = cid === 'courtesy-light' || (!cid && params.chapterId === 3);
  const isDarlington =
    cid === 'second-simplest' ||
    cid === 'eight-million-gain' ||
    cid === 'mains-hum' ||
    (!cid && params.chapterId === 4);
  const isSchmitt = cid === 'schmitt-trigger' || (!cid && params.chapterId === 5 && params.exampleId === 'dark-schmitt');
  const isNightLight = cid === 'night-light' || (!cid && params.chapterId === 5 && params.exampleId === 'night-light');
  const isMotorPwm = cid === 'motor-speed-control' || (!cid && params.chapterId === 5 && params.exampleId === 'motor-pwm');
  const isOsc6 =
    cid === 'robot-man' ||
    cid === 'three-led-chaser' ||
    cid === 'ticking-bomb' ||
    (!cid && params.chapterId === 6);
  const isBoost7 =
    cid === 'led-on-1v5' ||
    cid === 'bike-flasher-air' ||
    cid === 'led-torch-1v5' ||
    (!cid && params.chapterId === 7);
  const isSolar8 = cid === 'solar-charger' || (!cid && params.chapterId === 8 && params.exampleId === 'solar-charger');
  const isConstCurrent8 =
    cid === 'constant-current-source' || (!cid && params.chapterId === 8 && params.exampleId === 'constant-current');
  const isLogicProbe = cid === 'logic-probe' || (!cid && params.chapterId === 2 && params.exampleId === 'logic-probe');
  const isStaircase = cid === 'lie-detector-staircase' || (!cid && params.chapterId === 1 && params.exampleId === 'staircase');

  /* ================= RIGHT PANEL: OSCILLOSCOPE / TRANSFER CURVE ================= */
  const renderCurve = () => {
    const W = 280;
    const H = 155;
    const padL = 34;
    const padB = 24;
    const padT = 16;
    const padR = 14;
    const gw = W - padL - padR;
    const gh = H - padT - padB;

    // #24 Multimeter Tester Deflection Meter
    if (cid === 'multimeter-tester') {
      const defl = sim.meterDeflection ?? 0.02;
      const needleDeg = -48 + defl * 96;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
          <rect x={padL} y={padT} width={gw} height={gh - 8} rx="8" fill="none" stroke="currentColor" strokeOpacity="0.22" />
          <path
            d={`M ${padL + 24} ${padT + gh - 24} A 76 76 0 0 1 ${padL + gw - 24} ${padT + gh - 24}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />
          <text x={padL + 16} y={padT + gh - 34} fontSize="11" fontWeight="700" fill="#ef4444">∞</text>
          <text x={padL + gw - 24} y={padT + gh - 34} fontSize="10" fontWeight="700" fill="#10b981" fontFamily="monospace">0Ω</text>
          <g transform={`translate(${padL + gw / 2}, ${padT + gh - 16}) rotate(${needleDeg})`} className="transition-transform duration-300">
            <line x1="0" y1="0" x2="0" y2="-66" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="0" cy="0" r="5" fill="currentColor" />
          </g>
          <text x={padL + gw / 2} y={H - 4} textAnchor="middle" fontSize="9.5" fontFamily="monospace" fill="currentColor">
            {params.meterRange ?? 'x10'} · {Math.round(defl * 100)}% {lang === 'fr' ? 'déviation' : 'انحراف'}
          </text>
        </svg>
      );
    }

    // Staircase Lie Detector Thresholds (0.6 / 1.2 / 1.8 / 2.4 V)
    if (isStaircase) {
      const n = sim.staircaseLeds;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
          <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
          {[1, 2, 3, 4].map((step) => {
            const bw = (gw - 28) / 4;
            const bx = padL + 8 + (step - 1) * (bw + 4);
            const bh = (step / 4) * (gh - 22);
            const on = step <= n;
            return (
              <g key={step}>
                <rect
                  x={bx}
                  y={padT + gh - bh}
                  width={bw - 4}
                  height={bh}
                  rx="3"
                  fill={on ? '#22c55e' : 'currentColor'}
                  opacity={on ? 0.85 : 0.14}
                />
                <text x={bx + (bw - 4) / 2} y={padT + gh - bh - 4} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor">
                  {(step * 0.6).toFixed(1)}V
                </text>
                <text x={bx + (bw - 4) / 2} y={H - 6} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor">
                  L{step}
                </text>
              </g>
            );
          })}
        </svg>
      );
    }

    // Ch 9 / #23: Live AC Sine Wave + Clipping
    if (isSelfBias) {
      const vc = sim.vc;
      const amp = params.acSignalOn ? (params.acAmplitude ?? 2.0) : 0.4;
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
          <line x1={padL} y1={qY} x2={padL + gw} y2={qY} stroke="#38bdf8" strokeDasharray="2 2" strokeWidth="1" opacity="0.7" />
          <path
            d={pts.join(' ')}
            fill="none"
            stroke={clipped && params.acSignalOn ? '#ef4444' : '#f59e0b'}
            strokeWidth="2.4"
          />
          <text x={padL + 4} y={H - 6} fontSize="9.5" fill="currentColor" opacity="0.85">
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

    // Ch 3 / Courtesy Light: Capacitor Exponential
    if (isCapScene) {
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
      const curX = padL + Math.min(1, params.doorOpen ? 0.04 : params.capCharge) * gw;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
          <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
          <path d={ptsV.join(' ')} fill="none" stroke="#38bdf8" strokeWidth="2.2" />
          <path d={ptsI.join(' ')} fill="none" stroke="#f59e0b" strokeWidth="2.2" />
          <line x1={curX} y1={padT} x2={curX} y2={padT + gh} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x={padL} y={H - 6} fontSize="9.5" fill="#38bdf8">
            V_cap(t)
          </text>
          <text x={padL + 65} y={H - 6} fontSize="9.5" fill="#f59e0b">
            I_B(t) / {cid === 'courtesy-light' ? 'Plafonnier' : 'LED'}
          </text>
        </svg>
      );
    }

    // Ch 4 / Darlington: Multi-stage Log Gain Cascade
    if (isDarlington) {
      const activeStages =
        cid === 'mains-hum' || cid === 'eight-million-gain' || (!cid && (params.exampleId === 'mains-hum' || params.exampleId === 'eight-million'))
          ? 3
          : cid === 'second-simplest' || (!cid && params.exampleId === 'second-simplest')
          ? 2
          : params.stages;
      const bars = [
        { label: 'I_in', val: 0.14, color: '#38bdf8', text: `${sim.ibUA.toFixed(2)}µA` },
        { label: 'Q1 (×200)', val: 0.42, color: '#fbbf24', text: '×200' },
        { label: 'Q2 (×40k)', val: activeStages >= 2 ? 0.72 : 0.08, color: '#f97316', text: '×40 000' },
        { label: 'Q3 (×8M)', val: activeStages >= 3 ? 1.0 : 0.08, color: '#ef4444', text: '×8 000 000' },
      ];
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
          <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
          {bars.map((b, i) => {
            const bw = (gw - 32) / 4;
            const bx = padL + 8 + i * (bw + 6);
            const bh = Math.max(8, b.val * (gh - 22));
            const by = padT + gh - bh;
            const active = i === 0 || i <= activeStages;
            return (
              <g key={b.label} opacity={active ? 1 : 0.25}>
                <rect x={bx} y={by} width={bw - 4} height={bh} rx="3" fill={b.color} />
                <text x={bx + (bw - 4) / 2} y={by - 4} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor">
                  {b.text}
                </text>
                <text x={bx + (bw - 4) / 2} y={H - 6} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor" opacity="0.75">
                  {b.label.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      );
    }

    // Ch 5: Hysteresis, Night-Light Relay Threshold, & Motor PWM Oscilloscope
    if (isSchmitt) {
      const xLow = padL + 0.3 * gw;
      const xHigh = padL + 0.55 * gw;
      const yOn = padT + gh * 0.2;
      const yOff = padT + gh * 0.85;
      const curX = padL + (params.luxLevel / 100) * gw;
      const curY = params.schmittState ? yOn : yOff;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
          <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
          <path
            d={`M ${padL} ${yOn} H ${xHigh} V ${yOff} H ${padL + gw} M ${xHigh} ${yOff} H ${xLow} V ${yOn}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.2"
          />
          <circle cx={curX} cy={curY} r="5.5" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
          <text x={xLow} y={H - 6} textAnchor="middle" fontSize="8.5" fill="#10b981" fontFamily="monospace">
            30% ON
          </text>
          <text x={xHigh} y={H - 6} textAnchor="middle" fontSize="8.5" fill="#ef4444" fontFamily="monospace">
            55% OFF
          </text>
        </svg>
      );
    }

    if (isNightLight) {
      const xThresh = padL + 0.4 * gw;
      const yOn = padT + gh * 0.2;
      const yOff = padT + gh * 0.85;
      const curX = padL + (params.luxLevel / 100) * gw;
      const curY = params.luxLevel <= 40 ? yOn : yOff;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
          <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
          <path d={`M ${padL} ${yOn} H ${xThresh} V ${yOff} H ${padL + gw}`} fill="none" stroke="#38bdf8" strokeWidth="2.4" />
          <circle cx={curX} cy={curY} r="5.5" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
          <text x={xThresh} y={H - 6} textAnchor="middle" fontSize="8.5" fill="#10b981" fontFamily="monospace">
            Seuil LDR 40%
          </text>
        </svg>
      );
    }

    if (isMotorPwm) {
      const duty = params.pwmDuty / 100;
      const yHi = padT + gh * 0.2;
      const yLo = padT + gh * 0.85;
      const p1 = gw * 0.5;
      const hi1 = p1 * duty;
      const pts = `M ${padL} ${yLo} V ${yHi} H ${padL + hi1} V ${yLo} H ${padL + p1} V ${yHi} H ${padL + p1 + hi1} V ${yLo} H ${padL + gw}`;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
          <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
          <path d={pts} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
          <text x={padL - 4} y={yHi + 3} textAnchor="end" fontSize="8.5" fill="#f59e0b" fontFamily="monospace">
            3V
          </text>
          <text x={padL} y={H - 6} fontSize="9.5" fill="currentColor" opacity="0.85">
            PWM {params.pwmDuty}% · I_moy ≈ {sim.icMA.toFixed(0)} mA
          </text>
        </svg>
      );
    }

    // Ch 6: Multivibrator / Chaser / Siren Square Waves
    if (isOsc6) {
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
            {cid === 'ticking-bomb' || params.exampleId === 'siren-tick' ? 'Q1 (NPN)' : 'Q1 (LED1)'}
          </text>
          <text x={padL + 75} y={H - 6} fontSize="9.5" fill="#22c55e">
            {cid === 'ticking-bomb' || params.exampleId === 'siren-tick' ? 'Q2 (PNP)' : 'Q2 (LED2)'}
          </text>
        </svg>
      );
    }

    // Ch 7: Voltage Boost Spike Waveform (Charge Pump, Ferrite Torch, Air-Core Bike Flasher)
    if (isBoost7) {
      const isBike = cid === 'bike-flasher-air' || (!cid && params.exampleId === 'bike-flasher');
      const isPump = cid === 'led-on-1v5' || (!cid && params.exampleId === 'charge-pump');
      const openFault = Boolean(params.openCircuitFault);
      const maxScale = openFault ? 65 : isBike ? 7.5 : 4.5;
      const threshV = isBike ? 6.0 : 3.2;
      const vBaseY = padT + gh - (params.cellVoltage / maxScale) * gh;
      const vPeak = openFault
        ? sim.vc
        : isPump
        ? params.cellVoltage + 1.0
        : isBike
        ? params.cellVoltage >= 0.9
          ? 6.4
          : params.cellVoltage
        : params.cellVoltage >= 0.85
        ? 3.5
        : params.cellVoltage;
      const vPeakY = padT + gh - (Math.min(maxScale - 0.1, vPeak) / maxScale) * gh;
      const ledY = padT + gh - (threshV / maxScale) * gh;
      const wave =
        isPump
          ? `M ${padL} ${vBaseY} H ${padL + gw * 0.45} V ${vPeakY} H ${padL + gw * 0.9} V ${vBaseY} H ${padL + gw}`
          : isBike
          ? sim.conducting || openFault
            ? `M ${padL} ${vBaseY} L ${padL + gw * 0.22} ${vBaseY} L ${padL + gw * 0.26} ${vPeakY} L ${padL + gw * 0.32} ${vBaseY} L ${padL + gw * 0.36} ${vPeakY} L ${padL + gw * 0.42} ${vBaseY} H ${padL + gw}`
            : `M ${padL} ${vBaseY} H ${padL + gw}`
          : `M ${padL} ${vBaseY} L ${padL + gw * 0.25} ${vBaseY} L ${padL + gw * 0.3} ${vPeakY} L ${padL + gw * 0.45} ${vBaseY} L ${padL + gw * 0.65} ${vBaseY} L ${padL + gw * 0.7} ${vPeakY} L ${padL + gw * 0.85} ${vBaseY} H ${padL + gw}`;
      return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
          <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
          <line x1={padL} y1={ledY} x2={padL + gw} y2={ledY} stroke="#10b981" strokeDasharray="4 3" strokeWidth="1.2" />
          <text x={padL - 4} y={ledY + 3} textAnchor="end" fontSize="8.5" fill="#10b981" fontFamily="monospace">
            {isBike ? '6.0V' : '3.2V'}
          </text>
          <text x={padL - 4} y={vBaseY + 3} textAnchor="end" fontSize="8.5" fill="currentColor" opacity="0.7" fontFamily="monospace">
            {params.cellVoltage.toFixed(1)}V
          </text>
          <path d={wave} fill="none" stroke={openFault ? '#ef4444' : '#f59e0b'} strokeWidth="2.4" />
          <text x={padL} y={H - 6} fontSize="9.5" fill={openFault ? '#ef4444' : '#f59e0b'}>
            {openFault
              ? `Pic non clampé = ${vPeak.toFixed(0)} V !`
              : isBike
              ? `Train de flashs V_pic = ${vPeak.toFixed(1)} V`
              : `V_pic = ${vPeak.toFixed(1)} V`}
          </text>
        </svg>
      );
    }

    // Ch 8: Solar Hysteresis or Constant Current Curve
    if (isConstCurrent8 || isSolar8) {
      if (isConstCurrent8) {
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

    // Default Ch 1, 2, 5(other): Linear + Saturation Transfer Curve
    const satX = padL + gw * 0.55;
    const topY = padT + 10;
    const botY = padT + gh;
    const ratio = Math.min(1, sim.icMA / IMAX_9V);
    const dotX = padL + Math.min(1, ratio * 0.55) * gw;
    const dotY = botY - ratio * (botY - topY);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" direction="ltr">
        <rect x={padL} y={padT} width={gw} height={gh} fill="none" stroke="currentColor" strokeOpacity="0.18" />
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

  /* ================= LEFT PANEL: CHAPTER OR CATALOG LIVE SCHEMATIC ================= */
  const renderSchematic = () => {
    // #24 ANALOG MULTIMETER TESTER SCHEMATIC (INTERNAL DIODE MODEL + PROBES)
    if (cid === 'multimeter-tester') {
      const mType = params.mysteryType ?? 'npn_ebc';
      const range = params.meterRange ?? 'x10';
      const rev = Boolean(params.revealPins);
      const labels: Record<1 | 2 | 3, string> =
        mType === 'pnp_bce' ? { 1: 'B', 2: 'C', 3: 'E' } : { 1: 'E', 2: 'B', 3: 'C' };
      return (
        <g>
          {/* Internal Meter Battery + Galvanometer Loop */}
          <rect x="24" y="42" width="110" height="128" rx="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <text x="79" y="60" textAnchor="middle" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="currentColor">
            OHMMÈTRE ({range})
          </text>
          <text x="79" y="84" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#10b981" fontWeight="700">
            Noir = +Batt
          </text>
          <text x="79" y="102" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#ef4444" fontWeight="700">
            Rouge = −Batt
          </text>
          <text x="79" y="148" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#f59e0b">
            {sim.conducting ? 'Courant actif!' : 'Bloqué (R = ∞)'}
          </text>

          {/* Unknown Transistor Symbol */}
          <BjtSymbol cx={240} cy={106} isPnp={mType === 'pnp_bce'} active={sim.conducting} label={rev ? (mType === 'pnp_bce' ? 'PNP' : 'NPN') : '???'} />

          {/* Probe connections */}
          <line x1="134" y1="78" x2="215" y2="78" stroke="#18181b" strokeWidth="2.5" className={sim.conducting ? 'flow-active' : ''} />
          <text x="174" y="72" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fill="currentColor">
            Noir → P{params.blackPin ?? 2} {rev ? `(${labels[params.blackPin ?? 2]})` : ''}
          </text>
          <line x1="134" y1="134" x2="215" y2="134" stroke="#ef4444" strokeWidth="2.5" className={sim.conducting ? 'flow-active' : ''} />
          <text x="174" y="148" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fill="#ef4444">
            Rouge → P{params.redPin ?? 1} {rev ? `(${labels[params.redPin ?? 1]})` : ''}
          </text>

          {range === 'x10k' && params.fingerCB && (
            <text x="240" y="176" textAnchor="middle" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#eab308">
              R_doigt(C–B) → Gain β activé !
            </text>
          )}
        </g>
      );
    }

    // CH 4 / DARLINGTON: 1/2/3 STAGE CASCADE OR 50Hz / STATIC ANTENNA
    if (isDarlington) {
      const stages =
        cid === 'mains-hum' || cid === 'eight-million-gain' || (!cid && (params.exampleId === 'mains-hum' || params.exampleId === 'eight-million'))
          ? 3
          : cid === 'second-simplest' || (!cid && params.exampleId === 'second-simplest')
          ? 2
          : params.stages;
      const xs = [125, 200, 275];
      return (
        <g>
          {/* Power Rails */}
          <line x1="25" y1="24" x2="335" y2="24" stroke="#d97706" strokeWidth="2.2" />
          <line x1="25" y1="196" x2="335" y2="196" stroke="#475569" strokeWidth="2.2" />
          <text x="12" y="28" fontSize="9.5" fontWeight="700" fill="#d97706" fontFamily="monospace">{cid ? '+6V' : '+9V'}</text>
          <text x="12" y="199" fontSize="9.5" fontWeight="700" fill="#64748b" fontFamily="monospace">0V</text>

          {/* Load: LED + 220R into shared collector bus */}
          <line x1="282" y1="24" x2="282" y2="44" stroke="#ef4444" strokeWidth="2" />
          <rect x="274" y="44" width="16" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <text x="296" y="60" fontSize="9" fontFamily="monospace" fill="currentColor">220R</text>
          <polygon points="274,74 290,74 282,88" fill={sim.conducting ? '#f59e0b' : 'none'} stroke="currentColor" strokeWidth="1.8" />
          <line x1="274" y1="88" x2="290" y2="88" stroke="currentColor" strokeWidth="1.8" />
          <line x1="132" y1="98" x2="282" y2="98" stroke="#ef4444" strokeWidth="2" />
          <line x1="282" y1="88" x2="282" y2="98" stroke="#ef4444" strokeWidth="2" />

          {/* Input Sensor (Touch, Static, or ANT) into Q1 Base */}
          <line x1="35" y1="136" x2="107" y2="136" stroke="#0284c7" strokeWidth="2" className={sim.conducting ? 'flow-active' : ''} />
          {cid === 'mains-hum' || (!cid && params.exampleId === 'mains-hum') ? (
            <g>
              <line x1="35" y1="96" x2="35" y2="136" stroke="#eab308" strokeWidth="2.5" />
              <line x1="26" y1="96" x2="35" y2="108" stroke="#eab308" strokeWidth="2" />
              <line x1="44" y1="96" x2="35" y2="108" stroke="#eab308" strokeWidth="2" />
              <text x="35" y="88" textAnchor="middle" fontSize="9" fill="#eab308" fontWeight="700">ANT</text>
            </g>
          ) : cid === 'eight-million-gain' || (!cid && params.exampleId === 'eight-million') ? (
            <g>
              <rect x="25" y="102" width="20" height="34" rx="3" fill="none" stroke="#38bdf8" strokeWidth="2" />
              <text x="35" y="94" textAnchor="middle" fontSize="8" fill="#38bdf8" fontWeight="700">STATIC</text>
            </g>
          ) : (
            <g>
              <circle cx="35" cy="136" r="6" fill="#eab308" />
              <text x="35" y="123" textAnchor="middle" fontSize="8.5" fill="#eab308" fontWeight="700">Touch</text>
            </g>
          )}
          <text x="72" y="128" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fill="#0284c7">
            {sim.ibUA.toFixed(2)}µA
          </text>

          {/* Q1, Q2, Q3 Darlington Cascade */}
          {xs.map((cx, i) => {
            const on = i < stages;
            const isLast = i === stages - 1;
            return (
              <g key={i} opacity={on ? 1 : 0.2}>
                {/* Collector up to Collector Bus */}
                <line x1={cx + 7} y1="98" x2={cx + 7} y2="122" stroke="#ef4444" strokeWidth="2" className={sim.conducting && on ? 'flow-active' : ''} />
                <BjtSymbol cx={cx} cy={136} active={sim.conducting && on} />
                <text x={cx} y="168" textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="700" fill="currentColor">
                  Q{i + 1}
                </text>
                {/* Cascade E -> next B OR last E -> 0V */}
                {!isLast && i < 2 ? (
                  <path
                    d={`M ${cx + 7} 150 L ${cx + 7} 162 L ${xs[i + 1] - 28} 162 L ${xs[i + 1] - 28} 136 L ${xs[i + 1] - 18} 136`}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.2"
                    className={sim.conducting && on ? 'flow-active' : ''}
                  />
                ) : isLast ? (
                  <line x1={cx + 7} y1="150" x2={cx + 7} y2="196" stroke="#10b981" strokeWidth="2.5" className={sim.conducting ? 'flow-active' : ''} />
                ) : null}
              </g>
            );
          })}
          <text x="190" y="188" textAnchor="middle" fontSize="9.5" fontFamily="monospace" fill="#10b981" fontWeight="700">
            Gain β = ×{sim.betaEff.toLocaleString('fr-FR')}
          </text>
        </g>
      );
    }

    // CH 6 / OSCILLATORS: MULTIVIBRATOR 2-LED / 3-LED CHASER / SIREN NPN+PNP
    if (isOsc6) {
      if (cid === 'three-led-chaser' || (!cid && params.exampleId === 'chaser-3led')) {
        const rawIdx = params.oscPhase % 3;
        const activeIdx = params.chaserReverse ? (3 - rawIdx) % 3 : rawIdx;
        const xs = [90, 185, 280];
        return (
          <g>
            <line x1="25" y1="22" x2="335" y2="22" stroke="#d97706" strokeWidth="2.2" />
            <line x1="25" y1="196" x2="335" y2="196" stroke="#475569" strokeWidth="2.2" />
            <text x="12" y="25" fontSize="9" fontWeight="700" fill="#d97706" fontFamily="monospace">+9V</text>
            <text x="12" y="199" fontSize="9" fontWeight="700" fill="#64748b" fontFamily="monospace">0V</text>

            {/* Ring capacitor coupling C1, C2 & return */}
            {[0, 1].map((i) => (
              <g key={i}>
                <line x1={xs[i] + 7} y1="112" x2={xs[i] + 32} y2="112" stroke="#38bdf8" strokeWidth="1.8" />
                <line x1={xs[i] + 32} y1="104" x2={xs[i] + 32} y2="120" stroke="#38bdf8" strokeWidth="2.4" />
                <line x1={xs[i] + 38} y1="104" x2={xs[i] + 38} y2="120" stroke="#38bdf8" strokeWidth="2.4" />
                <path
                  d={`M ${xs[i] + 38} 112 L ${xs[i] + 54} 112 L ${xs[i] + 54} 144 L ${xs[i + 1] - 18} 144`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  className={activeIdx === i + 1 ? 'flow-active' : ''}
                />
              </g>
            ))}
            {/* Wrap return Q3 -> Q1 */}
            <path
              d={`M ${xs[2] + 7} 112 L 325 112 L 325 176 L 45 176 L 45 144 L ${xs[0] - 18} 144`}
              fill="none"
              stroke="#eab308"
              strokeWidth="1.8"
              strokeDasharray="4 3"
              className={activeIdx === 0 ? 'flow-active' : ''}
            />

            {xs.map((cx, i) => {
              const on = activeIdx === i;
              return (
                <g key={i}>
                  <line x1={cx + 7} y1="22" x2={cx + 7} y2="130" stroke="#ef4444" strokeWidth="2" className={on ? 'flow-active' : ''} />
                  <polygon points={`${cx - 1},40 ${cx + 15},40 ${cx + 7},54`} fill={on ? '#ef4444' : 'none'} stroke="currentColor" strokeWidth="1.8" />
                  <line x1={cx - 1} y1="54" x2={cx + 15} y2="54" stroke="currentColor" strokeWidth="1.8" />
                  <rect x={cx + 1} y="66" width="12" height="22" fill="#fbfaf6" stroke="currentColor" strokeWidth="1.5" />
                  <BjtSymbol cx={cx} cy={144} active={on} />
                  <line x1={cx + 7} y1="158" x2={cx + 7} y2="196" stroke="#10b981" strokeWidth="2" className={on ? 'flow-active' : ''} />
                  <text x={cx - 16} y="168" fontSize="9" fontFamily="monospace" fontWeight="700" fill="currentColor">Q{i + 1}</text>
                </g>
              );
            })}
          </g>
        );
      }

      if (cid === 'ticking-bomb' || (!cid && params.exampleId === 'siren-tick')) {
        const pulse = params.oscPhase % 2 === 0;
        return (
          <g>
            <line x1="25" y1="24" x2="335" y2="24" stroke="#d97706" strokeWidth="2.2" />
            <line x1="25" y1="196" x2="335" y2="196" stroke="#475569" strokeWidth="2.2" />
            <text x="12" y="27" fontSize="9" fontWeight="700" fill="#d97706" fontFamily="monospace">+9V</text>
            <text x="12" y="199" fontSize="9" fontWeight="700" fill="#64748b" fontFamily="monospace">0V</text>

            {/* R timing to Q1 Base */}
            <line x1="72" y1="24" x2="72" y2="136" stroke="#0284c7" strokeWidth="1.8" />
            <rect x="65" y="54" width="14" height="28" fill="#fbfaf6" stroke="currentColor" strokeWidth="1.8" />
            <text x="58" y="72" textAnchor="end" fontSize="8.5" fontFamily="monospace" fill="currentColor">{params.oscSpeedR.toFixed(0)}k</text>
            <line x1="72" y1="136" x2="97" y2="136" stroke="#0284c7" strokeWidth="2" className={pulse ? 'flow-active' : ''} />

            {/* Q1 NPN */}
            <BjtSymbol cx={115} cy={136} active={pulse} label="Q1" />
            <line x1="122" y1="150" x2="122" y2="196" stroke="#10b981" strokeWidth="2" className={pulse ? 'flow-active' : ''} />

            {/* Direct coupling Q1(C) -> Q2(B) */}
            <path d="M 122 122 L 122 86 L 217 86" fill="none" stroke="#ef4444" strokeWidth="2" className={pulse ? 'flow-active' : ''} />

            {/* Q2 PNP: Emitter at +9V, Collector to Speaker 8 Ohm -> 0V */}
            <line x1="242" y1="24" x2="242" y2="72" stroke="#d97706" strokeWidth="2.2" className={pulse ? 'flow-active' : ''} />
            <BjtSymbol cx={235} cy={86} isPnp active={pulse} label="Q2 PNP" />
            <line x1="242" y1="100" x2="242" y2="132" stroke="#ef4444" strokeWidth="2" className={pulse ? 'flow-active' : ''} />

            {/* Speaker 8 Ohm */}
            <rect x="234" y="132" width="16" height="26" fill="none" stroke="currentColor" strokeWidth="2" />
            <polygon points="250,132 268,122 268,168 250,158" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="275" y="148" fontSize="9" fontFamily="monospace" fill="currentColor">8Ω</text>
            <line x1="242" y1="158" x2="242" y2="196" stroke="#10b981" strokeWidth="2" />

            {/* Feedback capacitor C_fb from Q2(C) back to Q1(B) */}
            <path d="M 242 118 L 195 118" fill="none" stroke="#38bdf8" strokeWidth="2" />
            <line x1="189" y1="110" x2="189" y2="126" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="195" y1="110" x2="195" y2="126" stroke="#38bdf8" strokeWidth="2.5" />
            <path d="M 189 118 L 72 118" fill="none" stroke="#38bdf8" strokeWidth="2" className="flow-active" />
            <text x="165" y="110" fontSize="8.5" fontFamily="monospace" fill="#38bdf8">C_fb</text>
          </g>
        );
      }

      // Default Ch 6: 2-LED Multivibrator
      const q1On = params.oscPhase % 2 === 0;
      return (
        <g>
          <line x1="25" y1="22" x2="335" y2="22" stroke="#d97706" strokeWidth="2.2" />
          <line x1="25" y1="196" x2="335" y2="196" stroke="#475569" strokeWidth="2.2" />
          <text x="12" y="25" fontSize="9" fontWeight="700" fill="#d97706" fontFamily="monospace">+9V</text>
          <text x="12" y="199" fontSize="9" fontWeight="700" fill="#64748b" fontFamily="monospace">0V</text>

          {/* Q1 Left & Q2 Right */}
          {[
            { cx: 105, on: q1On, color: '#ef4444', idx: 1 },
            { cx: 255, on: !q1On, color: '#22c55e', idx: 2 },
          ].map(({ cx, on, color, idx }) => (
            <g key={idx}>
              <line x1={cx + 7} y1="22" x2={cx + 7} y2="132" stroke="#ef4444" strokeWidth="2" className={on ? 'flow-active' : ''} />
              <polygon points={`${cx - 1},38 ${cx + 15},38 ${cx + 7},52`} fill={on ? color : 'none'} stroke="currentColor" strokeWidth="1.8" />
              <line x1={cx - 1} y1="52" x2={cx + 15} y2="52" stroke="currentColor" strokeWidth="1.8" />
              <rect x={cx + 1} y="64" width="12" height="22" fill="#fbfaf6" stroke="currentColor" strokeWidth="1.5" />

              {/* R_B pull-up */}
              <line x1={cx - 26} y1="22" x2={cx - 26} y2="146" stroke="#0284c7" strokeWidth="1.6" />
              <rect x={cx - 32} y="64" width="12" height="22" fill="#fbfaf6" stroke="currentColor" strokeWidth="1.5" />
              <line x1={cx - 26} y1="146" x2={cx - 18} y2="146" stroke="#0284c7" strokeWidth="1.8" />

              <BjtSymbol cx={cx} cy={146} active={on} />
              <line x1={cx + 7} y1="160" x2={cx + 7} y2="196" stroke="#10b981" strokeWidth="2" className={on ? 'flow-active' : ''} />
              <text x={cx - 16} y="175" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="currentColor">Q{idx}</text>
            </g>
          ))}

          {/* Cross coupling capacitors C1 & C2 */}
          <path d="M 112 104 L 168 104" stroke="#38bdf8" strokeWidth="2" />
          <line x1="168" y1="95" x2="168" y2="113" stroke="#38bdf8" strokeWidth="2.5" />
          <line x1="175" y1="95" x2="175" y2="113" stroke="#38bdf8" strokeWidth="2.5" />
          <path d="M 175 104 L 210 104 L 229 146" fill="none" stroke="#38bdf8" strokeWidth="2" className={!q1On ? 'flow-active' : ''} />

          <path d="M 262 118 L 195 118" stroke="#f59e0b" strokeWidth="2" />
          <line x1="189" y1="109" x2="189" y2="127" stroke="#f59e0b" strokeWidth="2.5" />
          <line x1="195" y1="109" x2="195" y2="127" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M 189 118 L 152 118 L 87 146" fill="none" stroke="#f59e0b" strokeWidth="2" className={q1On ? 'flow-active' : ''} />
        </g>
      );
    }

    // CH 8 / CATALOG POWER: SOLAR CHARGER OR CONSTANT CURRENT SOURCE
    if (isSolar8 || isConstCurrent8) {
      if (isConstCurrent8) {
        const vSense = Math.min(0.62, (sim.icMA / 1000) * params.rSense);
        return (
          <g>
            <line x1="25" y1="24" x2="335" y2="24" stroke="#d97706" strokeWidth="2.2" />
            <line x1="25" y1="196" x2="335" y2="196" stroke="#475569" strokeWidth="2.2" />
            <text x="12" y="27" fontSize="9" fontWeight="700" fill="#d97706" fontFamily="monospace">+{params.supplyV.toFixed(0)}V</text>
            <text x="12" y="199" fontSize="9" fontWeight="700" fill="#64748b" fontFamily="monospace">0V</text>

            {/* +V -> LED -> Q2(C) */}
            <line x1="255" y1="24" x2="255" y2="108" stroke="#ef4444" strokeWidth="2.2" className="flow-active" />
            <polygon points="246,44 264,44 255,60" fill="#f59e0b" stroke="currentColor" strokeWidth="1.8" />
            <line x1="246" y1="60" x2="264" y2="60" stroke="currentColor" strokeWidth="1.8" />

            {/* 10k Bias -> Q2(B) & Q1(C) */}
            <line x1="145" y1="24" x2="145" y2="122" stroke="#0284c7" strokeWidth="2" />
            <rect x="138" y="48" width="14" height="24" fill="#fbfaf6" stroke="currentColor" strokeWidth="1.6" />
            <text x="160" y="64" fontSize="9" fontFamily="monospace" fill="currentColor">10k</text>
            <line x1="145" y1="122" x2="230" y2="122" stroke="#0284c7" strokeWidth="2" className="flow-active" />

            {/* Q1 Reg */}
            <BjtSymbol cx={145} cy={144} active label="Q1" />
            <line x1="152" y1="122" x2="152" y2="130" stroke="#ef4444" strokeWidth="2" />
            <line x1="152" y1="158" x2="152" y2="196" stroke="#10b981" strokeWidth="2" />

            {/* Q2 Pass */}
            <BjtSymbol cx={248} cy={122} active label="Q2" />
            {/* R_sense */}
            <line x1="255" y1="136" x2="255" y2="196" stroke="#10b981" strokeWidth="2.2" className="flow-active" />
            <rect x="247" y="158" width="16" height="26" fill="#fbfaf6" stroke="#d97706" strokeWidth="2" />
            <text x="268" y="174" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#d97706">{params.rSense}Ω</text>

            {/* Feedback line top of R_sense -> Q1 Base */}
            <line x1="127" y1="144" x2="255" y2="144" stroke="#0284c7" strokeWidth="2" strokeDasharray="3 2" className="flow-active" />
            <text x="192" y="139" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fill="#0284c7">
              V_sense = {vSense.toFixed(2)}V
            </text>
          </g>
        );
      }

      // Ch 8 Solar Charger schematic
      const div = params.solarDiverted;
      return (
        <g>
          {/* Solar Panel */}
          <rect x="22" y="34" width="52" height="54" rx="4" fill="none" stroke="#2563eb" strokeWidth="2" />
          <text x="48" y="58" textAnchor="middle" fontSize="9.5" fontFamily="monospace" fontWeight="700" fill="#2563eb">18V</text>
          <text x="48" y="72" textAnchor="middle" fontSize="8" fill="currentColor">Solar</text>
          <line x1="74" y1="54" x2="132" y2="54" stroke="#d97706" strokeWidth="2.4" className="flow-active" />

          {/* Relay K1 Switch */}
          <rect x="122" y="30" width="70" height="58" rx="5" fill="none" stroke="currentColor" strokeDasharray="3 3" strokeWidth="1.4" />
          <circle cx="134" cy="54" r="3" fill="currentColor" />
          <line x1="134" y1="54" x2="178" y2={div ? 40 : 68} stroke="#f59e0b" strokeWidth="3" />
          <text x="157" y="25" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="currentColor">Relais K1</text>

          {/* Top Branch: Dummy Load 100R 5W */}
          <line x1="178" y1="40" x2="245" y2="40" stroke="#f97316" strokeWidth="2" className={div ? 'flow-active' : ''} />
          <rect x="245" y="32" width="44" height="16" fill={div && params.dummyLoadEnabled ? '#f97316' : 'none'} stroke="currentColor" strokeWidth="1.8" />
          <text x="267" y="44" textAnchor="middle" fontSize="8.5" fontFamily="monospace" fill="currentColor">100Ω</text>
          <line x1="289" y1="40" x2="318" y2="40" stroke="#475569" strokeWidth="1.8" />

          {/* Middle Branch: Battery 12V */}
          <line x1="178" y1="68" x2="318" y2="68" stroke="#10b981" strokeWidth="2.2" className={!div ? 'flow-active' : ''} />
          <rect x="292" y="78" width="48" height="44" rx="4" fill="none" stroke="#16a34a" strokeWidth="2" />
          <text x="316" y="102" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#16a34a">
            {params.battVoltage.toFixed(1)}V
          </text>
          <line x1="316" y1="68" x2="316" y2="78" stroke="#16a34a" strokeWidth="2" />

          {/* Q1 driving K1 Coil + Sensing Divider */}
          <rect x="138" y="100" width="38" height="16" fill="none" stroke="#2563eb" strokeWidth="1.6" />
          <text x="157" y="112" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor">K1 Coil</text>
          <line x1="157" y1="116" x2="157" y2="136" stroke="#ef4444" strokeWidth="2" className={div ? 'flow-active' : ''} />
          <BjtSymbol cx={150} cy={150} active={div} label="Q1" />
          <line x1="157" y1="164" x2="157" y2="196" stroke="#10b981" strokeWidth="2" className={div ? 'flow-active' : ''} />

          {/* Divider Battery -> Q1 Base */}
          <path d="M 292 110 L 235 110 L 235 150 L 132 150" fill="none" stroke="#0284c7" strokeWidth="1.8" className={div ? 'flow-active' : ''} />
          <rect x="195" y="143" width="26" height="14" fill="#fbfaf6" stroke="currentColor" strokeWidth="1.5" />
          <text x="208" y="153" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor">1k</text>

          {/* 0V Ground rail */}
          <line x1="25" y1="196" x2="335" y2="196" stroke="#475569" strokeWidth="2.2" />
          <line x1="48" y1="88" x2="48" y2="196" stroke="#475569" strokeWidth="2" />
          <line x1="316" y1="122" x2="316" y2="196" stroke="#475569" strokeWidth="2" />
        </g>
      );
    }

    // CH 2 / CATALOG #7 COMPLEMENTARY LOGIC PROBE (p. 55)
    if (isLogicProbe) {
      const isHigh = params.logicInput === 'HIGH';
      const isLow = params.logicInput === 'LOW';
      return (
        <g>
          <line x1="35" y1="22" x2="315" y2="22" stroke="#d97706" strokeWidth="2.2" />
          <line x1="35" y1="196" x2="315" y2="196" stroke="#475569" strokeWidth="2.2" />
          <text x="15" y="25" fontSize="9.5" fontWeight="700" fill="#d97706" fontFamily="monospace">+3V</text>
          <text x="15" y="199" fontSize="9.5" fontWeight="700" fill="#64748b" fontFamily="monospace">0V</text>

          {/* Probe tip splitting to both bases via 10k */}
          <circle cx="48" cy="110" r="7" fill="#eab308" />
          <text x="48" y="96" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor">
            {params.logicInput}
          </text>
          <line x1="55" y1="110" x2="105" y2="110" stroke="#0284c7" strokeWidth="2" />
          <path d="M 105 110 L 105 68 L 192 68" fill="none" stroke="#0284c7" strokeWidth="1.8" className={isHigh ? 'flow-active' : ''} />
          <path d="M 105 110 L 105 152 L 192 152" fill="none" stroke="#0284c7" strokeWidth="1.8" className={isLow ? 'flow-active' : ''} />
          <rect x="122" y="61" width="26" height="14" fill="#fbfaf6" stroke="currentColor" strokeWidth="1.5" />
          <text x="135" y="71" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor">10k</text>
          <rect x="122" y="145" width="26" height="14" fill="#fbfaf6" stroke="currentColor" strokeWidth="1.5" />
          <text x="135" y="155" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="currentColor">10k</text>

          {/* Top NPN (HIGH -> Red LED) */}
          <line x1="217" y1="22" x2="217" y2="54" stroke="#ef4444" strokeWidth="2" className={isHigh ? 'flow-active' : ''} />
          <polygon points="209,28 225,28 217,42" fill={isHigh ? '#ef4444' : 'none'} stroke="currentColor" strokeWidth="1.8" />
          <BjtSymbol cx={210} cy={68} active={isHigh} label="NPN" />
          <line x1="217" y1="82" x2="217" y2="110" stroke="#10b981" strokeWidth="2" />
          <line x1="217" y1="110" x2="280" y2="110" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Bottom PNP (LOW -> Green LED) */}
          <BjtSymbol cx={210} cy={152} isPnp active={isLow} label="PNP" />
          <line x1="217" y1="110" x2="217" y2="138" stroke="#10b981" strokeWidth="2" />
          <line x1="217" y1="166" x2="217" y2="196" stroke="#22c55e" strokeWidth="2" className={isLow ? 'flow-active' : ''} />
          <polygon points="209,174 225,174 217,188" fill={isLow ? '#22c55e' : 'none'} stroke="currentColor" strokeWidth="1.8" />
        </g>
      );
    }

    // CH 7 / CATALOG BOOSTERS: JOULE THIEF (FERRITE F29) OR BIKE FLASHER (AIR-CORE 30+30T)
    if (
      cid === 'led-torch-1v5' ||
      cid === 'bike-flasher-air' ||
      (!cid && params.chapterId === 7 && (params.exampleId === 'joule-thief' || params.exampleId === 'bike-flasher'))
    ) {
      const isBike = cid === 'bike-flasher-air' || (!cid && params.exampleId === 'bike-flasher');
      return (
        <g>
          <line x1="30" y1="26" x2="310" y2="26" stroke="#d97706" strokeWidth="2.2" />
          <line x1="30" y1="196" x2="310" y2="196" stroke="#475569" strokeWidth="2.2" />
          <text x="20" y="114" fontSize="10" fontFamily="monospace" fontWeight="700" fill="currentColor">
            {params.cellVoltage.toFixed(2)}V
          </text>
          <line x1="56" y1="26" x2="56" y2="196" stroke="currentColor" strokeWidth="2" opacity="0.4" />

          {/* Bifilar Coil L1 & L2 */}
          <path d="M 130 26 L 130 56 Q 145 64 130 72 Q 145 80 130 88 L 130 148 L 210 148" fill="none" stroke="#0284c7" strokeWidth="2.2" className={sim.conducting ? 'flow-active' : ''} />
          <rect x="115" y="54" width="32" height="36" fill="none" stroke={isBike ? '#38bdf8' : '#f59e0b'} strokeDasharray="3 2" />
          <text x="106" y="74" textAnchor="end" fontSize="8.5" fontFamily="monospace" fill="#f59e0b">
            {isBike ? '30t' : 'L2'}
          </text>

          <path d="M 230 26 L 230 56 Q 245 64 230 72 Q 245 80 230 88 L 230 134" fill="none" stroke="#ef4444" strokeWidth="2.2" className={sim.conducting ? 'flow-active' : ''} />
          <text x="248" y="74" fontSize="8.5" fontFamily="monospace" fill="#ef4444">
            {isBike ? '30t Air' : 'L1 F29'}
          </text>

          {/* 1 White LED (Joule Thief) or 2 White LEDs in Series (Bike Flasher) */}
          <line x1="230" y1="108" x2="292" y2="108" stroke="#f59e0b" strokeWidth="2" />
          {isBike ? (
            <g>
              <polygon points="282,114 302,114 292,130" fill={sim.conducting ? '#f8fafc' : 'none'} stroke="#f59e0b" strokeWidth="2" />
              <line x1="282" y1="130" x2="302" y2="130" stroke="currentColor" strokeWidth="2" />
              <polygon points="282,140 302,140 292,156" fill={sim.conducting ? '#f8fafc' : 'none'} stroke="#f59e0b" strokeWidth="2" />
              <line x1="282" y1="156" x2="302" y2="156" stroke="currentColor" strokeWidth="2" />
              <line x1="292" y1="108" x2="292" y2="196" stroke="#f59e0b" strokeWidth="2" className={sim.conducting ? 'flow-active' : ''} />
              <text x="308" y="138" fontSize="8.5" fontFamily="monospace" fill="currentColor">2×3.2V</text>
            </g>
          ) : (
            <g>
              <polygon points="282,126 302,126 292,144" fill={sim.conducting ? '#f8fafc' : 'none'} stroke="#f59e0b" strokeWidth="2" />
              <line x1="282" y1="144" x2="302" y2="144" stroke="currentColor" strokeWidth="2" />
              <line x1="292" y1="108" x2="292" y2="196" stroke="#f59e0b" strokeWidth="2" className={sim.conducting ? 'flow-active' : ''} />
              <text x="308" y="138" fontSize="8.5" fontFamily="monospace" fill="currentColor">3.4V</text>
            </g>
          )}

          <BjtSymbol cx={223} cy={148} active={sim.conducting} label="BC337" />
          <line x1="230" y1="162" x2="230" y2="196" stroke="#10b981" strokeWidth="2.2" className={sim.conducting ? 'flow-active' : ''} />
        </g>
      );
    }

    // DEFAULT ENHANCED SINGLE-TRANSISTOR SCHEMATIC
    const revFlow = isPnp && params.batteryReversed;
    const isRevBat = (cid === 'simplest-tester' || (!cid && params.chapterId === 2)) && params.batteryReversed;
    const isRelayLoad =
      isNightLight || (!cid && params.chapterId === 5 && params.exampleId === 'motor-relay' && params.loadKind === 'relay');
    const isMotorLoad =
      isMotorPwm || (!cid && params.chapterId === 5 && params.exampleId === 'motor-relay' && params.loadKind === 'motor');
    const isTouchLatch = cid === 'touch-switch-globe' || (!cid && params.chapterId === 5 && params.exampleId === 'touch-latch');
    const isClap = cid === 'sound-triggered-led' || (!cid && params.chapterId === 5 && params.exampleId === 'clap-sound');
    const vBatLabel =
      cid === 'led-on-1v5' || (!cid && params.chapterId === 7)
        ? `${params.cellVoltage.toFixed(1)}V`
        : isSelfBias
        ? '5V'
        : cid === 'courtesy-light'
        ? '12V'
        : isNightLight
        ? `${cid === 'night-light' && params.supplySelect6or9 === 6 ? 6 : 12}V`
        : isMotorPwm || cid === 'plant-watering'
        ? '3V'
        : cid === 'worlds-simplest'
        ? `${params.supplySelect6or9 ?? 9}V`
        : '9V';

    return (
      <g>
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
          {isRevBat ? '−' : '+'}
        </text>
        <text x="12" y="138" fontSize="11" fontWeight="700" fill="#64748b">
          {isRevBat ? '+' : '−'}
        </text>
        <text x="48" y="115" fontSize="11" fontFamily="monospace" fill="currentColor" fontWeight="600">
          {vBatLabel}
        </text>

        {/* Collector Branch: Load + Resistor */}
        <line x1="230" y1="26" x2="230" y2="44" stroke="#ef4444" strokeWidth="2" />
        <rect x="222" y="44" width="16" height="32" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="245" y="64" fontSize="10" fontFamily="monospace" fill="currentColor">
          {isSelfBias
            ? 'RL 22k'
            : isRelayLoad
            ? 'Bobine'
            : isMotorLoad
            ? 'Moteur'
            : cid === 'courtesy-light'
            ? 'Bulb 12V'
            : '220R'}
        </text>
        <line x1="230" y1="76" x2="230" y2="96" stroke="#ef4444" strokeWidth="2" />

        {/* Load symbol */}
        {isRelayLoad ? (
          <g>
            <rect x="218" y="96" width="24" height="24" fill="none" stroke="#38bdf8" strokeWidth="2" />
            <text x="250" y="112" fontSize="9.5" fontFamily="monospace" fill="#38bdf8">D1 1N4148</text>
            <line x1="230" y1="120" x2="230" y2="138" stroke="#ef4444" strokeWidth="2" />
          </g>
        ) : isMotorLoad ? (
          <g>
            <circle cx="230" cy="106" r="12" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <text x="230" y="110" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#f59e0b">M</text>
            <line x1="230" y1="118" x2="230" y2="138" stroke="#ef4444" strokeWidth="2" />
          </g>
        ) : isSelfBias ? (
          <g>
            <line x1="230" y1="96" x2="230" y2="138" stroke="#ef4444" strokeWidth="2" />
            <line x1="230" y1="126" x2="275" y2="126" stroke="#f59e0b" strokeWidth="2" />
            <line x1="275" y1="118" x2="275" y2="134" stroke="#f59e0b" strokeWidth="2.4" />
            <line x1="281" y1="118" x2="281" y2="134" stroke="#f59e0b" strokeWidth="2.4" />
            <line x1="281" y1="126" x2="310" y2="126" stroke="#f59e0b" strokeWidth="2" />
            <text x="314" y="130" fontSize="9.5" fontFamily="monospace" fill="#f59e0b">V_out~</text>
          </g>
        ) : (
          <g>
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
          </g>
        )}

        {/* Animated Collector Current */}
        {sim.conducting && (
          <line
            x1="230"
            y1="26"
            x2="230"
            y2="138"
            stroke="#ef4444"
            strokeWidth="3"
            className={revFlow ? 'flow-active-rev' : 'flow-active'}
            opacity="0.7"
          />
        )}

        {/* Base Branch */}
        <line x1="106" y1="26" x2="106" y2="152" stroke="#0284c7" strokeWidth="1.8" opacity="0.5" />
        {isCapScene ? (
          <g>
            <line x1="106" y1="152" x2="142" y2="152" stroke="#0284c7" strokeWidth="2" />
            <line x1="142" y1="140" x2="142" y2="164" stroke="#38bdf8" strokeWidth="2.8" />
            <line x1="150" y1="140" x2="150" y2="164" stroke="#38bdf8" strokeWidth="2.8" />
            <line x1="150" y1="152" x2="210" y2="152" stroke="#0284c7" strokeWidth="2" />
            <text x="146" y="133" textAnchor="middle" fontSize="9.5" fontFamily="monospace" fill="#38bdf8">
              {params.capValueUF}µF
            </text>
          </g>
        ) : (
          <g>
            <rect x="128" y="144" width="38" height="16" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="147" y="138" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="currentColor">
              {isSelfBias
                ? 'RB'
                : isTouchLatch
                ? '4M7'
                : isSchmitt || isNightLight
                ? 'LDR'
                : isMotorPwm
                ? 'PWM'
                : isClap
                ? 'MIC'
                : cid === 'plant-watering'
                ? '220k'
                : 'R_base'}
            </text>
            <line x1="106" y1="152" x2="128" y2="152" stroke="#0284c7" strokeWidth="2" />
            <line x1="166" y1="152" x2="210" y2="152" stroke="#0284c7" strokeWidth="2" />
            {isSelfBias && params.acSignalOn && (
              <text x="95" y="156" textAnchor="end" fontSize="11" fontFamily="monospace" fill="#f59e0b" fontWeight="700">
                ~AC
              </text>
            )}
          </g>
        )}

        {(sim.conducting || sim.ibUA > 0.1) && (
          <line
            x1="106"
            y1="152"
            x2="210"
            y2="152"
            stroke="#0284c7"
            strokeWidth="3"
            className={revFlow ? 'flow-active-rev' : 'flow-active'}
          />
        )}

        {/* Transistor Circle Symbol */}
        <BjtSymbol cx={223} cy={152} isPnp={isPnp} active={sim.conducting} />

        {/* Emitter to GND */}
        <line x1="230" y1="166" x2="230" y2="196" stroke="#10b981" strokeWidth="2.2" />
        {sim.conducting && (
          <line
            x1="230"
            y1="166"
            x2="230"
            y2="196"
            stroke="#10b981"
            strokeWidth="3.2"
            className={revFlow ? 'flow-active-rev' : 'flow-active'}
          />
        )}

        {/* Live Node Voltage Readouts */}
        <g fontFamily="monospace" fontSize="9.5" fontWeight="600">
          <text x="252" y="146" fill="#ef4444">
            V_C = {sim.vc.toFixed(2)}V
          </text>
          <text x="170" y="172" fill="#0284c7">
            I_B {sim.ibUA.toFixed(1)}µA
          </text>
          <text x="252" y="164" fill="#10b981">
            I_C {sim.icMA.toFixed(1)}mA
          </text>
        </g>
      </g>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {/* Schematic SVG */}
      <div className="xl:col-span-7 schematic-grid rounded-xl border border-stone-200 dark:border-stone-800 p-4 flex flex-col justify-between min-h-[305px]">
        <div className="flex items-center justify-between text-xs font-mono-num text-stone-500 dark:text-stone-400 mb-2">
          <span>{lang === 'fr' ? 'SCHÉMA ÉLECTRONIQUE EN DIRECT' : 'المخطط الكهربائي الحيّ'}</span>
          <span className="text-sky-600 dark:text-sky-400">
            {isPnp ? 'BC557 (PNP)' : 'BC547 (NPN)'} · {cid || params.exampleId}
          </span>
        </div>

        <svg
          viewBox="0 0 360 218"
          className="w-full h-auto max-h-[265px]"
          direction="ltr"
          style={{ '--flow-speed': flowSpeed } as React.CSSProperties}
        >
          {renderSchematic()}
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
            {isSelfBias || isOsc6 || isBoost7 || isCapScene || isMotorPwm
              ? lang === 'fr'
                ? 'OSCILLOSCOPE TEMPS RÉEL'
                : 'راسم الإشارة اللحظي'
              : isDarlington
              ? lang === 'fr'
                ? 'MULTIPLICATION DES ÉTAGES'
                : 'تضاعف المراحل'
              : cid === 'multimeter-tester'
              ? lang === 'fr'
                ? 'AIGUILLE DE L’OHMMÈTRE'
                : 'مؤشر الأوميتر التناظري'
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
