export const VS_9V = 9;
export const VLED = 2;
export const R_220 = 220;
export const VBE = 0.6;
export const BETA_200 = 200;
export const IMAX_9V = ((VS_9V - VLED) / R_220) * 1000; // ~31.82 mA

export interface SimParams {
  chapterId: number;
  exampleId: string;
  catalogId?: string;
  // Shared / Basics
  pressure: number; // 0..100
  skinMoisture?: 'dry' | 'wet';
  supplySelect6or9?: 6 | 9;
  salinity?: 'pure' | 'normal' | 'fertilizer';
  // Testers & Logic
  transistorType: 'NPN' | 'PNP';
  batteryReversed: boolean;
  testerFault?: 'ok' | 'open' | 'short';
  logicInput: 'HIGH' | 'LOW' | 'FLOAT';
  // Capacitor Timing & Courtesy Light
  capTriggered: boolean;
  capCharge: number; // 0..1
  capValueUF: number; // 10..470
  doorOpen?: boolean;
  // Multi-stage / High Gain
  stages: 1 | 2 | 3;
  proximityCm: number; // 1..15 cm
  mainsFreqHz?: 50 | 60;
  // Sensors, Latch, PWM
  latchedOn: boolean;
  luxLevel: number; // 0..100
  schmittState: boolean;
  clapActive: boolean;
  micGain?: number; // 1..3
  vinSwitch: number; // 0..3.0 V
  loadKind: 'motor' | 'relay';
  pwmDuty: number; // 10..100 %
  motorLoad?: 'free' | 'heavy';
  // Oscillators & Chaser
  oscPhase: number; // 0..5
  oscSpeedR: number; // 4.7..47 kOhm
  chaserReverse?: boolean;
  sirenMode?: 'tick' | 'siren';
  // 1.5V Boosters
  pumpPhase: 'A' | 'B';
  cellVoltage: number; // 0.8..1.5 V
  openCircuitFault?: boolean;
  // Solar & Constant Current
  battVoltage: number; // 11.0..14.5 V
  solarDiverted: boolean;
  dummyLoadEnabled: boolean;
  sunIntensity?: number; // 20..100 %
  supplyV: number; // 6..15 V
  rSense: number; // 22, 47, 120
  ledSeriesCount?: 1 | 2 | 3;
  // Ch 9 Self-Bias
  rbSlider: number; // 0..100
  acSignalOn: boolean;
  acAmplitude?: number; // 0.3..3.0 V
  // #24 Analog Multimeter Transistor Tester
  mysteryType?: 'npn_ebc' | 'pnp_bce' | 'faulty';
  meterRange?: 'x10' | 'x10k';
  blackPin?: 1 | 2 | 3;
  redPin?: 1 | 2 | 3;
  fingerCB?: boolean;
  revealPins?: boolean;
}

export interface SimReadout {
  vbe: number;
  vce: number;
  vc: number;
  ibUA: number;
  icMA: number;
  betaEff: number;
  brightness: number; // 0..1
  conducting: boolean;
  staircaseLeds: number; // 0..4
  powerW?: number;
  powerMW?: number;
  freqHz?: number;
  meterDeflection?: number;
  warningFr?: string;
  warningAr?: string;
  statusFr: string;
  statusAr: string;
}

export function createDefaultSimParams(overrides: Partial<SimParams> = {}): SimParams {
  return {
    chapterId: 1,
    exampleId: 'simplest',
    pressure: 26,
    skinMoisture: 'dry',
    supplySelect6or9: 9,
    salinity: 'normal',
    transistorType: 'NPN',
    batteryReversed: false,
    testerFault: 'ok',
    logicInput: 'FLOAT',
    capTriggered: false,
    capCharge: 0,
    capValueUF: 100,
    doorOpen: false,
    stages: 1,
    proximityCm: 6,
    mainsFreqHz: 50,
    latchedOn: false,
    luxLevel: 65,
    schmittState: false,
    clapActive: false,
    micGain: 2,
    vinSwitch: 0.4,
    loadKind: 'motor',
    pwmDuty: 55,
    motorLoad: 'free',
    oscPhase: 0,
    oscSpeedR: 15,
    chaserReverse: false,
    sirenMode: 'tick',
    pumpPhase: 'A',
    cellVoltage: 1.5,
    openCircuitFault: false,
    battVoltage: 12.5,
    solarDiverted: false,
    dummyLoadEnabled: true,
    sunIntensity: 90,
    supplyV: 9.0,
    rSense: 22,
    ledSeriesCount: 1,
    rbSlider: 30,
    acSignalOn: true,
    acAmplitude: 2.0,
    mysteryType: 'npn_ebc',
    meterRange: 'x10',
    blackPin: 2,
    redPin: 1,
    fingerCB: false,
    revealPins: false,
    ...overrides,
  };
}

export function fingerResistance(pressure: number, moisture: 'dry' | 'wet' = 'dry'): number {
  const base = 20000 + Math.pow(1 - pressure / 100, 2) * 2000000;
  return moisture === 'wet' ? Math.max(4500, base * 0.25) : base;
}

