export const VS_9V = 9;
export const VLED = 2;
export const R_220 = 220;
export const VBE = 0.6;
export const BETA_200 = 200;
export const IMAX_9V = ((VS_9V - VLED) / R_220) * 1000; // ~31.82 mA

export interface SimParams {
  chapterId: number;
  exampleId: string;
  // Ch 1
  pressure: number; // 0..100
  // Ch 2
  transistorType: 'NPN' | 'PNP';
  batteryReversed: boolean;
  logicInput: 'HIGH' | 'LOW' | 'FLOAT';
  // Ch 3
  capTriggered: boolean;
  capCharge: number; // 0..1
  capValueUF: number; // 10..470
  // Ch 4
  stages: 1 | 2 | 3;
  proximityCm: number; // 1..15 cm
  // Ch 5
  latchedOn: boolean;
  luxLevel: number; // 0..100
  schmittState: boolean;
  clapActive: boolean;
  vinSwitch: number; // 0..3.0 V
  loadKind: 'motor' | 'relay';
  // Ch 6
  oscPhase: number; // 0..5
  oscSpeedR: number; // 4.7..47 kOhm
  // Ch 7
  pumpPhase: 'A' | 'B';
  cellVoltage: number; // 0.8..1.5 V
  // Ch 8
  battVoltage: number; // 11.0..14.5 V
  solarDiverted: boolean;
  dummyLoadEnabled: boolean;
  supplyV: number; // 6..15 V
  rSense: number; // 22, 47, 120
  // Ch 9
  rbSlider: number; // 0..100
  acSignalOn: boolean;
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
  statusFr: string;
  statusAr: string;
}

export function fingerResistance(pressure: number): number {
  return 20000 + Math.pow(1 - pressure / 100, 2) * 2000000;
}

export function computeSimulation(p: SimParams): SimReadout {
  switch (p.chapterId) {
    case 1: {
      if (p.exampleId === 'plant') {
        // 3V, 220k base path modulated by soil moisture (pressure slider = moisture/conductivity)
        const rSoil = 5000 + Math.pow(1 - p.pressure / 100, 2) * 800000;
        const ib = (3 - VBE) / (220000 + rSoil);
        const ic = Math.min(BETA_200 * ib * 1000, 2.2); // capped ~2.2 mA as book notes (~2mA)
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
        // Lie detector / strength tester 4 LEDs (each threshold +0.6V)
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
      // World's simplest circuit
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
      // Capacitor charge flash: current decays as (1 - capCharge)
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
      if (p.exampleId === 'mains-hum') {
        // Proximity 1..15cm -> induces tiny uA into 8M gain (3 stages)
        const strength = Math.max(0, 1 - (p.proximityCm - 1) / 11);
        const ib = strength * 0.04; // 0 to 0.04 uA!
        const gain = Math.pow(BETA_200, 3);
        const ic = Math.min((ib / 1e6) * gain * 1000, IMAX_9V);
        return {
          vbe: ic > 0.2 ? VBE : 0.1,
          vce: ic > 0.2 ? Math.max(0.2, 6 - (ic / IMAX_9V) * 5.5) : 6,
          vc: ic > 0.2 ? Math.max(0.2, 6 - (ic / IMAX_9V) * 5.5) : 6,
          ibUA: ib,
          icMA: ic,
          betaEff: gain,
          brightness: Math.min(1, ic / IMAX_9V),
          conducting: ic > 0.2,
          staircaseLeds: 0,
          statusFr:
            p.proximityCm <= 3
              ? 'Champ 50 Hz / statique détecté à proximité !'
              : p.proximityCm <= 7
              ? 'Signal faible capté par l’antenne'
              : 'Hors portée (> 8 cm)',
          statusAr:
            p.proximityCm <= 3
              ? 'تم التقاط حقل 50Hz / الكهرباء الساكنة!'
              : p.proximityCm <= 7
              ? 'إشارة ضعيفة عبر الهوائي'
              : 'خارج نطاق الالتقاط (> 8 cm)',
        };
      }
      const rf = fingerResistance(p.pressure);
      const ib = Math.max(0, (VS_9V - p.stages * VBE) / rf);
      const gain = Math.pow(BETA_200, p.stages);
      const ic = Math.min(gain * ib * 1000, IMAX_9V);
      return {
        vbe: p.stages * VBE,
        vce: Math.max(0.2, VS_9V - VLED - (ic * R_220) / 1000),
        vc: Math.max(0.2, VS_9V - VLED - (ic * R_220) / 1000),
        ibUA: ib * 1e6,
        icMA: ic,
        betaEff: gain,
        brightness: Math.min(1, ic / IMAX_9V),
        conducting: ic > 0.1,
        staircaseLeds: 0,
        statusFr: `${p.stages} étage(s) · β = ${gain.toLocaleString('fr-FR')}`,
        statusAr: `${p.stages} مراحل · التضخيم الكلي = ${gain.toLocaleString('en-US')}`,
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
      // motor-relay
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
      // Joule thief / Air core bike flasher
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
          ? `Pics inductifs ${peakV.toFixed(1)} V → LED blanche ON`
          : 'Pile trop faible (< 0,85 V)',
        statusAr: alive
          ? `نبضات رفع الجهد ${peakV.toFixed(1)} V ← الـ LED الأبيض مضاء`
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
      const rb = 100000 * Math.pow(100, p.rbSlider / 100); // 100k .. 10M
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
