import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

type Workout = {
  type: string;
  time: string;
  focus: string;
  exercises: number;
  user?: string;
};

const workouts: Record<string, Workout[]> = {
  '2025-09-15': [
    { type: 'Strength', time: '10:00 - 14:00', focus: 'Upper body', exercises: 8, user: 'You' },
  ],
  '2025-09-16': [
    { type: 'Cardio', time: '08:00 - 10:00', focus: 'Cardio', exercises: 1, user: 'Phillip' },
  ],
};

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const [selected, setSelected] = useState<string>(today);

  // typed markedDates object for react-native-calendars
  const markedDates: Record<string, { selected?: boolean; marked?: boolean; selectedColor?: string }> = {
    [selected]: {
      selected: true,
      marked: (workouts[selected]?.length ?? 0) > 0,
      selectedColor: tint,
    },
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity onPress={() => {/* TODO: open add-workout modal */}}>
          <Ionicons name="add" size={28} color={tint} />
        </TouchableOpacity>
      </View>

      {/* Calendar control */}
      <Calendar
        onDayPress={(day: DateData) => setSelected(day.dateString)}
        markedDates={markedDates}
        // keep default styling simple — you can customize theme prop if desired
      />

      {/* My workout */}
      <Text style={styles.sectionTitle}>My workout</Text>
      {workouts[selected] && workouts[selected].length > 0 ? (
        workouts[selected].map((w, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{w.type}</Text>
            <Text style={styles.cardTime}>{w.time}</Text>
            <Text style={styles.cardText}>Focus: {w.focus}</Text>
            <Text style={styles.cardText}>Exercises: {w.exercises}</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: tint }]}>
              <Text style={styles.btnText}>Change</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No workouts this day.</Text>
        </View>
      )}

      {/* Friend workouts (example) */}
      <Text style={styles.sectionTitle}>Friend workouts</Text>
      <View style={styles.friendCard}>
        <View>
          <Text style={styles.cardTitle}>Strength</Text>
          <Text style={styles.cardTime}>12:00 - 14:00</Text>
          <Text style={styles.cardText}>Focus: Arms</Text>
        </View>
        <TouchableOpacity style={[styles.joinBtn, { borderColor: tint }]}>
          <Text style={[styles.joinText, { color: tint }]}>Join</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e6e6e6' },
  cardTitle: { color: '#2f6cf9', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  cardTime: { color: '#666', marginBottom: 6 },
  cardText: { color: '#333', marginBottom: 4 },
  btn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  emptyCard: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 10 },
  emptyText: { color: '#666' },
  friendCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e6e6e6', marginBottom: 10 },
  joinBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  joinText: { fontWeight: '600' },
});
