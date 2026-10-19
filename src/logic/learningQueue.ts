import {Flashcard, DifficultyLevel, getCardsForLevel} from '../data/vocabulary';

const STORAGE_KEY_MASTERED = 'mrd_vocab_mastered_ids';
const STORAGE_KEY_LEVEL = 'mrd_vocab_difficulty';

export function loadMasteredIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MASTERED);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch {
    // Ignore storage errors on restricted environments
  }
  return new Set();
}

export function saveMasteredIds(ids: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY_MASTERED, JSON.stringify([...ids]));
  } catch {
    // Ignore
  }
}

export function loadDifficulty(): DifficultyLevel {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEVEL);
    if (raw === 'B1' || raw === 'B2' || raw === 'ALL') {
      return raw;
    }
  } catch {
    // Ignore
  }
  return 'B1';
}

export function saveDifficulty(level: DifficultyLevel): void {
  try {
    localStorage.setItem(STORAGE_KEY_LEVEL, level);
  } catch {
    // Ignore
  }
}

export function resetProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_MASTERED);
  } catch {
    // Ignore
  }
}

/**
 * Builds a frequency-biased randomized study queue.
 * Words with lower rank (more popular/frequent in Goethe exams) are prioritized,
 * while still drawing with controlled randomness to avoid monotone sequences.
 */
export function buildStudyQueue(level: DifficultyLevel, mastered: Set<string>): Flashcard[] {
  const allCards = getCardsForLevel(level);
  const remaining = allCards.filter(c => !mastered.has(c.id));

  if (remaining.length === 0) {
    return [];
  }

  // Sort remaining cards by popularity rank
  const sorted = [...remaining].sort((a, b) => a.rank - b.rank);

  // Group into frequency bands: Top 30% (High Frequency), Mid 40% (Medium), Rest (Advanced)
  const tierSize = Math.max(1, Math.floor(sorted.length / 3));
  const tierHigh = sorted.slice(0, tierSize);
  const tierMid = sorted.slice(tierSize, tierSize * 2);
  const tierLow = sorted.slice(tierSize * 2);

  // Shuffle individual tiers so words within the tier appear randomly
  const shuffledHigh = shuffle(tierHigh);
  const shuffledMid = shuffle(tierMid);
  const shuffledLow = shuffle(tierLow);

  // Interleave with high-frequency bias: 3 high -> 2 mid -> 1 low
  const queue: Flashcard[] = [];
  while (shuffledHigh.length > 0 || shuffledMid.length > 0 || shuffledLow.length > 0) {
    for (let i = 0; i < 3 && shuffledHigh.length > 0; i++) {
      queue.push(shuffledHigh.shift()!);
    }
    for (let i = 0; i < 2 && shuffledMid.length > 0; i++) {
      queue.push(shuffledMid.shift()!);
    }
    for (let i = 0; i < 1 && shuffledLow.length > 0; i++) {
      queue.push(shuffledLow.shift()!);
    }
  }

  return queue;
}

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
