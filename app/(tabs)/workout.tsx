import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const PADDING1 = 16;
const COLOR_BACK = "#e5e5e5";

const DEFAULT_WORKOUT = [
  {
    id: "push1",
    name: "Push Day",
    exercises: [
      { name: "Bench Press", sets: 5, reps: 5, weight: "—" },
      { name: "Shoulder Press", sets: 3, reps: 10, weight: "—" },
      { name: "Tricep Pushdown", sets: 3, reps: 12, weight: "—" },
    ],
  },
  {
    id: "legs1",
    name: "Leg Day",
    exercises: [
      { name: "Back Squat", sets: 5, reps: 5, weight: "—" },
      { name: "Leg Press", sets: 4, reps: 12, weight: "—" },
      { name: "Calf Raise", sets: 4, reps: 15, weight: "—" },
    ],
  },
  {
    id: "new",
    name: "Start ny workout...",
    exercises: [],
  },
];

type PredefExercise = {
  id: number;
  name: string;
  sets: number;
  reps: number | string;
  weight: string;
};

const workouts: PredefExercise[] = [
  { id: 1, name: "Bench Press", sets: 4, reps: 10, weight: "60kg" },
  { id: 2, name: "Squats", sets: 3, reps: 12, weight: "80kg" },
  { id: 3, name: "Deadlift", sets: 4, reps: 8, weight: "100kg" },
  { id: 4, name: "Pull Ups", sets: 3, reps: 10, weight: "Body" },
  { id: 5, name: "Plank", sets: 3, reps: "1min", weight: "-" },
];

type Exercise = { name: string; sets: number; reps: number | string; weight: string };