export function computeCatalogSimulation(p: SimParams): SimReadout {
  switch (p.catalogId) {
    case 'worlds-simplest': {
      const vs = p.supplySelect6or9 ?? 9;
      const iMax = ((vs - VLED) / R_220) * 1000;
      const rf = fingerResistance(p.pressure, p.skinMoisture ?? 'dry');
      const ib = (vs - VBE) / rf;
      const ic = Math.min(BETA_200 * ib * 1000, iMax);
      const vce = Math.max(0.2, vs - VLED - (ic * R_220) / 1000);
      const powerMW = vce * ic;
      return {
        vbe: ic > 0.05 ? VBE : 0.25,
        vce,
        vc: vce,
        ibUA: ib * 1e6,
        icMA: ic,
        betaEff: BETA_200,
        brightness: Math.min(1, ic / Math.max(1, iMax)),
        conducting: ic > 0.1,
        staircaseLeds: 0,
        powerMW,
        statusFr:
          ic >= iMax * 0.9
            ? `Saturé sous ${vs} V (${ic.toFixed(1)} mA max · R_peau ${(rf / 1000).toFixed(0)} kΩ)`
            : `Régime linéaire sous ${vs} V (R_peau ${(rf / 1000).toFixed(0)} kΩ)`,
        statusAr:
          ic >= iMax * 0.9
            ? `تشبّع كامل على ${vs}V (${ic.toFixed(1)} mA · مقاومة الجلد ${(rf / 1000).toFixed(0)}kΩ)`
            : `تضخيم خطي على ${vs}V (مقاومة الجلد ${(rf / 1000).toFixed(0)}kΩ)`,
      };
    }

    case 'second-simplest': {
      const vs = 6;
      const iMax = ((vs - VLED) / R_220) * 1000; // ~18.18 mA
      const rf = fingerResistance(p.pressure, p.skinMoisture ?? 'dry');
      const ib = Math.max(0, (vs - 2 * VBE) / rf);
      const gain = BETA_200 * BETA_200; // 40,000
      const ic = Math.min(gain * ib * 1000, iMax);
      const vce = Math.max(0.2, vs - VLED - (ic * R_220) / 1000);
      return {
        vbe: ic > 0.1 ? 1.2 : 0.4,
        vce,
        vc: vce,
        ibUA: ib * 1e6,
        icMA: ic,
        betaEff: gain,
        brightness: Math.min(1, ic / iMax),
        conducting: ic > 0.1,
        staircaseLeds: 0,
        powerMW: vce * ic,
        statusFr: `Paire Super-Alpha 6 V : β = 40 000× · I_C = ${ic.toFixed(1)} mA`,
        statusAr: `زوج دارلنغتون 6V: تضخيم 40,000× · I_C = ${ic.toFixed(1)} mA`,
      };
    }

    case 'eight-million-gain': {
      const strength = Math.max(0, 1 - (p.proximityCm - 1) / 14);
      const ib = strength * 0.045;
      const gain = Math.pow(BETA_200, 3);
      const ic = Math.min((ib / 1e6) * gain * 1000, 18.2);
      const vce = ic > 0.2 ? Math.max(0.2, 6 - (ic / 18.2) * 5.6) : 6;
      return {
        vbe: ic > 0.2 ? 1.8 : 0.3,
        vce,
        vc: vce,
        ibUA: ib,
        icMA: ic,
        betaEff: gain,
        brightness: Math.min(1, ic / 18.2),
        conducting: ic > 0.2,
        staircaseLeds: 0,
        powerMW: vce * ic,
        statusFr:
          p.proximityCm <= 6
            ? `Champ électrostatique fort à ${p.proximityCm} cm (β = 8 000 000×) !`
            : p.proximityCm <= 12
            ? `Détection sans contact à ${p.proximityCm} cm`
            : 'Hors portée (> 12 cm)',
        statusAr:
          p.proximityCm <= 6
            ? `شحنة ساكنة قوية على بُعد ${p.proximityCm} cm (تضخيم ٨ ملايين)!`
            : p.proximityCm <= 12
            ? `التقاط عن بُعد ${p.proximityCm} cm`
            : 'خارج نطاق الالتقاط (> 12 cm)',
      };
    }

    case 'mains-hum': {
      const strength = Math.max(0, 1 - (p.proximityCm - 1) / 11);
      const ib = strength * 0.04;
      const gain = Math.pow(BETA_200, 3);
      const ic = Math.min((ib / 1e6) * gain * 1000, 18.2);
      const freq = p.mainsFreqHz ?? 50;
      return {
        vbe: ic > 0.2 ? 1.8 : 0.3,
        vce: ic > 0.2 ? Math.max(0.2, 6 - (ic / 18.2) * 5.6) : 6,
        vc: ic > 0.2 ? Math.max(0.2, 6 - (ic / 18.2) * 5.6) : 6,
        ibUA: ib,
        icMA: ic,
        betaEff: gain,
        brightness: Math.min(1, ic / 18.2),
        conducting: ic > 0.2,
        staircaseLeds: 0,
        freqHz: freq,
        statusFr:
          p.proximityCm <= 4
            ? `Câble secteur ${freq} Hz détecté à ${p.proximityCm} cm !`
            : p.proximityCm <= 8
            ? `Signal ${freq} Hz faible sur l’antenne (${p.proximityCm} cm)`
            : `Aucun rayonnement ${freq} Hz détecté (> 8 cm)`,
        statusAr:
          p.proximityCm <= 4
            ? `تم كشف سلك كهرباء ${freq}Hz على مسافة ${p.proximityCm} cm!`
            : p.proximityCm <= 8
            ? `إشارة ${freq}Hz ضعيفة (${p.proximityCm} cm)`
            : `خارج مجال السلك (> 8 cm)`,
      };
    }

    case 'plant-watering': {
      const salFactor = p.salinity === 'fertilizer' ? 0.35 : p.salinity === 'pure' ? 2.6 : 1.0;
      const rSoil = (5000 + Math.pow(1 - p.pressure / 100, 2) * 800000) * salFactor;
      const ib = (3 - VBE) / (220000 + rSoil);
      const ic = Math.min(BETA_200 * ib * 1000, 2.2);
      const bright = Math.min(1, ic / 2.0);
      return {
        vbe: ic > 0.02 ? VBE : 0.2,
        vce: Math.max(0.2, 3 - (ic / 2.2) * 1.1),
        vc: 3 - (ic / 2.2) * 1.1,
        ibUA: ib * 1e6,
        icMA: ic,
        betaEff: BETA_200,
        brightness: bright,
        conducting: ic > 0.08,
        staircaseLeds: 0,
        statusFr:
          ic > 0.85
            ? `Terre conductrice (R_sol ≈ ${(rSoil / 1000).toFixed(0)} kΩ) : LED allumée (~${ic.toFixed(1)} mA)`
            : `Sol trop sec ou eau trop pure (R_sol ≈ ${(rSoil / 1000).toFixed(0)} kΩ) : arroser !`,
        statusAr:
          ic > 0.85
            ? `تربة موصلة (${(rSoil / 1000).toFixed(0)} kΩ): المصباح مضيء (~${ic.toFixed(1)} mA)`
            : `تربة جافة أو قليلة الأملاح (${(rSoil / 1000).toFixed(0)} kΩ): يحتاج سقياً!`,
      };
    }

    case 'simplest-tester': {
      const fault = p.testerFault ?? 'ok';
      if (fault === 'short') {
        return {
          vbe: 0.05,
          vce: 0.05,
          vc: 0.05,
          ibUA: 0,
          icMA: 36,
          betaEff: 1,
          brightness: 1,
          conducting: true,
          staircaseLeds: 0,
          warningFr: 'Défaut Court-Circuit C–E : LED allumée même sans appuyer !',
          warningAr: 'عطل قصر داخلي C–E: المصباح يضيء حتى بدون ضغط!',
          statusFr: 'Transistor en court-circuit interne C–E (Défectueux)',
          statusAr: 'الترانزستور تالف (قصر داخلي بين المجمّع والباعث)',
        };
      }
      if (fault === 'open') {
        return {
          vbe: 0,
          vce: VS_9V,
          vc: VS_9V,
          ibUA: 0,
          icMA: 0,
          betaEff: 0,
          brightness: 0,
          conducting: false,
          staircaseLeds: 0,
          warningFr: 'Jonction ouverte : aucune conduction dans aucun sens',
          warningAr: 'وصلة مقطوعة داخلياً: لا يوصّل في أي اتجاه',
          statusFr: 'Transistor coupé (circuit ouvert interne) — à rejeter',
          statusAr: 'الترانزستور تالف (انقطاع داخلي) — يجب استبداله',
        };
      }
      const ok = (p.transistorType === 'NPN') !== p.batteryReversed;
      const rf = fingerResistance(p.pressure, p.skinMoisture ?? 'dry');
      const ib = ok ? (VS_9V - VBE) / rf : 0;
      const ic = ok ? Math.min(BETA_200 * ib * 1000, IMAX_9V) : 0;
      const vce = ok ? Math.max(0.2, VS_9V - VLED - (ic * R_220) / 1000) : VS_9V;
      return {
        vbe: ok ? VBE : 0,
        vce,
        vc: vce,
        ibUA: ib * 1e6,
        icMA: ic,
        betaEff: BETA_200,
        brightness: ic / IMAX_9V,
        conducting: ok && ic > 0.1,
        staircaseLeds: 0,
        statusFr: ok
          ? `${p.transistorType} bon & bien polarisé : LED allumée (${ic.toFixed(1)} mA)`
          : `${p.transistorType} bloqué : inversez la pile 9 V pour tester !`,
        statusAr: ok
          ? `${p.transistorType} سليم وبقطبية صحيحة: المصباح مضاء (${ic.toFixed(1)} mA)`
          : `${p.transistorType} متوقف: اقلب البطارية 9V للتحقق منه!`,
      };
    }

    case 'logic-probe': {
      const isHigh = p.logicInput === 'HIGH';
      const isLow = p.logicInput === 'LOW';
      const ic = isHigh ? 9.5 : isLow ? 7.2 : 0;
      return {
        vbe: isHigh || isLow ? VBE : 0,
        vce: isHigh || isLow ? 0.2 : 3.0,
        vc: isHigh || isLow ? 0.2 : 3.0,
        ibUA: isHigh ? 170 : isLow ? 140 : 0,
        icMA: ic,
        betaEff: BETA_200,
        brightness: isHigh || isLow ? 1 : 0,
        conducting: isHigh || isLow,
        staircaseLeds: 0,
        statusFr: isHigh
          ? 'Pointe sur HIGH (+3 V / +5 V) → BC547 NPN conduit → LED Rouge ON'
          : isLow
          ? 'Pointe sur LOW (0 V) → BC557 PNP conduit → LED Verte ON'
          : 'Pointe en l’air (Haute Z) : somme seuils ≈ 5 V > 3 V → 0,0 mA',
        statusAr: isHigh
          ? 'إشارة HIGH ← يعمل BC547 NPN وتضيء LED الحمراء'
          : isLow
          ? 'إشارة LOW ← يعمل BC557 PNP وتضيء LED الخضراء'
          : 'فراغ (عائم): مجموع العتبات ~5V > 3V ← استهلاك 0.0 mA',
      };
    }

    case 'courtesy-light': {
      const doorOpen = Boolean(p.doorOpen);
      const rem = doorOpen ? 1 : p.capTriggered ? Math.max(0, 1 - p.capCharge) : 0;
      const ic = rem * 180; // 12V car dome bulb ~180 mA
      const ib = (ic / 1200) * 1000; // BC557 + BD679 Darlington ~1200+ gain
      return {
        vbe: rem > 0.04 ? 1.25 : 0,
        vce: rem > 0.04 ? Math.max(0.4, 12 - rem * 11.4) : 12,
        vc: rem > 0.04 ? Math.max(0.4, 12 - rem * 11.4) : 12,
        ibUA: ib,
        icMA: ic,
        betaEff: 1200,
        brightness: rem,
        conducting: rem > 0.04,
        staircaseLeds: 0,
        powerMW: rem * 12 * ic,
        statusFr: doorOpen
          ? 'Portière OUVERTE : condensateur 47 µF déchargé → Plafonnier 12 V à 100 %'
          : p.capCharge >= 0.98
          ? 'Condensateur plein : plafonnier éteint progressivement (0 mA)'
          : p.capTriggered
          ? `Portière fermée : temporisation active (${Math.round(rem * 100)} % · ${p.capValueUF} µF)`
          : 'Portière fermée : ouvrez puis refermez la portière pour lancer le fondu',
        statusAr: doorOpen
          ? 'الباب مفتوح: المكثف مفرّغ ← مصباح السقف 12V بأقصى إضاءة'
          : p.capCharge >= 0.98
          ? 'المكثف ممتلئ: انطفأ المصباح تدريجياً (0 mA)'
          : p.capTriggered
          ? `تم إغلاق الباب: تخميد تدريجي (${Math.round(rem * 100)}% · ${p.capValueUF}µF)`
          : 'افتح الباب ثم أغلقه لتشغيل التأخير الزمني',
      };
    }

    case 'touch-switch-globe': {
      const on = p.latchedOn;
      return {
        vbe: on ? VBE : 0,
        vce: on ? 0.2 : 6,
        vc: on ? 0.2 : 6,
        ibUA: on ? 1.15 : 0,
        icMA: on ? 22 : 0,
        betaEff: 40000,
        brightness: on ? 1 : 0,
        conducting: on,
        staircaseLeds: 0,
        statusFr: on
          ? 'Lampe verrouillée ON par boucle de rétroaction 4,7 MΩ'
          : 'Lampe coupée (touchez pastille ON pour amorcer le verrou)',
        statusAr: on
          ? 'المصباح مثبّت في وضع التشغيل عبر مقاومة 4.7MΩ'
          : 'المصباح مطفأ (المس لوح ON لتثبيت التشغيل)',
      };
    }

    case 'lie-detector-staircase': {
      const rf = fingerResistance(p.pressure, p.skinMoisture ?? 'dry');
      const vBase = 9 * (100000 / (100000 + rf));
      const leds =
        vBase >= 2.4 ? 4 : vBase >= 1.8 ? 3 : vBase >= 1.2 ? 2 : vBase >= 0.6 ? 1 : 0;
      const ib = Math.max(0, (9 - VBE) / rf);
      const ic = leds * 7.5;
      return {
        vbe: leds > 0 ? VBE : vBase,
        vce: leds > 0 ? 0.2 : 9,
        vc: leds > 0 ? 0.2 : 9,
        ibUA: ib * 1e6,
        icMA: ic,
        betaEff: BETA_200,
        brightness: leds / 4,
        conducting: leds > 0,
        staircaseLeds: leds,
        statusFr: `${leds} / 4 LEDs allumées · V_diviseur = ${vBase.toFixed(2)} V (Seuils : 0,6 / 1,2 / 1,8 / 2,4 V)`,
        statusAr: `إضاءة ${leds} من 4 مصابيح · الجهد = ${vBase.toFixed(2)}V (العتبات: 0.6 / 1.2 / 1.8 / 2.4V)`,
      };
    }

    case 'night-light': {
      const vs = p.supplySelect6or9 === 6 ? 6 : 12;
      const on = p.luxLevel <= 40;
      const ib = on ? 62 : Math.max(0, (55 - p.luxLevel) * 1.2);
      const ic = on ? (vs === 12 ? 32 : 18) : 0;
      return {
        vbe: on ? VBE : 0.3,
        vce: on ? 0.2 : vs,
        vc: on ? 0.2 : vs,
        ibUA: ib,
        icMA: ic,
        betaEff: BETA_200,
        brightness: on ? 1 : 0,
        conducting: on,
        staircaseLeds: 0,
        statusFr: on
          ? `Crépuscule (${p.luxLevel}% ≤ 40%) → Relais ${vs} V COLLÉ · Veilleuse ON`
          : `Jour (${p.luxLevel}% > 40%) → LDR basse résistance · Relais OUVERT`,
        statusAr: on
          ? `غسق/ظلام (${p.luxLevel}% ≤ 40%) ← المرحّل ${vs}V موصول والإنارة تعمل`
          : `ضوء نهار (${p.luxLevel}% > 40%) ← المرحّل مفصول`,
      };
    }

    case 'schmitt-trigger': {
      const on = p.schmittState;
      return {
        vbe: on ? VBE : 0.35,
        vce: on ? 0.2 : 6,
        vc: on ? 0.2 : 6,
        ibUA: on ? 45 : 0,
        icMA: on ? 18 : 0,
        betaEff: BETA_200,
        brightness: on ? 1 : 0,
        conducting: on,
        staircaseLeds: 0,
        statusFr: on
          ? `Seuil bas franchi (≤ 30%) → État ON verrouillé (jusqu’à 55%)`
          : `Seuil haut franchi (≥ 55%) → État OFF franc (sans scintillement)`,
        statusAr: on
          ? `تجاوز العتبة السفلى (≤ 30%) ← تشغيل ثابت حتى 55%`
          : `تجاوز العتبة العليا (≥ 55%) ← إطفاء حاسم بلا ارتعاش`,
      };
    }

    case 'sound-triggered-led': {
      const on = p.clapActive;
      const g = p.micGain ?? 2;
      const ic = on ? 12 + g * 4 : 0;
      return {
        vbe: on ? VBE : 0,
        vce: on ? 0.2 : 6,
        vc: on ? 0.2 : 6,
        ibUA: on ? 45 * g : 0,
        icMA: ic,
        betaEff: BETA_200 * g,
        brightness: on ? Math.min(1, 0.5 + g * 0.18) : 0,
        conducting: on,
        staircaseLeds: 0,
        statusFr: on
          ? `Claquement capté (Sensibilité ×${g}) ! 10 µF chargé via 1N4148`
          : 'Micro Électret en écoute (Silence)',
        statusAr: on
          ? `تم التقاط التصفيق (حساسية ×${g})! مكثف 10µF يغذّي القاعدة`
          : 'الميكروفون في وضع الاستماع (هدوء)',
      };
    }

    case 'robot-man': {
      const freqHz = 1 / (1.38 * (p.oscSpeedR * 1000) * 100e-6) * 4.5; // scaled nicely for 100u/R
      const q1On = p.oscPhase % 2 === 0;
      return {
        vbe: VBE,
        vce: 0.2,
        vc: 0.2,
        ibUA: 420,
        icMA: 18,
        betaEff: BETA_200,
        brightness: 1,
        conducting: true,
        staircaseLeds: 0,
        freqHz,
        statusFr: `Multivibrateur ${freqHz.toFixed(1)} Hz · ${q1On ? 'Q1 ON (Œil Gauche)' : 'Q2 ON (Œil Droit)'}`,
        statusAr: `وميض متناوب ${freqHz.toFixed(1)} Hz · ${q1On ? 'Q1 مضيء (العين ١)' : 'Q2 مضيء (العين ٢)'}`,
      };
    }

    case 'three-led-chaser': {
      const freqHz = 1 / (1.38 * (p.oscSpeedR * 1000) * 22e-6);
      const step = (p.oscPhase % 3) + 1;
      return {
        vbe: VBE,
        vce: 0.2,
        vc: 0.2,
        ibUA: 380,
        icMA: 14,
        betaEff: BETA_200,
        brightness: 1,
        conducting: true,
        staircaseLeds: 0,
        freqHz,
        statusFr: `Chenillard en anneau ${freqHz.toFixed(1)} Hz · Étage actif : LED ${step}/3`,
        statusAr: `ملاحق حلقي ${freqHz.toFixed(1)} Hz · المرحلة النشطة: LED ${step}/3`,
      };
    }

    case 'ticking-bomb': {
      const isSiren = p.sirenMode === 'siren';
      const freqHz = isSiren
        ? 420 + (p.oscPhase % 3) * 190
        : 240 / Math.max(4.7, p.oscSpeedR);
      return {
        vbe: VBE,
        vce: 0.2,
        vc: 0.2,
        ibUA: isSiren ? 780 : 420,
        icMA: isSiren ? 32 : 18,
        betaEff: 40000,
        brightness: 1,
        conducting: true,
        staircaseLeds: 0,
        freqHz,
        statusFr: isSiren
          ? `Mode Sirène modulée (~${freqHz.toFixed(0)} Hz) sur HP 8 Ω`
          : `Mode Tic-Tac rythmé (${freqHz.toFixed(1)} Hz · R = ${p.oscSpeedR} kΩ)`,
        statusAr: isSiren
          ? `وضع الصفّارة المتصاعدة (~${freqHz.toFixed(0)} Hz) على سماعة 8Ω`
          : `وضع النبضات الإيقاعية (${freqHz.toFixed(1)} Hz · R = ${p.oscSpeedR}kΩ)`,
      };
    }

    case 'led-on-1v5': {
      const isB = p.pumpPhase === 'B';
      const vTotal = p.cellVoltage + 1.0;
      const ok = isB && vTotal >= 1.7;
      return {
        vbe: VBE,
        vce: ok ? 0.2 : 1.3,
        vc: ok ? vTotal : 1.3,
        ibUA: 380,
        icMA: ok ? 12.5 : 4.5,
        betaEff: BETA_200,
        brightness: ok ? 1 : 0.08,
        conducting: ok,
        staircaseLeds: 0,
        statusFr: isB
          ? `Phase B (Décharge série) : ${p.cellVoltage.toFixed(2)} V + 1,0 V = ${vTotal.toFixed(2)} V → LED ON`
          : `Phase A (Charge 1 µF) : stockage d’énergie depuis pile ${p.cellVoltage.toFixed(2)} V`,
        statusAr: isB
          ? `الطور B (تفريغ متوالٍ): ${p.cellVoltage.toFixed(2)}V + 1.0V = ${vTotal.toFixed(2)}V ← إضاءة LED`
          : `الطور A (شحن 1µF): تخزين الشحنة من بطارية ${p.cellVoltage.toFixed(2)}V`,
      };
    }

    case 'bike-flasher-air': {
      const alive = p.cellVoltage >= 0.9;
      const openFault = Boolean(p.openCircuitFault);
      if (openFault) {
        return {
          vbe: alive ? VBE : 0.2,
          vce: 48,
          vc: 48,
          ibUA: 420,
          icMA: 0,
          betaEff: BETA_200,
          brightness: 0,
          conducting: false,
          staircaseLeds: 0,
          warningFr: 'DANGER Circuit Ouvert (p. 40) : LED débranchée → surtension bobine > 48 V sur le collecteur !',
          warningAr: 'تحذير دارة مفتوحة (ص ٤٠): فصل الـ LED يرفع نبضة الملف إلى > 48V وقد يتلف الترانزستور!',
          statusFr: 'Surtension non clampée à vide (V_C > 48 V)',
          statusAr: 'نبضة جهد خطرة في غياب الـ LED (V_C > 48V)',
        };
      }
      const flashOn = alive && p.oscPhase % 2 === 0;
      const peakV = alive ? 6.4 + (p.cellVoltage - 0.9) * 0.8 : p.cellVoltage;
      return {
        vbe: flashOn ? VBE : 0.2,
        vce: flashOn ? 0.2 : p.cellVoltage,
        vc: peakV,
        ibUA: flashOn ? 460 : 25,
        icMA: flashOn ? 24 : 1.2,
        betaEff: BETA_200,
        brightness: flashOn ? 1 : 0.06,
        conducting: flashOn,
        staircaseLeds: 0,
        statusFr: alive
          ? `Bobine à air 30+30t : flashs > ${peakV.toFixed(1)} V (2 LEDs blanches en série)`
          : 'Pile trop faible (< 0,90 V)',
        statusAr: alive
          ? `ملف هوائي 30+30: ومضات > ${peakV.toFixed(1)}V (مصباحان أبيضان على التوالي)`
          : 'البطارية ضعيفة جداً (< 0.90V)',
      };
    }

    case 'led-torch-1v5': {
      const alive = p.cellVoltage >= 0.85;
      const openFault = Boolean(p.openCircuitFault);
      if (openFault && alive) {
        return {
          vbe: VBE,
          vce: 62,
          vc: 62,
          ibUA: 550,
          icMA: 0,
          betaEff: BETA_200,
          brightness: 0,
          conducting: false,
          staircaseLeds: 0,
          freqHz: 250000,
          warningFr: 'DANGER (p. 103) : Sans LED pour limiter à 3,4 V, la ferrite F29 génère 60 V+ et détruit BC337 !',
          warningAr: 'تحذير (ص ١٠٣): بدون الـ LED لتثبيت الجهد عند 3.4V، يولّد ملف الفيريت >60V ويتلف BC337!',
          statusFr: 'Surtension ferrite non clampée (~62 V crête)',
          statusAr: 'نبضة فائقة الخطورة بدون LED (~62V)',
        };
      }
      const peakV = alive ? 3.4 + (p.cellVoltage - 0.8) * 0.4 : p.cellVoltage;
      const bright = alive ? Math.min(1, (p.cellVoltage - 0.7) / 0.8) : 0;
      const freqHz = alive ? 180000 + (p.cellVoltage - 0.85) * 320000 : 0;
      return {
        vbe: alive ? VBE : 0.3,
        vce: alive ? 0.2 : p.cellVoltage,
        vc: peakV,
        ibUA: alive ? 550 : 0,
        icMA: alive ? 28 * bright : 0,
        betaEff: BETA_200,
        brightness: bright,
        conducting: alive,
        staircaseLeds: 0,
        freqHz,
        statusFr: alive
          ? `Ferrite F29 (${(freqHz / 1000).toFixed(0)} kHz) : crêtes ${peakV.toFixed(1)} V · Torche LED ON`
          : 'Pile vide (< 0,85 V)',
        statusAr: alive
          ? `فيريت F29 (${(freqHz / 1000).toFixed(0)} kHz): نبضات ${peakV.toFixed(1)}V · الكشّاف يعمل`
          : 'البطارية منتهية (< 0.85V)',
      };
    }

    case 'solar-charger': {
      const sun = p.sunIntensity ?? 90;
      const panelV = 8 + (sun / 100) * 10; // up to 18V
      const canCharge = panelV > p.battVoltage + 0.7;
      const pw = p.solarDiverted && p.dummyLoadEnabled ? (panelV * panelV) / 100 : 0;
      return {
        vbe: p.solarDiverted ? 0.65 : 0.45,
        vce: p.solarDiverted ? 0.2 : p.battVoltage,
        vc: p.battVoltage,
        ibUA: p.solarDiverted ? 220 : 15,
        icMA: p.solarDiverted ? 25 : 0,
        betaEff: BETA_200,
        brightness: p.solarDiverted ? 0 : canCharge ? sun / 100 : 0.1,
        conducting: !p.solarDiverted && canCharge,
        staircaseLeds: 0,
        powerW: pw,
        warningFr:
          !p.solarDiverted && !canCharge
            ? `Ensoleillement insuffisant (${panelV.toFixed(1)} V ≤ V_batt) : diode anti-retour bloquée`
            : undefined,
        warningAr:
          !p.solarDiverted && !canCharge
            ? `الإشعاع الشمسي ضعيف (${panelV.toFixed(1)}V): دايود المنع يحمي البطارية من التفريغ`
            : undefined,
        statusFr: p.solarDiverted
          ? p.dummyLoadEnabled
            ? `Coupure 13,7 V → Dérivation vers 100 Ω (${pw.toFixed(2)} W dissipés)`
            : 'Coupure 13,7 V (charge factice débranchée)'
          : canCharge
          ? `Panneau ${panelV.toFixed(1)} V (${sun}%) → Charge active de la batterie ${p.battVoltage.toFixed(1)} V`
          : `Sous-tension solaire (${panelV.toFixed(1)} V) : attente soleil`,
        statusAr: p.solarDiverted
          ? p.dummyLoadEnabled
            ? `فصل 13.7V ← تحويل نحو مقاومة 100Ω (${pw.toFixed(2)}W)`
            : 'تم فصل الشحن عند 13.7V'
          : canCharge
          ? `اللوح ${panelV.toFixed(1)}V (${sun}%) يشحن البطارية (${p.battVoltage.toFixed(1)}V)`
          : `جهد اللوح منخفض (${panelV.toFixed(1)}V): في انتظار الشمس`,
      };
    }

    case 'constant-current-source': {
      const count = p.ledSeriesCount ?? 1;
      const ledDrop = count * 2.1; // ~2.1V per LED
      const iTargetMA = (0.62 / p.rSense) * 1000;
      const headroomV = Math.max(0, p.supplyV - ledDrop - 0.62);
      const maxPossible = (headroomV / p.rSense) * 1000 * 1.4;
      const ic = Math.max(0, Math.min(iTargetMA, maxPossible));
      const vce = Math.max(0.25, p.supplyV - ledDrop - (ic / 1000) * p.rSense);
      const starving = ic < iTargetMA * 0.9;
      return {
        vbe: VBE,
        vce,
        vc: vce,
        ibUA: (ic / 100) * 1000,
        icMA: ic,
        betaEff: 100,
        brightness: Math.min(1, ic / 30),
        conducting: ic > 0.5,
        staircaseLeds: count,
        powerMW: vce * ic,
        warningFr: starving
          ? `Réserve de tension insuffisante pour ${count} LEDs en série sous ${p.supplyV.toFixed(1)} V`
          : undefined,
        warningAr: starving
          ? `جهد التغذية (${p.supplyV.toFixed(1)}V) لا يكفي لتثبيت التيار مع ${count} مصابيح على التوالي`
          : undefined,
        statusFr: starving
          ? `Hors régulation : ${ic.toFixed(1)} mA (augmentez +V pour ${count} LEDs)`
          : `Régulation verrouillée à ${ic.toFixed(1)} mA · ${count} LED(s) · P_Q2 = ${(vce * ic).toFixed(0)} mW`,
        statusAr: starving
          ? `خارج التنظيم: ${ic.toFixed(1)} mA (ارفع الجهد لـ ${count} مصابيح)`
          : `تيار ثابت ${ic.toFixed(1)} mA · ${count} مصباح · حرارة Q2 = ${(vce * ic).toFixed(0)} mW`,
      };
    }

    case 'motor-speed-control': {
      const duty = p.pwmDuty / 100;
      const heavy = p.motorLoad === 'heavy';
      const stallThreshold = heavy ? 25 : 12;
      const spinning = p.pwmDuty >= stallThreshold;
      const ic = (heavy ? 360 : 260) * duty;
      return {
        vbe: VBE,
        vce: 0.2,
        vc: 0.2,
        ibUA: 1400 * duty,
        icMA: ic,
        betaEff: 200,
        brightness: spinning ? duty : 0.05,
        conducting: spinning,
        staircaseLeds: 0,
        powerMW: 3 * ic,
        warningFr: !spinning
          ? `Charge mécanique lourde : augmentez le PWM ≥ ${stallThreshold}% pour démarrer`
          : undefined,
        warningAr: !spinning
          ? `حمل ميكانيكي ثقيل: ارفع نسبة PWM ≥ ${stallThreshold}% لبدء الدوران`
          : undefined,
        statusFr: spinning
          ? `PWM ${p.pwmDuty}% (${heavy ? 'Charge lourde' : 'À vide'}) · I_moy = ${ic.toFixed(0)} mA`
          : `Moteur bloqué sous charge (${p.pwmDuty}% < ${stallThreshold}%)`,
        statusAr: spinning
          ? `نبضات PWM ${p.pwmDuty}% (${heavy ? 'حمل ثقيل' : 'حر'}) · ${ic.toFixed(0)} mA`
          : `المحرك متوقف تحت الحمل (${p.pwmDuty}% < ${stallThreshold}%)`,
      };
    }

    case 'self-bias-ce': {
      const rb = 100000 * Math.pow(100, p.rbSlider / 100);
      const ib = (5 - VBE) / rb;
      const ic = Math.min(57 * ib, 5 / 22000);
      const vc = Math.max(0.2, 5 - ic * 22000);
      const amp = p.acAmplitude ?? 2.0;
      const clipped = p.acSignalOn && (vc + amp > 4.95 || vc - amp < 0.25);
      return {
        vbe: VBE,
        vce: vc,
        vc,
        ibUA: ib * 1e6,
        icMA: ic * 1000,
        betaEff: 57,
        brightness: Math.max(0, 1 - Math.abs(vc - 2.5) / 2.5),
        conducting: ic > 0,
        staircaseLeds: 0,
        warningFr: clipped ? `Écrêtage détecté avec ±${amp.toFixed(1)} V ! Centrez V_C à 2,50 V` : undefined,
        warningAr: clipped ? `تشوّه قصّ مع إشارة ±${amp.toFixed(1)}V! قرّب V_C إلى 2.50V` : undefined,
        statusFr:
          Math.abs(vc - 2.5) < 0.12
            ? `Point Q centré (${vc.toFixed(2)} V) · Excursion max ±${amp.toFixed(1)} V propre`
            : vc < 2.5
            ? `V_C = ${vc.toFixed(2)} V (trop bas → risque d’écrêtage inférieur)`
            : `V_C = ${vc.toFixed(2)} V (trop haut → risque d’écrêtage supérieur)`,
        statusAr:
          Math.abs(vc - 2.5) < 0.12
            ? `نقطة التشغيل في المنتصف (${vc.toFixed(2)}V) · تكبير نظيف ±${amp.toFixed(1)}V`
            : vc < 2.5
            ? `V_C = ${vc.toFixed(2)}V (منخفض جداً → قصّ سفلي)`
            : `V_C = ${vc.toFixed(2)}V (مرتفع جداً → قصّ علوي)`,
      };
    }

    case 'multimeter-tester': {
      const mType = p.mysteryType ?? 'npn_ebc';
      const range = p.meterRange ?? 'x10';
      const bPin = p.blackPin ?? 2;
      const rPin = p.redPin ?? 1;
      const finger = Boolean(p.fingerCB);

      const pinMap: Record<1 | 2 | 3, 'E' | 'B' | 'C'> =
        mType === 'pnp_bce' ? { 1: 'B', 2: 'C', 3: 'E' } : { 1: 'E', 2: 'B', 3: 'C' };
      const pB = pinMap[bPin];
      const pR = pinMap[rPin];

      let defl = 0.02;
      if (bPin === rPin) {
        defl = 1.0;
      } else if (mType === 'faulty') {
        defl = 0.96;
      } else if (range === 'x10') {
        if (mType === 'npn_ebc' && pB === 'B' && (pR === 'C' || pR === 'E')) defl = 0.78;
        else if (mType === 'pnp_bce' && pR === 'B' && (pB === 'C' || pB === 'E')) defl = 0.78;
      } else {
        if (finger) {
          if (mType === 'npn_ebc' && pB === 'C' && pR === 'E') defl = 0.89;
          else if (mType === 'pnp_bce' && pR === 'C' && pB === 'E') defl = 0.89;
          else if (
            (mType === 'npn_ebc' && pB === 'E' && pR === 'C') ||
            (mType === 'pnp_bce' && pR === 'E' && pB === 'C')
          ) {
            defl = 0.14;
          }
        }
      }

      const conducting = defl > 0.5;
      return {
        vbe: conducting ? (range === 'x10' ? 0.65 : 0.58) : 0,
        vce: conducting ? (range === 'x10k' ? 0.35 : 0.7) : 3.0,
        vc: conducting ? 0.4 : 3.0,
        ibUA: range === 'x10k' && finger && conducting ? 18 : conducting ? 800 : 0,
        icMA: bPin === rPin ? 45 : mType === 'faulty' ? 40 : conducting ? (range === 'x10' ? 12 : 2.8) : 0,
        betaEff: range === 'x10k' && finger && conducting ? BETA_200 : 1,
        brightness: defl,
        conducting,
        staircaseLeds: 0,
        meterDeflection: defl,
        statusFr:
          bPin === rPin
            ? `Pointes en contact (P${bPin}) : 0 Ω (test de continuité)`
            : mType === 'faulty'
            ? `Déviation totale (${Math.round(defl * 100)}%) dans tous les sens : JONCTION EN COURT-CIRCUIT`
            : range === 'x10'
            ? conducting
              ? `Calibre ×10 : jonction passante P${bPin}(+) → P${rPin}(−) (~${Math.round(defl * 100)}%)`
              : `Calibre ×10 : résistance ∞ (jonction bloquée entre P${bPin} et P${rPin})`
            : conducting
            ? `Calibre ×10k + Doigt : forte déviation (${Math.round(defl * 100)}%) → Collecteur = ${mType === 'npn_ebc' ? `P${bPin}` : `P${rPin}`} !`
            : finger
            ? defl > 0.1
              ? 'Déviation très faible (polarité C/E inversée !)'
              : 'Aucune conduction (vérifiez la polarité C–E)'
            : 'Calibre ×10k : appuyez avec le doigt sur B+C pour amplifier !',
        statusAr:
          bPin === rPin
            ? `تلامس المجسّين على (P${bPin}): 0Ω`
            : mType === 'faulty'
            ? `انحراف كامل في كل الاتجاهات: الترانزستور تالف (قصر داخلي)`
            : range === 'x10'
            ? conducting
              ? `تدريج x10: توصيل أمامي من P${bPin}(+) إلى P${rPin}(−)`
              : `تدريج x10: مقاومة ∞ (مقطوع بين P${bPin} و P${rPin})`
            : conducting
            ? `تدريج x10k + الإصبع: انحراف قوي (${Math.round(defl * 100)}%) ← المجمّع C هو ${mType === 'npn_ebc' ? `P${bPin}` : `P${rPin}`}!`
            : finger
            ? 'انحراف ضعيف أو معدوم (اعكس طرفي C و E)'
            : 'تدريج x10k: اضغط بإصبعك بين القاعدة والمجمّع لقياس التضخيم!',
      };
    }

    default:
      break;
  }

  return computeChapterSimulation(p);
}

