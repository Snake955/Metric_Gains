import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from 'react-native';
import * as Progress from "react-native-progress";

export default function StatsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Overall Stats",
          headerBackTitle: "Profile",
          headerTitleAlign: "center",
        }}
      />
    <ScrollView style={styles.container}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
                Statistics
        </ThemedText>
        <View style={styles.activityRow}>
        <ThemedView style={styles.activityCard}>
            <Progress.Circle
            size={100}
            progress={6742 / 10000}
            thickness={8}
            color="#2D7FF9"
            showsText={false}
            />
            <ThemedText type="defaultSemiBold">6742 steps</ThemedText>
            <ThemedText type="default">10,000 goal</ThemedText>
        </ThemedView>

        <ThemedView style={styles.activityCard}>
            <Progress.Circle
            size={100}
            progress={240 / 500}
            thickness={8}
            color="#2D7FF9"
            showsText={false}
            />
            <ThemedText type="defaultSemiBold">240 kcal</ThemedText>
            <ThemedText type="default">500 goal</ThemedText>
        </ThemedView>

        <ThemedView style={styles.activityCard}>
            <ThemedText type="defaultSemiBold">Workouts</ThemedText>
            <ThemedText type="default">12/15</ThemedText>
        </ThemedView>

        <ThemedView style={styles.activityCard}>
            <ThemedText type="defaultSemiBold">Sleep</ThemedText>
            <ThemedText type="default">6.80 hours</ThemedText>
        </ThemedView>
        
        </View>

        <View style={styles.progressRow}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Progress
          </ThemedText>
          <ThemedView style={styles.progressCard}>
            <ThemedText type="defaultSemiBold">Graf</ThemedText>
        </ThemedView>
        </View>
        
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  topbar_index: {
    fontSize:22,
    paddingTop:10,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",

  },
  blue: {
    color: "#2D7FF9",
    fontWeight: "600",
    fontSize: 22,
  },
  sectionTitle: {
    marginVertical: 15,
  },
  activityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  activityCard: {
    width: "48%",
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    // skygge effekt
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  progressRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  progressCard: {
    width: "100%",
    height: 180,
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    // skygge effekt
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
