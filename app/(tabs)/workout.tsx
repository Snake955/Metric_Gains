import React, { useState } from 'react';
import { Button, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkoutMain() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WORKOUT</Text>
      </View>

      <View style={styles.main1}>
        <Button title="Start workout" color="#2D7FF9" onPress={() => setIsModalVisible(true)}/>
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

          {[
            { name: 'Bench Press', sets: 4, reps: 10, weight: '60kg' },
            { name: 'Squats', sets: 3, reps: 12, weight: '80kg' },
            { name: 'Deadlift', sets: 4, reps: 8, weight: '100kg' },
            { name: 'Pull Ups', sets: 3, reps: 10, weight: 'Body' },
            { name: 'Plank', sets: 3, reps: '1min', weight: '-' },
          ].map((item, index) => (

            <View key={index} style={styles.tableRow}>
              <TouchableOpacity style={[styles.tableButton, { flex: 1 }]} onPress={() => {}}>
                <Text style={styles.tableButtonText}>{item.name}</Text>
              </TouchableOpacity>
              <Text style={styles.tableItem}>{item.sets}</Text>
              <Text style={styles.tableItem}>{item.reps}</Text>
              <Text style={styles.tableItem}>{item.weight}</Text>
            </View>

          ))}
        
        </SafeAreaView>

        </ScrollView>

      </Modal>

      <View style={styles.main}>
        <Text style={styles.mainTitle}>Start a workout!</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main1: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingLeft: 15,
    paddingTop: 50,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
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
});
