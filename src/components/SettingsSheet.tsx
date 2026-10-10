import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { t } from '../i18n';
import { Settings } from '../storage';

type Props = {
  visible: boolean;
  settings: Settings;
  accent: string;
  onChange: (s: Settings) => void;
  onClose: () => void;
};

function Stepper({
  label,
  value,
  unit,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          accessibilityLabel={`${label} -`}
          style={styles.stepBtn}
          onPress={() => onChange(Math.max(min, value - 1))}
        >
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <Text style={styles.value}>
          {value} {unit}
        </Text>
        <Pressable
          accessibilityLabel={`${label} +`}
          style={styles.stepBtn}
          onPress={() => onChange(Math.min(max, value + 1))}
        >
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function SettingsSheet({ visible, settings, accent, onChange, onClose }: Props) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch });
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t('settings')}</Text>
          <Stepper
            label={t('focus')}
            value={settings.focusMinutes}
            unit={t('minutes')}
            min={1}
            max={90}
            onChange={(v) => set({ focusMinutes: v })}
          />
          <Stepper
            label={t('shortBreak')}
            value={settings.shortBreakMinutes}
            unit={t('minutes')}
            min={1}
            max={30}
            onChange={(v) => set({ shortBreakMinutes: v })}
          />
          <Stepper
            label={t('longBreak')}
            value={settings.longBreakMinutes}
            unit={t('minutes')}
            min={1}
            max={60}
            onChange={(v) => set({ longBreakMinutes: v })}
          />
          <Stepper
            label={t('longBreakEvery')}
            value={settings.longBreakInterval}
            unit={t('sessions')}
            min={2}
            max={8}
            onChange={(v) => set({ longBreakInterval: v })}
          />
          <View style={styles.row}>
            <Text style={styles.label}>{t('autoStart')}</Text>
            <Switch
              value={settings.autoStart}
              onValueChange={(v) => set({ autoStart: v })}
              trackColor={{ true: accent }}
            />
          </View>
          <Pressable style={[styles.doneBtn, { backgroundColor: accent }]} onPress={onClose}>
            <Text style={styles.doneText}>{t('done')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 8,
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#222' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: { fontSize: 16, color: '#333', flexShrink: 1, marginRight: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 20, fontWeight: '600', color: '#333' },
  value: { minWidth: 72, textAlign: 'center', fontSize: 16, fontWeight: '600', color: '#222' },
  doneBtn: { marginTop: 16, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  doneText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
