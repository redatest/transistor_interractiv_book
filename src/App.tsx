import { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, Moon, Sun, Languages } from 'lucide-react';
import { AppView, Lang } from './types';
import { CHAPTERS } from './data/chapters';
import { CATALOG_CIRCUITS } from './data/catalog';
import { ChapterWorkspace } from './components/ChapterWorkspace';
import { CatalogView } from './components/CatalogView';
import { CatalogLabView } from './components/CatalogLabView';
import { ToolsView } from './components/ToolsView';

export default function App() {
  const [view, setView] = useState<AppView>('chapters');
  const [lang, setLang] = useState<Lang>('fr');
  const [dark, setDark] = useState<boolean>(false);
  const [teacherMode, setTeacherMode] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const [activeExampleId, setActiveExampleId] = useState<string | undefined>(undefined);
  const [activeCatalogId, setActiveCatalogId] = useState<string>(CATALOG_CIRCUITS[0].id);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    root.classList.toggle('dark', dark);
  }, [lang, dark]);

  const handleSelectChapter = (chapterId: number, exampleId?: string) => {
    setActiveChapterId(chapterId);
    setActiveExampleId(exampleId);
  };

  const handleLaunchCatalogSim = (circuitId: string) => {
    setTeacherMode(false);
    setActiveCatalogId(circuitId);
    setView('catalog-sim');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleTeacherMode = () => {
    setTeacherMode((prev) => {
      const next = !prev;
      if (next && view !== 'chapters') {
        setView('chapters');
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf8f2] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Strictly 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 border-b border-stone-200 dark:border-stone-800 bg-[#fbf8f2]/90 dark:bg-stone-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => setView('chapters')}
            className="flex items-center gap-2.5 text-start cursor-pointer whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-bold text-base tracking-tight text-stone-900 dark:text-stone-50">
              {lang === 'fr' ? 'Le Livre Vivant' : 'الكتاب الحيّ'}
            </span>
          </button>

          {/* Zone 2: Primary Navigation Links */}
          <nav className="flex items-center gap-6 overflow-x-auto" aria-label="Navigation principale">
            <button
              type="button"
              onClick={() => setView('chapters')}
              className={`py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'chapters'
                  ? 'border-amber-600 text-stone-950 dark:border-amber-400 dark:text-stone-50'
                  : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              {lang === 'fr' ? 'Chapitres' : 'الفصول'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTeacherMode(false);
                setView('catalog');
              }}
              className={`py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'catalog' || view === 'catalog-sim'
                  ? 'border-amber-600 text-stone-950 dark:border-amber-400 dark:text-stone-50'
                  : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              {lang === 'fr' ? 'Catalogue (24)' : 'دليل الدارات (٢٤)'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTeacherMode(false);
                setView('tools');
              }}
              className={`py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'tools'
                  ? 'border-amber-600 text-stone-950 dark:border-amber-400 dark:text-stone-50'
                  : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              {lang === 'fr' ? 'Testeur & Outils' : 'أدوات المختبر'}
            </button>
          </nav>

          {/* Zone 3: Single Primary Action CTA */}
          <button
            type="button"
            onClick={handleToggleTeacherMode}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              teacherMode
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-amber-400 dark:text-stone-950 dark:hover:bg-amber-300'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>
              {teacherMode
                ? lang === 'fr'
                  ? 'Quitter Enseignant'
                  : 'إنهاء وضع العرض'
                : lang === 'fr'
                ? 'Mode Enseignant'
                : 'وضع المعلّم'}
            </span>
          </button>
        </div>
      </header>

      {/* Compact Workspace Toolbar (below header) */}
      <div className="border-b border-stone-200/80 dark:border-stone-800/80 bg-stone-100/60 dark:bg-stone-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="font-mono-num text-stone-600 dark:text-stone-400">
            1-100 Transistor Circuits · Colin Mitchell · {lang === 'fr' ? 'Édition interactive' : 'النسخة التفاعلية'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang((l) => (l === 'fr' ? 'ar' : 'fr'))}
              className="px-2.5 py-1 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Languages className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{lang === 'fr' ? 'العربية' : 'Français'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="px-2.5 py-1 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              aria-label={lang === 'fr' ? 'Changer le thème' : 'تبديل المظهر'}
            >
              {dark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'fr' ? 'Clair' : 'فاتح'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-stone-600" />
                  <span>{lang === 'fr' ? 'Sombre' : 'داكن'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {view === 'chapters' && (
          <ChapterWorkspace
            chapters={CHAPTERS}
            activeChapterId={activeChapterId}
            activeExampleId={activeExampleId}
            onSelectChapter={handleSelectChapter}
            lang={lang}
            teacherMode={teacherMode}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
          />
        )}

        {view === 'catalog' && (
          <CatalogView
            circuits={CATALOG_CIRCUITS}
            lang={lang}
            onLaunchCatalogSim={handleLaunchCatalogSim}
          />
        )}

        {view === 'catalog-sim' && (
          <CatalogLabView
            circuits={CATALOG_CIRCUITS}
            activeCircuitId={activeCatalogId}
            onSelectCircuit={setActiveCatalogId}
            onBackToCatalog={() => setView('catalog')}
            lang={lang}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
          />
        )}

        {view === 'tools' && <ToolsView lang={lang} />}
      </main>

      {/* Minimal Academic Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-4 text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {lang === 'fr'
              ? 'Basé sur « 1-100 Transistor Circuits » de Colin Mitchell (Talking Electronics)'
              : 'مبني على كتاب «1-100 Transistor Circuits» للمؤلف كولن ميتشل'}
          </span>
          <span className="font-mono-num">
            {lang === 'fr'
              ? '9 chapitres · 24 montages du livre · Multimètre & Code couleurs'
              : '٩ فصول · ٢٤ دارة تطبيقية · فاحص الترانزستور وحاسبة المقاومات'}
          </span>
        </div>
      </footer>
    </div>
  );
}
