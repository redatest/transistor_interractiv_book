import React, { useState, useRef } from 'react';
import { RotateCcw, MousePointerClick } from 'lucide-react';
import { Lang } from '../types';
import { SimParams, SimReadout } from '../utils/physics';

interface Props {
  params: SimParams;
  sim: SimReadout;
  lang: Lang;
  onQuickAction?: (action: string) => void;
}

interface InspectedPart {
  name: string;
  roleFr: string;
  roleAr: string;
}

const PART_INFO: Record<string, InspectedPart> = {
  Q1: {
    name: 'BC547 / BC337 (NPN)',
    roleFr: 'Transistor NPN : lorsque V_B dépasse V_E d’environ 0,6 V, un faible courant I_B commande un fort courant I_C de C vers E.',
    roleAr: 'ترانزستور NPN: عندما يتجاوز جهد القاعدة V_B جهد الباعث V_E بنحو 0.6V، يفتح تياراً كبيراً من المجمّع C إلى الباعث E.',
  },
  Q2: {
    name: 'Transistor de puissance / 2e étage (Q2)',
    roleFr: 'Amplifie ou commute le courant issu du 1er étage : sa jonction Base-Émetteur suit le potentiel du transistor pilote.',
    roleAr: 'الترانزستور الثاني Q2: يضخّم أو يعكس إشارة المرحلة الأولى، ويتبع جهده عند الأقطاب (C, B, E) حالة الترانزستور الأول.',
  },
  PNP: {
    name: 'BC557 / BC327 (PNP)',
    roleFr: 'Transistor PNP : l’émetteur E est au (+) ; lorsque V_B descend à ~0,6 V sous V_E, le courant sort de B et circule de E vers C.',
    roleAr: 'ترانزستور PNP: يتصل الباعث E بالقطب الموجب (+)؛ وعندما ينخفض V_B بمقدار 0.6V عن V_E يمر التيار من E إلى C.',
  },
  R220: {
    name: 'R2 · 220 Ω (Rouge-Rouge-Marron)',
    roleFr: 'Résistance de limitation : protège la LED en plafonnant le courant à ~31,8 mA sous 9 V.',
    roleAr: 'مقاومة حماية: تحدّ من تيار الـ LED عند ~31.8mA لتمنع احتراقه.',
  },
  RSENSE: {
    name: 'R_sense (22 Ω / 47 Ω / 120 Ω)',
    roleFr: 'Résistance de mesure en émetteur : dès que U = I_C × R_sense atteint 0,62 V, Q1 entre en conduction et bride Q2.',
    roleAr: 'مقاومة استشعار التيار: ما إن يبلغ الجهد عبرها 0.62V حتى يفتح الترانزستور Q1 ليمنع زيادة تيار Q2.',
  },
  CAP: {
    name: 'Condensateur électrolytique / couplage',
    roleFr: 'Stocke la charge électrique et transmet les variations brusques de tension d’un collecteur C vers la base B voisine.',
    roleAr: 'مكثف توقيت/ربط: يخزّن الشحنة وينقل التغيّرات اللحظية في الجهد من مجمّع C إلى قاعدة B المجاورة.',
  },
  LDR: {
    name: 'LDR ORP12 (Photorésistance)',
    roleFr: 'Sa résistance chute à la lumière (< 1 kΩ) et grimpe dans le noir (> 1 MΩ), modifiant la tension sur la base B.',
    roleAr: 'مقاومة ضوئية: تنخفض مقاومتها في الضوء وترتفع جداً في الظلام، مما يغيّر الجهد عند القاعدة B.',
  },
  RELAY: {
    name: 'Relais 12 V + Diode 1N4148',
    roleFr: 'Bobine reliée entre +V et le collecteur C de Q1 ; la diode D1 absorbe la surtension inverse à l’ouverture.',
    roleAr: 'مرحّل كهرومغناطيسي موصول بين الموجب والمجمّع C؛ الدايود D1 يمتص نبضة الارتداد عند فصل الملف.',
  },
  COIL: {
    name: 'Bobine élévatrice bifilaire (Air / Ferrite)',
    roleFr: 'L’enroulement L1 alimente le collecteur C et L2 réinjecte l’impulsion vers la base B pour générer des pics > 3,4 V.',
    roleAr: 'ملف رفع الجهد المزدوج: L1 يغذي المجمّع C و L2 يغذّي القاعدة B عكسياً لتوليد نبضات تفوق 3.4V.',
  },
  SOLAR: {
    name: 'Panneau solaire 18 V (28 cellules)',
    roleFr: 'Chaque cellule fournit ~0,6 V (28 × 0,6 ≈ 16,8–18 V) pour dépasser les 13,7 V de la batterie.',
    roleAr: 'لوح شمسي 18V (٢٨ خلية × 0.6V) ليتجاوز جهد البطارية (13.7V) أثناء الشحن.',
  },
  DUMMY: {
    name: 'Charge factice 100 Ω / 5 W',
    roleFr: 'Dissipateur thermique : absorbe P = 18²/100 = 3,24 W quand Q1 active le relais K1 à 13,7 V.',
    roleAr: 'حِمل وهمي 100Ω: يبدّد قدرة 3.24W على شكل حرارة عندما يفعّل Q1 المرحّل عند 13.7V.',
  },
  FB4M7: {
    name: 'Résistance de maintien 4,7 MΩ',
    roleFr: 'Boucle de rétroaction positive : maintient le potentiel de la base B au-dessus de 0,6 V après le retrait du doigt.',
    roleAr: 'مقاومة التغذية الراجعة 4M7: تحافظ على جهد القاعدة B فوق 0.6V بعد رفع الإصبع عن لوح ON.',
  },
};

interface TransistorProps {
  cx: number;
  topY: number;
  label: string;
  sub: string;
  compId?: string;
  active: boolean;
  dimmed?: boolean;
  vE?: string;
  vB?: string;
  vC?: string;
  isPnp?: boolean;
  onSelect: (id: string) => void;
}

const TransistorTO92: React.FC<TransistorProps> = ({
  cx,
  topY,
  label,
  sub,
  compId = 'Q1',
  active,
  dimmed = false,
  vE,
  vB,
  vC,
  isPnp = false,
  onSelect,
}) => {
  const padY = topY + 74;
  const pinE = cx - 26;
  const pinB = cx;
  const pinC = cx + 26;

  return (
    <g
      data-comp={compId}
      onClick={() => onSelect(compId)}
      opacity={dimmed ? 0.28 : 1}
      className="cursor-pointer"
    >
      {/* Conducting halo behind package */}
      {active && !dimmed && (
        <rect
          x={cx - 46}
          y={topY - 4}
          width={92}
          height={58}
          rx="10"
          fill="none"
          stroke={isPnp ? '#38bdf8' : '#fbbf24'}
          strokeWidth="1.6"
          strokeDasharray="4 3"
          opacity="0.7"
        />
      )}

      {/* Metallic legs extending to copper pads */}
      <line x1={pinE} y1={topY + 48} x2={pinE} y2={padY} stroke="#cbd5e1" strokeWidth="4" />
      <line x1={pinB} y1={topY + 48} x2={pinB} y2={padY} stroke="#cbd5e1" strokeWidth="4" />
      <line x1={pinC} y1={topY + 48} x2={pinC} y2={padY} stroke="#cbd5e1" strokeWidth="4" />

      {/* Copper Solder Pads */}
      <circle cx={pinE} cy={padY} r="6.5" fill="#d4af37" stroke="#1c1917" strokeWidth="1.2" />
      <circle cx={pinE} cy={padY} r="2.6" fill="#22c55e" />

      <circle cx={pinB} cy={padY} r="6.5" fill="#d4af37" stroke="#1c1917" strokeWidth="1.2" />
      <circle cx={pinB} cy={padY} r="2.6" fill="#38bdf8" />

      <circle cx={pinC} cy={padY} r="6.5" fill="#d4af37" stroke="#1c1917" strokeWidth="1.2" />
      <circle cx={pinC} cy={padY} r="2.6" fill="#ef4444" />

      {/* Transistor Package Body */}
      <rect
        x={cx - 42}
        y={topY}
        width={84}
        height={50}
        rx="7"
        fill="#18181b"
        stroke={active ? '#fbbf24' : '#71717a'}
        strokeWidth="2"
      />
      <text x={cx} y={topY + 21} textAnchor="middle" fill="#f4f4f5" fontSize="11.5" fontWeight="700" fontFamily="monospace">
        {label}
      </text>
      <text x={cx} y={topY + 37} textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="monospace">
        {sub}
      </text>

      {/* Pin E, B, C crisp badges right next to the metallic pins */}
      <text x={pinE - 9} y={topY + 63} textAnchor="end" fill="#6fe39a" fontSize="10.5" fontWeight="700" fontFamily="monospace">
        E
      </text>
      <text x={pinB + 7} y={topY + 63} textAnchor="start" fill="#5ab0ff" fontSize="10.5" fontWeight="700" fontFamily="monospace">
        B
      </text>
      <text x={pinC + 9} y={topY + 63} textAnchor="start" fill="#ff7868" fontSize="10.5" fontWeight="700" fontFamily="monospace">
        C
      </text>

      {/* Live pin voltage readouts cleanly positioned just below the pads */}
      {vE && (
        <text x={pinE} y={padY + 16} textAnchor="middle" fill="#86efac" fontSize="8.2" fontFamily="monospace" fontWeight="700">
          {vE}
        </text>
      )}
      {vB && (
        <text x={pinB} y={padY + 16} textAnchor="middle" fill="#7dd3fc" fontSize="8.2" fontFamily="monospace" fontWeight="700">
          {vB}
        </text>
      )}
      {vC && (
        <text x={pinC} y={padY + 16} textAnchor="middle" fill="#fca5a5" fontSize="8.2" fontFamily="monospace" fontWeight="700">
          {vC}
        </text>
      )}
    </g>
  );
};

