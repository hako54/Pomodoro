import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Haptics from 'expo-haptics';
import { t } from './i18n';
import { cancelEndNotification, scheduleEndNotification } from './notifications';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  loadTodayCount,
  saveSettings,
  saveTodayCount,
  Settings,
} from './storage';

export type Mode = 'focus' | 'shortBreak' | 'longBreak';

export function durationMs(mode: Mode, s: Settings): number {
  const minutes =
    mode === 'focus' ? s.focusMinutes : mode === 'shortBreak' ? s.shortBreakMinutes : s.longBreakMinutes;
  return minutes * 60 * 1000;
}

export function usePomodoro() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<Mode>('focus');
  const [remaining, setRemaining] = useState(durationMs('focus', DEFAULT_SETTINGS));
  const [running, setRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0); // focus sessions completed in the current cycle
  const [todayCount, setTodayCount] = useState(0);
  const endAt = useRef<number | null>(null);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setRemaining(durationMs('focus', s));
    });
    loadTodayCount().then(setTodayCount);
  }, []);

  const start = useCallback((ms: number, nextMode: Mode) => {
    endAt.current = Date.now() + ms;
    setRunning(true);
    const isFocus = nextMode === 'focus';
    scheduleEndNotification(
      ms / 1000,
      isFocus ? t('breakTitle') : t('focusTitle'),
      isFocus ? t('focusDone') : t('breakDone'),
    );
  }, []);

  const finishSession = useCallback((counted = true) => {
    endAt.current = null;
    setRunning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    let next: Mode = 'focus';
    if (mode === 'focus') {
      const newCycle = cycleCount + 1;
      if (counted) {
        const newToday = todayCount + 1;
        setTodayCount(newToday);
        saveTodayCount(newToday);
      }
      if (newCycle >= settings.longBreakInterval) {
        next = 'longBreak';
        setCycleCount(0);
      } else {
        next = 'shortBreak';
        setCycleCount(newCycle);
      }
    }
    const ms = durationMs(next, settings);
    setMode(next);
    setRemaining(ms);
    if (settings.autoStart) start(ms, next);
  }, [mode, cycleCount, todayCount, settings, start]);

  // Tick. Time is derived from a wall-clock end timestamp, so it stays correct
  // when the app is backgrounded and resumed.
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (endAt.current === null) return;
      const left = endAt.current - Date.now();
      if (left <= 0) finishSession();
      else setRemaining(left);
    };
    tick();
    const id = setInterval(tick, 250);
    const sub = AppState.addEventListener('change', (state) => state === 'active' && tick());
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [running, finishSession]);

  const toggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (running) {
      endAt.current = null;
      setRunning(false);
      cancelEndNotification();
    } else {
      start(remaining, mode);
    }
  }, [running, remaining, mode, start]);

  const reset = useCallback(() => {
    endAt.current = null;
    setRunning(false);
    cancelEndNotification();
    setRemaining(durationMs(mode, settings));
  }, [mode, settings]);

  const selectMode = useCallback(
    (m: Mode) => {
      Haptics.selectionAsync().catch(() => {});
      endAt.current = null;
      setRunning(false);
      cancelEndNotification();
      setMode(m);
      setRemaining(durationMs(m, settings));
    },
    [settings],
  );

  const skip = useCallback(() => {
    cancelEndNotification();
    finishSession(false);
  }, [finishSession]);

  const updateSettings = useCallback(
    (s: Settings) => {
      setSettings(s);
      saveSettings(s);
      if (!running) setRemaining(durationMs(mode, s));
    },
    [running, mode],
  );

  return {
    settings,
    mode,
    remaining,
    total: durationMs(mode, settings),
    running,
    cycleCount,
    todayCount,
    toggle,
    reset,
    skip,
    selectMode,
    updateSettings,
  };
}
