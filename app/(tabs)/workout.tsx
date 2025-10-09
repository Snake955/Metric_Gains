import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function WorkoutMain() {
  return (
    <View style={styles.body}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WORKOUT</Text>
      </View>

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
  mainTitle: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
});
