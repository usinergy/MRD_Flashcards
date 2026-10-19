import goetheData from './goetheVocab.json';

export interface Flashcard {
  id: string;
  german: string;
  article: string | null;
  english: string;
  level: 'B1' | 'B2';
  exampleGerman: string;
  exampleEnglish: string;
  category: string;
  rank: number;
}

export type DifficultyLevel = 'B1' | 'B2' | 'ALL';

export const GOETHE_B1_CARDS: Flashcard[] = (goetheData.B1 as Flashcard[]);
export const GOETHE_B2_CARDS: Flashcard[] = (goetheData.B2 as Flashcard[]);

export function getCardsForLevel(level: DifficultyLevel): Flashcard[] {
  if (level === 'B1') return GOETHE_B1_CARDS;
  if (level === 'B2') return GOETHE_B2_CARDS;
  return [...GOETHE_B1_CARDS, ...GOETHE_B2_CARDS];
}
