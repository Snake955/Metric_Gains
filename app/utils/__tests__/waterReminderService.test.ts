import waterReminderService from '../waterReminderService';
import * as Notifications from 'expo-notifications';

jest.mock('expo-notifications');

describe('WaterReminderServiceTest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('spør om tillatelse, fortsetter om det blir tillat', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    });

    const tillatt = await waterReminderService.requestPermissions();
    
    expect(tillatt).toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('spør om tillatelse, false om det ikke er tillat', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    });

    const tillatt = await waterReminderService.requestPermissions();
    
    expect(tillatt).toBe(false);
  });

  it('12 vannpåminnelser planlagt', async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('test');

    await waterReminderService.startWaterReminders();

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(12);
  });

  it('12 vann påminnelser med riktig timer', async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('test');

    await waterReminderService.startWaterReminders();

    const antallTimer = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
    
    antallTimer.forEach((h, i) => {
      const notifs = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[i][0];
      expect(notifs.trigger.hour).toBe(h);
    });
  });

  it('kansellerer alle påminnelser', async () => {
    (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(undefined);

    await waterReminderService.cancelAllReminders();

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });
});