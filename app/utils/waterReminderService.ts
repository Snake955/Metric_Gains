import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class WaterReminderService {
  async requestPermissions(): Promise<boolean> {
  const { granted } = await Notifications.requestPermissionsAsync();
  
  if (granted) {
    console.log('Påminnelse tillat');
  } else {
    console.log('Påminnelse nektet');
  }
  return granted;
}

  async sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test påminnelse",
        body: "Dette er test, hei:D",
        sound: true,
        data: { type: 'test' },
      },
      trigger: { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        repeats: false,
      },
    });

    console.log('Test påminnelse, du får se om 5 sekunder.');
  }
}

export default new WaterReminderService();