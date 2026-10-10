import AsyncStorage from '@react-native-async-storage/async-storage';

export type Settings = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStart: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStart: false,
};

const SETTINGS_KEY = 'pomodoro.settings';
const STATS_KEY = 'pomodoro.stats';

type Stats = { date: string; completed: number };

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export async function loadTodayCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) return 0;
    const stats: Stats = JSON.parse(raw);
    return stats.date === todayKey() ? stats.completed : 0;
  } catch {
    return 0;
  }
}

export async function saveTodayCount(completed: number): Promise<void> {
  try {
    const stats: Stats = { date: todayKey(), completed };
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}
