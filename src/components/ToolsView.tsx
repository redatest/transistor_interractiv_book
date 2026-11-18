import React, { useMemo, useState } from 'react';
import { Lang } from '../types';

interface Props {
  lang: Lang;
}

type MysteryId = 'npn_ebc' | 'pnp_bce' | 'faulty';
type PinIdx = 1 | 2 | 3;

const MYSTERY_DATA: Record<
  MysteryId,
  {
    type: 'NPN' | 'PNP' | 'FAULTY';
    pins: Record<PinIdx, 'E' | 'B' | 'C'>;
    labelFr: string;
    labelAr: string;
  }
> = {
  npn_ebc: {
    type: 'NPN',
    pins: { 1: 'E', 2: 'B', 3: 'C' },
    labelFr: 'Transistor Mystère A (NPN · E-B-C)',
    labelAr: 'ترانزستور غامض A (NPN · E-B-C)',
  },
  pnp_bce: {
    type: 'PNP',
    pins: { 1: 'B', 2: 'C', 3: 'E' },
    labelFr: 'Transistor Mystère B (PNP · B-C-E)',
    labelAr: 'ترانزستور غامض B (PNP · B-C-E)',
  },
  faulty: {
    type: 'FAULTY',
    pins: { 1: 'C', 2: 'B', 3: 'E' },
    labelFr: 'Transistor Mystère C (Défectueux / Court-circuit)',
    labelAr: 'ترانزستور غامض C (تالف / قصر داخلي)',
  },
};

const RESISTOR_COLORS = [
  { nameFr: 'Noir (0)', nameAr: 'أسود (0)', val: 0, mult: 1, hex: '#1c1917' },
  { nameFr: 'Marron (1)', nameAr: 'بني (1)', val: 1, mult: 10, hex: '#78350f' },
  { nameFr: 'Rouge (2)', nameAr: 'أحمر (2)', val: 2, mult: 100, hex: '#dc2626' },
  { nameFr: 'Orange (3)', nameAr: 'برتقالي (3)', val: 3, mult: 1000, hex: '#ea580c' },
  { nameFr: 'Jaune (4)', nameAr: 'أصفر (4)', val: 4, mult: 10000, hex: '#eab308' },
  { nameFr: 'Vert (5)', nameAr: 'أخضر (5)', val: 5, mult: 100000, hex: '#16a34a' },
  { nameFr: 'Bleu (6)', nameAr: 'أزرق (6)', val: 6, mult: 1000000, hex: '#2563eb' },
  { nameFr: 'Violet (7)', nameAr: 'بنفسجي (7)', val: 7, mult: 10000000, hex: '#7c3aed' },
  { nameFr: 'Gris (8)', nameAr: 'رمادي (8)', val: 8, mult: 1, hex: '#71717a' },
  { nameFr: 'Blanc (9)', nameAr: 'أبيض (9)', val: 9, mult: 1, hex: '#f4f4f5' },
];

const KIT_PRESETS = [
  { label: '220 Ω', b1: 2, b2: 2, mult: 1 },
  { label: '1 kΩ', b1: 1, b2: 0, mult: 2 },
  { label: '4k7', b1: 4, b2: 7, mult: 2 },
  { label: '10 kΩ', b1: 1, b2: 0, mult: 3 },
  { label: '22 kΩ', b1: 2, b2: 2, mult: 3 },
  { label: '100 kΩ', b1: 1, b2: 0, mult: 4 },
  { label: '2M2', b1: 2, b2: 2, mult: 5 },
  { label: '4M7', b1: 4, b2: 7, mult: 5 },
];

