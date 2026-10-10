import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import { ProgressRing } from './src/components/ProgressRing';
import { SettingsSheet } from './src/components/SettingsSheet';
import { t } from './src/i18n';
import { setupNotifications } from './src/notifications';
import { Mode, usePomodoro } from './src/usePomodoro';

const COLORS: Record<Mode, string> = {
  focus: '#E5533D',
  shortBreak: '#2A9D8F',
  longBreak: '#3D6FD8',
};

const MODES: { key: Mode; label: string }[] = [
  { key: 'focus', label: t('focus') },
  { key: 'shortBreak', label: t('shortBreak') },
  { key: 'longBreak', label: t('longBreak') },
];

function formatTime(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function KeepAwake() {
  useKeepAwake();
  return null;
}

function PomodoroScreen() {
  const p = usePomodoro();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { width, height } = useWindowDimensions();
  // Scale the whole layout up on tablets so it doesn't float tiny in the middle.
  const k = Math.min(Math.max(Math.min(width / 393, height / 852), 1), 1.8);
  const ringSize = Math.min(width - 64, 320 * k);
  const color = COLORS[p.mode];

  useEffect(() => {
    setupNotifications();
  }, []);

  const startLabel = p.running ? t('pause') : p.remaining < p.total ? t('resume') : t('start');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: color }]}>
      <StatusBar style="light" />
      {p.running && <KeepAwake />}

      <View style={styles.header}>
        <Text style={[styles.brand, { fontSize: 22 * k }]}>🍅 Pomodoro</Text>
        <Pressable accessibilityLabel={t('settings')} hitSlop={12} onPress={() => setSettingsOpen(true)}>
          <Text style={[styles.icon, { fontSize: 28 * k }]}>⚙︎</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {MODES.map((m) => (
          <Pressable
            key={m.key}
            onPress={() => p.selectMode(m.key)}
            style={[
              styles.tab,
              { paddingVertical: 8 * k, paddingHorizontal: 12 * k },
              p.mode === m.key && styles.tabActive,
            ]}
          >
            <Text style={[styles.tabText, { fontSize: 14 * k }]} numberOfLines={1}>
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.ringWrap, { width: ringSize, height: ringSize }]}>
        <ProgressRing
          size={ringSize}
          stroke={12}
          progress={1 - p.remaining / p.total}
          color="#fff"
          track="rgba(255,255,255,0.25)"
        />
        <Text style={[styles.time, { fontSize: 72 * k }]} accessibilityRole="timer">
          {formatTime(p.remaining)}
        </Text>
        <View style={styles.dots}>
          {Array.from({ length: p.settings.longBreakInterval }).map((_, i) => (
            <View key={i} style={[styles.dot, i < p.cycleCount && styles.dotFilled]} />
          ))}
        </View>
      </View>

      <Pressable
        onPress={p.toggle}
        style={({ pressed }) => [
          styles.mainBtn,
          { width: 220 * k, paddingVertical: 18 * k, borderRadius: 18 * k },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={[styles.mainBtnText, { color, fontSize: 22 * k }]}>{startLabel}</Text>
      </Pressable>

      <View style={styles.secondary}>
        <Pressable onPress={p.reset} hitSlop={12} accessibilityLabel="Reset">
          <Text style={[styles.icon, { fontSize: 28 * k }]}>↺</Text>
        </Pressable>
        <Text style={[styles.today, { fontSize: 16 * k }]}>
          {t('today')}: {p.todayCount} 🍅
        </Text>
        <Pressable onPress={p.skip} hitSlop={12} accessibilityLabel="Skip">
          <Text style={[styles.icon, { fontSize: 28 * k }]}>⏭︎</Text>
        </Pressable>
      </View>

      <SettingsSheet
        visible={settingsOpen}
        settings={p.settings}
        accent={color}
        onChange={p.updateSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PomodoroScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  header: {
    width: '100%',
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { color: '#fff', fontSize: 22, fontWeight: '800' },
  icon: { color: '#fff', fontSize: 28 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 16,
  },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  time: { color: '#fff', fontSize: 72, fontWeight: '800', fontVariant: ['tabular-nums'] },
  dots: { flexDirection: 'row', gap: 8, marginTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotFilled: { backgroundColor: '#fff' },
  mainBtn: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    width: 220,
    alignItems: 'center',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  mainBtnText: { fontSize: 22, fontWeight: '800', letterSpacing: 2 },
  secondary: {
    width: '100%',
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  today: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
