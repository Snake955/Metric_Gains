import React, { useState } from 'react';
import { Button, Modal, StyleSheet, Text, View } from 'react-native';

export default function WorkoutMain() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  return (
    <View style={styles.body}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WORKOUT</Text>
      </View>

      <View style={styles.main1}>
        <Button title="Start workout" color="black" onPress={() => setIsModalVisible(true)}/>
      </View>

      <Modal visible={isModalVisible}>
        <View style={styles.main1}>
          <Button title="Close" color="black" onPress={() => setIsModalVisible(false)}></Button>
        </View>
      </Modal>

      <View style={styles.main}>
        <Text style={styles.mainTitle}>Start a workout!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
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
});