export const InteractiveBoard3D: React.FC<Props> = ({ params, sim, lang, onQuickAction }) => {
  const [rot, setRot] = useState({ rx: 28, rz: -6 });
  const [inspected, setInspected] = useState<string>('Q1');
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 });

  const flowSpeed = sim.conducting
    ? `${Math.max(0.28, 1.3 - sim.brightness * 0.95).toFixed(2)}s`
    : '1.2s';

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button,[data-comp]')) return;
    dragRef.current = { active: true, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    dragRef.current.x = e.clientX;
    dragRef.current.y = e.clientY;
    setRot((prev) => ({
      rx: Math.max(8, Math.min(54, prev.rx - dy * 0.35)),
      rz: Math.max(-35, Math.min(35, prev.rz + dx * 0.35)),
    }));
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  const part = PART_INFO[inspected] || PART_INFO.Q1;
  const isNpn = params.chapterId === 2 ? params.transistorType === 'NPN' : true;
  const ledGlow = sim.conducting ? Math.max(0.25, sim.brightness) : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* 3D Cutting Mat Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="workbench-mat relative h-[350px] sm:h-[395px] w-full rounded-xl overflow-hidden border border-stone-700/40 select-none cursor-grab active:cursor-grabbing flex items-center justify-center"
        style={{ perspective: '950px', touchAction: 'pan-y' }}
      >
        {/* Top HUD inside Mat */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none" dir="ltr">
          <div className="bg-black/60 backdrop-blur-xs text-stone-100 text-xs px-2.5 py-1 rounded-md font-mono-num flex items-center gap-2 pointer-events-auto">
            <span className="text-sky-400">V_BE {sim.vbe.toFixed(2)}V</span>
            <span className="text-stone-500">·</span>
            <span className="text-rose-400">V_CE {sim.vce.toFixed(2)}V</span>
            <span className="text-stone-500">·</span>
            <span className="text-emerald-400">I_C {sim.icMA.toFixed(1)}mA</span>
          </div>
          <button
            type="button"
            onClick={() => setRot({ rx: 28, rz: -6 })}
            className="pointer-events-auto bg-black/60 hover:bg-black/80 text-stone-100 text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            title={lang === 'fr' ? 'Réinitialiser l’angle' : 'إعادة ضبط الزاوية'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Vue 3D' : 'زاوية 3D'}</span>
          </button>
        </div>

        {/* Tilted 3D PCB SVG */}
        <div
          className="transition-transform duration-150 ease-out w-[94%] max-w-[540px]"
          style={{
            transform: `rotateX(${rot.rx}deg) rotateZ(${rot.rz}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <svg
            viewBox="0 0 520 315"
            className="w-full h-auto drop-shadow-[0_22px_26px_rgba(0,0,0,0.62)]"
            direction="ltr"
            style={{ '--flow-speed': flowSpeed } as React.CSSProperties}
          >
            <defs>
              <filter id="ledGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="pcbGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0f6b46" />
                <stop offset="100%" stopColor="#094a2f" />
              </linearGradient>
              <linearGradient id="pcbEdge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#063420" />
                <stop offset="100%" stopColor="#031d12" />
              </linearGradient>
              {/* Directional current markers */}
              <marker id="arrRed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#ff6b5a" />
              </marker>
              <marker id="arrBlue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#5ab0ff" />
              </marker>
              <marker id="arrGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#6fe39a" />
              </marker>
              <marker id="arrGold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#ffd24a" />
              </marker>
            </defs>

            {/* PCB 3D thickness edge */}
            <rect x="18" y="22" width="484" height="282" rx="10" fill="url(#pcbEdge)" />
            {/* PCB Main Surface */}
            <rect
              x="18"
              y="12"
              width="484"
              height="282"
              rx="10"
              fill="url(#pcbGrad)"
              stroke="#d6be78"
              strokeWidth="2.5"
            />
            {/* Corner mounting holes */}
            {[
              [33, 27],
              [487, 27],
              [33, 279],
              [487, 279],
            ].map(([cx, cy], idx) => (
              <g key={idx}>
                <circle cx={cx} cy={cy} r="6.5" fill="#c8a951" />
                <circle cx={cx} cy={cy} r="3.2" fill="#133b3f" />
              </g>
            ))}

            {/* Silkscreen Legend */}
            <text x="50" y="287" fill="#d9f2e3" fontSize="8.5" fontFamily="monospace" opacity="0.88">
              ● B (Base)  ● C (Collecteur)  ● E (Émetteur)
            </text>
            <text x="470" y="287" textAnchor="end" fill="#d9f2e3" fontSize="8.5" fontFamily="monospace" opacity="0.75">
              LIVRE VIVANT · PCB 3D
            </text>

            {/* ================= CHAPTER 4: DARLINGTON 1/2/3 STAGES & MAINS HUM 50Hz ================= */}
            {params.chapterId === 4 ? (
              (() => {
                const activeStages = params.exampleId === 'mains-hum' ? 3 : params.stages;
                const qX = [175, 285, 395];
                const topY = 114;
                const padY = topY + 74; // 188
                const lastIdx = activeStages - 1;
                const lastEX = qX[lastIdx] - 26;

                return (
                  <g>
                    {/* Power Rails: +9V top & 0V GND bottom */}
                    <path d="M 88 46 L 448 46" stroke="#ffd24a" strokeWidth="4.5" opacity="0.35" fill="none" />
                    {sim.conducting && (
                      <path
                        d="M 88 46 L 448 46"
                        stroke="#ffd24a"
                        strokeWidth="3.5"
                        fill="none"
                        className="flow-active"
                        markerMid="url(#arrGold)"
                      />
                    )}
                    <text x="102" y="38" fill="#fde047" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      +9 V
                    </text>

                    {/* Bottom 0V Ground Rail (routed clean around ANT/Touch at x=50) */}
                    <path d={`M ${lastEX} 266 L 52 266 L 52 108`} stroke="#6fe39a" strokeWidth="4.5" opacity="0.32" fill="none" />
                    {sim.conducting && (
                      <path
                        d={`M ${lastEX} 266 L 52 266 L 52 108`}
                        stroke="#6fe39a"
                        strokeWidth="3.5"
                        fill="none"
                        className="flow-active"
                      />
                    )}
                    <text x="68" y="260" fill="#86efac" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      0 V (−)
                    </text>

                    {/* Collector Bus at y=90 fed by LED cathode -> enters each active Q(C) pad */}
                    <path d="M 448 64 L 448 90 L 201 90" stroke="#ff6b5a" strokeWidth="4" opacity="0.32" fill="none" />
                    {sim.conducting && (
                      <path d="M 448 64 L 448 90 L 201 90" stroke="#ff6b5a" strokeWidth="3.5" fill="none" className="flow-active" />
                    )}

                    {/* Individual C traces dropping from y=90 to C pad (x+26, 188) */}
                    {qX.map((cx, i) => {
                      const onStage = i < activeStages;
                      const pinC = cx + 26;
                      return (
                        <g key={`c-${i}`} opacity={onStage ? 1 : 0.2}>
                          <path
                            d={`M ${pinC} 90 L ${cx + 46} 90 L ${cx + 46} ${padY} L ${pinC} ${padY}`}
                            stroke="#ff6b5a"
                            strokeWidth="3.5"
                            opacity="0.35"
                            fill="none"
                          />
                          {sim.conducting && onStage && (
                            <path
                              d={`M ${pinC} 90 L ${cx + 46} 90 L ${cx + 46} ${padY} L ${pinC} ${padY}`}
                              stroke="#ff6b5a"
                              strokeWidth="3"
                              fill="none"
                              className="flow-active"
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* Input Sensor -> Q1 Base (B = 175, 188) */}
                    <path d="M 106 218 L 175 218 L 175 188" stroke="#5ab0ff" strokeWidth="2.5" opacity="0.4" fill="none" />
                    {(sim.conducting || sim.ibUA > 0) && (
                      <path
                        d="M 106 218 L 175 218 L 175 188"
                        stroke="#5ab0ff"
                        strokeWidth="2.2"
                        fill="none"
                        className="flow-active"
                        markerEnd="url(#arrBlue)"
                      />
                    )}
                    <text x="134" y="212" textAnchor="middle" fill="#7dd3fc" fontSize="8" fontFamily="monospace">
                      {sim.ibUA.toFixed(2)}µA
                    </text>

                    {/* Darlington Cascade Links: Q1(E) -> Q2(B) and Q2(E) -> Q3(B) */}
                    {[0, 1].map((i) => {
                      const linkActive = i + 1 < activeStages;
                      const fromE = qX[i] - 26;
                      const toB = qX[i + 1];
                      const pathD = `M ${fromE} ${padY} L ${fromE} 232 L ${toB} 232 L ${toB} ${padY}`;
                      return (
                        <g key={`link-${i}`} opacity={linkActive ? 1 : 0.16}>
                          <path d={pathD} stroke="#38bdf8" strokeWidth={3 + i * 1.2} opacity="0.35" fill="none" />
                          {sim.conducting && linkActive && (
                            <path
                              d={pathD}
                              stroke="#38bdf8"
                              strokeWidth={2.8 + i * 1.2}
                              fill="none"
                              className="flow-active"
                              markerMid="url(#arrBlue)"
                            />
                          )}
                          {linkActive && (
                            <text x={(fromE + toB) / 2} y="244" textAnchor="middle" fill="#bae6fd" fontSize="8.2" fontFamily="monospace">
                              E{i + 1}→B{i + 2} (×{i === 0 ? '200' : '40k'})
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Final Active Emitter -> 0V Ground */}
                    <path d={`M ${lastEX} ${padY} L ${lastEX} 266`} stroke="#6fe39a" strokeWidth="4.5" opacity="0.4" fill="none" />
                    {sim.conducting && (
                      <path
                        d={`M ${lastEX} ${padY} L ${lastEX} 266`}
                        stroke="#6fe39a"
                        strokeWidth="4"
                        fill="none"
                        className="flow-active"
                        markerEnd="url(#arrGreen)"
                      />
                    )}

                    {/* Battery Block on Left */}
                    <rect x="36" y="38" width="54" height="70" rx="6" fill="#15803d" stroke="#bbf7d0" strokeWidth="2" />
                    <text x="63" y="67" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700" fontFamily="monospace">
                      +  −
                    </text>
                    <text x="63" y="90" textAnchor="middle" fill="#dcfce7" fontSize="10" fontFamily="monospace">
                      9V
                    </text>

                    {/* Antenna / Touch Pad */}
                    {params.exampleId === 'mains-hum' ? (
                      <g>
                        <rect x="70" y="164" width="38" height="62" rx="5" fill="#eab308" stroke="#fef08a" strokeWidth="2" />
                        <text x="89" y="199" textAnchor="middle" fill="#1c1917" fontSize="10" fontWeight="700">
                          ANT
                        </text>
                        {sim.conducting && (
                          <circle cx="89" cy="195" r="26" fill="none" stroke="#fde047" strokeWidth="2" strokeDasharray="4 4" />
                        )}
                      </g>
                    ) : (
                      <g>
                        <circle cx="92" cy="218" r="14" fill="#eab308" stroke="#fef08a" strokeWidth="2" />
                        <text x="92" y="196" textAnchor="middle" fill="#fef08a" fontSize="9.5" fontWeight="700">
                          Touch
                        </text>
                      </g>
                    )}

                    {/* 220R & LED on Top Right */}
                    <g data-comp="R220" onClick={() => setInspected('R220')} className="cursor-pointer">
                      <rect x="305" y="36" width="70" height="20" rx="4" fill="#e7d6ac" stroke="#78350f" />
                      <text x="340" y="50" textAnchor="middle" fill="#1c1917" fontSize="10" fontWeight="700" fontFamily="monospace">
                        220 Ω
                      </text>
                    </g>
                    <circle
                      cx="448"
                      cy="46"
                      r="17"
                      fill={ledGlow > 0.05 ? `rgba(255, 204, 0, ${0.28 + ledGlow * 0.72})` : '#422006'}
                      stroke="#fde047"
                      strokeWidth="2.5"
                      filter={ledGlow > 0.1 ? 'url(#ledGlow)' : undefined}
                    />
                    <text x="448" y="50" textAnchor="middle" fill={ledGlow > 0.35 ? '#1c1917' : '#fef08a'} fontSize="9.5" fontWeight="700">
                      LED
                    </text>

                    {/* Q1, Q2, Q3 Packages with live pin voltages */}
                    {qX.map((cx, idx) => {
                      const onStage = idx < activeStages;
                      const stepsLeft = activeStages - idx;
                      const vbVal = sim.conducting && onStage ? `${(stepsLeft * 0.6).toFixed(1)}V` : '0V';
                      const veVal = sim.conducting && onStage ? `${((stepsLeft - 1) * 0.6).toFixed(1)}V` : '0V';
                      const vcVal = sim.conducting && onStage ? '0.2V' : '9V';
                      return (
                        <TransistorTO92
                          key={idx}
                          cx={cx}
                          topY={topY}
                          label={`Q${idx + 1}`}
                          sub="BC547"
                          compId={idx === 0 ? 'Q1' : 'Q2'}
                          active={sim.conducting && onStage}
                          dimmed={!onStage}
                          vE={onStage ? veVal : undefined}
                          vB={onStage ? vbVal : undefined}
                          vC={onStage ? vcVal : undefined}
                          onSelect={setInspected}
                        />
                      );
                    })}
                  </g>
                );
              })()
            ) : params.chapterId === 6 && params.exampleId === 'chaser-3led' ? (
              /* ================= CHAPTER 6A: 3-LED RING CHASER ================= */
              (() => {
                const qX = [115, 260, 405];
                const activeIdx = params.oscPhase % 3;
                const topY = 114;
                const padY = topY + 74; // 188

                return (
                  <g>
                    {/* Top +9V Rail */}
                    <path d="M 48 34 L 470 34" stroke="#ffd24a" strokeWidth="4.5" opacity="0.4" fill="none" />
                    <path d="M 48 34 L 470 34" stroke="#ffd24a" strokeWidth="3.5" fill="none" className="flow-active" />
                    <text x="52" y="27" fill="#fde047" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      +9 V
                    </text>

                    {/* Bottom 0V Ground Rail */}
                    <path d="M 48 268 L 470 268" stroke="#6fe39a" strokeWidth="4.5" opacity="0.35" fill="none" />
                    <text x="52" y="263" fill="#86efac" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      0 V (−)
                    </text>

                    {/* Cross-Stage Capacitor Ring: C(Q1)->B(Q2), C(Q2)->B(Q3), C(Q3)->B(Q1) */}
                    {[0, 1].map((i) => {
                      const fromC = qX[i] + 26;
                      const toB = qX[i + 1];
                      const nextOn = activeIdx === i + 1;
                      return (
                        <g key={`ring-${i}`}>
                          <path
                            d={`M ${fromC} ${padY} L ${fromC} 228 L ${toB} 228 L ${toB} ${padY}`}
                            stroke="#38bdf8"
                            strokeWidth="3"
                            opacity={nextOn ? 0.95 : 0.28}
                            fill="none"
                            className={nextOn ? 'flow-active' : ''}
                          />
                          <g data-comp="CAP" onClick={() => setInspected('CAP')} className="cursor-pointer">
                            <rect x={(fromC + toB) / 2 - 19} y="218" width="38" height="18" rx="4" fill="#1d4ed8" stroke="#93c5fd" />
                            <text x={(fromC + toB) / 2} y="231" textAnchor="middle" fill="#fff" fontSize="8.5" fontFamily="monospace">
                              10µF
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* Wrap-around ring from Q3(C) -> Q1(B) */}
                    <path
                      d={`M ${qX[2] + 26} ${padY} L ${qX[2] + 26} 250 L ${qX[0]} 250 L ${qX[0]} ${padY}`}
                      stroke="#ffd24a"
                      strokeWidth="3"
                      opacity={activeIdx === 0 ? 0.95 : 0.28}
                      fill="none"
                      className={activeIdx === 0 ? 'flow-active' : ''}
                    />
                    <g data-comp="CAP" onClick={() => setInspected('CAP')} className="cursor-pointer">
                      <rect x="241" y="241" width="38" height="18" rx="4" fill="#1d4ed8" stroke="#93c5fd" />
                      <text x="260" y="254" textAnchor="middle" fill="#fff" fontSize="8.5" fontFamily="monospace">
                        10µF
                      </text>
                    </g>

                    {/* 3 Identical Stages */}
                    {qX.map((cx, idx) => {
                      const isOn = activeIdx === idx;
                      const pinE = cx - 26;
                      const pinB = cx;
                      const pinC = cx + 26;

                      return (
                        <g key={idx}>
                          {/* +9V -> LED -> 470R -> Collector C */}
                          <path
                            d={`M ${pinC} 34 L ${pinC} ${padY}`}
                            stroke="#ff6b5a"
                            strokeWidth="4"
                            opacity={isOn ? 0.9 : 0.22}
                            fill="none"
                            className={isOn ? 'flow-active' : ''}
                            markerMid={isOn ? 'url(#arrRed)' : undefined}
                          />

                          {/* Base bias resistor from +9V -> B */}
                          <path
                            d={`M ${pinB} 34 L ${pinB} ${padY}`}
                            stroke="#5ab0ff"
                            strokeWidth="2.5"
                            opacity={isOn ? 0.95 : 0.25}
                            fill="none"
                            className={isOn ? 'flow-active' : ''}
                          />

                          {/* Emitter E -> 0V Ground */}
                          <path
                            d={`M ${pinE} ${padY} L ${pinE} 268`}
                            stroke="#6fe39a"
                            strokeWidth="4"
                            opacity={isOn ? 0.95 : 0.22}
                            fill="none"
                            className={isOn ? 'flow-active' : ''}
                          />

                          {/* LED on Collector line */}
                          <circle
                            cx={pinC}
                            cy={57}
                            r="13.5"
                            fill={isOn ? '#ef4444' : '#451a1a'}
                            stroke="#fca5a5"
                            strokeWidth="2"
                            filter={isOn ? 'url(#ledGlow)' : undefined}
                          />
                          <text x={pinC} y={61} textAnchor="middle" fill="#fff" fontSize="8.5" fontWeight="700">
                            L{idx + 1}
                          </text>

                          {/* Collector Resistor */}
                          <rect x={pinC - 11} y={78} width="22" height="22" rx="3" fill="#e7d6ac" stroke="#78350f" />
                          <text x={pinC} y={92} textAnchor="middle" fill="#1c1917" fontSize="7.5" fontFamily="monospace" fontWeight="700">
                            470
                          </text>

                          {/* Base Resistor */}
                          <rect x={pinB - 10} y={78} width="20" height="22" rx="3" fill="#e7d6ac" stroke="#78350f" />
                          <text x={pinB} y={92} textAnchor="middle" fill="#1c1917" fontSize="7.5" fontFamily="monospace" fontWeight="700">
                            R
                          </text>

                          <TransistorTO92
                            cx={cx}
                            topY={topY}
                            label={`Q${idx + 1}`}
                            sub="BC547"
                            compId={idx === 0 ? 'Q1' : 'Q2'}
                            active={isOn}
                            vE="0V"
                            vB={isOn ? '0.6V' : '0.1V'}
                            vC={isOn ? '0.2V' : '9V'}
                            onSelect={setInspected}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              })()
            ) : params.chapterId === 6 && params.exampleId === 'flipflop-2led' ? (
              /* ================= CHAPTER 6B: 2-LED ASTABLE MULTIVIBRATOR ================= */
              (() => {
                const q1On = params.oscPhase % 2 === 0;
                const q2On = !q1On;
                const q1X = 140;
                const q2X = 380;
                const topY = 114;
                const padY = topY + 74; // 188

                return (
                  <g>
                    {/* Top +9V Rail */}
                    <path d="M 48 34 L 470 34" stroke="#ffd24a" strokeWidth="4.5" opacity="0.4" fill="none" />
                    <path d="M 48 34 L 470 34" stroke="#ffd24a" strokeWidth="3.5" fill="none" className="flow-active" />
                    <text x="52" y="27" fill="#fde047" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      +9 V
                    </text>

                    {/* Bottom 0V Ground Rail */}
                    <path d="M 48 268 L 470 268" stroke="#6fe39a" strokeWidth="4.5" opacity="0.35" fill="none" />
                    <text x="52" y="263" fill="#86efac" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      0 V (−)
                    </text>

                    {/* Cross-coupling C1: Q1(C = 166) -> Q2(B = 380) */}
                    <path
                      d={`M ${q1X + 26} ${padY} L ${q1X + 26} 228 L ${q2X} 228 L ${q2X} ${padY}`}
                      stroke="#38bdf8"
                      strokeWidth="3"
                      opacity={q2On ? 0.95 : 0.25}
                      fill="none"
                      className={q2On ? 'flow-active' : ''}
                    />
                    <g data-comp="CAP" onClick={() => setInspected('CAP')} className="cursor-pointer">
                      <rect x="234" y="218" width="52" height="19" rx="4" fill="#1d4ed8" stroke="#93c5fd" />
                      <text x="260" y="231" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="monospace" fontWeight="700">
                        C1 100µ
                      </text>
                    </g>

                    {/* Cross-coupling C2: Q2(C = 406) -> Q1(B = 140) */}
                    <path
                      d={`M ${q2X + 26} ${padY} L ${q2X + 26} 250 L ${q1X} 250 L ${q1X} ${padY}`}
                      stroke="#ffd24a"
                      strokeWidth="3"
                      opacity={q1On ? 0.95 : 0.25}
                      fill="none"
                      className={q1On ? 'flow-active' : ''}
                    />
                    <g data-comp="CAP" onClick={() => setInspected('CAP')} className="cursor-pointer">
                      <rect x="234" y="240" width="52" height="19" rx="4" fill="#1d4ed8" stroke="#93c5fd" />
                      <text x="260" y="253" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="monospace" fontWeight="700">
                        C2 100µ
                      </text>
                    </g>

                    {/* Stage 1 & Stage 2 */}
                    {[
                      { cx: q1X, on: q1On, color: '#ef4444', idx: 1 },
                      { cx: q2X, on: q2On, color: '#22c55e', idx: 2 },
                    ].map(({ cx, on, color, idx }) => {
                      const pinE = cx - 26;
                      const pinB = cx;
                      const pinC = cx + 26;
                      return (
                        <g key={idx}>
                          {/* +9V -> LED -> 470R -> Collector C */}
                          <path
                            d={`M ${pinC} 34 L ${pinC} ${padY}`}
                            stroke="#ff6b5a"
                            strokeWidth="4"
                            opacity={on ? 0.95 : 0.22}
                            fill="none"
                            className={on ? 'flow-active' : ''}
                            markerMid={on ? 'url(#arrRed)' : undefined}
                          />
                          {/* +9V -> R_B -> Base B */}
                          <path
                            d={`M ${pinB} 34 L ${pinB} ${padY}`}
                            stroke="#5ab0ff"
                            strokeWidth="2.8"
                            opacity={on ? 0.95 : 0.25}
                            fill="none"
                            className={on ? 'flow-active' : ''}
                          />
                          {/* Emitter E -> 0V */}
                          <path
                            d={`M ${pinE} ${padY} L ${pinE} 268`}
                            stroke="#6fe39a"
                            strokeWidth="4"
                            opacity={on ? 0.95 : 0.22}
                            fill="none"
                            className={on ? 'flow-active' : ''}
                          />

                          {/* LED */}
                          <circle
                            cx={pinC}
                            cy={57}
                            r="14.5"
                            fill={on ? color : '#292524'}
                            stroke="#e7e5e4"
                            strokeWidth="2"
                            filter={on ? 'url(#ledGlow)' : undefined}
                          />
                          <text x={pinC} y="61" textAnchor="middle" fill="#fff" fontSize="8.5" fontWeight="700">
                            LED{idx}
                          </text>

                          {/* Collector & Base Resistors */}
                          <rect x={pinC - 11} y="79" width="22" height="22" rx="3" fill="#e7d6ac" stroke="#78350f" />
                          <text x={pinC} y="94" textAnchor="middle" fill="#1c1917" fontSize="8" fontFamily="monospace" fontWeight="700">
                            470
                          </text>
                          <rect x={pinB - 11} y="79" width="22" height="22" rx="3" fill="#e7d6ac" stroke="#78350f" />
                          <text x={pinB} y="94" textAnchor="middle" fill="#1c1917" fontSize="8" fontFamily="monospace" fontWeight="700">
                            R{idx}
                          </text>

                          <TransistorTO92
                            cx={cx}
                            topY={topY}
                            label={`Q${idx}`}
                            sub="BC547"
                            compId={idx === 1 ? 'Q1' : 'Q2'}
                            active={on}
                            vE="0V"
                            vB={on ? '0.6V' : '0.1V'}
                            vC={on ? '0.2V' : '8.8V'}
                            onSelect={setInspected}
                          />
                        </g>
                      );
                    })}
                  </g>
                );
              })()
            ) : params.chapterId === 6 && params.exampleId === 'siren-tick' ? (
              /* ================= CHAPTER 6C: COMPLEMENTARY NPN + PNP SIREN OSCILLATOR ================= */
              (() => {
                const pulse = params.oscPhase % 2 === 0;
                const q1X = 148;
                const q2X = 320;
                const topY = 114;
                const padY = topY + 74; // 188

                return (
                  <g>
                    {/* Top +9V Rail */}
                    <path d="M 48 38 L 468 38" stroke="#ffd24a" strokeWidth="4.5" opacity="0.4" fill="none" />
                    <path d="M 48 38 L 468 38" stroke="#ffd24a" strokeWidth="3.5" fill="none" className="flow-active" />
                    <text x="54" y="31" fill="#fde047" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      +9 V
                    </text>

                    {/* Bottom 0V Rail */}
                    <path d="M 48 268 L 468 268" stroke="#6fe39a" strokeWidth="4.5" opacity="0.35" fill="none" />
                    <text x="54" y="263" fill="#86efac" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      0 V (−)
                    </text>

                    {/* Q1 (NPN) Emitter E -> 0V */}
                    <path
                      d={`M ${q1X - 26} ${padY} L ${q1X - 26} 268`}
                      stroke="#6fe39a"
                      strokeWidth="4"
                      className={pulse ? 'flow-active' : ''}
                      opacity={pulse ? 0.95 : 0.3}
                      fill="none"
                    />

                    {/* Timing resistor R from +9V -> Q1 Base B */}
                    <path d={`M ${q1X} 38 L ${q1X} ${padY}`} stroke="#5ab0ff" strokeWidth="3" className="flow-active" fill="none" />
                    <rect x={q1X - 18} y="72" width="36" height="22" rx="4" fill="#e7d6ac" stroke="#78350f" />
                    <text x={q1X} y="87" textAnchor="middle" fill="#1c1917" fontSize="9" fontFamily="monospace" fontWeight="700">
                      {params.oscSpeedR.toFixed(0)}k
                    </text>

                    {/* Direct coupling Q1 Collector C -> Q2 PNP Base B */}
                    <path
                      d={`M ${q1X + 26} ${padY} L ${q1X + 26} 226 L ${q2X} 226 L ${q2X} ${padY}`}
                      stroke="#ff6b5a"
                      strokeWidth="3.5"
                      className={pulse ? 'flow-active' : ''}
                      opacity={pulse ? 0.95 : 0.35}
                      fill="none"
                    />
                    <text x="246" y="220" textAnchor="middle" fill="#fca5a5" fontSize="8.2" fontFamily="monospace">
                      Q1(C) → Q2(B)
                    </text>

                    {/* Q2 (PNP) Emitter E connected directly to +9V Rail! */}
                    <path
                      d={`M ${q2X - 26} 38 L ${q2X - 26} ${padY}`}
                      stroke="#ffd24a"
                      strokeWidth="4"
                      className={pulse ? 'flow-active' : ''}
                      opacity={pulse ? 0.95 : 0.35}
                      fill="none"
                    />

                    {/* Q2 (PNP) Collector C -> Speaker 8 Ohm -> 0V (cleanly in/out of speaker) */}
                    <path
                      d={`M ${q2X + 26} ${padY} L ${q2X + 26} 226 L 398 226 L 398 148 L 416 148`}
                      stroke="#ff6b5a"
                      strokeWidth="4"
                      className={pulse ? 'flow-active' : ''}
                      opacity={pulse ? 0.95 : 0.35}
                      fill="none"
                    />
                    <path
                      d="M 444 176 L 444 268"
                      stroke="#6fe39a"
                      strokeWidth="4"
                      className={pulse ? 'flow-active' : ''}
                      opacity={pulse ? 0.95 : 0.35}
                      fill="none"
                    />

                    {/* Feedback Capacitor from Q2(C) back to Q1(B) */}
                    <path
                      d={`M ${q2X + 26} 250 L ${q1X} 250 L ${q1X} ${padY}`}
                      stroke="#38bdf8"
                      strokeWidth="3"
                      className="flow-active"
                      fill="none"
                    />
                    <g data-comp="CAP" onClick={() => setInspected('CAP')} className="cursor-pointer">
                      <rect x="218" y="240" width="56" height="19" rx="4" fill="#1d4ed8" stroke="#93c5fd" />
                      <text x="246" y="253" textAnchor="middle" fill="#fff" fontSize="8.5" fontFamily="monospace" fontWeight="700">
                        C_fb 22n
                      </text>
                    </g>

                    {/* Speaker 8 Ohm */}
                    <g>
                      <circle cx="444" cy="148" r="28" fill="#27272a" stroke="#a1a1aa" strokeWidth="2" />
                      <circle cx="444" cy="148" r="14" fill="#52525b" className="speaker-pulse" />
                      <text x="444" y="112" textAnchor="middle" fill="#fff" fontSize="9.5" fontWeight="700">
                        HP 8 Ω
                      </text>
                    </g>

                    <TransistorTO92
                      cx={q1X}
                      topY={topY}
                      label="Q1 NPN"
                      sub="BC547"
                      compId="Q1"
                      active={pulse}
                      vE="0V"
                      vB={pulse ? '0.6V' : '0.2V'}
                      vC={pulse ? '8.3V' : '9V'}
                      onSelect={setInspected}
                    />
                    <TransistorTO92
                      cx={q2X}
                      topY={topY}
                      label="Q2 PNP"
                      sub="BC557"
                      compId="PNP"
                      isPnp
                      active={pulse}
                      vE="9V"
                      vB={pulse ? '8.3V' : '9V'}
                      vC={pulse ? '8.8V' : '0V'}
                      onSelect={setInspected}
                    />
                  </g>
                );
              })()
            ) : params.chapterId === 8 && params.exampleId === 'solar-charger' ? (
              /* ================= CHAPTER 8A: SOLAR CHARGER WITH RELAY & Q1 PINS ================= */
              (() => {
                const qX = 225;
                const topY = 140;
                const padY = topY + 74; // 214
                const q1On = params.solarDiverted;

                return (
                  <g>
                    {/* Solar +18V -> Relay Common */}
                    <path d="M 118 76 L 195 76" stroke="#ffd24a" strokeWidth="5" opacity="0.35" fill="none" />
                    <path d="M 118 76 L 195 76" stroke="#ffd24a" strokeWidth="4" fill="none" className="flow-active" />

                    {/* Relay NO -> Dummy Load 100R 5W (active when solarDiverted) */}
                    <path d="M 278 62 L 368 62" stroke="#ff9a3c" strokeWidth="5" opacity="0.32" fill="none" />
                    {q1On && params.dummyLoadEnabled && (
                      <path d="M 278 62 L 368 62" stroke="#ff9a3c" strokeWidth="4" fill="none" className="flow-active" />
                    )}

                    {/* Relay NC -> 12V Battery + (active when charging) */}
                    <path d="M 278 104 L 410 104 L 410 162" stroke="#6fe39a" strokeWidth="5" opacity="0.32" fill="none" />
                    {!q1On && (
                      <path
                        d="M 278 104 L 410 104 L 410 162"
                        stroke="#6fe39a"
                        strokeWidth="4"
                        fill="none"
                        className="flow-active"
                        markerMid="url(#arrGreen)"
                      />
                    )}

                    {/* Sense Line: Battery + -> Zener/1k Pot -> Q1 Base (B = 225, 214) */}
                    <path
                      d={`M 358 192 L 316 192 L 316 246 L ${qX} 246 L ${qX} ${padY}`}
                      stroke="#5ab0ff"
                      strokeWidth="3.5"
                      opacity={q1On ? 0.95 : 0.45}
                      fill="none"
                      className={q1On ? 'flow-active' : ''}
                    />
                    <rect x="285" y="237" width="38" height="17" rx="3" fill="#e7d6ac" stroke="#78350f" />
                    <text x="304" y="249" textAnchor="middle" fill="#1c1917" fontSize="8.5" fontFamily="monospace" fontWeight="700">
                      1k
                    </text>

                    {/* Q1 Collector (C = 251, 214) -> Relay Coil Bottom */}
                    <path
                      d={`M 251 120 L 251 135 L 280 135 L 280 ${padY} L 251 ${padY}`}
                      stroke="#ff6b5a"
                      strokeWidth="3.8"
                      opacity={q1On ? 0.95 : 0.25}
                      fill="none"
                      className={q1On ? 'flow-active' : ''}
                    />

                    {/* Bottom 0V (-) Ground Rail connecting Solar -, Q1(E), Battery - */}
                    <path
                      d={`M 80 144 L 80 268 L 412 268 L 412 226 M ${qX - 26} ${padY} L ${qX - 26} 268`}
                      stroke="#6fe39a"
                      strokeWidth="4"
                      opacity={q1On ? 0.85 : 0.38}
                      fill="none"
                      className={q1On ? 'flow-active' : ''}
                    />
                    <text x="128" y="262" fill="#86efac" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      0 V (−)
                    </text>

                    {/* 28-cell Solar Panel */}
                    <g data-comp="SOLAR" onClick={() => setInspected('SOLAR')} className="cursor-pointer">
                      <rect x="38" y="38" width="84" height="106" rx="6" fill="#1e3a8a" stroke="#cbd5e1" strokeWidth="2" />
                      {Array.from({ length: 28 }).map((_, i) => {
                        const col = i % 4;
                        const row = Math.floor(i / 4);
                        return (
                          <rect
                            key={i}
                            x={44 + col * 19}
                            y={44 + row * 13.5}
                            width="15"
                            height="10.2"
                            rx="1.5"
                            fill="#3b82f6"
                          />
                        );
                      })}
                      <text x="80" y="160" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
                        18V (28 cel.)
                      </text>
                    </g>

                    {/* Relay K1 + Animated Contact Arm */}
                    <g data-comp="RELAY" onClick={() => setInspected('RELAY')} className="cursor-pointer">
                      <rect x="195" y="40" width="84" height="80" rx="6" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="1.5" />
                      <text x="237" y="60" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
                        K1 · 12V
                      </text>
                      <line
                        x1="210"
                        y1="86"
                        x2="268"
                        y2={q1On ? 62 : 104}
                        stroke="#fde047"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <circle cx="210" cy="86" r="4" fill="#fff" />
                      <text x="237" y="113" textAnchor="middle" fill="#bfdbfe" fontSize="8" fontFamily="monospace">
                        {q1On ? 'Bobine ON' : 'Repos NC'}
                      </text>
                    </g>

                    {/* Dummy Load 100R 5W */}
                    <g data-comp="DUMMY" onClick={() => setInspected('DUMMY')} className="cursor-pointer">
                      <rect
                        x="368"
                        y="38"
                        width="98"
                        height="46"
                        rx="5"
                        fill={q1On && params.dummyLoadEnabled ? '#ea580c' : '#d6c6a5'}
                        stroke="#44403c"
                        strokeWidth="2"
                        filter={q1On && params.dummyLoadEnabled ? 'url(#ledGlow)' : undefined}
                      />
                      <text
                        x="417"
                        y="65"
                        textAnchor="middle"
                        fill={q1On && params.dummyLoadEnabled ? '#fff' : '#1c1917'}
                        fontSize="12"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        100Ω 5W
                      </text>
                      <text x="417" y="96" textAnchor="middle" fill="#fed7aa" fontSize="9.5">
                        {q1On && params.dummyLoadEnabled ? '3.24 W (Chaud)' : 'Dummy Load'}
                      </text>
                    </g>

                    {/* 12V Battery */}
                    <g>
                      <rect x="358" y="162" width="108" height="64" rx="6" fill="#3f6212" stroke="#bef264" strokeWidth="2" />
                      <text x="412" y="191" textAnchor="middle" fill="#ecfccb" fontSize="14" fontWeight="700" fontFamily="monospace">
                        {params.battVoltage.toFixed(1)} V
                      </text>
                      <text x="412" y="211" textAnchor="middle" fill="#d9f99d" fontSize="9.5">
                        {q1On ? 'Charge coupée' : 'Charge active'}
                      </text>
                    </g>

                    {/* Regulator Transistor Q1 with clear E, B, C pins & live voltages */}
                    <TransistorTO92
                      cx={qX}
                      topY={topY}
                      label="Q1"
                      sub="BC547"
                      compId="Q1"
                      active={q1On}
                      vE="0V"
                      vB={q1On ? '0.65V' : '0.45V'}
                      vC={q1On ? '0.2V' : `${params.battVoltage.toFixed(1)}V`}
                      onSelect={setInspected}
                    />
                  </g>
                );
              })()
            ) : params.chapterId === 8 && params.exampleId === 'constant-current' ? (
              /* ================= CHAPTER 8B: 2-TRANSISTOR CONSTANT CURRENT REGULATOR ================= */
              (() => {
                const q1X = 165;
                const q2X = 355;
                const topY = 114;
                const padY = topY + 74; // 188
                const vSense = Math.min(0.62, (sim.icMA / 1000) * params.rSense);

                return (
                  <g>
                    {/* Top +V Variable Supply Rail */}
                    <path d="M 94 40 L 435 40" stroke="#ffd24a" strokeWidth="4.5" opacity="0.4" fill="none" />
                    {sim.conducting && (
                      <path d="M 94 40 L 435 40" stroke="#ffd24a" strokeWidth="3.5" fill="none" className="flow-active" />
                    )}
                    <text x="115" y="32" fill="#fde047" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      +V = {params.supplyV.toFixed(1)} V
                    </text>

                    {/* Bottom 0V Rail */}
                    <path d="M 64 110 L 64 268 L 329 268" stroke="#6fe39a" strokeWidth="4.5" opacity="0.35" fill="none" />
                    {sim.conducting && (
                      <path d="M 64 110 L 64 268 L 329 268" stroke="#6fe39a" strokeWidth="3.5" fill="none" className="flow-active" />
                    )}
                    <text x="88" y="262" fill="#86efac" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      0 V (−)
                    </text>

                    {/* +V -> LED -> Q2 Collector (C = 381) */}
                    <path
                      d={`M 381 40 L 381 ${padY}`}
                      stroke="#ff6b5a"
                      strokeWidth="4"
                      opacity={sim.conducting ? 0.95 : 0.25}
                      fill="none"
                      className={sim.conducting ? 'flow-active' : ''}
                      markerMid={sim.conducting ? 'url(#arrRed)' : undefined}
                    />
                    <circle
                      cx="381"
                      cy="72"
                      r="16"
                      fill={ledGlow > 0.05 ? `rgba(251, 191, 36, ${0.28 + ledGlow * 0.72})` : '#422006'}
                      stroke="#fde047"
                      strokeWidth="2.5"
                      filter={ledGlow > 0.1 ? 'url(#ledGlow)' : undefined}
                    />
                    <text x="415" y="76" fill="#fff" fontSize="10" fontWeight="700">
                      LED
                    </text>

                    {/* +V -> 10k Bias Resistor -> Q2 Base (B = 355) & Q1 Collector (C = 191) */}
                    <path d={`M 260 40 L 260 226 L ${q2X} 226 L ${q2X} ${padY}`} stroke="#5ab0ff" strokeWidth="3" className="flow-active" fill="none" />
                    <path d={`M 260 226 L ${q1X + 26} 226 L ${q1X + 26} ${padY}`} stroke="#ff6b5a" strokeWidth="3" className="flow-active" fill="none" />
                    <rect x="242" y="72" width="36" height="22" rx="4" fill="#e7d6ac" stroke="#78350f" />
                    <text x="260" y="87" textAnchor="middle" fill="#1c1917" fontSize="9" fontFamily="monospace" fontWeight="700">
                      10k
                    </text>

                    {/* Q2 Emitter (E = 329) -> R_sense -> 0V AND feedback node to Q1 Base (B = 165) */}
                    <path d={`M ${q2X - 26} ${padY} L ${q2X - 26} 268`} stroke="#6fe39a" strokeWidth="4" className="flow-active" fill="none" />
                    <path
                      d={`M ${q2X - 26} 244 L ${q1X} 244 L ${q1X} ${padY}`}
                      stroke="#5ab0ff"
                      strokeWidth="3"
                      className="flow-active"
                      fill="none"
                    />
                    <g data-comp="RSENSE" onClick={() => setInspected('RSENSE')} className="cursor-pointer">
                      <rect x="303" y="246" width="52" height="19" rx="4" fill="#d97706" stroke="#fde68a" />
                      <text x="329" y="259" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="monospace" fontWeight="700">
                        {params.rSense} Ω
                      </text>
                    </g>

                    {/* Q1 Emitter (E = 139) -> 0V */}
                    <path d={`M ${q1X - 26} ${padY} L ${q1X - 26} 268`} stroke="#6fe39a" strokeWidth="3.5" className="flow-active" fill="none" />

                    {/* Variable Battery Block */}
                    <rect x="38" y="38" width="58" height="72" rx="6" fill="#15803d" stroke="#bbf7d0" strokeWidth="2" />
                    <text x="67" y="68" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" fontFamily="monospace">
                      +  −
                    </text>
                    <text x="67" y="92" textAnchor="middle" fill="#dcfce7" fontSize="10" fontFamily="monospace">
                      {params.supplyV.toFixed(1)}V
                    </text>

                    <TransistorTO92
                      cx={q1X}
                      topY={topY}
                      label="Q1 Rég."
                      sub="BC547"
                      compId="Q1"
                      active={sim.conducting}
                      vE="0V"
                      vB={`${vSense.toFixed(2)}V`}
                      vC={`${(vSense + 0.6).toFixed(2)}V`}
                      onSelect={setInspected}
                    />
                    <TransistorTO92
                      cx={q2X}
                      topY={topY}
                      label="Q2 Pass"
                      sub="BC337"
                      compId="Q2"
                      active={sim.conducting}
                      vE={`${vSense.toFixed(2)}V`}
                      vB={`${(vSense + 0.6).toFixed(2)}V`}
                      vC={`${(vSense + sim.vce).toFixed(1)}V`}
                      onSelect={setInspected}
                    />
                  </g>
                );
              })()
            ) : (
              /* ================= VERSATILE SINGLE-TRANSISTOR PCB (CH 1, 2, 3, 5, 7, 9) ================= */
              (() => {
                const qX = 275;
                const topY = 114;
                const padY = topY + 74; // 188
                const pinE = qX - 26; // 249
                const pinB = qX;      // 275
                const pinC = qX + 26; // 301
                const pnpFlow = !isNpn;
                const revFlow = pnpFlow && params.batteryReversed;

                return (
                  <g>
                    {/* +V Top Rail: Battery (+) -> Resistor -> Load -> Collector Pad C */}
                    <path d="M 96 62 L 420 62" stroke="#ffd24a" strokeWidth="4.5" opacity="0.35" fill="none" />
                    {sim.conducting && (
                      <path
                        d="M 96 62 L 420 62"
                        stroke="#ffd24a"
                        strokeWidth="3.8"
                        fill="none"
                        className={revFlow ? 'flow-active-rev' : 'flow-active'}
                      />
                    )}
                    <text x="112" y="52" fill="#fde047" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                      {params.chapterId === 2 && params.batteryReversed ? '− Rail' : '+V Rail'}
                    </text>

                    {/* Collector / Output Load Path: Load at (420, 62) -> down right side -> enters Collector Pad C (301, 188) */}
                    <path
                      d={`M 420 62 L 420 218 L ${pinC} 218 L ${pinC} ${padY}`}
                      stroke="#ff6b5a"
                      strokeWidth="4.5"
                      opacity="0.32"
                      fill="none"
                    />
                    {sim.conducting && (
                      <path
                        d={`M 420 62 L 420 218 L ${pinC} 218 L ${pinC} ${padY}`}
                        stroke="#ff6b5a"
                        strokeWidth="3.8"
                        fill="none"
                        className={revFlow ? 'flow-active-rev' : 'flow-active'}
                        markerMid="url(#arrRed)"
                      />
                    )}

                    {/* Emitter Path: Emitter Pad E (249, 188) -> 0V Return -> Battery (-) */}
                    <path
                      d={`M ${pinE} ${padY} L ${pinE} 264 L 66 264 L 66 112`}
                      stroke="#6fe39a"
                      strokeWidth="4.5"
                      opacity="0.32"
                      fill="none"
                    />
                    {sim.conducting && (
                      <path
                        d={`M ${pinE} ${padY} L ${pinE} 264 L 66 264 L 66 112`}
                        stroke="#6fe39a"
                        strokeWidth="3.8"
                        fill="none"
                        className={revFlow ? 'flow-active-rev' : 'flow-active'}
                        markerMid="url(#arrGreen)"
                      />
                    )}

                    {/* Base Path: Input Pad (70, 228) -> R1/Cap/LDR -> Base Pad B (275, 188) */}
                    <path
                      d={`M 70 228 L ${pinB} 228 L ${pinB} ${padY}`}
                      stroke="#5ab0ff"
                      strokeWidth="4"
                      opacity="0.32"
                      fill="none"
                    />
                    {(sim.conducting || sim.ibUA > 0.1) && (
                      <path
                        d={`M 70 228 L ${pinB} 228 L ${pinB} ${padY}`}
                        stroke="#5ab0ff"
                        strokeWidth="3.2"
                        fill="none"
                        className={revFlow ? 'flow-active-rev' : 'flow-active'}
                        markerEnd="url(#arrBlue)"
                      />
                    )}

                    {/* Extra Joule Thief feedback coil link C -> B */}
                    {params.chapterId === 7 && params.exampleId === 'joule-thief' && (
                      <path
                        d={`M 326 62 L 326 104 L ${pinB} 104 L ${pinB} ${padY}`}
                        stroke="#fbbf24"
                        strokeWidth="2.6"
                        strokeDasharray="5 4"
                        fill="none"
                        opacity="0.8"
                      />
                    )}

                    {/* Extra Charge Pump 1uF boost capacitor between Base/Collector & Output */}
                    {params.chapterId === 7 && params.exampleId === 'charge-pump' && (
                      <g data-comp="CAP" onClick={() => setInspected('CAP')} className="cursor-pointer">
                        <path
                          d={`M ${pinC} ${padY} L 355 ${padY} L 355 62`}
                          stroke="#38bdf8"
                          strokeWidth="2.8"
                          className={params.pumpPhase === 'B' ? 'flow-active' : ''}
                          opacity={params.pumpPhase === 'B' ? 0.95 : 0.35}
                          fill="none"
                        />
                        <rect x="334" y="122" width="42" height="22" rx="4" fill="#1d4ed8" stroke="#93c5fd" />
                        <text x="355" y="137" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="monospace" fontWeight="700">
                          1µF
                        </text>
                      </g>
                    )}

                    {/* Terminal Block (Battery) */}
                    <g>
                      <rect x="38" y="40" width="58" height="72" rx="6" fill="#15803d" stroke="#bbf7d0" strokeWidth="2" />
                      <text x="67" y="72" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="monospace">
                        {params.chapterId === 2 && params.batteryReversed ? '−   +' : '+   −'}
                      </text>
                      <text x="67" y="96" textAnchor="middle" fill="#dcfce7" fontSize="10" fontFamily="monospace">
                        {params.chapterId === 7 ? `${params.cellVoltage.toFixed(1)}V` : params.chapterId === 9 ? '5V' : '9V'}
                      </text>
                    </g>

                    {/* Base Component: Touch / LDR / Cap / 4M7 */}
                    {params.chapterId === 5 && params.exampleId === 'dark-schmitt' ? (
                      <g data-comp="LDR" onClick={() => setInspected('LDR')} className="cursor-pointer">
                        <circle cx="84" cy="228" r="21" fill="#b45309" stroke="#fde68a" strokeWidth="2" />
                        <path d="M 72 228 L 78 220 L 84 236 L 90 220 L 96 228" stroke="#fef3c7" strokeWidth="2.5" fill="none" />
                        <text x="84" y="198" textAnchor="middle" fill="#fef3c7" fontSize="9.5" fontWeight="700">
                          LDR ({params.luxLevel}%)
                        </text>
                      </g>
                    ) : params.chapterId === 5 && params.exampleId === 'touch-latch' ? (
                      <g>
                        <g onClick={() => onQuickAction?.('latch-on')} className="cursor-pointer">
                          <rect x="44" y="182" width="42" height="24" rx="4" fill="#eab308" stroke="#fef08a" strokeWidth="1.5" />
                          <text x="65" y="198" textAnchor="middle" fill="#1c1917" fontSize="10" fontWeight="700">
                            ON
                          </text>
                        </g>
                        <g onClick={() => onQuickAction?.('latch-off')} className="cursor-pointer">
                          <rect x="94" y="182" width="42" height="24" rx="4" fill="#e11d48" stroke="#fecdd3" strokeWidth="1.5" />
                          <text x="115" y="198" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
                            OFF
                          </text>
                        </g>
                        <g data-comp="FB4M7" onClick={() => setInspected('FB4M7')} className="cursor-pointer">
                          <rect x="148" y="218" width="60" height="20" rx="4" fill="#e7d6ac" stroke="#78350f" />
                          <text x="178" y="232" textAnchor="middle" fill="#1c1917" fontSize="10" fontWeight="700" fontFamily="monospace">
                            4M7
                          </text>
                        </g>
                      </g>
                    ) : params.chapterId === 3 ? (
                      <g data-comp="CAP" onClick={() => setInspected('CAP')} className="cursor-pointer">
                        <rect x="135" y="208" width="66" height="34" rx="6" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="1.5" />
                        <rect
                          x="137"
                          y="210"
                          width={Math.max(4, 62 * params.capCharge)}
                          height="30"
                          rx="4"
                          fill="#38bdf8"
                          opacity="0.55"
                        />
                        <text x="168" y="229" textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="700" fontFamily="monospace">
                          {params.capValueUF}µF
                        </text>
                      </g>
                    ) : (
                      <g>
                        <circle cx="70" cy="228" r="14" fill="#eab308" stroke="#fef08a" strokeWidth="2" />
                        <text x="70" y="205" textAnchor="middle" fill="#fef08a" fontSize="9.5" fontWeight="600">
                          {params.chapterId === 1 && params.exampleId === 'plant' ? 'Sonde' : 'Touch'}
                        </text>
                        <rect x="132" y="218" width="64" height="19" rx="4" fill="#e7d6ac" stroke="#78350f" />
                        <text x="164" y="231" textAnchor="middle" fill="#1c1917" fontSize="10" fontFamily="monospace" fontWeight="700">
                          {params.chapterId === 9 ? 'RB' : 'R1'}
                        </text>
                      </g>
                    )}

                    {/* Central Transistor Package with exact E, B, C pins & live pin voltages */}
                    <TransistorTO92
                      cx={qX}
                      topY={topY}
                      label={isNpn ? 'BC547' : 'BC557'}
                      sub={isNpn ? 'Q1 · NPN' : 'Q1 · PNP'}
                      compId={isNpn ? 'Q1' : 'PNP'}
                      isPnp={!isNpn}
                      active={sim.conducting}
                      vE={params.chapterId === 2 && params.batteryReversed ? '9V' : '0V'}
                      vB={
                        params.chapterId === 2 && params.batteryReversed
                          ? `${(9 - sim.vbe).toFixed(2)}V`
                          : `${sim.vbe.toFixed(2)}V`
                      }
                      vC={`${sim.vc.toFixed(1)}V`}
                      onSelect={setInspected}
                    />

                    {/* Top Load Resistor or Inductor Coil */}
                    {params.chapterId === 7 && params.exampleId === 'joule-thief' ? (
                      <g data-comp="COIL" onClick={() => setInspected('COIL')} className="cursor-pointer">
                        <rect x="235" y="44" width="94" height="36" rx="6" fill="#44403c" stroke="#f59e0b" strokeWidth="2" />
                        <path
                          d="M 245 62 Q 255 46 265 62 T 285 62 T 305 62 T 320 62"
                          stroke="#fbbf24"
                          strokeWidth="3"
                          fill="none"
                        />
                        <text x="282" y="34" textAnchor="middle" fill="#fde68a" fontSize="9.5" fontWeight="700">
                          Bobine L1+L2
                        </text>
                      </g>
                    ) : (
                      <g data-comp="R220" onClick={() => setInspected('R220')} className="cursor-pointer">
                        <rect x="255" y="51" width="76" height="22" rx="4" fill="#e7d6ac" stroke="#78350f" />
                        <text x="293" y="66" textAnchor="middle" fill="#1c1917" fontSize="11" fontWeight="700" fontFamily="monospace">
                          {params.chapterId === 9 ? 'RL 22k' : '220 Ω'}
                        </text>
                      </g>
                    )}

                    {/* Output Load Component on Top Right */}
                    {params.chapterId === 1 && params.exampleId === 'staircase' ? (
                      <g>
                        {[0, 1, 2, 3].map((i) => {
                          const lit = i < sim.staircaseLeds;
                          return (
                            <g key={i}>
                              <circle
                                cx={366 + i * 28}
                                cy={62}
                                r="10"
                                fill={lit ? '#22c55e' : '#1c1917'}
                                stroke="#86efac"
                                strokeWidth="2"
                                filter={lit ? 'url(#ledGlow)' : undefined}
                              />
                              <text x={366 + i * 28} y="86" textAnchor="middle" fill="#fff" fontSize="8.5">
                                L{i + 1}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    ) : params.chapterId === 2 && params.exampleId === 'logic-probe' ? (
                      <g>
                        <circle
                          cx="396"
                          cy="58"
                          r="15"
                          fill={params.logicInput === 'HIGH' ? '#ef4444' : '#450a0a'}
                          stroke="#fca5a5"
                          strokeWidth="2"
                          filter={params.logicInput === 'HIGH' ? 'url(#ledGlow)' : undefined}
                        />
                        <text x="396" y="86" textAnchor="middle" fill="#fecaca" fontSize="8.5" fontWeight="700">
                          HIGH
                        </text>
                        <circle
                          cx="440"
                          cy="58"
                          r="15"
                          fill={params.logicInput === 'LOW' ? '#22c55e' : '#052e16'}
                          stroke="#86efac"
                          strokeWidth="2"
                          filter={params.logicInput === 'LOW' ? 'url(#ledGlow)' : undefined}
                        />
                        <text x="440" y="86" textAnchor="middle" fill="#bbf7d0" fontSize="8.5" fontWeight="700">
                          LOW
                        </text>
                      </g>
                    ) : params.chapterId === 5 && params.exampleId === 'motor-relay' && params.loadKind === 'motor' ? (
                      <g>
                        <circle cx="420" cy="62" r="28" fill="#71717a" stroke="#e4e4e7" strokeWidth="2.5" />
                        <g
                          className={sim.conducting ? 'fan-spin' : ''}
                          style={{ '--spin-speed': `${Math.max(0.25, 1.4 - sim.brightness * 1.1).toFixed(2)}s` } as React.CSSProperties}
                        >
                          <rect x="416" y="40" width="8" height="44" rx="3" fill="#fde047" />
                          <rect x="398" y="58" width="44" height="8" rx="3" fill="#fde047" />
                        </g>
                        <text x="420" y="104" textAnchor="middle" fill="#fff" fontSize="9.5" fontWeight="700">
                          MOTEUR
                        </text>
                      </g>
                    ) : params.chapterId === 5 && params.exampleId === 'motor-relay' && params.loadKind === 'relay' ? (
                      <g data-comp="RELAY" onClick={() => setInspected('RELAY')} className="cursor-pointer">
                        <rect
                          x="374"
                          y="34"
                          width="90"
                          height="58"
                          rx="6"
                          fill={sim.conducting ? '#2563eb' : '#1e3a8a'}
                          stroke="#93c5fd"
                          strokeWidth="2"
                        />
                        <text x="419" y="60" textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="700">
                          SONGLE 12V
                        </text>
                        <text x="419" y="78" textAnchor="middle" fill="#dbeafe" fontSize="9.5">
                          {sim.conducting ? 'FERMÉ' : 'OUVERT'}
                        </text>
                      </g>
                    ) : (
                      <g>
                        <circle
                          cx="420"
                          cy="62"
                          r="21"
                          fill={
                            ledGlow > 0.04
                              ? params.chapterId === 7 && params.exampleId === 'joule-thief'
                                ? `rgba(248, 250, 252, ${0.35 + ledGlow * 0.65})`
                                : `rgba(251, 191, 36, ${0.25 + ledGlow * 0.75})`
                              : '#422006'
                          }
                          stroke="#fde047"
                          strokeWidth="2.5"
                          filter={ledGlow > 0.08 ? 'url(#ledGlow)' : undefined}
                        />
                        <text x="420" y="98" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
                          LED
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()
            )}
          </svg>
        </div>

        {/* Bottom Status Bar inside Mat */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
          <div className="bg-black/65 backdrop-blur-xs text-stone-100 text-xs px-3 py-1.5 rounded-md font-medium">
            {lang === 'fr' ? sim.statusFr : sim.statusAr}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-black/55 text-stone-300 text-xs px-2.5 py-1.5 rounded-md">
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>{lang === 'fr' ? 'Glisser pour pivoter · Cliquer un composant' : 'اسحب للتدوير · انقر أي مكوّن'}</span>
          </div>
        </div>
      </div>

      {/* Component Inspector Strip */}
      <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-mono-num text-amber-700 dark:text-amber-400 font-semibold">
            {part.name}
          </div>
          <p className="text-sm text-stone-700 dark:text-stone-300 mt-0.5 leading-snug">
            {lang === 'fr' ? part.roleFr : part.roleAr}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs font-mono-num">
          <span className="text-sky-600 dark:text-sky-400">I_B {sim.ibUA.toFixed(1)}µA</span>
          <span className="text-stone-400">·</span>
          <span className="text-rose-600 dark:text-rose-400">I_C {sim.icMA.toFixed(1)}mA</span>
        </div>
      </div>
    </div>
  );
};
