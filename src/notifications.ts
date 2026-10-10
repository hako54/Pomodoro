import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const CHANNEL_ID = 'timer';
let scheduledId: string | null = null;

export async function setupNotifications(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Timer',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 300, 200, 300],
      });
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  } catch {}
}

export async function scheduleEndNotification(seconds: number, title: string, body: string) {
  await cancelEndNotification();
  if (seconds < 1) return;
  try {
    scheduledId = await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: 'default' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.round(seconds),
        channelId: CHANNEL_ID,
      },
    });
  } catch {}
}

export async function cancelEndNotification() {
  if (!scheduledId) return;
  const id = scheduledId;
  scheduledId = null;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {}
}
