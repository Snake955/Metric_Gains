import React, { useState } from 'react';
import { ThemedText } from "@/components/themed-text";
import { Button, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkoutMain() {


  const [isModalVisible, setIsModalVisible] = useState(false);

  const [workouts] = useState([
    { id: 1, name: 'Bench Press', sets: 4, reps: 10, weight: '60kg' },
    { id: 2, name: 'Squats', sets: 3, reps: 12, weight: '80kg' },
    { id: 3, name: 'Deadlift', sets: 4, reps: 8, weight: '100kg' },
    { id: 4, name: 'Pull Ups', sets: 3, reps: 10, weight: 'Body' },
    { id: 5, name: 'Plank', sets: 3, reps: '1min', weight: '-' },
  ]);

  const editHandle = (id: number) => {
  const choiceWorkout = workouts.find(wo => wo.id === id);
  console.log('Edit:', choiceWorkout);
  };

  return (
    <SafeAreaView style={styles.body}>

      {/* Header */}
            <View style={styles.headerDate}>
              <ThemedText style={styles.greyDate}>{new Date().toLocaleDateString("no-NO",
              {
              weekday: "long",
              day: "numeric",
              month: "long",})}
              </ThemedText>
            </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>WORKOUT</Text>
        <TouchableOpacity style={styles.addWorkout} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.addWorkoutText}>+</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)} animationType="slide" presentationStyle="formSheet">

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        <SafeAreaView style={styles.modalBody}>

          <View style={styles.modalMain}>
            <Button title="Close" color="#2D7FF9" onPress={() => setIsModalVisible(false)}></Button>
          </View>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Workout Exercises:</Text>
              <Text style={styles.modalDescription}>
                  Choose an exercise:
              </Text>
          </View>

          <View style={styles.tableTitles}>
            <Text style={[styles.tableItem, styles.headerItem, { flex: 1 }]}>Name</Text>
            <Text style={[styles.tableItem, styles.headerItem]}>Sets</Text>
            <Text style={[styles.tableItem, styles.headerItem]}>Reps/Time</Text>
            <Text style={[styles.tableItem, styles.headerItem]}>Weight</Text>
          </View>

          {workouts.map((item, index) => (

            <View key={index} style={styles.tableRow}>
              <TouchableOpacity style={[styles.tableButton, { flex: 1 }]} onPress={() => {}}>
                <Text style={styles.tableButtonText}>{item.name}</Text>
              </TouchableOpacity>
              <Text style={styles.tableItem}>{item.sets}</Text>
              <Text style={styles.tableItem}>{item.reps}</Text>
              <Text style={styles.tableItem}>{item.weight}</Text>

              <TouchableOpacity onPress={() => editHandle(item.id)} style={styles.editButton}>
                <Text style={styles.editContent}>Edit</Text>
              </TouchableOpacity>
            </View>

          ))}
        
        </SafeAreaView>

        </ScrollView>

      </Modal>

      <View style={styles.friendCard}>
        <View>
          <Text style={styles.cardTitle}>Strength</Text>
          <Text style={styles.cardTime}>Duration: 1h</Text>
          <Text style={styles.cardText}>Focus: Arms</Text>
          <Text style={styles.cardText}>Exercises: 3</Text>
        </View>
      </View>
      
      <View style={styles.main}>
        <TouchableOpacity style={styles.startWorkout}>
            <Text style={styles.mainTitle}>Start the Workout!</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const PADDING1 = 16;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
    paddingHorizontal: PADDING1,
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    bottom: '30%',
  },
  addWorkout: {
    position: 'absolute',
    right: 5,
    bottom: '10%',
  },
  addWorkoutText: {
    color: '#2770ddff',
    fontSize: 40,
    textAlign: 'center',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  main1: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingLeft: 15,
    paddingTop: 50,
  },
  mainTitle: {
    backgroundColor: '#2770ddff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'center',
  },
  modalBody: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: PADDING1,
  },
  modalMain: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 12,
  },
  list: {
    marginBottom: 24,
  },
  listMain: {
    color: '#ccccccfd',
    fontSize: 16,
    marginBottom: 6,
  },
  modalHeader: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  modalDescription: {
    fontSize: 14,
    color: '#bbbbbbff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  scrollContainer: {
    flexGrow: 0,
    marginBottom: 10,
    backgroundColor: '#000',
  },

  tableTitles: {
    flexDirection: 'row',
    paddingVertical: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#464343ff',
  },
  tableItem: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  headerItem: {
    fontWeight: '700',
    color: '#2770ddff',
  },
  tableButton: {
    backgroundColor: '#2e2c2cff',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  editButton: {
  backgroundColor: '#2770ddff',
  paddingVertical: 4,
  paddingHorizontal: 8,
  marginLeft: 6,
  justifyContent: 'center',
  alignItems: 'center',
  },
  editContent: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },

  startWorkout: {
    justifyContent: 'center',
    alignSelf: 'center',
  },

  friendCard: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    backgroundColor: '#ffffffff', 
    borderRadius: 18, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: "#e6e6e6ff", 
  },

  cardTitle: { 
    color: "#2f6cf9", 
    fontWeight: "700", 
    fontSize: 26, 
    marginBottom: 5,
  },

  cardTime: { 
    color: "#666666ff", 
    marginBottom: 1,
  },

  cardText: { 
    color: "#666666ff", 
    marginBottom: 1,
  },
  greyDate: {
    color: "#888",
    fontSize:10,
  },
  headerDate: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
});
