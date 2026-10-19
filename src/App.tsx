import {useState, useEffect, useCallback, useMemo} from 'react';
import {App as WearablesApp} from '@wearables-ui-toolkit/mrbd';
import {Flashcard, DifficultyLevel, getCardsForLevel} from './data/vocabulary';
import {
  loadMasteredIds,
  saveMasteredIds,
  loadDifficulty,
  saveDifficulty,
  resetProgress,
  buildStudyQueue,
} from './logic/learningQueue';
import {WelcomeView} from './views/WelcomeView';
import {SettingsView} from './views/SettingsView';
import {StudyView} from './views/StudyView';
import {useImuGesture, requestImuPermission} from './hooks/useImuGesture';

type Screen = 'welcome' | 'study' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(loadDifficulty);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(loadMasteredIds);
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);

  const totalCardsInLevel = useMemo(() => {
    return getCardsForLevel(difficulty).length;
  }, [difficulty]);

  const currentCard = queue[0] as Flashcard | undefined;

  const onStartSession = useCallback(async () => {
    await requestImuPermission();
    const newQueue = buildStudyQueue(difficulty, masteredIds);
    setQueue(newQueue);
    setIsFlipped(false);
    setScreen('study');
  }, [difficulty, masteredIds]);

  const onOpenSettings = useCallback(() => {
    setScreen('settings');
  }, []);

  const onCloseSettings = useCallback(() => {
    setScreen('welcome');
  }, []);

  const onCycleDifficulty = useCallback(() => {
    setDifficulty(prev => {
      const next: DifficultyLevel = prev === 'B1' ? 'B2' : prev === 'B2' ? 'ALL' : 'B1';
      saveDifficulty(next);
      return next;
    });
  }, []);

  const onResetProgress = useCallback(() => {
    resetProgress();
    setMasteredIds(new Set());
    setQueue([]);
    setIsFlipped(false);
  }, []);

  // Swipe Right: "I know the word -> never show again"
  const onSwipeRightAction = useCallback(() => {
    if (!currentCard) {
      setScreen('welcome');
      return;
    }

    setMasteredIds(prev => {
      const next = new Set(prev).add(currentCard.id);
      saveMasteredIds(next);
      return next;
    });

    setQueue(prev => prev.slice(1));
    setIsFlipped(false);
  }, [currentCard]);

  // Swipe Left: "I do not know"
  // 1st swipe (front showing): flip to reveal meaning — queue stays unchanged
  // 2nd swipe (back showing): re-queue card ~3 positions ahead, advance to next
  const onSwipeLeftAction = useCallback(() => {
    if (!currentCard) {
      setScreen('welcome');
      return;
    }

    if (!isFlipped) {
      // Step 1: Just flip to reveal the answer
      setIsFlipped(true);
    } else {
      // Step 2: User saw the answer. Re-queue for reinforcement, then advance.
      setQueue(prev => {
        if (prev.length <= 1) return prev;
        const current = prev[0];
        const rest = prev.slice(1);
        const insertIndex = Math.min(3, rest.length);
        return [...rest.slice(0, insertIndex), current, ...rest.slice(insertIndex)];
      });
      setIsFlipped(false);
    }
  }, [currentCard, isFlipped]);

  // Manage focus restoration across screen transitions
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const button = document.querySelector<HTMLElement>('button:not([disabled])');
      button?.focus();
    });
    return () => cancelAnimationFrame(frameId);
  }, [screen]);

  // Keyboard navigation for Meta Neural Band gestures and escape/back.
  // Use capture phase so we intercept arrow events before the UI toolkit's
  // focus-management handlers consume them on the glasses.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (screen !== 'welcome') {
          setScreen('welcome');
        }
        return;
      }

      if (screen === 'study') {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          event.stopPropagation();
          onSwipeRightAction();
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          event.stopPropagation();
          onSwipeLeftAction();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [
    screen,
    onSwipeRightAction,
    onSwipeLeftAction,
  ]);

  // IMU sensor gesture detection for hand flicks and device tilt.
  // When in study mode, flicking/tilting left reveals/next and flicking/tilting right marks known.
  useImuGesture({
    enabled: screen === 'study',
    onSwipeLeft: onSwipeLeftAction,
    onSwipeRight: onSwipeRightAction,
  });

  const difficultyText = difficulty === 'ALL' ? 'Goethe B1 + B2' : `Goethe ${difficulty}`;

  return (
    <WearablesApp>
      {screen === 'welcome' && (
        <WelcomeView
          masteredCount={masteredIds.size}
          totalCount={totalCardsInLevel}
          onStart={onStartSession}
          onSettings={onOpenSettings}
        />
      )}

      {screen === 'settings' && (
        <SettingsView
          difficultyLabel={difficultyText}
          masteredCount={masteredIds.size}
          onCycleLevel={onCycleDifficulty}
          onReset={onResetProgress}
          onClose={onCloseSettings}
        />
      )}

      {screen === 'study' && (
        <StudyView
          currentCard={currentCard}
          isFlipped={isFlipped}
          onLeft={onSwipeLeftAction}
          onRight={onSwipeRightAction}
        />
      )}
    </WearablesApp>
  );
}
