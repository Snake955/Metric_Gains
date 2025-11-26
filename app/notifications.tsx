import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export default function NotificationsScreen() {

const [notifications, setNotifications] = useState<any[]>([]);

useEffect(() => {
    const getNotifications = async () => {
        const reminder = await Notifications.getAllScheduledNotificationsAsync();
        setNotifications(reminder);
    };
    getNotifications();
}, []);

const waterReminders = notifications.filter(n => 
    n.content.title?.includes('💧')
);

const getCurrentReminder = () => {
  const currentDay = new Date();
  const currentStart = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());
  const currentEnd = new Date(currentStart);
  currentEnd.setDate(currentEnd.getDate() + 1);

  return waterReminders.filter(reminder => {
    if (!reminder.trigger) return false;
    
    if (reminder.trigger.type === 'daily') {
      const currentHour = reminder.trigger.hour || 0;
      const currentReminder = new Date(currentStart);
      currentReminder.setHours(currentHour, reminder.trigger.minute || 0);
      
      return currentReminder >= currentStart && currentReminder < currentEnd;
    }
    
    return false;
  });
};

const currentWaterReminder = getCurrentReminder();

return (
    <SafeAreaView style={styles.screen}>
    <View style={styles.header}>
        <ThemedText type="title">Notifications</ThemedText>
    </View>

    <ScrollView style={styles.container}>
        <ThemedText>Today's reminders count: {currentWaterReminder.length}</ThemedText>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
screen: {
    flex: 1,
},

header: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 5,
  paddingHorizontal: 5,
  paddingTop: 10,
},

container: {
  flex: 1,
  paddingHorizontal: 5,
},
});