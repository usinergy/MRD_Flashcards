import {useRef, useCallback} from 'react';
import type {PointerEvent} from 'react';

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_MIN = 0.15; // px per ms

interface SwipeBindings {
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
  onPointerCancel: () => void;
}

export function useSwipeGesture(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
): SwipeBindings {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const tracking = useRef(false);

  const reset = useCallback(() => {
    startX.current = null;
    startY.current = null;
    startTime.current = 0;
    tracking.current = false;
  }, []);

  const onPointerDown = useCallback((e: PointerEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    startTime.current = Date.now();
    tracking.current = true;
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    // Prevents text selection or scroll fighting while swiping
    if (!tracking.current || startX.current === null) return;
    const dx = Math.abs(e.clientX - startX.current);
    const dy = Math.abs(e.clientY - (startY.current ?? 0));
    // If clearly vertical, abandon tracking
    if (dy > dx * 2 && dy > 10) {
      reset();
    }
  }, [reset]);

  const onPointerUp = useCallback((e: PointerEvent) => {
    if (!tracking.current || startX.current === null || startY.current === null) {
      reset();
      return;
    }

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    const elapsed = Date.now() - startTime.current;
    const velocity = elapsed > 0 ? Math.abs(dx) / elapsed : 0;

    reset();

    // Must be predominantly horizontal, exceed distance threshold,
    // and have enough velocity to feel intentional
    if (
      Math.abs(dx) >= SWIPE_THRESHOLD &&
      Math.abs(dx) > Math.abs(dy) &&
      velocity >= SWIPE_VELOCITY_MIN
    ) {
      if (dx > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }
  }, [onSwipeLeft, onSwipeRight, reset]);

  const onPointerCancel = reset;

  return {onPointerDown, onPointerMove, onPointerUp, onPointerCancel};
}
