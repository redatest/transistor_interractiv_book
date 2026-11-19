import React from 'react';
import { Lang } from '../types';
import { SimParams, SimReadout } from '../utils/physics';

interface Props {
  params: SimParams;
  sim: SimReadout;
  lang: Lang;
  analogyTitle: string;
  analogyText: string;
}

export const WaterValveAnalogy: React.FC<Props> = ({
  params,
  sim,
  lang,
  analogyTitle,
  analogyText,
}) => {
  const cid = params.catalogId;
  const openRatio = sim.conducting ? Math.min(1, Math.max(0.15, sim.brightness)) : 0;
  const leverAngle = -28 + openRatio * 56;

  const renderAnalogyVisual = () => {
    /* #24 ANALOG MULTIMETER TESTER: BACK-TO-BACK CHECK VALVES + x10k FINGER BYPASS */
    if (cid === 'multimeter-tester') {
      const mType = params.mysteryType ?? 'npn_ebc';
      const range = params.meterRange ?? 'x10';
      const bPin = params.blackPin ?? 2;
      const rPin = params.redPin ?? 1;
      const defl = sim.meterDeflection ?? 0;
      const needleDeg = -52 + defl * 104;

      return (
        <svg viewBox="0 0 440 215" className="w-full h-auto max-h-[250px]" direction="ltr">
          {/* Left: Internal BJT Dual Check-Valve Body */}
          <rect x="28" y="26" width="186" height="164" rx="10" fill="rgba(148,163,184,0.12)" stroke="#64748b" strokeWidth="2" />
          <text x="121" y="45" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="currentColor">
            {mType === 'faulty'
              ? lang === 'fr'
                ? 'Clapets crevés (Court-circuit)'
                : 'صمّامان مثقوبان (قصر داخلي)'
              : mType === 'pnp_bce'
              ? 'PNP (← B →)'
              : 'NPN (→ B ←)'}
          </text>

          {/* Pin Nodes P1, P2, P3 */}
          {[1, 2, 3].map((pin) => {
            const y = 64 + (pin - 1) * 44;
            const isBlack = bPin === pin;
            const isRed = rPin === pin;
            const role =
              params.revealPins && mType !== 'faulty'
                ? mType === 'pnp_bce'
                  ? pin === 1
                    ? 'B'
                    : pin === 2
                    ? 'C'
                    : 'E'
                  : pin === 1
                  ? 'E'
                  : pin === 2
                  ? 'B'
                  : 'C'
                : '?';
            return (
              <g key={pin}>
                <circle
                  cx="72"
                  cy={y}
                  r="13"
                  fill={isBlack && isRed ? '#f59e0b' : isBlack ? '#1c1917' : isRed ? '#dc2626' : '#cbd5e1'}
                  stroke="#475569"
                  strokeWidth="1.8"
                />
                <text
                  x="72"
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill={isBlack || isRed ? '#ffffff' : '#1e293b'}
                >
                  P{pin}
                </text>
                <text x="94" y={y + 4} fontSize="10" fontFamily="monospace" fontWeight="700" fill="currentColor">
                  {role !== '?' ? `[${role}]` : ''}
                  {isBlack ? ' Noir(+)' : ''}
                  {isRed ? ' Rouge(−)' : ''}
                </text>
              </g>
            );
          })}

          {/* Finger bypass pipe for x10k */}
          {range === 'x10k' && (
            <g>
              <path
                d="M 176 70 Q 204 108 176 148"
                fill="none"
                stroke={params.fingerCB ? '#f59e0b' : '#94a3b8'}
                strokeWidth={params.fingerCB ? '4' : '2'}
                strokeDasharray={params.fingerCB ? '5 4' : '3 3'}
                className={params.fingerCB ? 'flow-active' : ''}
              />
              <text x="195" y="182" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={params.fingerCB ? '#f59e0b' : '#64748b'}>
                {params.fingerCB
                  ? lang === 'fr'
                    ? 'Fuite doigt C–B (×200)'
                    : 'تسريب الإصبع C–B (×200)'
                  : lang === 'fr'
                  ? 'Doigt C–B levé'
                  : 'الإصبع مرفوع'}
              </text>
            </g>
          )}

          {/* Right: Analog Meter Pressure Gauge */}
          <rect x="242" y="26" width="170" height="164" rx="10" fill="rgba(245,158,11,0.08)" stroke="#d97706" strokeWidth="2" />
          <path d="M 264 134 A 64 64 0 0 1 390 134" fill="none" stroke="#64748b" strokeWidth="3" />
          <text x="262" y="150" fontSize="10" fontFamily="monospace" fill="#64748b">
            ∞
          </text>
          <text x="386" y="150" fontSize="10" fontFamily="monospace" fill="#10b981" fontWeight="700">
            0Ω
          </text>
          <g transform={`translate(327, 146) rotate(${needleDeg})`} className="transition-transform duration-300">
            <line x1="0" y1="0" x2="0" y2="-56" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="0" r="5" fill="#1c1917" />
          </g>
          <text x="327" y="176" textAnchor="middle" fontSize="10.5" fontWeight="700" fontFamily="monospace" fill="currentColor">
            {range === 'x10k' ? '×10k' : '×10'} · {Math.round(defl * 100)}%
          </text>
        </svg>
      );
    }

    /* LIE DETECTOR STAIRCASE (4 DIODE WEIRS: 0.6V -> 2.4V) */
    if (cid === 'lie-detector-staircase' || (params.chapterId === 1 && params.exampleId === 'staircase')) {
      const steps = sim.staircaseLeds;
      return (
        <svg viewBox="0 0 420 205" className="w-full h-auto max-h-[240px]" direction="ltr">
          <text x="28" y="26" fontSize="10.5" fontWeight="700" fill="#38bdf8">
            {lang === 'fr' ? 'Pression peau → hauteur de colonne' : 'ضغط الأصابع ← ارتفاع منسوب الجهد'}
          </text>
          {[0, 1, 2, 3].map((i) => {
            const x = 44 + i * 90;
            const thresholdH = 42 + i * 26;
            const thresholdV = ((i + 1) * 0.6).toFixed(1);
            const active = steps >= i + 1;
            const colors = ['#22c55e', '#eab308', '#f97316', '#ef4444'];
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={168 - thresholdH}
                  width="58"
                  height={thresholdH}
                  rx="4"
                  fill={active ? colors[i] : 'rgba(148,163,184,0.22)'}
                  opacity={active ? 0.78 : 0.6}
                  stroke={active ? colors[i] : '#64748b'}
                  strokeWidth="2"
                />
                <circle cx={x + 29} cy={168 - thresholdH - 18} r="9" fill={active ? colors[i] : '#334155'} stroke="#fff" strokeWidth="1.5" />
                <text x={x + 29} y="188" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="700" fill="currentColor">
                  ≥ {thresholdV}V
                </text>
              </g>
            );
          })}
        </svg>
      );
    }

    /* CH 2 / SIMPLEST TESTER & LOGIC PROBE: CHECK VALVES */
    if (cid === 'logic-probe' || (params.chapterId === 2 && params.exampleId === 'logic-probe')) {
      const isHigh = params.logicInput === 'HIGH';
      const isLow = params.logicInput === 'LOW';
      return (
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          <rect x="40" y="28" width="152" height="54" rx="8" fill={isHigh ? 'rgba(239,68,68,0.18)' : 'rgba(148,163,184,0.15)'} stroke="#ef4444" strokeWidth="2" />
          <text x="116" y="50" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ef4444">
            {lang === 'fr' ? 'Clapet NPN (Entrée HIGH)' : 'صمّام NPN (إشارة عالية)'}
          </text>
          <text x="116" y="68" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="currentColor">
            {isHigh ? 'OUVERT → LED Rouge' : 'Fermé'}
          </text>

          <rect x="40" y="114" width="152" height="54" rx="8" fill={isLow ? 'rgba(34,197,94,0.18)' : 'rgba(148,163,184,0.15)'} stroke="#22c55e" strokeWidth="2" />
          <text x="116" y="136" textAnchor="middle" fontSize="11" fontWeight="700" fill="#22c55e">
            {lang === 'fr' ? 'Clapet PNP (Entrée LOW)' : 'صمّام PNP (إشارة منخفضة)'}
          </text>
          <text x="116" y="154" textAnchor="middle" fontSize="10" fontFamily="monospace" fill="currentColor">
            {isLow ? 'OUVERT → LED Verte' : 'Fermé'}
          </text>

          <line x1="250" y1="28" x2="250" y2="168" stroke="#64748b" strokeWidth="4" />
          <circle cx="250" cy={isHigh ? 45 : isLow ? 150 : 98} r="14" fill={isHigh ? '#ef4444' : isLow ? '#22c55e' : '#eab308'} />
          <text x="276" y={isHigh ? 49 : isLow ? 154 : 102} fontSize="11" fontWeight="700" fill="currentColor">
            {isHigh
              ? lang === 'fr'
                ? 'Pression haute (5V) : ouvre NPN'
                : 'ضغط عالٍ: يفتح NPN'
              : isLow
              ? lang === 'fr'
                ? 'Aspiration basse (0V) : ouvre PNP'
                : 'ضغط منخفض: يفتح PNP'
              : lang === 'fr'
              ? 'Équilibre flottant (0 mA)'
              : 'توازن عائم (0 mA)'}
          </text>
        </svg>
      );
    }

    if (cid === 'simplest-tester' || params.chapterId === 2) {
      const fault = params.testerFault ?? 'ok';
      const isPnp = params.transistorType === 'PNP';
      const flowOk = sim.conducting;
      return (
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          <rect x="175" y="18" width="66" height="164" rx="6" fill="#cbd5e1" opacity="0.25" stroke="#64748b" strokeWidth="2" />
          <text x="208" y="34" textAnchor="middle" fontSize="11" fontWeight="700" fill={params.batteryReversed ? '#64748b' : '#d97706'}>
            {params.batteryReversed ? '− (0 V)' : '+ (+9 V)'}
          </text>
          <text x="208" y="175" textAnchor="middle" fontSize="11" fontWeight="700" fill={params.batteryReversed ? '#d97706' : '#64748b'}>
            {params.batteryReversed ? '+ (+9 V)' : '− (0 V)'}
          </text>

          <g transform={`translate(208, 100)`}>
            {fault === 'short' ? (
              <text x="52" y="-6" fontSize="11" fontWeight="700" fill="#ef4444">
                {lang === 'fr' ? 'Clapet cassé : fuite directe C–E !' : 'صمّام مكسور: تسرّب مباشر C–E!'}
              </text>
            ) : fault === 'open' ? (
              <text x="52" y="-6" fontSize="11" fontWeight="700" fill="#ef4444">
                {lang === 'fr' ? 'Conduit bouché (coupure interne)' : 'أنبوب مسدود (انقطاع داخلي)'}
              </text>
            ) : isPnp ? (
              <>
                <line x1="-28" y1="0" x2="22" y2={flowOk ? -28 : 2} stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
                <text x="52" y="-6" fontSize="11" fontWeight="700" fill="#38bdf8">
                  {lang === 'fr' ? 'Clapet PNP (↑ de E vers C)' : 'صمّام PNP (يتدفق من الأسفل ↑)'}
                </text>
              </>
            ) : (
              <>
                <line x1="-28" y1="0" x2="22" y2={flowOk ? 28 : -2} stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
                <text x="52" y="-6" fontSize="11" fontWeight="700" fill="#ef4444">
                  {lang === 'fr' ? 'Clapet NPN (↓ de C vers E)' : 'صمّام NPN (يتدفق من الأعلى ↓)'}
                </text>
              </>
            )}
          </g>

          {flowOk ? (
            <line
              x1="208"
              y1={isPnp ? 155 : 45}
              x2="208"
              y2={isPnp ? 45 : 155}
              stroke={fault === 'short' ? '#ef4444' : isPnp ? '#38bdf8' : '#ef4444'}
              strokeWidth="4"
              strokeDasharray="6 6"
              className="flow-active"
            />
          ) : (
            <text x="260" y="116" fontSize="11" fontWeight="700" fill="#f43f5e">
              {fault === 'open'
                ? lang === 'fr'
                  ? '× Jonction coupée (0 mA)'
                  : '× وصلة مقطوعة (0 mA)'
                : lang === 'fr'
                ? '× Clapet plaqué fermé (polarité inverse)'
                : '× الصمّام مغلق (قطبية خاطئة)'}
            </text>
          )}
        </svg>
      );
    }

    /* SOUND TRIGGERED LED: DIODE CHECK-VALVE PUMP + 10uF BUFFER TANK */
    if (cid === 'sound-triggered-led') {
      const on = sim.conducting;
      return (
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          <circle cx="62" cy="96" r="24" fill={on ? 'rgba(245,158,11,0.22)' : 'rgba(148,163,184,0.16)'} stroke="#f59e0b" strokeWidth="2" />
          <text x="62" y="100" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="currentColor">
            MIC ×{params.micGain ?? 2}
          </text>
          <line x1="86" y1="96" x2="165" y2="96" stroke="#38bdf8" strokeWidth="5" className={on ? 'flow-active' : ''} />
          {/* 1N4148 one-way check valve */}
          <polygon points="122,82 122,110 144,96" fill="#f59e0b" />
          <line x1="144" y1="82" x2="144" y2="110" stroke="#f59e0b" strokeWidth="3" />
          <text x="133" y="72" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#f59e0b">
            1N4148
          </text>

          {/* 10uF Buffer tank */}
          <rect x="168" y="48" width="76" height="92" rx="6" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
          <rect x="171" y={on ? 62 : 122} width="70" height={on ? 75 : 15} rx="3" fill="#38bdf8" opacity="0.65" />
          <text x="206" y="38" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#38bdf8">
            10 µF Tampon
          </text>

          <line x1="244" y1="96" x2="310" y2="96" stroke={on ? '#22c55e' : '#64748b'} strokeWidth="5" className={on ? 'flow-active' : ''} />
          <circle cx="340" cy="96" r="24" fill={on ? '#facc15' : '#334155'} stroke="#f59e0b" strokeWidth="2" />
          <text x="340" y="138" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="currentColor">
            {on ? 'LED ON!' : lang === 'fr' ? 'En écoute' : 'في الانتظار'}
          </text>
        </svg>
      );
    }

    /* CH 3 / COURTESY LIGHT: ELASTIC RESERVOIR / CAPACITOR FILLING */
    if (cid === 'courtesy-light' || params.chapterId === 3) {
      const doorOpen = Boolean(params.doorOpen);
      const fillPct = doorOpen ? 0 : Math.round(params.capCharge * 100);
      const fillH = Math.max(4, (fillPct / 100) * 74);
      return (
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          <rect x="42" y="54" width="84" height="82" rx="6" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
          <rect x="45" y={133 - fillH} width="78" height={fillH} rx="3" fill="#38bdf8" opacity="0.65" />
          <line x1="42" y1={133 - fillH} x2="126" y2={133 - fillH} stroke="#bae6fd" strokeWidth="2.5" />
          <text x="84" y="44" textAnchor="middle" fontSize="11" fontWeight="700" fill="#38bdf8">
            {params.capValueUF} µF ({fillPct}%)
          </text>

          <rect x="126" y="86" width="90" height="20" fill="#cbd5e1" opacity="0.3" stroke="#0284c7" strokeWidth="1.8" />
          {sim.conducting && (
            <line x1="130" y1="96" x2="212" y2="96" stroke="#38bdf8" strokeWidth="4" className="flow-active" />
          )}

          <rect x="216" y="20" width="54" height="160" rx="4" fill="#cbd5e1" opacity="0.3" stroke="#64748b" strokeWidth="2" />
          <rect x="222" y="22" width="42" height={sim.conducting ? 156 : 70} fill="#ef4444" opacity={sim.conducting ? 0.4 + openRatio * 0.4 : 0.22} />
          <g transform={`translate(243, 96) rotate(${leverAngle})`}>
            <rect x="-22" y="-4.5" width="44" height="9" rx="3" fill="#f59e0b" />
          </g>

          <text x="284" y="74" fontSize="11" fontWeight="700" fill="currentColor">
            {doorOpen
              ? lang === 'fr'
                ? 'Porte ouverte → réservoir vidé (100%)'
                : 'الباب مفتوح ← الخزّان فارغ (100%)'
              : fillPct >= 98
              ? lang === 'fr'
                ? 'Réservoir plein → débit coupé !'
                : 'الخزّان ممتلئ ← توقف التدفق!'
              : sim.conducting
              ? lang === 'fr'
                ? 'Remplissage → vanne ouverte'
                : 'يمتلئ الآن ← الصمّام مفتوح'
              : lang === 'fr'
              ? 'En attente de charge'
              : 'في انتظار بدء الشحن'}
          </text>
          <text x="284" y="96" fontSize="10" fontFamily="monospace" fill="#f59e0b">
            I_C = {sim.icMA.toFixed(1)} mA
          </text>
        </svg>
      );
    }

    /* CH 4 / DARLINGTON & 3-STAGE CASCADE */
    if (
      cid === 'second-simplest' ||
      cid === 'eight-million-gain' ||
      cid === 'mains-hum' ||
      params.chapterId === 4
    ) {
      const stages =
        cid === 'eight-million-gain' || cid === 'mains-hum' || params.exampleId === 'mains-hum' || params.exampleId === 'eight-million'
          ? 3
          : cid === 'second-simplest' || params.exampleId === 'second-simplest'
          ? 2
          : params.stages;
      const pipeWidths = [12, 26, 46];
      return (
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          <text x="22" y="98" fontSize="10" fontWeight="700" fill="#38bdf8">
            {lang === 'fr' ? 'Goutte' : 'قطرة'} ({sim.ibUA.toFixed(2)}µA)
          </text>
          <line x1="42" y1="108" x2="108" y2="108" stroke="#38bdf8" strokeWidth="2" className={sim.conducting ? 'flow-active' : ''} />

          {[0, 1, 2].map((i) => {
            const x = 115 + i * 102;
            const on = i < stages;
            const w = pipeWidths[i];
            return (
              <g key={i} opacity={on ? 1 : 0.22}>
                <rect x={x} y="24" width={w} height="150" rx="4" fill="#cbd5e1" opacity="0.28" stroke="#64748b" strokeWidth="1.8" />
                {sim.conducting && on && (
                  <rect x={x + 3} y="26" width={w - 6} height="146" fill={i === 0 ? '#38bdf8' : i === 1 ? '#f59e0b' : '#ef4444'} opacity="0.7" />
                )}
                <text x={x + w / 2} y="190" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="700" fill="currentColor">
                  Q{i + 1} (×{i === 0 ? '200' : i === 1 ? '40k' : '8M'})
                </text>
                {i < 2 && i + 1 < stages && (
                  <path
                    d={`M ${x + w} 145 L ${x + 102} 108`}
                    stroke="#38bdf8"
                    strokeWidth={2 + i * 1.5}
                    className={sim.conducting ? 'flow-active' : ''}
                    fill="none"
                  />
                )}
              </g>
            );
          })}
        </svg>
      );
    }

    /* MOTOR SPEED CONTROL PWM */
    if (cid === 'motor-speed-control' || (params.chapterId === 5 && params.exampleId === 'motor-pwm')) {
      const duty = params.pwmDuty / 100;
      const spinning = sim.conducting;
      return (
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          <rect x="45" y="84" width="130" height="28" rx="4" fill="#cbd5e1" opacity="0.28" stroke="#64748b" strokeWidth="2" />
          <line
            x1="50"
            y1="98"
            x2="175"
            y2="98"
            stroke="#f59e0b"
            strokeWidth="12"
            strokeDasharray={`${Math.max(8, duty * 36)} ${Math.max(4, (1 - duty) * 36)}`}
            className={spinning ? 'flow-active' : ''}
          />
          <circle cx="245" cy="98" r="38" fill="none" stroke={spinning ? '#64748b' : '#ef4444'} strokeWidth="3" />
          <g
            className={spinning ? 'fan-spin' : ''}
            style={{
              transformOrigin: '245px 98px',
              '--spin-speed': `${Math.max(0.22, 1.4 - duty * 1.15).toFixed(2)}s`,
            } as React.CSSProperties}
          >
            <rect x="241" y="68" width="8" height="60" rx="3" fill={spinning ? '#f59e0b' : '#94a3b8'} />
            <rect x="215" y="94" width="60" height="8" rx="3" fill={spinning ? '#f59e0b' : '#94a3b8'} />
          </g>
          <text x="298" y="92" fontSize="11" fontWeight="700" fill="currentColor">
            {lang === 'fr' ? `Impulsions 3V (${params.pwmDuty}%)` : `نبضات 3V (${params.pwmDuty}%)`}
          </text>
          <text x="298" y="112" fontSize="10" fill={spinning ? '#10b981' : '#ef4444'} fontWeight="700">
            {spinning
              ? lang === 'fr'
                ? 'Pleine force de poussée !'
                : 'عزم دوران كامل!'
              : lang === 'fr'
              ? 'Calé sous charge lourde'
              : 'متوقف تحت الحمل'}
          </text>
        </svg>
      );
    }

    /* LATCHES & THRESHOLDS: TOUCH SWITCH / NIGHT LIGHT / SCHMITT TRIGGER */
    if (
      cid === 'touch-switch-globe' ||
      cid === 'night-light' ||
      cid === 'schmitt-trigger' ||
      params.chapterId === 5
    ) {
      const active = sim.conducting;
      const isTouch = cid === 'touch-switch-globe' || params.exampleId === 'touch-latch';
      const isNight = cid === 'night-light' || params.exampleId === 'night-light';
      return (
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          <rect x="175" y="20" width="56" height="160" rx="4" fill="#cbd5e1" opacity="0.3" stroke="#64748b" strokeWidth="2" />
          <rect x="181" y="22" width="44" height={active ? 156 : 70} fill="#ef4444" opacity={active ? 0.72 : 0.22} />
          <path
            d={active ? 'M 231 140 L 296 140 L 296 96 L 231 96' : 'M 231 140 L 296 140 L 296 122'}
            fill="none"
            stroke="#eab308"
            strokeWidth="4"
            className={active ? 'flow-active' : ''}
          />
          <g transform={`translate(203, 96) rotate(${active ? 26 : -26})`}>
            <rect x="-24" y="-5" width="48" height="10" rx="3" fill="#f59e0b" />
          </g>
          <text x="42" y="96" fontSize="11" fontWeight="700" fill="#38bdf8">
            {isTouch
              ? lang === 'fr'
                ? 'Impulsion ON/OFF →'
                : 'نبضة ON/OFF ←'
              : isNight
              ? lang === 'fr'
                ? 'LDR ≤ 40% →'
                : 'LDR ≤ 40% ←'
              : lang === 'fr'
              ? 'Hystérésis 30/55% →'
              : 'هسترة 30/55% ←'}
          </text>
          <text x="245" y="78" fontSize="11" fontWeight="700" fill="#eab308">
            {active
              ? isNight
                ? lang === 'fr'
                  ? 'Relais Veilleuse ON'
                  : 'المرحّل يعمل ليلاً'
                : lang === 'fr'
                ? 'Verrouillé ON (Boucle rétroaction)'
                : 'مثبّت ON (حلقة التغذية الراجعة)'
              : lang === 'fr'
              ? 'Déverrouillé (OFF)'
              : 'مفتوح / مطفأ (OFF)'}
          </text>
        </svg>
      );
    }

    /* OSCILLATORS & CHASER: ROBOT MAN / 3-LED CHASER / TICKING BOMB */
    if (
      cid === 'robot-man' ||
      cid === 'three-led-chaser' ||
      cid === 'ticking-bomb' ||
      params.chapterId === 6
    ) {
      const isChaser = cid === 'three-led-chaser' || params.exampleId === 'chaser-3led';
      const q1On = params.oscPhase % 2 === 0;
      const tilt = isChaser ? ((params.oscPhase % 3) - 1) * 14 : q1On ? -14 : 14;
      return (
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          <polygon points="210,115 190,175 230,175" fill="#64748b" />
          <g transform={`translate(210, 115) rotate(${tilt})`} className="transition-transform duration-200">
            <rect x="-130" y="-6" width="260" height="12" rx="4" fill="#d97706" />
            <rect x="-125" y="-52" width="54" height="44" rx="4" fill={q1On ? '#ef4444' : '#334155'} stroke="#fca5a5" strokeWidth="2" />
            <text x="-98" y="-26" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
              {cid === 'ticking-bomb' ? 'NPN' : 'Q1'}
            </text>
            <rect x="71" y="-52" width="54" height="44" rx="4" fill={!q1On ? '#22c55e' : '#334155'} stroke="#86efac" strokeWidth="2" />
            <text x="98" y="-26" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
              {cid === 'ticking-bomb' ? 'PNP' : isChaser ? 'Q2/Q3' : 'Q2'}
            </text>
          </g>
          <text x="210" y="34" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
            {isChaser
              ? `Phase ${(params.oscPhase % 3) + 1} / 3 ${params.chaserReverse ? '(Inversé)' : ''}`
              : cid === 'ticking-bomb'
              ? params.sirenMode === 'siren'
                ? lang === 'fr'
                  ? 'Bascule ultra-rapide → Sirène continue !'
                  : 'تذبذب سريع جداً ← صفّارة مستمرة!'
                : lang === 'fr'
                ? 'Impulsion sèche → Tic-Tac sur HP 8Ω'
                : 'نبضات إيقاعية في سماعة 8Ω'
              : q1On
              ? lang === 'fr'
                ? 'Q1 plein → bascule à gauche (LED1 ON)'
                : 'Q1 يمتلئ ← يميل لليسار (LED1)'
              : lang === 'fr'
              ? 'Q2 plein → bascule à droite (LED2 ON)'
              : 'Q2 يمتلئ ← يميل لليمين (LED2)'}
          </text>
        </svg>
      );
    }

    /* 1.5V BOOSTERS: CHARGE PUMP / BIKE FLASHER / FERRITE TORCH */
    if (cid === 'led-on-1v5') {
      const isB = params.pumpPhase === 'B';
      return (
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          <rect x="36" y="122" width="84" height="54" rx="4" fill="#38bdf8" opacity="0.5" stroke="#0284c7" strokeWidth="2" />
          <text x="78" y="153" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
            {params.cellVoltage.toFixed(2)} V
          </text>
          {/* Elevated capacitor 1uF */}
          <rect
            x="148"
            y={isB ? 64 : 122}
            width="78"
            height="54"
            rx="4"
            fill="#f59e0b"
            opacity="0.65"
            stroke="#d97706"
            strokeWidth="2"
            className="transition-all duration-300"
          />
          <text x="187" y={isB ? 95 : 153} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1c1917">
            +1.0 V (1 µF)
          </text>
          <line x1="252" y1="92" x2="292" y2="92" stroke="#ef4444" strokeDasharray="4 3" strokeWidth="2" />
          <text x="272" y="82" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ef4444">
            1.7 V
          </text>
          <rect x="302" y="80" width="88" height="44" rx="6" fill={sim.conducting ? 'rgba(239,68,68,0.28)' : 'rgba(148,163,184,0.16)'} stroke="#ef4444" strokeWidth="2" />
          <text x="346" y="106" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
            {sim.conducting ? `${(params.cellVoltage + 1).toFixed(2)}V ON` : lang === 'fr' ? 'Charge 1µF' : 'شحن 1µF'}
          </text>
        </svg>
      );
    }

    if (cid === 'bike-flasher-air' || cid === 'led-torch-1v5' || params.chapterId === 7) {
      const isBike = cid === 'bike-flasher-air' || params.exampleId === 'bike-flasher';
      const ok = sim.conducting;
      const openFault = Boolean(params.openCircuitFault);
      return (
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          <rect x="30" y="128" width="90" height="50" fill="#38bdf8" opacity="0.5" stroke="#0284c7" strokeWidth="2" />
          <text x="75" y="158" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
            {params.cellVoltage.toFixed(2)} V
          </text>

          <rect x="200" y={isBike ? 36 : 58} width="28" height={isBike ? 142 : 120} fill="#64748b" />
          <text x="214" y={isBike ? 28 : 48} textAnchor="middle" fontSize="10" fontWeight="700" fill="#f59e0b">
            {isBike
              ? lang === 'fr'
                ? 'Double seuil 2 LEDs (6,4 V)'
                : 'حاجز مصباحين (6.4V)'
              : lang === 'fr'
              ? 'Seuil LED (3,2 V)'
              : 'حاجز الـ LED (3.2V)'}
          </text>

          {openFault ? (
            <path d="M 120 140 Q 175 -14 290 10" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray="6 4" className="flow-active" />
          ) : ok ? (
            <path
              d={isBike ? 'M 120 140 Q 175 2 265 66 T 350 155' : 'M 120 140 Q 175 18 265 78 T 350 155'}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="6"
              className="flow-active"
            />
          ) : (
            <path d="M 120 148 L 195 148" fill="none" stroke="#94a3b8" strokeWidth="4" strokeDasharray="4 4" />
          )}

          <rect x="295" y="138" width="94" height="40" rx="4" fill={openFault ? 'rgba(239,68,68,0.28)' : ok ? 'rgba(251,191,36,0.35)' : 'rgba(148,163,184,0.15)'} stroke={openFault ? '#ef4444' : '#f59e0b'} strokeWidth="2" />
          <text x="342" y="162" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="currentColor">
            {openFault ? 'PIC > 50V!' : ok ? (isBike ? 'FLASH 2×LED!' : 'LED ON!') : isBike ? 'Pause / Bas' : lang === 'fr' ? 'Trop bas' : 'أقل من الحاجز'}
          </text>
        </svg>
      );
    }

    /* CONSTANT CURRENT & SOLAR CHARGER */
    if (cid === 'constant-current-source' || (params.chapterId === 8 && params.exampleId === 'constant-current')) {
      const lvl = 35 + ((params.supplyV - 6) / 9) * 85;
      return (
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          <rect x="42" y="28" width="84" height="145" rx="5" fill="none" stroke="#38bdf8" strokeWidth="2" />
          <rect x="45" y={170 - lvl} width="78" height={lvl} fill="#38bdf8" opacity="0.45" />
          <text x="84" y="20" textAnchor="middle" fontSize="10" fontWeight="700" fill="#38bdf8">
            +V = {params.supplyV.toFixed(1)}V
          </text>

          <rect x="126" y="130" width="110" height="26" fill="#cbd5e1" opacity="0.25" stroke="#64748b" strokeWidth="2" />
          <rect x="165" y="130" width="18" height={Math.min(20, 6 + ((params.supplyV - 6) / 9) * 14)} fill="#f59e0b" />
          <text x="180" y="122" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f59e0b">
            {lang === 'fr' ? 'Soupape Q1 pince le débit' : 'صمّام Q1 يضبط التدفق'}
          </text>

          <line x1="236" y1="143" x2="365" y2="143" stroke={sim.warningFr ? '#f97316' : '#10b981'} strokeWidth="6" className="flow-active" />
          <text x="305" y="126" textAnchor="middle" fontSize="11" fontWeight="700" fill={sim.warningFr ? '#f97316' : '#10b981'}>
            I_LED = {sim.icMA.toFixed(1)} mA ({params.ledSeriesCount ?? 1}×LED)
          </text>
        </svg>
      );
    }

    if (cid === 'solar-charger' || params.chapterId === 8) {
      const fillH = Math.max(12, ((params.battVoltage - 11) / 3.5) * 110);
      return (
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          <rect x="150" y="34" width="100" height="136" rx="5" fill="none" stroke="#64748b" strokeWidth="2" />
          <rect x="153" y={167 - fillH} width="94" height={fillH} fill="#22c55e" opacity="0.45" />
          <line x1="140" y1="62" x2="260" y2="62" stroke="#ef4444" strokeDasharray="4 3" strokeWidth="1.8" />
          <text x="266" y="66" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#ef4444">
            13.7V (Coupure)
          </text>
          <line x1="140" y1="112" x2="260" y2="112" stroke="#10b981" strokeDasharray="4 3" strokeWidth="1.8" />
          <text x="266" y="116" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#10b981">
            12.5V (Reprise)
          </text>

          <line
            x1="80"
            y1="42"
            x2="150"
            y2={params.solarDiverted ? 20 : 48}
            stroke="#fbbf24"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <text x="68" y="34" textAnchor="end" fontSize="10" fontWeight="700" fill="#fbbf24">
            {params.sunIntensity ?? 90}% Solar
          </text>
          {params.solarDiverted && (
            <text x="200" y="22" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#f97316">
              → Trop-plein 100 Ω ({(sim.powerW ?? 3.24).toFixed(2)} W)
            </text>
          )}
        </svg>
      );
    }

    /* SELF-BIAS COMMON EMITTER (CEILING 5V / FLOOR 0V) */
    if (cid === 'self-bias-ce' || params.chapterId === 9) {
      const cy = 172 - (sim.vc / 5.0) * 144;
      const ampV = params.acSignalOn ? params.acAmplitude ?? 2.0 : 0.4;
      const ampPx = ampV * (144 / 5.0);
      const hitTop = cy - ampPx < 28;
      const hitBot = cy + ampPx > 172;
      return (
        <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
          <line x1="40" y1="28" x2="380" y2="28" stroke="#ef4444" strokeWidth="3" />
          <text x="44" y="21" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#ef4444">
            Plafond +5,0 V
          </text>
          <line x1="40" y1="172" x2="380" y2="172" stroke="#ef4444" strokeWidth="3" />
          <text x="44" y="188" fontSize="10" fontFamily="monospace" fontWeight="700" fill="#ef4444">
            Plancher 0,0 V
          </text>
          <line x1="40" y1="100" x2="380" y2="100" stroke="#10b981" strokeDasharray="5 4" strokeWidth="1.5" />
          <text x="378" y="94" textAnchor="end" fontSize="10" fontFamily="monospace" fill="#10b981">
            Centre idéal 2,50 V
          </text>

          <rect
            x="160"
            y={Math.max(28, cy - ampPx)}
            width="60"
            height={Math.min(172, cy + ampPx) - Math.max(28, cy - ampPx)}
            rx="6"
            fill={hitTop || hitBot ? 'rgba(239, 68, 68, 0.28)' : 'rgba(16, 185, 129, 0.28)'}
            stroke={hitTop || hitBot ? '#ef4444' : '#10b981'}
            strokeWidth="2"
          />
          <circle cx="190" cy={cy} r="9" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
          <text x="234" y={cy + 4} fontSize="11" fontWeight="700" fill="currentColor">
            Q = {sim.vc.toFixed(2)} V ·{' '}
            {hitTop || hitBot
              ? lang === 'fr'
                ? 'Écrêtage contre la butée !'
                : 'ارتطام وتشويه بالموجة!'
              : lang === 'fr'
              ? 'Excursion libre !'
              : 'حركة حرة بلا تشويه!'}
          </text>
        </svg>
      );
    }

    /* DEFAULT & PLANT WATERING & WORLD'S SIMPLEST: CLASSIC HYDRAULIC VALVE */
    return (
      <svg viewBox="0 0 420 200" className="w-full h-auto max-h-[240px]" direction="ltr">
        <rect x="195" y="16" width="56" height="168" rx="4" fill="#cbd5e1" opacity="0.35" stroke="#64748b" strokeWidth="2" />
        <rect
          x="201"
          y="18"
          width="44"
          height={sim.conducting ? 164 : 74}
          fill="#ef4444"
          opacity={sim.conducting ? 0.35 + openRatio * 0.45 : 0.25}
        />
        <rect x="40" y="86" width="155" height="24" rx="3" fill="#cbd5e1" opacity="0.35" stroke="#0284c7" strokeWidth="2" />
        <rect
          x="42"
          y="90"
          width={sim.ibUA > 0.1 ? 151 : 40}
          height="16"
          fill="#0284c7"
          opacity={sim.ibUA > 0.1 ? 0.65 : 0.2}
        />
        <g transform={`translate(223, 98) rotate(${leverAngle})`}>
          <rect x="-24" y="-5" width="48" height="10" rx="3" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="5" fill="#1c1917" />
        </g>
        {sim.conducting && (
          <g stroke="#fff" strokeWidth="2.5" strokeDasharray="6 8" className="flow-active" opacity="0.8">
            <line x1="215" y1="22" x2="215" y2="180" />
            <line x1="231" y1="22" x2="231" y2="180" />
            <line x1="48" y1="98" x2="188" y2="98" stroke="#bae6fd" />
          </g>
        )}
        <text x="264" y="34" fontSize="12" fontWeight="700" fill="#ef4444">
          Collector (C) · {sim.icMA.toFixed(1)} mA
        </text>
        <text x="264" y="176" fontSize="12" fontWeight="700" fill="#10b981">
          Emitter (E) · {(sim.icMA + sim.ibUA / 1000).toFixed(1)} mA
        </text>
        <text x="42" y="76" fontSize="12" fontWeight="700" fill="#0284c7">
          {cid === 'plant-watering'
            ? `Sondes terre · ${sim.ibUA.toFixed(1)} µA`
            : `Base (B) · ${sim.ibUA.toFixed(1)} µA`}
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
    );
  };

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-5 flex flex-col gap-4">
      <div>
        <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">{analogyTitle}</h4>
        <p className="text-sm text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">{analogyText}</p>
      </div>

      <div className="bg-stone-50 dark:bg-stone-950/60 rounded-lg border border-stone-200/80 dark:border-stone-800 p-4" dir="ltr">
        {renderAnalogyVisual()}
      </div>
    </div>
  );
};
