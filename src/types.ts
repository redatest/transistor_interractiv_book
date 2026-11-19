export type Lang = 'fr' | 'ar';

export type AppView = 'chapters' | 'catalog' | 'catalog-sim' | 'tools';

export interface BiText {
  fr: string;
  ar: string;
}

export interface BookExample {
  id: string;
  pageRef: string;
  title: BiText;
  summary: BiText;
  components: string[];
}

export interface PredictionQuestion {
  question: BiText;
  options: BiText[];
  correctIndex: number;
  explanation: BiText;
}

export interface ChapterFormulaVar {
  symbol: string;
  meaning: BiText;
  unit: string;
}

export interface ChapterDef {
  id: number;
  slug: string;
  pageRef: string;
  title: BiText;
  subtitle: BiText;
  analogyTitle: BiText;
  analogyText: BiText;
  theory: BiText[];
  formula: string;
  formulaVars: ChapterFormulaVar[];
  examples: BookExample[];
  prediction: PredictionQuestion;
  teacherNote: BiText;
}

export type CatalogCategory =
  | 'all'
  | 'basics'
  | 'leds'
  | 'sensors'
  | 'audio'
  | 'power'
  | 'testers';

export interface CatalogCircuit {
  id: string;
  page: number;
  title: string;
  titleBi: BiText;
  category: Exclude<CatalogCategory, 'all'>;
  transistors: string[];
  supply: string;
  parts: string[];
  concept: BiText;
  analogyTitle: BiText;
  analogyText: BiText;
}
