import React, { useState } from 'react';
import { Button, Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WorkoutMain() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WORKOUT</Text>
      </View>

      <View style={styles.main1}>
        <Button title="Start workout" color="black" onPress={() => setIsModalVisible(true)}/>
      </View>

      <Modal visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalBody}>
        <View style={styles.modalMain}>
          <Button title="Close" color="black" onPress={() => setIsModalVisible(false)}></Button>
        </View>
        </SafeAreaView>
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
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: PADDING1,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  headerTitle: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main1: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingLeft: 15,
    paddingTop: 50,
  },
  mainTitle: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  modalBody: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: PADDING1,
  },
  modalMain: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 12,
  },
});