export function computeSimulation(p: SimParams): SimReadout {
  if (p.catalogId) {
    return computeCatalogSimulation(p);
  }
  return computeChapterSimulation(p);
}

function computeChapterSimulation(p: SimParams): SimReadout {
  switch (p.chapterId) {
    case 1: {
      if (p.exampleId === 'plant') {
        const rSoil = 5000 + Math.pow(1 - p.pressure / 100, 2) * 800000;
        const ib = (3 - VBE) / (220000 + rSoil);
        const ic = Math.min(BETA_200 * ib * 1000, 2.2);
        const bright = Math.min(1, ic / 2.0);
        return {
          vbe: ic > 0.02 ? VBE : 0.2,
          vce: Math.max(0.2, 3 - (ic / 2.2) * 1.1),
          vc: 3 - (ic / 2.2) * 1.1,
          ibUA: ib * 1e6,
          icMA: ic,
          betaEff: BETA_200,
          brightness: bright,
          conducting: ic > 0.05,
          staircaseLeds: 0,
          statusFr: ic > 0.8 ? 'Sol conducteur : LED allumée (~2 mA)' : 'Sol sec : quasi aucun courant',
          statusAr: ic > 0.8 ? 'التربة موصلة: يضيء الـ LED (~2mA)' : 'التربة جافة: تيار ضعيف جداً',
        };
      }
      if (p.exampleId === 'staircase') {
        const rf = fingerResistance(p.pressure);
        const vBase = 9 * (100000 / (100000 + rf));
        const leds =
          vBase >= 2.4 ? 4 : vBase >= 1.8 ? 3 : vBase >= 1.2 ? 2 : vBase >= 0.6 ? 1 : 0;
        const ib = Math.max(0, (9 - VBE) / rf);
        const ic = leds * 7.5;
        return {
          vbe: leds > 0 ? VBE : vBase,
          vce: leds > 0 ? 0.2 : 9,
          vc: leds > 0 ? 0.2 : 9,
          ibUA: ib * 1e6,
          icMA: ic,
          betaEff: BETA_200,
          brightness: leds / 4,
          conducting: leds > 0,
          staircaseLeds: leds,
          statusFr: `${leds} / 4 LEDs allumées (V_base ≈ ${vBase.toFixed(2)} V)`,
          statusAr: `إضاءة ${leds} من 4 مصابيح (جهد الدخل ≈ ${vBase.toFixed(2)} V)`,
        };
      }
      const rf = fingerResistance(p.pressure);
      const ib = (VS_9V - VBE) / rf;
      const ic = Math.min(BETA_200 * ib * 1000, IMAX_9V);
      const vce = Math.max(0.2, VS_9V - VLED - (ic * R_220) / 1000);
      return {
        vbe: VBE,
        vce,
        vc: vce,
        ibUA: ib * 1e6,
        icMA: ic,
        betaEff: BETA_200,
        brightness: Math.min(1, ic / IMAX_9V),
        conducting: ic > 0.1,
        staircaseLeds: 0,
        statusFr: ic >= IMAX_9V * 0.9 ? 'Saturé (luminosité max)' : 'Régime linéaire (I_C = β·I_B)',
        statusAr: ic >= IMAX_9V * 0.9 ? 'تشبّع كامل (أقصى سطوع)' : 'تضخيم خطي (I_C = β·I_B)',
      };
    }

    case 2: {
      if (p.exampleId === 'logic-probe') {
        const isHigh = p.logicInput === 'HIGH';
        const isLow = p.logicInput === 'LOW';
        const ic = isHigh ? 9.5 : isLow ? 7.2 : 0;
        return {
          vbe: isHigh || isLow ? VBE : 0,
          vce: isHigh || isLow ? 0.2 : 3.0,
          vc: isHigh || isLow ? 0.2 : 3.0,
          ibUA: isHigh ? 170 : isLow ? 140 : 0,
          icMA: ic,
          betaEff: BETA_200,
          brightness: isHigh || isLow ? 1 : 0,
          conducting: isHigh || isLow,
          staircaseLeds: 0,
          statusFr: isHigh
            ? 'Niveau HAUT → NPN conduit (LED Rouge)'
            : isLow
            ? 'Niveau BAS → PNP conduit (LED Verte)'
            : 'À vide : 0 mA (seuil 5 V > 3 V)',
          statusAr: isHigh
            ? 'مستوى HIGH ← يعمل NPN (LED أحمر)'
            : isLow
            ? 'مستوى LOW ← يعمل PNP (LED أخضر)'
            : 'بدون تلامس: استهلاك 0mA (5V > 3V)',
        };
      }
      const ok = (p.transistorType === 'NPN') !== p.batteryReversed;
      const rf = fingerResistance(p.pressure);
      const ib = ok ? (VS_9V - VBE) / rf : 0;
      const ic = ok ? Math.min(BETA_200 * ib * 1000, IMAX_9V) : 0;
      const vce = ok ? Math.max(0.2, VS_9V - VLED - (ic * R_220) / 1000) : VS_9V;
      return {
        vbe: ok ? VBE : 0,
        vce,
        vc: vce,
        ibUA: ib * 1e6,
        icMA: ic,
        betaEff: BETA_200,
        brightness: ic / IMAX_9V,
        conducting: ok && ic > 0.1,
        staircaseLeds: 0,
        statusFr: ok
          ? `${p.transistorType} bien polarisé : LED allumée`
          : `${p.transistorType} bloqué : polarité inverse requise`,
        statusAr: ok
          ? `${p.transistorType} بقطبية صحيحة: الترانزستور يوصّل`
          : `${p.transistorType} متوقف: يحتاج عكس البطارية`,
      };
    }

    case 3: {
      const rem = p.capTriggered ? Math.max(0, 1 - p.capCharge) : 0;
      const ic = rem * (p.exampleId === 'courtesy-light' ? 28 : 24);
      const ib = (ic / BETA_200) * 1000;
      return {
        vbe: rem > 0.04 ? VBE : 0,
        vce: rem > 0.04 ? Math.max(0.2, 6 - rem * 5.6) : 6,
        vc: rem > 0.04 ? Math.max(0.2, 6 - rem * 5.6) : 6,
        ibUA: ib,
        icMA: ic,
        betaEff: BETA_200,
        brightness: rem,
        conducting: rem > 0.04,
        staircaseLeds: 0,
        statusFr:
          p.capCharge >= 0.98
            ? 'Condensateur plein : courant bloqué (déchargez-le !)'
            : p.capTriggered
            ? 'Charge en cours : le courant traverse la base'
            : 'En attente : appuyez pour fermer le circuit',
        statusAr:
          p.capCharge >= 0.98
            ? 'المكثف ممتلئ: توقف التيار (اضغط تفريغ للإعادة)'
            : p.capTriggered
            ? 'جاري الشحن: التيار يمر عبر القاعدة ويضيء المصباح'
            : 'في الانتظار: المس الدارة لبدء الشحن',
      };
    }

    case 4: {
      if (p.exampleId === 'mains-hum' || p.exampleId === 'eight-million') {
        const maxDist = p.exampleId === 'eight-million' ? 14 : 11;
        const strength = Math.max(0, 1 - (p.proximityCm - 1) / maxDist);
        const ib = strength * 0.04;
        const gain = Math.pow(BETA_200, 3);
        const ic = Math.min((ib / 1e6) * gain * 1000, IMAX_9V);
        return {
          vbe: ic > 0.2 ? 1.8 : 0.3,
          vce: ic > 0.2 ? Math.max(0.2, 6 - (ic / IMAX_9V) * 5.5) : 6,
          vc: ic > 0.2 ? Math.max(0.2, 6 - (ic / IMAX_9V) * 5.5) : 6,
          ibUA: ib,
          icMA: ic,
          betaEff: gain,
          brightness: Math.min(1, ic / IMAX_9V),
          conducting: ic > 0.2,
          staircaseLeds: 0,
          statusFr:
            p.exampleId === 'eight-million'
              ? p.proximityCm <= 6
                ? 'Charge statique captée (β = 8 000 000) !'
                : p.proximityCm <= 11
                ? 'Champ faible détecté à distance'
                : 'Hors portée (> 12 cm)'
              : p.proximityCm <= 3
              ? 'Champ 50 Hz secteur détecté !'
              : p.proximityCm <= 7
              ? 'Ronflement 50 Hz faible sur l’antenne'
              : 'Hors portée (> 8 cm)',
          statusAr:
            p.exampleId === 'eight-million'
              ? p.proximityCm <= 6
                ? 'التقاط الشحنة الساكنة (تضخيم ٨ ملايين)!'
                : 'إشارة ساكنة ضعيفة'
              : p.proximityCm <= 3
              ? 'تم التقاط حقل أسلاك 50Hz!'
              : p.proximityCm <= 7
              ? 'إشارة 50Hz ضعيفة عبر الهوائي'
              : 'خارج نطاق الالتقاط (> 8 cm)',
        };
      }
      const stagesCount = p.exampleId === 'second-simplest' ? 2 : p.stages;
      const rf = fingerResistance(p.pressure);
      const ib = Math.max(0, (VS_9V - stagesCount * VBE) / rf);
      const gain = Math.pow(BETA_200, stagesCount);
      const ic = Math.min(gain * ib * 1000, IMAX_9V);
      return {
        vbe: stagesCount * VBE,
        vce: Math.max(0.2, VS_9V - VLED - (ic * R_220) / 1000),
        vc: Math.max(0.2, VS_9V - VLED - (ic * R_220) / 1000),
        ibUA: ib * 1e6,
        icMA: ic,
        betaEff: gain,
        brightness: Math.min(1, ic / IMAX_9V),
        conducting: ic > 0.1,
        staircaseLeds: 0,
        statusFr: `${stagesCount} étage(s) · β = ${gain.toLocaleString('fr-FR')}`,
        statusAr: `${stagesCount} مراحل · التضخيم الكلي = ${gain.toLocaleString('en-US')}`,
      };
    }

    case 5: {
      if (p.exampleId === 'touch-latch') {
        const on = p.latchedOn;
        return {
          vbe: on ? VBE : 0,
          vce: on ? 0.2 : 6,
          vc: on ? 0.2 : 6,
          ibUA: on ? 1.1 : 0,
          icMA: on ? 22 : 0,
          betaEff: 40000,
          brightness: on ? 1 : 0,
          conducting: on,
          staircaseLeds: 0,
          statusFr: on ? 'Verrouillé ON via boucle 4M7' : 'Éteint (verrou coupé par OFF)',
          statusAr: on ? 'مثبّت في وضع التشغيل عبر 4M7' : 'مطفأ (تم فصل التثبيت عبر OFF)',
        };
      }
      if (p.exampleId === 'dark-schmitt') {
        const on = p.schmittState;
        return {
          vbe: on ? VBE : 0.35,
          vce: on ? 0.2 : 6,
          vc: on ? 0.2 : 6,
          ibUA: on ? 45 : 0,
          icMA: on ? 18 : 0,
          betaEff: BETA_200,
          brightness: on ? 1 : 0,
          conducting: on,
          staircaseLeds: 0,
          statusFr: on ? 'Nuit / Seuil bas → Éclairage ON' : 'Jour / Seuil haut → Éclairage OFF',
          statusAr: on ? 'ظلام (تحت العتبة) ← المصباح مضاء' : 'إضاءة كافية ← المصباح مطفأ',
        };
      }
      if (p.exampleId === 'clap-sound') {
        const on = p.clapActive;
        return {
          vbe: on ? VBE : 0,
          vce: on ? 0.2 : 6,
          vc: on ? 0.2 : 6,
          ibUA: on ? 85 : 0,
          icMA: on ? 18.5 : 0,
          betaEff: BETA_200,
          brightness: on ? 1 : 0,
          conducting: on,
          staircaseLeds: 0,
          statusFr: on ? 'Claquement capté ! Pompe 10u active' : 'En écoute (silence)',
          statusAr: on ? 'تم التقاط التصفيق! المكثف 10u يغذّي القاعدة' : 'في وضع الاستماع (هدوء)',
        };
      }
      if (p.exampleId === 'night-light') {
        const on = p.luxLevel <= 40;
        const ib = on ? 62 : Math.max(0, (55 - p.luxLevel) * 1.2);
        const ic = on ? 28 : 0;
        return {
          vbe: on ? VBE : 0.3,
          vce: on ? 0.2 : 12,
          vc: on ? 0.2 : 12,
          ibUA: ib,
          icMA: ic,
          betaEff: BETA_200,
          brightness: on ? 1 : 0,
          conducting: on,
          staircaseLeds: 0,
          statusFr: on ? 'Crépuscule (< 40%) → Relais veilleuse COLLÉ' : 'Jour (> 40%) → Relais ouvert',
          statusAr: on ? 'ظلام (< 40%) ← المرحّل موصول والإنارة تعمل' : 'ضوء نهار (> 40%) ← المرحّل مفصول',
        };
      }
      if (p.exampleId === 'motor-pwm') {
        const duty = p.pwmDuty / 100;
        const ic = 280 * duty;
        return {
          vbe: VBE,
          vce: 0.2,
          vc: 0.2,
          ibUA: 1400 * duty,
          icMA: ic,
          betaEff: 200,
          brightness: duty,
          conducting: p.pwmDuty >= 12,
          staircaseLeds: 0,
          statusFr: `Impulsions PWM ${p.pwmDuty}% · Couple plein à bas régime (3 V)`,
          statusAr: `نبضات PWM ${p.pwmDuty}% · عزم قوي حتى مع السرعة المنخفضة (3V)`,
        };
      }
      const ib = Math.max(0, (p.vinSwitch - VBE) / 10000);
      const ic = Math.min(BETA_200 * ib * 1000, IMAX_9V);
      const full = ic >= IMAX_9V * 0.95;
      return {
        vbe: p.vinSwitch >= VBE ? VBE : p.vinSwitch,
        vce: ic > 0 ? Math.max(0.2, 9 - (ic / IMAX_9V) * 8.8) : 9,
        vc: ic > 0 ? Math.max(0.2, 9 - (ic / IMAX_9V) * 8.8) : 9,
        ibUA: ib * 1e6,
        icMA: ic,
        betaEff: BETA_200,
        brightness: Math.min(1, ic / IMAX_9V),
        conducting: ic > 0.1,
        staircaseLeds: 0,
        statusFr: ic <= 0 ? 'Bloqué (V_in < 0,6 V)' : full ? 'Saturé (pleine puissance)' : 'Régime linéaire partiel',
        statusAr: ic <= 0 ? 'مقطوع (V_in < 0.6V)' : full ? 'مشبّع (قدرة كاملة)' : 'توصيل جزئي',
      };
    }

    case 6: {
      const freqHz =
        p.exampleId === 'siren-tick'
          ? 240 / Math.max(4.7, p.oscSpeedR)
          : 1 / (1.38 * (p.oscSpeedR * 1000) * 22e-6);
      return {
        vbe: VBE,
        vce: 0.2,
        vc: 0.2,
        ibUA: 420,
        icMA: p.exampleId === 'chaser-3led' ? 14 : 18,
        betaEff: BETA_200,
        brightness: 1,
        conducting: true,
        staircaseLeds: 0,
        freqHz,
        statusFr: `Oscillation active ≈ ${freqHz.toFixed(1)} Hz`,
        statusAr: `تذبذب نشط ≈ ${freqHz.toFixed(1)} Hz`,
      };
    }

    case 7: {
      if (p.exampleId === 'charge-pump') {
        const isB = p.pumpPhase === 'B';
        const vTotal = p.cellVoltage + 1.0;
        const ok = isB && vTotal >= 1.7;
        return {
          vbe: VBE,
          vce: ok ? 0.2 : 1.3,
          vc: ok ? 0.2 : 1.3,
          ibUA: 380,
          icMA: ok ? 12.0 : 4.5,
          betaEff: BETA_200,
          brightness: ok ? 1 : 0.08,
          conducting: ok,
          staircaseLeds: 0,
          statusFr: isB
            ? `Phase B : 1,5V + 1,0V = ${vTotal.toFixed(1)} V → LED allumée !`
            : 'Phase A : Charge du condensateur 1 µF à ~1,3 V',
          statusAr: isB
            ? `الطور B: جمع الجهدين = ${vTotal.toFixed(1)} V ← إضاءة الـ LED!`
            : 'الطور A: شحن المكثف 1µF إلى ~1.3V',
        };
      }
      if (p.exampleId === 'bike-flasher') {
        const alive = p.cellVoltage >= 0.9;
        const flashOn = alive && p.oscPhase % 2 === 0;
        const peakV = alive ? 6.2 + (p.cellVoltage - 0.9) * 0.8 : p.cellVoltage;
        return {
          vbe: flashOn ? VBE : 0.2,
          vce: flashOn ? 0.2 : p.cellVoltage,
          vc: peakV,
          ibUA: flashOn ? 460 : 25,
          icMA: flashOn ? 24 : 1.2,
          betaEff: BETA_200,
          brightness: flashOn ? 1 : 0.06,
          conducting: flashOn,
          staircaseLeds: 0,
          statusFr: alive
            ? `Bobine à air (30+30t) : flash > ${peakV.toFixed(1)} V sur 2 LEDs !`
            : 'Pile trop faible (< 0,90 V)',
          statusAr: alive
            ? `ملف هوائي (30+30): ومضات > ${peakV.toFixed(1)} V على مصباحين!`
            : 'البطارية ضعيفة (< 0.90V)',
        };
      }
      const alive = p.cellVoltage >= 0.85;
      const peakV = alive ? 3.4 + (p.cellVoltage - 0.8) * 0.4 : p.cellVoltage;
      const bright = alive ? Math.min(1, (p.cellVoltage - 0.7) / 0.8) : 0;
      return {
        vbe: alive ? VBE : 0.3,
        vce: alive ? 0.2 : p.cellVoltage,
        vc: peakV,
        ibUA: alive ? 550 : 0,
        icMA: alive ? 28 * bright : 0,
        betaEff: BETA_200,
        brightness: bright,
        conducting: alive,
        staircaseLeds: 0,
        statusFr: alive
          ? `Ferrite F29 : pics ${peakV.toFixed(1)} V → Torche LED blanche ON`
          : 'Pile trop faible (< 0,85 V)',
        statusAr: alive
          ? `قلب فيريت F29: نبضات ${peakV.toFixed(1)} V ← الكشّاف مضاء`
          : 'البطارية أضعف من حد التشغيل (< 0.85V)',
      };
    }

    case 8: {
      if (p.exampleId === 'constant-current') {
        const iTargetMA = (0.62 / p.rSense) * 1000;
        const maxPossible = ((p.supplyV - 3.6) / p.rSense) * 1000;
        const ic = Math.max(0, Math.min(iTargetMA, maxPossible));
        const vce = Math.max(0.3, p.supplyV - 3.4 - (ic / 1000) * p.rSense);
        return {
          vbe: VBE,
          vce,
          vc: vce,
          ibUA: (ic / 100) * 1000,
          icMA: ic,
          betaEff: 100,
          brightness: Math.min(1, ic / 30),
          conducting: ic > 0.5,
          staircaseLeds: 0,
          statusFr: `Courant régulé à ${ic.toFixed(1)} mA (R = ${p.rSense} Ω)`,
          statusAr: `تيار ثابت مضبوط عند ${ic.toFixed(1)} mA (R = ${p.rSense} Ω)`,
        };
      }
      const pw = p.solarDiverted && p.dummyLoadEnabled ? (18 * 18) / 100 : 0;
      return {
        vbe: p.solarDiverted ? 0.65 : 0.45,
        vce: p.solarDiverted ? 0.2 : 12,
        vc: p.battVoltage,
        ibUA: p.solarDiverted ? 220 : 15,
        icMA: p.solarDiverted ? 25 : 0,
        betaEff: BETA_200,
        brightness: p.solarDiverted ? 0 : 1,
        conducting: !p.solarDiverted,
        staircaseLeds: 0,
        powerW: pw,
        statusFr: p.solarDiverted
          ? p.dummyLoadEnabled
            ? 'Charge coupée → dérivation vers charge 100 Ω (3,24 W)'
            : 'Charge coupée (panneau en circuit ouvert)'
          : 'Charge en cours vers la batterie 12 V',
        statusAr: p.solarDiverted
          ? p.dummyLoadEnabled
            ? 'توقف الشحن ← تحويل الطاقة للحِمل الوهمي (3.24W)'
            : 'توقف الشحن (اللوح مفصول)'
          : 'الشحن جارٍ إلى بطارية 12V',
      };
    }

    case 9:
    default: {
      const rb = 100000 * Math.pow(100, p.rbSlider / 100);
      const ib = (5 - VBE) / rb;
      const ic = Math.min(57 * ib, 5 / 22000);
      const vc = Math.max(0.2, 5 - ic * 22000);
      const diff = Math.abs(vc - 2.5);
      return {
        vbe: VBE,
        vce: vc,
        vc,
        ibUA: ib * 1e6,
        icMA: ic * 1000,
        betaEff: 57,
        brightness: Math.max(0, 1 - diff / 2.5),
        conducting: ic > 0,
        staircaseLeds: 0,
        statusFr:
          diff < 0.1
            ? 'Point Q centré (2,50 V) — Excursion maximale sans écrêtage !'
            : vc < 2.5
            ? 'Trop proche de 0 V (écrêtage bas)'
            : 'Trop proche de 5 V (écrêtage haut)',
        statusAr:
          diff < 0.1
            ? 'نقطة التشغيل في المنتصف (2.50V) — تكبير مثالي بلا قصّ!'
            : vc < 2.5
            ? 'قريب جداً من 0V (قصّ سفلي)'
            : 'قريب جداً من 5V (قصّ علوي)',
      };
    }
  }
}
