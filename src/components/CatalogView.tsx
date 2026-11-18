import React, { useMemo, useState } from 'react';
import { Play, Search } from 'lucide-react';
import { CatalogCategory, CatalogCircuit, Lang } from '../types';

interface Props {
  circuits: CatalogCircuit[];
  lang: Lang;
  onLaunchInLab: (chapterId: number, exampleId?: string) => void;
}

const CATEGORIES: { id: CatalogCategory; fr: string; ar: string }[] = [
  { id: 'all', fr: 'Tous', ar: 'الكل' },
  { id: 'basics', fr: 'Bases', ar: 'الأساسيات' },
  { id: 'leds', fr: 'LEDs & Clignotants', ar: 'مصابيح ووماضات' },
  { id: 'sensors', fr: 'Capteurs & Tactile', ar: 'حساسات ولمس' },
  { id: 'audio', fr: 'Audio & Sirènes', ar: 'صوتيات وصفارات' },
  { id: 'power', fr: 'Énergie & Solaire', ar: 'طاقة وشحن شمسي' },
  { id: 'testers', fr: 'Testeurs', ar: 'أجهزة فحص' },
];

export const CatalogView: React.FC<Props> = ({ circuits, lang, onLaunchInLab }) => {
  const [cat, setCat] = useState<CatalogCategory>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return circuits.filter((c) => {
      if (cat !== 'all' && c.category !== cat) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.titleBi[lang].toLowerCase().includes(q) ||
        c.parts.some((p) => p.toLowerCase().includes(q)) ||
        String(c.page).includes(q)
      );
    });
  }, [circuits, cat, query, lang]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <p className="text-xs font-mono-num text-amber-700 dark:text-amber-400">
            1-100 Transistor Circuits · Colin Mitchell
          </p>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mt-1">
            {lang === 'fr' ? 'Explorateur de circuits concrets' : 'دليل الدارات التطبيقية من الكتاب'}
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 mt-1 max-w-2xl">
            {lang === 'fr'
              ? 'Parcourez les montages emblématiques du livre avec leur page exacte, leurs composants et lancez directement leur simulation interactive.'
              : 'تصفّح أشهر دارات الكتاب مع رقم الصفحة والمكوّنات الحقيقية وافتح محاكاتها التفاعلية مباشرة.'}
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'fr' ? 'Chercher (BC547, LDR, p. 50...)' : 'ابحث (BC547، LDR، صفحة 50...)'}
            className="w-full ps-9 pe-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-200/70 dark:bg-stone-800/80 rounded-lg w-fit">
        {CATEGORIES.map((c) => {
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {c[lang]}
            </button>
          );
        })}
      </div>

      {/* Circuit Cards Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-stone-500 dark:text-stone-400 border border-dashed border-stone-300 dark:border-stone-700 rounded-xl">
          {lang === 'fr' ? 'Aucun circuit ne correspond à votre recherche.' : 'لا توجد دارات مطابقة لبحثك.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 p-5 flex flex-col justify-between gap-4 hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-mono-num text-stone-500 dark:text-stone-400">
                  <span>p. {item.page}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.transistors.join(' + ')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.supply}</span>
                </div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {item.titleBi[lang]}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {item.concept[lang]}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-200/70 dark:border-stone-800 flex items-center justify-between gap-3">
                <span className="text-xs font-mono-num text-stone-500 dark:text-stone-400 truncate">
                  {item.parts.slice(0, 4).join(' · ')}
                </span>
                <button
                  type="button"
                  onClick={() => onLaunchInLab(item.linkedChapterId, item.linkedExampleId)}
                  className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap transition-colors"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{lang === 'fr' ? 'Simuler' : 'محاكاة'}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
