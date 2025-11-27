import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
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
    const interval = setInterval(getNotifications, 60000);
    return () => clearInterval(interval);
}, []);

const waterReminders = notifications.filter(n => 
    n.content.title?.includes('💧')
);

const getCurrentReminder = () => {
    const currentDay = new Date();
    const currentHour = currentDay.getHours();
    const currentMinute = currentDay.getMinutes();

    return waterReminders.filter(reminder => {
        if (!reminder.trigger || !reminder.trigger.dateComponents) return false;
    
        const triggerHour = reminder.trigger.dateComponents.hour ?? 0;
        const triggerMinute = reminder.trigger.dateComponents.minute ?? 0;
    
        if (triggerHour < currentHour) {
            return true;
        } else if (triggerHour === currentHour && triggerMinute <= currentMinute) {
            return true;
        }
    
        return false;
    });
};

const currentKlokke = (trigger: any) => {
  if (!trigger || !trigger.dateComponents) return 'Ukjent tid';
  
  const hour = trigger.dateComponents.hour ?? 0;
  const minute = trigger.dateComponents.minute ?? 0;
  
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const currentWaterReminder = getCurrentReminder();

return (
    <SafeAreaView style={styles.screen}>
    <View style={styles.header}>
        <ThemedText style={styles.centerTitle} type="title">Notifications</ThemedText>
    </View>

    <ScrollView style={styles.container}>
        {currentWaterReminder.length > 0 && (
    <View style={styles.section}>

    <ThemedText style={styles.sectionTitle} type="subtitle">{"💧Today's Water Reminders"}</ThemedText>

    {currentWaterReminder.map((varsel) => (
      <ThemedView key={varsel.identifier} style={styles.notifsCard}>

        <View style={styles.notifsRow}>
          <IconSymbol name="drop.fill" size={20} color="#2D7FF9" />
          <ThemedText type="defaultSemiBold">
            {varsel.content.title}
          </ThemedText>
        </View>

        <ThemedText style={styles.timer}>
          {currentKlokke(varsel.trigger)}
        </ThemedText>
        </ThemedView>
        ))}
    </View>
    )}
    {currentWaterReminder.length === 0 && (
    <View style={styles.zeroNotifs}>
        <IconSymbol name="bell.slash" size={48} color="#888" />
        <ThemedText style={styles.noWaterText}>No water reminders today!</ThemedText>
        <ThemedText style={styles.timer}>Start water reminders in the welcome site!</ThemedText>
    </View>
    )}
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

section: {
  paddingHorizontal: 15,
},
sectionTitle: {
  marginVertical: 15,
},
notifsCard: {
  padding: 15,
  margin: 5,
  borderRadius: 12,
},
notifsRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginBottom: 5,
},
timer: {
  color: "#888",
  fontSize: 12,
},
centerTitle: {
  textAlign: 'center',
  flex: 1,
},

zeroNotifs: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 60,
  paddingHorizontal: 15,
},
noWaterText: {
  marginTop: 16,
  fontSize: 16,
  textAlign: 'center',
},
});