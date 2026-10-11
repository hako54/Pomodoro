const strings = {
  en: {
    focus: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
    start: 'START',
    pause: 'PAUSE',
    resume: 'RESUME',
    today: 'Today',
    focusDone: 'Focus session complete! Time for a break.',
    breakDone: "Break's over. Ready to focus?",
    settings: 'Settings',
    minutes: 'min',
    autoStart: 'Auto-start next session',
    longBreakEvery: 'Long break every',
    sessions: 'sessions',
    done: 'Done',
    focusTitle: 'Time to focus!',
    breakTitle: 'Time for a break!',
  },
  tr: {
    focus: 'Odaklan',
    shortBreak: 'Kısa Mola',
    longBreak: 'Uzun Mola',
    start: 'BAŞLAT',
    pause: 'DURAKLAT',
    resume: 'DEVAM',
    today: 'Bugün',
    focusDone: 'Odak seansı bitti! Mola zamanı.',
    breakDone: 'Mola bitti. Odaklanmaya hazır mısın?',
    settings: 'Ayarlar',
    minutes: 'dk',
    autoStart: 'Sonraki seansı otomatik başlat',
    longBreakEvery: 'Uzun mola sıklığı',
    sessions: 'seans',
    done: 'Tamam',
    focusTitle: 'Odaklanma zamanı!',
    breakTitle: 'Mola zamanı!',
  },
};

export type StringKey = keyof typeof strings.en;

function detectLanguage(): keyof typeof strings {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale ?? 'en';
    return locale.toLowerCase().startsWith('tr') ? 'tr' : 'en';
  } catch {
    return 'en';
  }
}

const lang = detectLanguage();

export function t(key: StringKey): string {
  return strings[lang][key];
}
