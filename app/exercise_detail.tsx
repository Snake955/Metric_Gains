import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

type Exercise = {
  id: string;
  name: string;
  muscle_group?: string;
  gifUrl?: string;
  instructions?: string;
  equipment?: string;
  difficulty?: string;
};

export default function ModalScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const hasExerciseParams = params.id && params.name;

  if (hasExerciseParams) {
    return <ExerciseDetailModal />;
  }

  return null;
}

function ExerciseDetailModal() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const exercise: Exercise = {
    id: params.id as string,
    name: params.name as string,
    muscle_group: params.muscle_group as string,
    gifUrl: params.gifUrl as string,
    instructions: params.instructions as string,
    equipment: params.equipment as string,
    difficulty: params.difficulty as string,
  };

  return (
    <ThemedView style={styles.exerciseContainer}>
      <Stack.Screen
        options={{
          title: exercise.name,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="close" size={24} color="#2f6cf9" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.exerciseName}>{exercise.name}</ThemedText>
          <ThemedText type="default" style={styles.muscleGroup}>
            {exercise.muscle_group || "Full Body"}
          </ThemedText>
        </View>

        <View style={styles.gifContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Exercise Demonstration
          </ThemedText>

          {exercise.gifUrl ? (
            <View style={styles.gifWrapper}>
              <Image
                source={{ uri: exercise.gifUrl }}
                style={styles.gifImage}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={styles.placeholderGif}>
              <Ionicons name="fitness-outline" size={48} color="#666" />
              <ThemedText type="default" style={styles.placeholderText}>
                No GIF Available
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.infoSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Exercise Information
          </ThemedText>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="barbell-outline" size={20} color="#2f6cf9" />
              <ThemedText type="default" style={styles.infoLabel}>
                Primary Muscle Group:
              </ThemedText>
            </View>
            <ThemedText type="default" style={styles.infoValue}>
              {exercise.muscle_group || "N/A"}
            </ThemedText>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="hardware-chip-outline" size={20} color="#2f6cf9" />
              <ThemedText type="default" style={styles.infoLabel}>
                Equipment:
              </ThemedText>
            </View>
            <ThemedText type="default" style={styles.infoValue}>
              {exercise.equipment || "Bodyweight / Weights"}
            </ThemedText>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="speedometer-outline" size={20} color="#2f6cf9" />
              <ThemedText type="default" style={styles.infoLabel}>
                Difficulty:
              </ThemedText>
            </View>
            <ThemedText type="default" style={[
              styles.infoValue,
              exercise.difficulty === "Easy" && { color: "#22c55e" },
              exercise.difficulty === "Intermediate" && { color: "#eab308" },
              exercise.difficulty === "Hard" && { color: "#ef4444" },
            ]}>
              {exercise.difficulty || "Intermediate"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.instructionsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <Ionicons name="list-outline" size={20} color="#2f6cf9" />
            Instructions
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  exerciseContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  backButton: {
    marginLeft: 10,
    padding: 4,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  exerciseName: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  muscleGroup: {
    color: "#2f6cf9",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  gifContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  gifWrapper: {
    backgroundColor: "#f8f9fa",
    height: 280,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e9ecef",
    overflow: "hidden",
  },
  gifImage: {
    width: "100%",
    height: "100%",
  },
  placeholderGif: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  infoSection: {
    marginBottom: 24,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  instructionsSection: {
    marginBottom: 24,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
});