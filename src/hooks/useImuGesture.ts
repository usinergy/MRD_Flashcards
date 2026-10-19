import {useEffect, useRef} from 'react';

interface SensorWithPermission {
  requestPermission?: () => Promise<string>;
}

/**
 * Requests permission for DeviceMotion and DeviceOrientation if required
 * by the environment (e.g. mobile Safari / strict runtimes).
 */
export async function requestImuPermission(): Promise<boolean> {
  let granted = true;

  if (typeof DeviceMotionEvent !== 'undefined') {
    const motion = DeviceMotionEvent as SensorWithPermission;
    if (typeof motion.requestPermission === 'function') {
      try {
        const state = await motion.requestPermission();
        if (state !== 'granted') granted = false;
      } catch {
        granted = false;
      }
    }
  }

  if (typeof DeviceOrientationEvent !== 'undefined') {
    const orient = DeviceOrientationEvent as SensorWithPermission;
    if (typeof orient.requestPermission === 'function') {
      try {
        const state = await orient.requestPermission();
        if (state !== 'granted') granted = false;
      } catch {
        granted = false;
      }
    }
  }

  return granted;
}

interface ImuGestureOptions {
  enabled: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  /** Acceleration threshold in m/s^2 for a quick hand flick */
  accelerationThreshold?: number;
  /** Tilt threshold in degrees for device orientation */
  tiltThreshold?: number;
  /** Cooldown in ms between triggered gestures */
  cooldownMs?: number;
}

/**
 * Hook to detect hand gestures / flicks via IMU (devicemotion and deviceorientation).
 * - Flick / tilt left: triggers onSwipeLeft
 * - Flick / tilt right: triggers onSwipeRight
 *
 * Implements hysteresis deadzone, cooldown debounce, visibility lifecycle cleanup,
 * and exact add/remove listener symmetry.
 */
export function useImuGesture({
  enabled,
  onSwipeLeft,
  onSwipeRight,
  accelerationThreshold = 3.2,
  tiltThreshold = 20,
  cooldownMs = 700,
}: ImuGestureOptions) {
  const lastTriggerTime = useRef<number>(0);
  const isNeutral = useRef<boolean>(true);
  const leftCallback = useRef(onSwipeLeft);
  const rightCallback = useRef(onSwipeRight);

  useEffect(() => {
    leftCallback.current = onSwipeLeft;
    rightCallback.current = onSwipeRight;
  }, [onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    if (!enabled) return;

    let attached = false;

    const handleMotion = (event: DeviceMotionEvent) => {
      const now = Date.now();
      if (now - lastTriggerTime.current < cooldownMs) return;

      // Lateral acceleration (X axis):
      // Positive X: flick to the right
      // Negative X: flick to the left
      const ax =
        event.acceleration?.x ??
        (event.accelerationIncludingGravity?.x != null ? event.accelerationIncludingGravity.x : null);

      // Rotation rate (deg/s): gamma = roll, alpha = yaw / twist
      const rotZ = event.rotationRate?.gamma ?? 0;
      const rotY = event.rotationRate?.beta ?? 0;

      if (ax != null) {
        if (ax > accelerationThreshold || rotZ > 130 || rotY > 130) {
          lastTriggerTime.current = now;
          isNeutral.current = false;
          rightCallback.current();
          return;
        }
        if (ax < -accelerationThreshold || rotZ < -130 || rotY < -130) {
          lastTriggerTime.current = now;
          isNeutral.current = false;
          leftCallback.current();
          return;
        }
      }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const now = Date.now();
      const gamma = event.gamma; // Left-to-right tilt in degrees (-90 to +90)

      if (gamma == null) return;

      // Reset neutral state when back in center deadzone
      if (Math.abs(gamma) < 10) {
        isNeutral.current = true;
      }

      if (now - lastTriggerTime.current < cooldownMs) return;
      if (!isNeutral.current) return;

      if (gamma > tiltThreshold) {
        lastTriggerTime.current = now;
        isNeutral.current = false;
        rightCallback.current();
      } else if (gamma < -tiltThreshold) {
        lastTriggerTime.current = now;
        isNeutral.current = false;
        leftCallback.current();
      }
    };

    const attachListeners = () => {
      if (attached) return;
      window.addEventListener('devicemotion', handleMotion);
      window.addEventListener('deviceorientation', handleOrientation);
      attached = true;
    };

    const detachListeners = () => {
      if (!attached) return;
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
      attached = false;
    };

    attachListeners();

    const onVisibilityChange = () => {
      if (document.hidden) {
        detachListeners();
      } else {
        attachListeners();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      detachListeners();
    };
  }, [enabled, accelerationThreshold, tiltThreshold, cooldownMs]);
}