export const ToolsView: React.FC<Props> = ({ lang }) => {
  // Analogue Multimeter Tester State (pp. 20-24)
  const [mystery, setMystery] = useState<MysteryId>('npn_ebc');
  const [range, setRange] = useState<'x10' | 'x10k'>('x10');
  const [blackPin, setBlackPin] = useState<PinIdx>(2);
  const [redPin, setRedPin] = useState<PinIdx>(1);
  const [fingerPress, setFingerPress] = useState(false);
  const [reveal, setReveal] = useState(false);

  // Resistor Color Code State (pp. 13, 132-133)
  const [b1, setB1] = useState(2);
  const [b2, setB2] = useState(2);
  const [mult, setMult] = useState(1);

  const meterDeflection = useMemo(() => {
    // Returns 0..1 (0 = infinity left, 1 = 0 Ohm full scale right)
    if (blackPin === redPin) return 1.0; // shorted probes -> 0 Ohm!
    const info = MYSTERY_DATA[mystery];
    if (info.type === 'FAULTY') {
      return 0.96; // shorted junction full-scale swing!
    }
    const pBlack = info.pins[blackPin];
    const pRed = info.pins[redPin];

    if (range === 'x10') {
      // Remember book p. 21-22: Analogue meter Black lead is + of internal battery!
      if (info.type === 'NPN' && pBlack === 'B' && (pRed === 'C' || pRed === 'E')) return 0.78;
      if (info.type === 'PNP' && pRed === 'B' && (pBlack === 'C' || pBlack === 'E')) return 0.78;
      return 0.02;
    } else {
      // x10k range: finding C and E with finger between C and B (p. 21-23)
      if (!fingerPress) return 0.03;
      if (info.type === 'NPN' && pBlack === 'C' && pRed === 'E') return 0.88;
      if (info.type === 'PNP' && pRed === 'C' && pBlack === 'E') return 0.88;
      // Slight leakage if reversed
      if (
        (info.type === 'NPN' && pBlack === 'E' && pRed === 'C') ||
        (info.type === 'PNP' && pRed === 'E' && pBlack === 'C')
      ) {
        return 0.12;
      }
      return 0.02;
    }
  }, [mystery, range, blackPin, redPin, fingerPress]);

  // Needle angle: -48 deg (left = ∞) to +48 deg (right = 0 Ω)
  const needleAngle = -48 + meterDeflection * 96;

  const resistorOhms = (b1 * 10 + b2) * RESISTOR_COLORS[mult].mult;
  const formatOhms = (ohms: number) => {
    if (ohms >= 1e6) return `${(ohms / 1e6).toFixed(ohms % 1e6 === 0 ? 0 : 1)} MΩ`;
    if (ohms >= 1e3) return `${(ohms / 1e3).toFixed(ohms % 1e3 === 0 ? 0 : 1)} kΩ`;
    return `${ohms} Ω`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* TOOL 1: ANALOGUE MULTIMETER TRANSISTOR TESTER (pp. 20-24) */}
      <section className="lg:col-span-7 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-5 flex flex-col gap-5">
        <div>
          <div className="text-xs font-mono-num text-amber-700 dark:text-amber-400">
            1-100 Transistor Circuits · pp. 20–24
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50 mt-0.5">
            {lang === 'fr'
              ? 'Tester un transistor inconnu au multimètre analogique'
              : 'اختبار ترانزستور مجهول بالأفوميتر التناظري'}
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
            {lang === 'fr'
              ? 'Astuce du livre : sur un multimètre analogique en ohmmètre, le fil NOIR est le (+) interne ! En calibre ×10, trouvez la Base ; en ×10k, appuyez avec le doigt sur B et C pour voir l’aiguille dévier presque à fond.'
              : 'سرّ الكتاب (ص ٢١): في الأفوميتر التناظري يحمل السلك الأسود القطب الموجب (+) الداخلي! على تدريج x10 ابحث عن القاعدة B، وعلى x10k المس القاعدة والمجمّع بإصبعك لتندفع الإبرة.'}
          </p>
        </div>

        {/* Mystery Transistor Selector */}
        <div className="flex flex-wrap gap-2">
          {(['npn_ebc', 'pnp_bce', 'faulty'] as MysteryId[]).map((mId, i) => (
            <button
              key={mId}
              type="button"
              onClick={() => {
                setMystery(mId);
                setReveal(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                mystery === mId
                  ? 'bg-stone-900 text-white border-stone-900 dark:bg-amber-400 dark:text-stone-950'
                  : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
              }`}
            >
              {lang === 'fr' ? `Composant #${i + 1}` : `قطعة مجهولة #${i + 1}`}
            </button>
          ))}
        </div>

        {/* Visual Analogue Meter + Transistor Leads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-stone-100/70 dark:bg-stone-950/60 rounded-xl p-4 border border-stone-200 dark:border-stone-800">
          {/* Analogue Scale SVG */}
          <svg viewBox="0 0 220 155" className="w-full max-w-[240px] mx-auto" direction="ltr">
            <rect x="8" y="8" width="204" height="140" rx="10" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <rect x="20" y="18" width="180" height="82" rx="6" fill="#fefce8" />
            {/* Resistance arc (∞ left, 0 right) */}
            <path d="M 38 82 A 76 76 0 0 1 182 82" fill="none" stroke="#1c1917" strokeWidth="2" />
            <text x="34" y="72" fontSize="11" fontWeight="700" fill="#dc2626">
              ∞
            </text>
            <text x="110" y="34" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1c1917">
              OHMS ({range})
            </text>
            <text x="180" y="72" fontSize="11" fontWeight="700" fill="#16a34a">
              0 Ω
            </text>

            {/* Needle */}
            <g transform={`translate(110, 96) rotate(${needleAngle})`} className="transition-transform duration-300 ease-out">
              <line x1="0" y1="0" x2="0" y2="-66" stroke="#dc2626" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="0" cy="0" r="5" fill="#0f172a" />
            </g>

            {/* Range readout */}
            <text x="110" y="128" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontFamily="monospace">
              {meterDeflection > 0.7
                ? 'FAIBLE R (Conduit)'
                : meterDeflection > 0.1
                ? 'Fuite légère'
                : 'R = ∞ (Bloqué)'}
            </text>
          </svg>

          {/* 3-Pin Unknown TO-92 Transistor */}
          <div className="flex flex-col items-center gap-3">
            <svg viewBox="0 0 180 120" className="w-44 h-auto" direction="ltr">
              <rect x="45" y="10" width="90" height="42" rx="6" fill="#18181b" stroke="#52525b" strokeWidth="2" />
              <text x="90" y="35" textAnchor="middle" fill="#e4e4e7" fontSize="12" fontFamily="monospace" fontWeight="700">
                {reveal ? MYSTERY_DATA[mystery].type : '???'}
              </text>
              {[1, 2, 3].map((pin) => {
                const px = 45 + pin * 22.5;
                const hasBlack = blackPin === pin;
                const hasRed = redPin === pin;
                return (
                  <g key={pin}>
                    <line x1={px} y1="52" x2={px} y2="95" stroke="#94a3b8" strokeWidth="4" />
                    <text x={px} y="112" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
                      {reveal ? `${pin}:${MYSTERY_DATA[mystery].pins[pin as PinIdx]}` : `P${pin}`}
                    </text>
                    {hasBlack && <circle cx={px} cy="82" r="7" fill="#18181b" stroke="#fff" strokeWidth="2" />}
                    {hasRed && <circle cx={px} cy="70" r="7" fill="#dc2626" stroke="#fff" strokeWidth="2" />}
                  </g>
                );
              })}
            </svg>
            <div className="text-xs font-mono-num text-stone-500">
              ● Noir (+ batt.) · <span className="text-rose-600">● Rouge (− batt.)</span>
            </div>
          </div>
        </div>

        {/* Probe & Range Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              {lang === 'fr' ? 'Pointe NOIRE (+ interne)' : 'المجسّ الأسود (+ الداخلي)'}
            </span>
            <div className="flex gap-1.5">
              {([1, 2, 3] as PinIdx[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBlackPin(p)}
                  className={`flex-1 py-1.5 rounded-md border font-mono-num font-semibold cursor-pointer ${
                    blackPin === p
                      ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900'
                      : 'border-stone-300 dark:border-stone-700'
                  }`}
                >
                  Pin {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-rose-700 dark:text-rose-400">
              {lang === 'fr' ? 'Pointe ROUGE (− interne)' : 'المجسّ الأحمر (− الداخلي)'}
            </span>
            <div className="flex gap-1.5">
              {([1, 2, 3] as PinIdx[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRedPin(p)}
                  className={`flex-1 py-1.5 rounded-md border font-mono-num font-semibold cursor-pointer ${
                    redPin === p
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'border-stone-300 dark:border-stone-700'
                  }`}
                >
                  Pin {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            {(['x10', 'x10k'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold border cursor-pointer ${
                  range === r
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'border-stone-300 dark:border-stone-700'
                }`}
              >
                {r}
              </button>
            ))}
            {range === 'x10k' && (
              <button
                type="button"
                onClick={() => setFingerPress((f) => !f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                  fingerPress
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-stone-300 dark:border-stone-700'
                }`}
              >
                {fingerPress
                  ? lang === 'fr'
                    ? 'Doigt appuyé sur C & B'
                    : 'الإصبع يضغط على C و B'
                  : lang === 'fr'
                  ? 'Appuyer avec le doigt (C + B)'
                  : 'اضغط بإصبعك بين C و B'}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer whitespace-nowrap"
          >
            {reveal ? (lang === 'fr' ? 'Masquer' : 'إخفاء') : (lang === 'fr' ? 'Révéler le brochage' : 'كشف الأقطاب')}
          </button>
        </div>

        {reveal && (
          <div className="text-xs font-mono-num bg-amber-50 dark:bg-amber-950/30 border border-amber-400/50 rounded-lg p-3 text-stone-800 dark:text-amber-200">
            {lang === 'fr' ? MYSTERY_DATA[mystery].labelFr : MYSTERY_DATA[mystery].labelAr}
          </div>
        )}
      </section>

      {/* TOOL 2: RESISTOR COLOR CODE DECODER (pp. 13, 132-133) */}
      <section className="lg:col-span-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-5 flex flex-col gap-5">
        <div>
          <div className="text-xs font-mono-num text-amber-700 dark:text-amber-400">
            1-100 Transistor Circuits · pp. 13, 132–133
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50 mt-0.5">
            {lang === 'fr' ? 'Code couleur des résistances' : 'حاسبة ألوان المقاومات'}
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
            {lang === 'fr'
              ? 'Décodez les 4 anneaux des résistances du kit du livre (¼ W) ou cliquez sur une valeur classique.'
              : 'فكّ رموز ألوان مقاومات حقيبة الكتاب أو اختر إحدى القيم الشهيرة.'}
          </p>
        </div>

        {/* Realistic Resistor SVG */}
        <div className="bg-stone-100/80 dark:bg-stone-950/60 rounded-xl p-5 border border-stone-200 dark:border-stone-800 flex flex-col items-center gap-3">
          <svg viewBox="0 0 280 80" className="w-full max-w-[260px]" direction="ltr">
            <line x1="10" y1="40" x2="270" y2="40" stroke="#94a3b8" strokeWidth="6" />
            <rect x="65" y="16" width="150" height="48" rx="14" fill="#e7d6ac" stroke="#b49a67" strokeWidth="2" />
            {/* 4 Color Bands */}
            <rect x="86" y="17" width="14" height="46" fill={RESISTOR_COLORS[b1].hex} />
            <rect x="114" y="17" width="14" height="46" fill={RESISTOR_COLORS[b2].hex} />
            <rect x="142" y="17" width="14" height="46" fill={RESISTOR_COLORS[mult].hex} />
            <rect x="182" y="17" width="12" height="46" fill="#ca8a04" />
          </svg>
          <div className="text-2xl font-bold font-mono-num text-stone-900 dark:text-stone-50" dir="ltr">
            {formatOhms(resistorOhms)} <span className="text-sm font-normal text-stone-500">±5%</span>
          </div>
        </div>

        {/* Kit Presets */}
        <div className="flex flex-wrap gap-1.5">
          {KIT_PRESETS.map((pr) => (
            <button
              key={pr.label}
              type="button"
              onClick={() => {
                setB1(pr.b1);
                setB2(pr.b2);
                setMult(pr.mult);
              }}
              className="px-2.5 py-1 rounded-md text-xs font-mono-num border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
            >
              {pr.label}
            </button>
          ))}
        </div>

        {/* Band Selectors */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <label className="flex flex-col gap-1">
            <span className="text-stone-500">{lang === 'fr' ? '1er anneau' : 'الحلقة ١'}</span>
            <select
              value={b1}
              onChange={(e) => setB1(Number(e.target.value))}
              className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-2 py-1.5"
            >
              {RESISTOR_COLORS.slice(1).map((c, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {lang === 'fr' ? c.nameFr : c.nameAr}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-stone-500">{lang === 'fr' ? '2e anneau' : 'الحلقة ٢'}</span>
            <select
              value={b2}
              onChange={(e) => setB2(Number(e.target.value))}
              className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-2 py-1.5"
            >
              {RESISTOR_COLORS.map((c, idx) => (
                <option key={idx} value={idx}>
                  {lang === 'fr' ? c.nameFr : c.nameAr}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-stone-500">{lang === 'fr' ? 'Multiplicateur' : 'المضاعِف'}</span>
            <select
              value={mult}
              onChange={(e) => setMult(Number(e.target.value))}
              className="rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-2 py-1.5"
            >
              {RESISTOR_COLORS.slice(0, 7).map((c, idx) => (
                <option key={idx} value={idx}>
                  ×{c.mult >= 1e6 ? `${c.mult / 1e6}M` : c.mult >= 1e3 ? `${c.mult / 1e3}k` : c.mult}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
    </div>
  );
};
