import SpotifyLogo from "@/assets/images/spotify-blue.png";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import React from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";


export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.greyDate}>{new Date().toLocaleDateString("en-US",
        {
        weekday: "long",
        day: "numeric",
        month: "long",})}
        </ThemedText>
        <IconSymbol name="bell.fill" size={24} color="#3f3f3fff" />
      </View>
      {/* This part will be changed later so that instead of Erik it will take the assigned user's name */}
      <ThemedText type="default">Good Morning, Erik!</ThemedText>

      <ThemedText style={styles.topbar_index}>
        You are on a <ThemedText type="title" style={styles.blue}>2x week</ThemedText> streak!
      </ThemedText>

      {/* Activity */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Today’s activity
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
      </View>

      {/* Last Workout */}
      <ThemedView style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <ThemedText type="defaultSemiBold">Last workout</ThemedText>
          <ThemedText type="default">Friday, 12 Sept - 18:30</ThemedText>
        </View>
        <ThemedText>Category: Strength</ThemedText>
        <ThemedText>Duration: 1h 32min</ThemedText>
        <ThemedText>Calories burned: 420 kcal</ThemedText>
        <ThemedText>Exercises: 8</ThemedText>
        <ThemedText>Focus: Upper body</ThemedText>
      </ThemedView>

      {/* Music API */}
      <ThemedView style={styles.musicControls}>
        <TouchableOpacity>
          <IconSymbol name="shuffle" size={26} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity>
          <IconSymbol name="chevron.left" size={26} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity>
          <IconSymbol name="play.circle.fill" size={42} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity>
          <IconSymbol name="chevron.right" size={26} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity>
          <IconSymbol name="repeat" size={26} color="#888" />
        </TouchableOpacity>
      </ThemedView>
      <View style={styles.spotifyRow}>
        <ThemedText style={styles.spotifyText}>Spotify®</ThemedText>
        <Image source={SpotifyLogo} style={styles.spotifyIcon} resizeMode="contain" />
        </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  greyDate: {
    color: "#888",
    fontSize:10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
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
    justifyContent: "space-between",
  },
  activityCard: {
    flex: 1,
    padding: 15,
    margin: 5,
    borderRadius: 12,
    alignItems: "center",
  },
  workoutCard: {
    padding: 15,
    marginVertical: 20,
    borderRadius: 12,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  musicControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 15,
    borderRadius: 12,

  },
 spotifyRow: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 20,
},

spotifyText: {
  textAlign: "center",
  fontSize: 12,
  marginRight: 5,
},

spotifyIcon: {
  width: 16,
  height: 16,
},
});
