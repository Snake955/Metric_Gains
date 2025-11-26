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

  return (
    <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
            <ThemedText type="title">Notifications</ThemedText>
        </View>

        <ScrollView style={styles.container}>
            <ThemedText>Notifications: {notifications.length}</ThemedText>
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