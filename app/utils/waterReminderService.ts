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

const waterNotifs = [
  "00: Drink some water!!",
  "02: Water time:D",
  "04: Get hydrated buddy!",
  "06: It's morning, Get some H2O",
  "08: Drink up that bottle of yours!!",
  "10: You know what time it is.. WATER TIME:D",
  "12: Get some lunch and get some WATER!",
  "14: Fill up your stomach with WATER!!",
  "16: Hydration again and again!",
  "18: Late water time!",
  "20: Little bit more water before bed.",
  "22: Last sip of water:D, you have basically drank the pacific ocean, great job!",
];

class WaterReminderService {
  async requestPermissions(): Promise<boolean> {
  const { granted } = await Notifications.requestPermissionsAsync();
  
  if (granted) {
    console.log('Påminnelse tillatt');
  } else {
    console.log('Påminnelse nektet');
  }
  return granted;
}

  async startWaterReminders() {
    const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
    
    for (let i = 0; i < hours.length; i++) {
      const hour = hours[i];
      const melding = waterNotifs[i];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: melding,
          body: "Hydration time",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hour,
          minute: 0,
        },
      });

      console.log(`${melding}`);
    }

    console.log('Vannpåminnelser har startet.');
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