import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Cpu,
  Activity,
  Droplets,
  Volume2,
  VolumeX,
  RotateCcw,
  Star,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { ChapterDef, Lang } from '../types';
import { computeSimulation, fingerResistance, SimParams } from '../utils/physics';
import { InteractiveBoard3D } from './InteractiveBoard3D';
import { LiveSchematicScope } from './LiveSchematicScope';
import { WaterValveAnalogy } from './WaterValveAnalogy';
import { playPageFlip, playRelayClick, playTickSound } from '../utils/sound';

interface Props {
  chapters: ChapterDef[];
  activeChapterId: number;
  activeExampleId?: string;
  onSelectChapter: (id: number, exampleId?: string) => void;
  lang: Lang;
  teacherMode: boolean;
  muted: boolean;
  onToggleMute: () => void;
}

type StageView = 'board3d' | 'schematic' | 'analogy';

export const ChapterWorkspace: React.FC<Props> = ({
  chapters,
  activeChapterId,
  activeExampleId,
  onSelectChapter,
  lang,
  teacherMode,
  muted,
  onToggleMute,
}) => {
  const chapter = useMemo(
    () => chapters.find((c) => c.id === activeChapterId) || chapters[0],
    [chapters, activeChapterId]
  );

  const [stageView, setStageView] = useState<StageView>('board3d');
  const [selectedExampleId, setSelectedExampleId] = useState<string>(
    activeExampleId || chapter.examples[0].id
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [flapOpen, setFlapOpen] = useState(false);
  const [challengeStars, setChallengeStars] = useState<number | null>(null);

  const [params, setParams] = useState<SimParams>({
    chapterId: chapter.id,
    exampleId: selectedExampleId,
    pressure: 22,
    transistorType: 'NPN',
    batteryReversed: false,
    logicInput: 'FLOAT',
    capTriggered: false,
    capCharge: 0,
    capValueUF: 100,
    stages: 1,
    proximityCm: 6,
    latchedOn: false,
    luxLevel: 65,
    schmittState: false,
    clapActive: false,
    vinSwitch: 0.4,
    loadKind: 'motor',
    pwmDuty: 55,
    oscPhase: 0,
    oscSpeedR: 15,
    pumpPhase: 'A',
    cellVoltage: 1.5,
    battVoltage: 12.5,
    solarDiverted: false,
    dummyLoadEnabled: true,
    supplyV: 9.0,
    rSense: 22,
    rbSlider: 30,
    acSignalOn: true,
  });

  // Sync chapter / example selection
  useEffect(() => {
    const nextEx =
      activeExampleId && chapter.examples.some((e) => e.id === activeExampleId)
        ? activeExampleId
        : chapter.examples[0].id;
    setSelectedExampleId(nextEx);
    setSelectedAnswer(null);
    setFlapOpen(false);
    setChallengeStars(null);
    setParams((prev) => ({
      ...prev,
      chapterId: chapter.id,
      exampleId: nextEx,
      capTriggered: false,
      capCharge: 0,
    }));
  }, [chapter, activeExampleId]);

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      chapterId: chapter.id,
      exampleId: selectedExampleId,
    }));
  }, [chapter.id, selectedExampleId]);

  // Ch 3 Capacitor charge animation loop
  useEffect(() => {
    if (params.chapterId !== 3 || !params.capTriggered || params.capCharge >= 1) return;
    const step = Math.max(0.012, 0.08 * (100 / params.capValueUF));
    const timer = window.setInterval(() => {
      setParams((prev) => {
        const next = Math.min(1, prev.capCharge + step);
        return { ...prev, capCharge: next };
      });
    }, 60);
    return () => window.clearInterval(timer);
  }, [params.chapterId, params.capTriggered, params.capCharge, params.capValueUF]);

  // Ch 6 Multivibrator / Chaser & Ch 7 Bike Flasher oscillation timer
  useEffect(() => {
    const isBikeFlasher = params.chapterId === 7 && params.exampleId === 'bike-flasher';
    if (params.chapterId !== 6 && !isBikeFlasher) return;
    const ms = isBikeFlasher ? 450 : Math.max(160, Math.min(1100, params.oscSpeedR * 28));
    const timer = window.setInterval(() => {
      setParams((prev) => {
        const nextPhase = (prev.oscPhase + 1) % 6;
        if (prev.chapterId === 6 && prev.exampleId === 'siren-tick') {
          const pitch = 380 + (nextPhase % 3) * 180;
          playTickSound(muted, pitch, 0.04);
        }
        return { ...prev, oscPhase: nextPhase };
      });
    }, ms);
    return () => window.clearInterval(timer);
  }, [params.chapterId, params.oscSpeedR, params.exampleId, muted]);

  // Ch 7 Charge Pump auto toggle
  useEffect(() => {
    if (params.chapterId !== 7 || params.exampleId !== 'charge-pump') return;
    const timer = window.setInterval(() => {
      setParams((prev) => ({ ...prev, pumpPhase: prev.pumpPhase === 'A' ? 'B' : 'A' }));
    }, 1100);
    return () => window.clearInterval(timer);
  }, [params.chapterId, params.exampleId]);

  const sim = useMemo(() => computeSimulation(params), [params]);

  const handleQuickAction = (action: string) => {
    if (action === 'latch-on') {
      setParams((p) => ({ ...p, latchedOn: true }));
    } else if (action === 'latch-off') {
      setParams((p) => ({ ...p, latchedOn: false }));
    }
  };

  const handleSelectChapter = (id: number) => {
    playPageFlip(muted);
    onSelectChapter(id);
  };

  const rbOhms = 100000 * Math.pow(100, params.rbSlider / 100);
  const rbLabel =
    rbOhms >= 1e6 ? `${(rbOhms / 1e6).toFixed(2)} MΩ` : `${(rbOhms / 1e3).toFixed(0)} kΩ`;

  const currentIdx = chapters.findIndex((c) => c.id === chapter.id);

  return (
    <div className="flex flex-col gap-5">
      {/* Compact Chapter Stepper Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {chapters.map((c) => {
            const active = c.id === chapter.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectChapter(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-stone-900 text-stone-50 dark:bg-amber-400 dark:text-stone-950'
                    : 'bg-stone-200/70 text-stone-700 hover:bg-stone-300/80 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                }`}
              >
                {lang === 'fr' ? `Ch. ${c.id}` : `فصل ${c.id}`}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleMute}
            className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{muted ? (lang === 'fr' ? 'Son coupé' : 'صامت') : (lang === 'fr' ? 'Audio actif' : 'صوت نشط')}</span>
          </button>

          <button
            type="button"
            disabled={currentIdx <= 0}
            onClick={() => handleSelectChapter(chapters[currentIdx - 1].id)}
            className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label={lang === 'fr' ? 'Chapitre précédent' : 'الفصل السابق'}
          >
            {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            type="button"
            disabled={currentIdx >= chapters.length - 1}
            onClick={() => handleSelectChapter(chapters[currentIdx + 1].id)}
            className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label={lang === 'fr' ? 'Chapitre suivant' : 'الفصل التالي'}
          >
            {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Two-Zone Educational Sandbox */}
      <div className={`grid grid-cols-1 ${teacherMode ? '' : 'lg:grid-cols-12'} gap-6 items-start`}>
        {/* LEFT ZONE: Theory, Concrete Book Examples & Predict-Observe-Explain */}
        {!teacherMode && (
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Chapter Title + Book Page Reference */}
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-mono-num mb-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>1-100 Transistor Circuits</span>
                <span aria-hidden="true">·</span>
                <span>{chapter.pageRef}</span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 tracking-tight text-balance">
                {chapter.title[lang]}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                {chapter.subtitle[lang]}
              </p>
            </div>

            {/* Key Law Box */}
            <div className="rounded-xl border border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/20 p-4">
              <div className="text-center font-mono-num text-lg font-semibold text-stone-900 dark:text-amber-200 tracking-tight" dir="ltr">
                {chapter.formula}
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-amber-500/20">
                {chapter.formulaVars.map((v) => (
                  <div key={v.symbol} className="text-xs flex items-baseline justify-between gap-2">
                    <span className="font-mono-num font-semibold text-amber-800 dark:text-amber-300">{v.symbol}</span>
                    <span className="text-stone-600 dark:text-stone-300 truncate">{v.meaning[lang]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Concise Theory Points */}
            <div className="space-y-2.5 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {chapter.theory.map((t, i) => (
                <p key={i}>{t[lang]}</p>
              ))}
            </div>

            {/* Concrete Examples Selector from the Book */}
            <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-4 flex flex-col gap-3">
              <div className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                {lang === 'fr' ? 'Exemples concrets tirés du livre' : 'أمثلة تطبيقية حقيقية من الكتاب'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {chapter.examples.map((ex) => {
                  const active = ex.id === selectedExampleId;
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => setSelectedExampleId(ex.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-stone-950'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                      }`}
                    >
                      {ex.title[lang]}
                    </button>
                  );
                })}
              </div>
              {(() => {
                const ex = chapter.examples.find((e) => e.id === selectedExampleId) || chapter.examples[0];
                return (
                  <div className="pt-2 border-t border-stone-200/70 dark:border-stone-800 text-xs space-y-1.5">
                    <div className="font-mono-num text-amber-700 dark:text-amber-400">
                      {ex.pageRef} · {ex.components.join(' · ')}
                    </div>
                    <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                      {ex.summary[lang]}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Predict-Observe-Explain Interactive Card */}
            <div className="rounded-xl border border-dashed border-stone-400 dark:border-stone-600 p-4 flex flex-col gap-3 bg-stone-100/50 dark:bg-stone-900/40">
              <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {lang === 'fr' ? 'Prédis puis vérifie :' : 'توقّع قبل التجربة:'} {chapter.prediction.question[lang]}
              </div>
              <div className="flex flex-col gap-1.5">
                {chapter.prediction.options.map((opt, idx) => {
                  const isPicked = selectedAnswer === idx;
                  const isRight = idx === chapter.prediction.correctIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedAnswer(idx);
                        setFlapOpen(true);
                      }}
                      className={`text-start px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        isPicked
                          ? isRight
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                            : 'bg-rose-50 border-rose-500 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 hover:border-stone-400 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <span>{opt[lang]}</span>
                      {isPicked &&
                        (isRight ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        ))}
                    </button>
                  );
                })}
              </div>
              {flapOpen && (
                <div className="text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 rounded-lg p-3 border border-stone-200 dark:border-stone-800 leading-relaxed">
                  {chapter.prediction.explanation[lang]}
                </div>
              )}
            </div>

            {/* Teacher / Book Accuracy Note */}
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              {chapter.teacherNote[lang]}
            </p>
          </div>
        )}

        {/* RIGHT ZONE: Interactive Simulation Stage + Controls */}
        <div className={`${teacherMode ? 'w-full max-w-5xl mx-auto' : 'lg:col-span-7'} flex flex-col gap-4`}>
          {/* Stage Visual Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-stone-200/80 dark:bg-stone-800 rounded-lg">
              <button
                type="button"
                onClick={() => setStageView('board3d')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  stageView === 'board3d'
                    ? 'bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Platine 3D' : 'اللوحة 3D'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStageView('schematic')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  stageView === 'schematic'
                    ? 'bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Schéma & Oscillo' : 'المخطط والراسم'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStageView('analogy')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  stageView === 'analogy'
                    ? 'bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? 'Analogie' : 'تشبيه الصمّام'}</span>
              </button>
            </div>

            {teacherMode && (
              <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                {chapter.title[lang]}
              </div>
            )}
          </div>

          {/* Visual Stage Content */}
          {stageView === 'board3d' && (
            <InteractiveBoard3D
              params={params}
              sim={sim}
              lang={lang}
              onQuickAction={handleQuickAction}
            />
          )}
          {stageView === 'schematic' && (
            <LiveSchematicScope params={params} sim={sim} lang={lang} />
          )}
          {stageView === 'analogy' && (
            <WaterValveAnalogy
              params={params}
              sim={sim}
              lang={lang}
              analogyTitle={chapter.analogyTitle[lang]}
              analogyText={chapter.analogyText[lang]}
            />
          )}

          {/* Parameter Controls Deck (Always clearly labeled with values & units) */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-4 flex flex-col gap-4">
            {/* CH 1 Controls */}
            {chapter.id === 1 && (
              <label className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between font-medium">
                  <span>
                    {params.exampleId === 'plant'
                      ? lang === 'fr'
                        ? 'Humidité du sol'
                        : 'رطوبة التربة'
                      : lang === 'fr'
                      ? 'Pression du doigt sur les fils'
                      : 'قوة الضغط بالإصبع'}
                  </span>
                  <span className="font-mono-num text-amber-700 dark:text-amber-400">
                    {params.pressure}% · R ≈ {(fingerResistance(params.pressure) / 1000).toFixed(0)} kΩ
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={params.pressure}
                  onChange={(e) => setParams((p) => ({ ...p, pressure: Number(e.target.value) }))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </label>
            )}

            {/* CH 2 Controls */}
            {chapter.id === 2 && (
              <div className="flex flex-col gap-3">
                {params.exampleId === 'logic-probe' ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-stone-500">
                      {lang === 'fr' ? 'Signal sur la pointe :' : 'الإشارة على المجسّ:'}
                    </span>
                    {(['FLOAT', 'LOW', 'HIGH'] as const).map((lv) => (
                      <button
                        key={lv}
                        type="button"
                        onClick={() => setParams((p) => ({ ...p, logicInput: lv }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                          params.logicInput === lv
                            ? 'bg-stone-900 text-white border-stone-900 dark:bg-amber-400 dark:text-stone-950'
                            : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {lv === 'FLOAT'
                          ? lang === 'fr'
                            ? 'À vide (Flottant)'
                            : 'فراغ (بدون تلامس)'
                          : lv === 'LOW'
                          ? 'LOW (0 V)'
                          : 'HIGH (5 V)'}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      {(['NPN', 'PNP'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setParams((p) => ({ ...p, transistorType: t }))}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                            params.transistorType === t
                              ? 'bg-stone-900 text-white border-stone-900 dark:bg-amber-400 dark:text-stone-950'
                              : 'border-stone-300 dark:border-stone-700'
                          }`}
                        >
                          {t === 'NPN' ? 'NPN (BC547)' : 'PNP (BC557)'}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setParams((p) => ({ ...p, batteryReversed: !p.batteryReversed }))}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                          params.batteryReversed
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'border-stone-300 dark:border-stone-700'
                        }`}
                      >
                        {lang === 'fr' ? 'Inverser la batterie' : 'اقلب البطارية'}
                      </button>
                    </div>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <div className="flex justify-between font-medium">
                        <span>{lang === 'fr' ? 'Pression de test' : 'قوة الضغط'}</span>
                        <span className="font-mono-num">{params.pressure}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={params.pressure}
                        onChange={(e) => setParams((p) => ({ ...p, pressure: Number(e.target.value) }))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </label>
                  </>
                )}
              </div>
            )}

            {/* CH 3 Controls (Capacitor Timing) */}
            {chapter.id === 3 && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setParams((p) => ({ ...p, capTriggered: true }))}
                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer whitespace-nowrap"
                  >
                    {params.exampleId === 'courtesy-light'
                      ? lang === 'fr'
                        ? 'Fermer la portière'
                        : 'إغلاق باب السيارة'
                      : lang === 'fr'
                      ? 'Toucher les fils (Charger C)'
                      : 'المس السلكين (شحن المكثف)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setParams((p) => ({ ...p, capTriggered: false, capCharge: 0 }))}
                    className="px-4 py-2 rounded-lg text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === 'fr' ? 'Décharger le condensateur' : 'تفريغ المكثف'}</span>
                  </button>
                </div>
                <label className="flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between font-medium">
                    <span>{lang === 'fr' ? 'Capacité du condensateur C' : 'سعة المكثف C'}</span>
                    <span className="font-mono-num text-sky-600 dark:text-sky-400">
                      {params.capValueUF} µF · Charge {Math.round(params.capCharge * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={470}
                    step={10}
                    value={params.capValueUF}
                    onChange={(e) => setParams((p) => ({ ...p, capValueUF: Number(e.target.value) }))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </label>
              </div>
            )}

            {/* CH 4 Controls (Darlington, Second Simplest, 8M Static & Mains Hum 50Hz) */}
            {chapter.id === 4 && (
              <div className="flex flex-col gap-3">
                {params.exampleId === 'mains-hum' || params.exampleId === 'eight-million' ? (
                  <label className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between font-medium">
                      <span>
                        {params.exampleId === 'eight-million'
                          ? lang === 'fr'
                            ? 'Distance main / objet statique (cm)'
                            : 'بُعد اليد / الجسم المشحون (cm)'
                          : lang === 'fr'
                          ? 'Distance main / câble secteur (cm)'
                          : 'بُعد اليد / السلك عن الهوائي (cm)'}
                      </span>
                      <span className="font-mono-num text-amber-700 dark:text-amber-400">{params.proximityCm} cm</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      value={params.proximityCm}
                      onChange={(e) => setParams((p) => ({ ...p, proximityCm: Number(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </label>
                ) : (
                  <>
                    {params.exampleId === 'second-simplest' ? (
                      <div className="text-xs font-mono-num px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 text-amber-800 dark:text-amber-300">
                        {lang === 'fr'
                          ? 'Paire Darlington fixe : 2 transistors BC547 (Gain β = 200 × 200 = 40 000×)'
                          : 'ثنائي دارلنغتون ثابت: ترانزستوران BC547 (تضخيم ×40 000)'}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {([1, 2, 3] as const).map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setParams((p) => ({ ...p, stages: n }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                              params.stages === n
                                ? 'bg-stone-900 text-white border-stone-900 dark:bg-amber-400 dark:text-stone-950'
                                : 'border-stone-300 dark:border-stone-700'
                            }`}
                          >
                            {n} {lang === 'fr' ? (n === 1 ? 'transistor (200×)' : `transistors (${Math.pow(200, n).toLocaleString('fr-FR')}×)`) : 'ترانزستور'}
                          </button>
                        ))}
                      </div>
                    )}
                    <label className="flex flex-col gap-1.5 text-sm">
                      <div className="flex justify-between font-medium">
                        <span>{lang === 'fr' ? 'Effleurement d’entrée' : 'قوة اللمس'}</span>
                        <span className="font-mono-num">{params.pressure}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={params.pressure}
                        onChange={(e) => setParams((p) => ({ ...p, pressure: Number(e.target.value) }))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </label>
                  </>
                )}
              </div>
            )}

            {/* CH 5 Controls (Switches, Touch 4M7, LDR Schmitt, Clap, Motor/Relay) */}
            {chapter.id === 5 && (
              <div className="flex flex-col gap-3">
                {params.exampleId === 'touch-latch' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setParams((p) => ({ ...p, latchedOn: true }))}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                        params.latchedOn ? 'bg-amber-500 text-stone-950' : 'bg-stone-200 dark:bg-stone-800'
                      }`}
                    >
                      {lang === 'fr' ? 'Toucher pastille ON (Verrouiller)' : 'لمس لوح ON (تثبيت)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setParams((p) => ({ ...p, latchedOn: false }))}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                        !params.latchedOn ? 'bg-rose-600 text-white' : 'bg-stone-200 dark:bg-stone-800'
                      }`}
                    >
                      {lang === 'fr' ? 'Toucher pastille OFF (Couper)' : 'لمس لوح OFF (إطفاء)'}
                    </button>
                  </div>
                )}

                {params.exampleId === 'dark-schmitt' && (
                  <label className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between font-medium">
                      <span>{lang === 'fr' ? 'Luminosité ambiante sur la LDR' : 'شدة الإضاءة على LDR'}</span>
                      <span className="font-mono-num">
                        {params.luxLevel}% · {params.schmittState ? 'ON (≤ 30%)' : 'OFF (≥ 55%)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={params.luxLevel}
                      onChange={(e) => {
                        const lux = Number(e.target.value);
                        setParams((p) => {
                          let next = p.schmittState;
                          if (lux <= 30) next = true;
                          else if (lux >= 55) next = false;
                          return { ...p, luxLevel: lux, schmittState: next };
                        });
                      }}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </label>
                )}

                {params.exampleId === 'clap-sound' && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        playTickSound(muted, 1200, 0.06);
                        setParams((p) => ({ ...p, clapActive: true }));
                        window.setTimeout(() => {
                          setParams((p) => ({ ...p, clapActive: false }));
                        }, 2400);
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer whitespace-nowrap"
                    >
                      {lang === 'fr' ? 'Clapper des mains ! (Impulsion 2,4 s)' : 'صفّق بيديك! (إضاءة مؤقتة)'}
                    </button>
                  </div>
                )}

                {params.exampleId === 'night-light' && (
                  <label className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between font-medium">
                      <span>{lang === 'fr' ? 'Luminosité sur la LDR (Veilleuse 12 V)' : 'شدة الإضاءة على LDR (مصباح ليلي 12V)'}</span>
                      <span className="font-mono-num">
                        {params.luxLevel}% · {params.luxLevel <= 40 ? 'Relais COLLÉ (ON)' : 'Relais OUVERT (OFF)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={params.luxLevel}
                      onChange={(e) => setParams((p) => ({ ...p, luxLevel: Number(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </label>
                )}

                {params.exampleId === 'motor-pwm' && (
                  <label className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between font-medium">
                      <span>{lang === 'fr' ? 'Rapport cyclique PWM (Moteur 3 V)' : 'نسبة نبضات PWM (محرك 3V)'}</span>
                      <span className="font-mono-num text-amber-700 dark:text-amber-400">
                        {params.pwmDuty}% · {sim.icMA.toFixed(0)} mA
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={params.pwmDuty}
                      onChange={(e) => setParams((p) => ({ ...p, pwmDuty: Number(e.target.value) }))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </label>
                )}

                {params.exampleId === 'motor-relay' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      {(['motor', 'relay'] as const).map((lk) => (
                        <button
                          key={lk}
                          type="button"
                          onClick={() => setParams((p) => ({ ...p, loadKind: lk }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                            params.loadKind === lk
                              ? 'bg-stone-900 text-white dark:bg-amber-400 dark:text-stone-950'
                              : 'border-stone-300 dark:border-stone-700'
                          }`}
                        >
                          {lk === 'motor' ? (lang === 'fr' ? 'Moteur DC' : 'محرك') : (lang === 'fr' ? 'Relais + Diode D1' : 'مرحّل + دايود')}
                        </button>
                      ))}
                    </div>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <div className="flex justify-between font-medium">
                        <span>{lang === 'fr' ? 'Tension d’entrée V_in (via 10 kΩ)' : 'جهد الدخل V_in'}</span>
                        <span className="font-mono-num">{params.vinSwitch.toFixed(1)} V</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={Math.round(params.vinSwitch * 10)}
                        onChange={(e) => setParams((p) => ({ ...p, vinSwitch: Number(e.target.value) / 10 }))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* CH 6 Controls (Oscillators & Sirens) */}
            {chapter.id === 6 && (
              <label className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between font-medium">
                  <span>{lang === 'fr' ? 'Résistance de rythme R' : 'مقاومة ضبط السرعة R'}</span>
                  <span className="font-mono-num">{params.oscSpeedR.toFixed(1)} kΩ</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={47}
                  step={1}
                  value={params.oscSpeedR}
                  onChange={(e) => setParams((p) => ({ ...p, oscSpeedR: Number(e.target.value) }))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </label>
            )}

            {/* CH 7 Controls (1.5V Charge Pump & Joule Thief) */}
            {chapter.id === 7 && (
              <div className="flex flex-col gap-3">
                {params.exampleId === 'charge-pump' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setParams((p) => ({ ...p, pumpPhase: p.pumpPhase === 'A' ? 'B' : 'A' }))}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-300 dark:border-stone-700 cursor-pointer whitespace-nowrap"
                    >
                      {lang === 'fr' ? `Phase actuelle : ${params.pumpPhase} (Basculer)` : `الطور الحالي: ${params.pumpPhase}`}
                    </button>
                  </div>
                )}
                <label className="flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between font-medium">
                    <span>{lang === 'fr' ? 'Tension de la pile (1,5 V neuf → 0,8 V usé)' : 'جهد البطارية (1.5V إلى 0.8V)'}</span>
                    <span className="font-mono-num">{params.cellVoltage.toFixed(2)} V</span>
                  </div>
                  <input
                    type="range"
                    min={80}
                    max={150}
                    value={Math.round(params.cellVoltage * 100)}
                    onChange={(e) => setParams((p) => ({ ...p, cellVoltage: Number(e.target.value) / 100 }))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </label>
              </div>
            )}

            {/* CH 8 Controls (Solar Hysteresis & Constant Current) */}
            {chapter.id === 8 && (
              <div className="flex flex-col gap-3">
                {params.exampleId === 'constant-current' ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-stone-500">R_sense :</span>
                      {[120, 47, 22].map((rv) => (
                        <button
                          key={rv}
                          type="button"
                          onClick={() => setParams((p) => ({ ...p, rSense: rv }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono-num font-semibold border cursor-pointer ${
                            params.rSense === rv
                              ? 'bg-stone-900 text-white dark:bg-amber-400 dark:text-stone-950'
                              : 'border-stone-300 dark:border-stone-700'
                          }`}
                        >
                          {rv} Ω
                        </button>
                      ))}
                    </div>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <div className="flex justify-between font-medium">
                        <span>{lang === 'fr' ? 'Tension d’alimentation variable' : 'جهد المصدر المتغيّر'}</span>
                        <span className="font-mono-num">{params.supplyV.toFixed(1)} V</span>
                      </div>
                      <input
                        type="range"
                        min={60}
                        max={150}
                        value={Math.round(params.supplyV * 10)}
                        onChange={(e) => setParams((p) => ({ ...p, supplyV: Number(e.target.value) / 10 }))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <div className="flex justify-between font-medium">
                        <span>{lang === 'fr' ? 'Tension batterie V_batt (Hystérésis 12,5–13,7 V)' : 'جهد البطارية V_batt'}</span>
                        <span className="font-mono-num">{params.battVoltage.toFixed(1)} V</span>
                      </div>
                      <input
                        type="range"
                        min={110}
                        max={145}
                        value={Math.round(params.battVoltage * 10)}
                        onChange={(e) => {
                          const v = Number(e.target.value) / 10;
                          setParams((p) => {
                            let div = p.solarDiverted;
                            if (v >= 13.7 && !div) {
                              div = true;
                              playRelayClick(muted, false);
                            } else if (v <= 12.5 && div) {
                              div = false;
                              playRelayClick(muted, true);
                            }
                            return { ...p, battVoltage: v, solarDiverted: div };
                          });
                        }}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </label>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setParams((p) => ({ ...p, dummyLoadEnabled: !p.dummyLoadEnabled }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                          params.dummyLoadEnabled
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'border-stone-300 dark:border-stone-700'
                        }`}
                      >
                        {params.dummyLoadEnabled
                          ? lang === 'fr'
                            ? 'Avec charge factice 100 Ω (5 W)'
                            : 'مع الحِمل الوهمي 100Ω'
                          : lang === 'fr'
                          ? 'Sans charge factice'
                          : 'بدون الحِمل الوهمي'}
                      </button>
                      <span className="text-xs font-mono-num text-stone-500">
                        {lang === 'fr' ? 'Coupure ≥ 13,7 V · Reprise ≤ 12,5 V' : 'فصل ≥ 13.7V · عودة ≤ 12.5V'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CH 9 Controls (Half-Rail Challenge + AC Clipping) */}
            {chapter.id === 9 && (
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1.5 text-sm">
                  <div className="flex justify-between font-medium">
                    <span>{lang === 'fr' ? 'Résistance de base R_B' : 'مقاومة القاعدة R_B'}</span>
                    <span className="font-mono-num text-amber-700 dark:text-amber-400">
                      {rbLabel} → V_C = {sim.vc.toFixed(2)} V
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={params.rbSlider}
                    onChange={(e) => {
                      setChallengeStars(null);
                      setParams((p) => ({ ...p, rbSlider: Number(e.target.value) }));
                    }}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </label>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const d = Math.abs(sim.vc - 2.5);
                        setChallengeStars(d < 0.1 ? 3 : d < 0.3 ? 2 : d < 0.6 ? 1 : 0);
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer whitespace-nowrap"
                    >
                      {lang === 'fr' ? 'Vérifier V_C = 2,50 V' : 'تحقّق من نصف الجهد'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStageView('schematic');
                        setParams((p) => ({ ...p, acSignalOn: !p.acSignalOn }));
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border cursor-pointer whitespace-nowrap ${
                        params.acSignalOn
                          ? 'border-sky-600 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/30'
                          : 'border-stone-300 dark:border-stone-700'
                      }`}
                    >
                      {params.acSignalOn
                        ? lang === 'fr'
                          ? 'Signal AC injecté (Voir Oscillo)'
                          : 'إشارة AC مفعّلة'
                        : lang === 'fr'
                        ? 'Injecter un signal AC'
                        : 'حقن موجة AC'}
                    </button>
                  </div>

                  {challengeStars !== null && (
                    <div className="flex items-center gap-1 text-amber-500">
                      {[0, 1, 2].map((i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < challengeStars ? 'fill-amber-400 text-amber-500' : 'text-stone-300 dark:text-stone-700'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Live Electrical Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-200 dark:border-stone-800 text-xs font-mono-num">
              <div>
                <div className="text-stone-500 dark:text-stone-400">I_B</div>
                <div className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                  {sim.ibUA.toFixed(1)} µA
                </div>
              </div>
              <div>
                <div className="text-stone-500 dark:text-stone-400">I_C</div>
                <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                  {sim.icMA.toFixed(2)} mA
                </div>
              </div>
              <div>
                <div className="text-stone-500 dark:text-stone-400">V_CE / V_C</div>
                <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {sim.vce.toFixed(2)} V
                </div>
              </div>
              <div>
                <div className="text-stone-500 dark:text-stone-400">
                  {lang === 'fr' ? 'Gain actif' : 'التضخيم'}
                </div>
                <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  ×{sim.betaEff.toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