export default function WorkoutMain() {
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [timeCount, setTimeCount] = useState(0);
  const [oldWorkoutDuration, setoldWorkoutDuration] = useState(0);
  const [startTimer, setStartTimer] = useState<Date | null>(null);
  const [oldWorkoutStart, setoldWorkoutStart] = useState<Date | null>(null);
  const [oldWorkoutName, setoldWorkoutName] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [savedExercises, setSavedExercises] = useState<
    { id: string; name: string; exercises: Exercise[] }[]
  >([]);
  const allWorkouts = [...DEFAULT_WORKOUT, ...savedExercises];

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(
    DEFAULT_WORKOUT[0]?.id ?? "new"
  );
  const [ongoingWorkout, setOngoingWorkout] = useState<
    { id: string; name: string; exercises: Exercise[] } | null
  >(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<PredefExercise[]>([]);

  function handleStartWorkout() {
    setIsWorkoutActive(true);
    setTimeCount(0);
    setStartTimer(new Date());

    const chosen = allWorkouts.find((w) => w.id === selectedWorkoutId);

    if (chosen) {
      const workoutToUse =
        chosen.id === "new"
          ? { id: "new", name: "Ny workout", exercises: [] as Exercise[] }
          : chosen;

      setOngoingWorkout({
        ...workoutToUse,
        exercises: workoutToUse.exercises.map((ex) => ({
          ...ex,
          weight: ex.weight ?? "—",
        })),
      });
    } else {
      setOngoingWorkout({
        id: "custom",
        name: "Ukjent økt",
        exercises: [],
      });
    }
  }

  function handleStopWorkout() {
    if (!isWorkoutActive) return;

    setoldWorkoutDuration(timeCount);
    setoldWorkoutStart(startTimer);
    setoldWorkoutName(ongoingWorkout ? ongoingWorkout.name : null);

    setIsWorkoutActive(false);
    setOngoingWorkout(null);

    const sessionForDB = {
      workoutName: ongoingWorkout ? ongoingWorkout.name : null,
      startedAt: startTimer ? startTimer.toISOString() : null,
      durationSeconds: timeCount,
      durationPretty: formatTime(timeCount),
    };

    console.log("Workout finished:", sessionForDB);
  }

  useEffect(() => {
    if (isWorkoutActive) {
      timerRef.current = setInterval(() => setTimeCount((p) => p + 1), 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isWorkoutActive]);

  function formatTime(secondsTotal: number): string {
    const mins = Math.floor(secondsTotal / 60);
    const secs = secondsTotal % 60;
    const mm = mins < 10 ? "0" + mins : "" + mins;
    const ss = secs < 10 ? "0" + secs : "" + secs;
    return mm + ":" + ss;
  }

  function formatStartTime(dateObj: Date | null): string {
    if (!dateObj) return "";
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours();
    const mins = dateObj.getMinutes();
    const dd = day < 10 ? "0" + day : "" + day;
    const mm = month < 10 ? "0" + month : "" + month;
    const hh = hours < 10 ? "0" + hours : "" + hours;
    const minStr = mins < 10 ? "0" + mins : "" + mins;
    return `${dd}.${mm}.${year} kl ${hh}:${minStr}`;
  }

  const handleSaveWorkout = () => {
    if (selectedExercises.length === 0) return;
    const newWorkout = {
      id: "user_" + Date.now(),
      name: `Custom Workout ${savedExercises.length + 1}`,
      exercises: selectedExercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
      })),
    };
    setSavedExercises((prev) => [...prev, newWorkout]);
    setSelectedExercises([]);
    setIsModalVisible(false);
    setSelectedWorkoutId(newWorkout.id);
  };

  return (
    <SafeAreaView style={styles.body}>
      <View style={styles.headerDate}>
        <Text style={styles.greyDate}>
          {new Date().toLocaleDateString("no-NO", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isWorkoutActive ? "Workout i gang" : "WORKOUT"}</Text>
        {!isWorkoutActive && (
          <TouchableOpacity style={styles.addWorkout} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.addWorkoutText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.friendCard}>
          <View>
            <Text style={styles.cardTitle}>
              {isWorkoutActive && ongoingWorkout ? ongoingWorkout.name : "Dagens økt"}
            </Text>
            <Text style={styles.cardText}>
              {isWorkoutActive && ongoingWorkout ? "Aktiv plan" : "Push day · Bryst / skuldre / triceps"}
            </Text>
          </View>
        </View>

        <View style={styles.main}>
          <Text style={styles.listMain}>
            {isWorkoutActive ? "Du er i en aktiv workout 💪" : "Velkommen tilbake 👋"}
          </Text>
        </View>

        {isWorkoutActive && (
          <View style={styles.timerBox}>
            <Text style={styles.timerLabel}>Tid</Text>
            <Text style={styles.timerValue}>{formatTime(timeCount)}</Text>
            {startTimer && <Text style={styles.timerSubText}>Startet: {formatStartTime(startTimer)}</Text>}
          </View>
        )}

        {isWorkoutActive && ongoingWorkout && (
          <View style={styles.exerciseList}>
            <Text style={styles.exerciseHeader}>{ongoingWorkout.name}</Text>

            {ongoingWorkout.exercises.length === 0 ? (
              <Text style={styles.exerciseEmpty}>Ingen øvelser valgt.</Text>
            ) : (
              ongoingWorkout.exercises.map((ex, i) => (
                <View key={i} style={styles.exerciseRow}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseDetail}>
                    {ex.sets} x {ex.reps} {ex.weight ? `(${ex.weight})` : ""}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {!isWorkoutActive ? (
          <>
            <TouchableOpacity style={styles.startWorkout} onPress={() => setIsModalVisible(true)}>
              <Text style={styles.mainTitle}>+ Create Workout</Text>
            </TouchableOpacity>

            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Velg workout:</Text>
              <Picker
                selectedValue={selectedWorkoutId}
                onValueChange={(value: string) => setSelectedWorkoutId(value)}
                style={styles.picker}
              >
                {allWorkouts.map((w) => (
                  <Picker.Item key={w.id} label={w.name} value={w.id} />
                ))}
              </Picker>
            </View>

            <Pressable onPress={handleStartWorkout} style={styles.buttonStart}>
              <Text style={styles.buttonText}>Start workout</Text>
            </Pressable>
          </>
        ) : (
          <Pressable onPress={handleStopWorkout} style={styles.buttonStop}>
            <Text style={styles.buttonText}>Stopp workout</Text>
          </Pressable>
        )}

        {!isWorkoutActive && oldWorkoutDuration > 0 && (
          <View style={styles.prevWorkoutBox}>
            <Text style={styles.prevWorkoutTitle}>Forrige økt</Text>
            {oldWorkoutName && <Text style={styles.prevWorkoutLine}>Økt: {oldWorkoutName}</Text>}
            <Text style={styles.prevWorkoutLine}>Varighet: {formatTime(oldWorkoutDuration)}</Text>
            {oldWorkoutStart && (
              <Text style={styles.prevWorkoutLine}>Startet: {formatStartTime(oldWorkoutStart)}</Text>
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        animationType="slide"
      >
        <SafeAreaView style={styles.modalBody}>
          <View style={styles.modalMain}>
            <Button title="Close" color="#2f6cf9" onPress={() => setIsModalVisible(false)} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Workout Exercises:</Text>
            <Text style={styles.modalDescription}>Choose an exercise:</Text>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {workouts.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.modalExercise,
                  selectedExercises.some((ex) => ex.id === item.id) && styles.modalExerciseActive,
                ]}
                onPress={() => {
                  setSelectedExercises((prev) =>
                    prev.some((ex) => ex.id === item.id)
                      ? prev.filter((ex) => ex.id !== item.id)
                      : [...prev, item]
                  );
                }}
              >
                <Text style={styles.modalExerciseText}>{item.name}</Text>
                <Text style={styles.modalExerciseText}>
                  {item.sets}x{item.reps} ({item.weight})
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.saveWorkoutButton} onPress={handleSaveWorkout}>
              <Text style={styles.saveWorkoutText}>Save Workout</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { 
    flex: 1, 
    backgroundColor: COLOR_BACK
   },
  scrollContainer: { 
    flex: 1 
  },

  headerDate: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 5 
  },
  greyDate: { 
    color: "#888", 
    fontSize: 10 
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: PADDING1,
  },
  headerTitle: { 
    color: "#111", 
    fontSize: 28, 
    fontWeight: "700", 
    textAlign: "center" 
  },

  addWorkout: { 
    position: "absolute", 
    right: 10, 
    bottom: "15%" 
  },
  addWorkoutText: { 
    color: "#2f6cf9", 
    fontSize: 40, 
    textAlign: "center" 
  },

  friendCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: PADDING1,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    marginBottom: 16,
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#111", 
    marginBottom: 4 
  },
  cardText: { 
    fontSize: 14, 
    color: "#555" 
  },

  main: { 
    justifyContent: "center", 
    alignItems: "center", 
    paddingBottom: 12 
  },
  listMain: { 
    color: "#444", 
    fontSize: 14, 
    marginBottom: 6 
  },

  timerBox: {
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: "#fafafa",
  },
  timerLabel: { 
    fontSize: 14, 
    color: "#444", 
    marginBottom: 4 
  },
  timerValue: { 
    fontSize: 32, 
    fontWeight: "700", 
    color: "#111" 
  },
  timerSubText: { 
    marginTop: 4, 
    fontSize: 12, 
    color: "#555" 
  },

  exerciseList: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  exerciseHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  exerciseEmpty: { 
    fontSize: 14, 
    color: "#777", 
    padding: 12 
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  exerciseName: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: "#111" 
  },
  exerciseDetail: { 
    fontSize: 14, 
    color: "#444" 
  },

  pickerWrapper: {
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  pickerLabel: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: "#111", 
    padding: 12 
  },
  picker: { 
    width: "100%" 
  },

  buttonStart: {
    backgroundColor: "#2f6cf9",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonStop: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 16 
  },

  prevWorkoutBox: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    padding: 12,
  },
  prevWorkoutTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#111" 
  },
  prevWorkoutLine: { 
    fontSize: 14, 
    color: "#444" 
  },

  modalBody: { 
    flex: 1, 
    backgroundColor: "#111" 
  },
  modalMain: { 
    padding: 16 
  },
  modalHeader: { 
    paddingHorizontal: 16, 
    marginBottom: 12, 
    alignItems: "flex-start" 
  },
  modalTitle: { 
    color: "#fff", 
    fontSize: 20, 
    fontWeight: "700", 
    marginBottom: 6 
  },
  modalDescription: { 
    fontSize: 14, 
    color: "#bbb", 
    textAlign: "left" 
  },

  modalContent: { 
    padding: 16 
  },

  modalExercise: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "#222",
    borderRadius: 8,
    marginBottom: 6,
  },
  modalExerciseActive: { 
    backgroundColor: "#2f6cf9" 
  },
  modalExerciseText: { 
    color: "#fff", 
    fontSize: 14 
  },

  saveWorkoutButton: {
    marginTop: 20,
    backgroundColor: "#2f6cf9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveWorkoutText: { 
    color: "#fff",
     fontWeight: "700", 
     fontSize: 16 
    },

  startWorkout: { 
    justifyContent: "center", 
    alignSelf: "center", 
    marginTop: 12 
  },
  mainTitle: {
    backgroundColor: "#2770ddff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "center",
    color: "#fff",
    fontWeight: "700",
  },
});