import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { Picker } from "@react-native-picker/picker";
import { useRouter } from 'expo-router';
import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Info } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

type Exercise = {
  id: string;
  name: string;
  muscle_group?: string;
  sets?: number | string;
  reps?: number | string;
  weight?: string;
  complete?: boolean;
  gifUrl?: string;
  instructions?: string;
  equipment?: string;
  difficulty?: string;
};

type Workout = {
  id: string;
  name: string;
  exercises: Exercise[];
  userId?: string;
  createdAt?: string;
};

type WorkoutSession = {
  workoutName: string | null;
  startedAt: string | null;
  endedAt: string;
  durationSeconds: number;
  duration: string;
  userId: string;
  exercises: any[];
  totalExercises: number;
  completedSets: number;
  totalSets: number;
};

const DEFAULT_WORKOUT = [
  {
    id: "jog",
    name: "Joggetur",
    exercises: [],
  },
  {
    id: "new",
    name: "Start ny workout...",
    exercises: [],
  },
];

export default function WorkoutMain() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [timeCount, setTimeCount] = useState(0);
  const [lastWorkoutDuration, setLastWorkoutDuration] = useState(0);
  const [startTimer, setStartTimer] = useState<Date | null>(null);
  const [lastWorkoutStart, setLastWorkoutStart] = useState<Date | null>(null);
  const [lastWorkoutName, setLastWorkoutName] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([]);
  const allWorkouts = [...DEFAULT_WORKOUT, ...userWorkouts];

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(
    allWorkouts.length > 0 ? String(allWorkouts[0].id) : ""
  );
  const [ongoingWorkout, setOngoingWorkout] = useState<Workout | null>(null);
  const [activeExerciseSets, setActiveExerciseSets] = useState<{ [key: string]: { sets: number, reps: string, weight: string, completed: boolean }[] }>({});

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [exerciseSets, setExerciseSets] = useState<{ [key: string]: { sets: string, reps: string, weight: string } }>({});
  const [customWorkoutName, setCustomWorkoutName] = useState('');
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
      if (user) {
        loadUserWorkouts(user.uid);
      } else {
        setUserWorkouts([]);
      }
    });

    return unsubscribe;
  }, []);

  const loadUserWorkouts = async (userId: string) => {
    try {
      const workoutsQuery = query(
        collection(FIRESTORE_DB, 'user_workouts'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(workoutsQuery);
      const workouts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Workout[];

      setUserWorkouts(workouts);
    } catch (error) {
      console.error("Error loading user workouts:", error);
    }
  };

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'exercises'));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.id,
          muscle_group: doc.data().muscle_group,
          weight: doc.data().weight || "-",
          gifUrl: doc.data().gifUrl || "",
          instructions: doc.data().instructions || "",
          equipment: doc.data().equipment || "Bodyweight / Weights",
          difficulty: doc.data().difficulty || "Intermediate",
        }));
        setExercises(data);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const handleInfoPress = (exercise: Exercise) => {
    const encodedGifUrl = exercise.gifUrl ? encodeURI(exercise.gifUrl) : '';

    router.push({
      pathname: '/modal',
      params: {
        id: exercise.id,
        name: exercise.name,
        muscle_group: exercise.muscle_group || '',
        gifUrl: encodedGifUrl,
        instructions: exercise.instructions || '',
        equipment: exercise.equipment || '',
        difficulty: exercise.difficulty || '',
      },
    });
  };

  function handleStartPress() {
    if (!user) {
      alert("Please sign in to start a workout");
      return;
    }

    setIsWorkoutActive(true);
    setTimeCount(0);
    setStartTimer(new Date());

    const chosen = allWorkouts.find((w) => w.id === selectedWorkoutId);

    if (chosen) {
      let workoutToUse;

      if (chosen.id === "new") {
        const exercisesWithSetsReps = selectedExercises.map(exercise => ({
          ...exercise,
          sets: exerciseSets[exercise.id]?.sets || "",
          reps: exerciseSets[exercise.id]?.reps || "",
          weight: exerciseSets[exercise.id]?.weight || "",
        }));
        workoutToUse = { id: "new", name: "Ny workout", exercises: exercisesWithSetsReps };
      } else {
        workoutToUse = chosen;
      }

      const initialActiveSets: { [key: string]: { sets: number, reps: string, weight: string, completed: boolean, }[] } = {};
      workoutToUse.exercises.forEach(exercise => {
        const inputSets = Number(exercise.sets) || 0;
        const inputReps = exercise.reps?.toString() || "";
        const inputWeight = exercise.weight?.toString() || "";

        const initialSets = [];
        for (let i = 1; i <= inputSets; i++) {
          initialSets.push({
            sets: i,
            reps: inputReps,
            weight: inputWeight,
            completed: false
          });
        }
        initialActiveSets[exercise.id] = initialSets;
      });
      setActiveExerciseSets(initialActiveSets);

      setOngoingWorkout(workoutToUse);
    } else {
      const initialActiveSets: { [key: string]: { sets: number, reps: string, weight: string, completed: boolean, }[] } = {};
      selectedExercises.forEach(exercise => {
        const inputSets = Number(exerciseSets[exercise.id]?.sets) || 0;
        const inputReps = exerciseSets[exercise.id]?.reps || "";
        const inputWeight = exerciseSets[exercise.id]?.weight || "";

        const initialSets = [];
        for (let i = 1; i <= inputSets; i++) {
          initialSets.push({
            sets: i,
            reps: inputReps,
            weight: inputWeight,
            completed: false
          });
        }
        initialActiveSets[exercise.id] = initialSets;
      });
      setActiveExerciseSets(initialActiveSets);

      setOngoingWorkout({
        id: "custom",
        name: "Custom Workout",
        exercises: selectedExercises,
      });
    }
  }

  const handleStopPress = async () => {
    if (!isWorkoutActive || !user) return;

    const workoutDuration = timeCount;
    const workoutStartTime = startTimer;
    const workoutName = ongoingWorkout ? ongoingWorkout.name : null;

    setLastWorkoutDuration(workoutDuration);
    setLastWorkoutStart(workoutStartTime);
    setLastWorkoutName(workoutName);
    setIsWorkoutActive(false);
    setOngoingWorkout(null);
    setActiveExerciseSets({});

    const sessionForDB: WorkoutSession = {
      workoutName: workoutName,
      startedAt: workoutStartTime ? workoutStartTime.toISOString() : null,
      endedAt: new Date().toISOString(),
      durationSeconds: workoutDuration,
      duration: formatTime(workoutDuration),
      userId: user.uid,
      exercises: ongoingWorkout?.exercises.map(exercise => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.muscle_group,
        sets: activeExerciseSets[exercise.id] || []
      })) || [],
      totalExercises: ongoingWorkout?.exercises.length || 0,
      completedSets: Object.values(activeExerciseSets).flat().filter(set => set.completed).length,
      totalSets: Object.values(activeExerciseSets).flat().length
    };

    console.log("Workout finished:", sessionForDB);

    try {
      const docRef = await addDoc(collection(FIRESTORE_DB, 'workout_sessions'), sessionForDB);
      console.log("Workout session saved to Firestore with ID:", docRef.id);
    } catch (error) {
      console.error('Error saving workout session to Firestore:', error);
      alert('Workout completed but failed to save session data.');
    }
  };

  useEffect(() => {
    if (isWorkoutActive) {
      timerRef.current = setInterval(() => {
        setTimeCount((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
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

  const updateExerciseSetsReps = (exerciseId: string, sets: string, reps: string, weight: string) => {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: { sets, reps, weight }
    }));
  };

  const toggleExerciseSelection = (exercise: Exercise) => {
    setSelectedExercises((prev) => {
      if (prev.some((ex) => ex.id === exercise.id)) {
        const newExerciseSets = { ...exerciseSets };
        delete newExerciseSets[exercise.id];
        setExerciseSets(newExerciseSets);
        return prev.filter((ex) => ex.id !== exercise.id);
      } else {
        updateExerciseSetsReps(exercise.id, "", "", "");
        return [...prev, { ...exercise, sets: "", reps: "", weight: "" }];
      }
    });
  };

  const handleSaveWorkout = async () => {
    if (selectedExercises.length === 0 || !user) {
      alert("Please select exercises and make sure you are signed in");
      return;
    }

    const exercisesWithSetsReps = selectedExercises.map(exercise => {
      const sets = exerciseSets[exercise.id]?.sets || "0";
      const reps = exerciseSets[exercise.id]?.reps || "0";
      const weight = exerciseSets[exercise.id]?.weight || "0";

      return {
        id: String(exercise.id),
        name: String(exercise.name || ""),
        muscle_group: String(exercise.muscle_group || ""),
        sets: String(sets),
        reps: String(reps),
        weight: String(weight),
      };
    });

    const workoutName = customWorkoutName.trim() || `Custom Workout ${userWorkouts.length + 1}`;

    try {
      const workoutData = {
        name: String(workoutName),
        exercises: exercisesWithSetsReps,
        userId: String(user.uid),
        createdAt: new Date().toISOString(),
      };

      console.log("Final workout data to save:", workoutData);

      const docRef = await addDoc(collection(FIRESTORE_DB, 'user_workouts'), workoutData);

      const newWorkout = {
        id: docRef.id,
        name: workoutName,
        exercises: exercisesWithSetsReps,
      };

      setUserWorkouts((prev) => [...prev, newWorkout]);
      setSelectedExercises([]);
      setExerciseSets({});
      setCustomWorkoutName('');
      setIsModalVisible(false);
      setSelectedWorkoutId(newWorkout.id);

      console.log("Workout saved to Firestore with ID:", docRef.id);
    } catch (error) {
      console.error('Error saving workout to Firestore:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        const firebaseError = error as any;
        console.error('Firebase error code:', firebaseError.code);
        console.error('Firebase error details:', firebaseError.details);
        alert(`Failed to save workout: ${error.message}`);
      } else {
        alert('Failed to save workout. Please try again.');
      }
    }
  };

  const addNewSet = (exerciseId: string) => {
    setActiveExerciseSets(prev => {
      const currentSets = prev[exerciseId] || []
      const newSetNumber = currentSets.length + 1;

      return {
        ...prev,
        [exerciseId]: [
          ...currentSets,
          {
            sets: newSetNumber,
            reps: "",
            weight: "",
            completed: false
          }
        ]
      };
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading exercises...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isWorkoutActive ? "Workout i gang" : "Workout"}
          </Text>
        </View>

        <View style={styles.bodySection}>
          <Text style={styles.sectionTitle}>
            {isWorkoutActive ? "Du er i en aktiv workout 💪" : "Velkommen tilbake 👋"}
          </Text>

          <Text style={styles.sectionText}>
            {isWorkoutActive
              ? "Hold ut og fullfør økta!"
              : "Start en ny workout eller velg en lagret treningsøkt."}
          </Text>

          {!isWorkoutActive && (
            <>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setIsModalVisible(true)}
              >
                <Text style={styles.createButtonText}>+ Create Workout</Text>
              </TouchableOpacity>

              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Velg workout:</Text>
                <Picker
                  selectedValue={selectedWorkoutId}
                  onValueChange={(value) => setSelectedWorkoutId(value)}
                  style={styles.picker}
                >
                  {allWorkouts.map((w) => (
                    <Picker.Item key={w.id} label={w.name} value={w.id} />
                  ))}
                </Picker>
              </View>
            </>
          )}

          {isWorkoutActive && (
            <View style={styles.timerBox}>
              <Text style={styles.timerLabel}>Tid</Text>
              <Text style={styles.timerValue}>{formatTime(timeCount)}</Text>
              {startTimer && (
                <Text style={styles.timerSubText}>
                  Startet: {formatStartTime(startTimer)}
                </Text>
              )}
            </View>
          )}

          {isWorkoutActive && ongoingWorkout && (
            <View style={styles.exerciseList}>
              <Text style={styles.exerciseHeader}>{ongoingWorkout.name}</Text>
              {ongoingWorkout.exercises.length > 0 ? (
                ongoingWorkout.exercises.map((ex: Exercise, i: number) => {
                  const currentSets = activeExerciseSets[ex.id] || [];

                  return (
                    <View key={ex.id} style={styles.activeExerciseContainer}>
                      <View style={styles.exerciseRow}>
                        <View style={styles.exerciseInfo}>
                          <Text style={styles.exerciseName}>{ex.name}</Text>
                          <Text style={styles.exerciseDetail}>
                            {ex.muscle_group && ex.muscle_group}
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={styles.infoButton}
                          onPress={() => handleInfoPress(ex)}
                        >
                          <Info color="#111" size={20} />
                        </TouchableOpacity>

                      </View>
                      <View style={styles.setsRepsLabel}>
                        <View style={styles.setsHeader}>
                          <Text style={styles.setsRepsLabel}>Set</Text>
                          <Text style={styles.setsRepsLabel}>Reps</Text>
                          <Text style={styles.setsRepsLabel}>Weight</Text>
                          <Text style={styles.setsRepsLabel}>Done</Text>
                        </View>

                        {currentSets.map((set, index) => (
                          <View key={set.sets} style={styles.setRow}>
                            <Text style={styles.setNumber}>{set.sets}</Text>

                            <TextInput
                              style={styles.setInput}
                              value={set.reps}
                              placeholder="-"
                              placeholderTextColor="#666"
                              keyboardType="numeric"
                              onChangeText={(text) => {
                                const updatedSets = [...currentSets];
                                updatedSets[index] = { ...set, reps: text };
                                setActiveExerciseSets(prev => ({
                                  ...prev,
                                  [ex.id]: updatedSets
                                }));
                              }}
                            />

                            <TextInput
                              style={styles.setInput}
                              value={set.weight}
                              placeholder="-"
                              placeholderTextColor="#666"
                              keyboardType="numeric"
                              onChangeText={(text) => {
                                const updatedSets = [...currentSets];
                                updatedSets[index] = { ...set, weight: text };
                                setActiveExerciseSets(prev => ({
                                  ...prev,
                                  [ex.id]: updatedSets
                                }));
                              }}
                            />

                            <TouchableOpacity
                              style={[
                                styles.checkbox,
                                set.completed && styles.checkboxCompleted
                              ]}
                              onPress={() => {
                                const updatedSets = [...currentSets];
                                updatedSets[index] = {
                                  ...set,
                                  completed: !set.completed
                                };
                                setActiveExerciseSets(prev => ({
                                  ...prev,
                                  [ex.id]: updatedSets
                                }));
                              }}
                            >
                              {set.completed && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                          </View>
                        ))}

                        <TouchableOpacity
                          style={styles.addSetButton}
                          onPress={() => addNewSet(ex.id)}
                        >
                          <Text style={styles.addSetButtonText}>+ Add Set</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.exerciseEmpty}>
                  Ingen øvelser lagt til ennå
                </Text>
              )}
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isWorkoutActive && ongoingWorkout ? ongoingWorkout.name : "Dagens økt"}
            </Text>
            <Text style={styles.cardText}>
              {isWorkoutActive && ongoingWorkout
                ? "Aktiv plan"
                : "Velg en workout for å komme i gang"}
            </Text>
          </View>

          {!isWorkoutActive && (
            <Pressable style={styles.buttonStart} onPress={handleStartPress}>
              <Text style={styles.buttonText}>Start workout</Text>
            </Pressable>
          )}
          {isWorkoutActive && (
            <Pressable style={styles.buttonStop} onPress={handleStopPress}>
              <Text style={styles.buttonText}>Stopp workout</Text>
            </Pressable>
          )}

          {!isWorkoutActive && lastWorkoutDuration > 0 && (
            <View style={styles.prevWorkoutBox}>
              <Text style={styles.prevWorkoutTitle}>Forrige økt</Text>
              {lastWorkoutName && (
                <Text style={styles.prevWorkoutLine}>Økt: {lastWorkoutName}</Text>
              )}
              <Text style={styles.prevWorkoutLine}>
                Varighet: {formatTime(lastWorkoutDuration)}
              </Text>
              {lastWorkoutStart && (
                <Text style={styles.prevWorkoutLine}>
                  Startet: {formatStartTime(lastWorkoutStart)}
                </Text>
              )}
              <Text style={styles.prevWorkoutSaved}>
                ✅ Saved to your workout history
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        animationType="slide"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#111" }}>
          <View style={{ padding: 16 }}>
            <Button
              title="Close"
              color="#2f6cf9"
              onPress={() => setIsModalVisible(false)}
            />
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: "700",
                marginBottom: 12,
              }}
            >
              Choose Exercises
            </Text>

            {exercises.length > 0 ? (
              exercises.map((item: Exercise) => {
                const isSelected = selectedExercises.some((ex) => ex.id === item.id);
                const currentSets = exerciseSets[item.id]?.sets || "";
                const currentReps = exerciseSets[item.id]?.reps || "";
                const currentWeight = exerciseSets[item.id]?.weight || "";

                return (
                  <View key={item.id} style={[
                    styles.modalExerciseContainer,
                    isSelected && { backgroundColor: "#2f6cf9" },
                  ]}>
                    <TouchableOpacity
                      style={styles.modalExercise}
                      onPress={() => toggleExerciseSelection(item)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalExerciseText}>{item.name}</Text>
                        <Text style={styles.modalExerciseSubtext}>
                          {item.muscle_group || "Full body"}
                          {(currentSets || currentReps) && "-" + (currentSets || "0") + "x" + (currentReps || "0")}
                          {currentWeight && "-" + (currentWeight)}
                          {item.weight && "-" + (item.weight)}
                        </Text>
                      </View>

                      <View style={styles.exerciseActions}>
                        <TouchableOpacity
                          style={styles.infoButton}
                          onPress={() => handleInfoPress(item)}
                        >
                          <Info size={20} color="#fff" />
                        </TouchableOpacity>


                        <Text style={styles.modalExerciseText}>
                          {isSelected ? '' : ''}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {isSelected && (
                      <View style={styles.setsRepsContainer}>
                        <Text style={styles.setsRepsLabel}>Sets:</Text>
                        <TextInput
                          style={styles.setsRepsInput}
                          value={currentSets}
                          placeholder="0"
                          placeholderTextColor="#666"
                          keyboardType="numeric"
                          onChangeText={(text) => {
                            updateExerciseSetsReps(item.id, text, currentReps, currentWeight);
                          }}
                        />

                        <Text style={styles.setsRepsLabel}>Reps:</Text>
                        <TextInput
                          style={styles.setsRepsInput}
                          value={currentReps}
                          placeholder="0"
                          placeholderTextColor="#666"
                          keyboardType="numeric"
                          onChangeText={(text) => {
                            updateExerciseSetsReps(item.id, currentSets, text, currentWeight);
                          }}
                        />

                        <Text style={styles.setsRepsLabel}>Weight:</Text>
                        <TextInput
                          style={styles.setsRepsInput}
                          value={currentWeight}
                          placeholder="0"
                          placeholderTextColor="#666"
                          keyboardType="numeric"
                          onChangeText={(text) => {
                            updateExerciseSetsReps(item.id, currentSets, currentReps, text);
                          }}
                        />
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <Text style={{ color: "#fff", textAlign: "center", marginTop: 20 }}>
                No exercises found in Firestore
              </Text>
            )}

            <TextInput
              style={styles.workoutNameInput}
              placeholder="Workout name"
              placeholderTextColor="#999"
              value={customWorkoutName}
              onChangeText={setCustomWorkoutName}
            />

            <TouchableOpacity
              style={[
                styles.saveWorkoutButton,
                selectedExercises.length === 0 && { backgroundColor: "#666" }
              ]}
              onPress={handleSaveWorkout}
              disabled={selectedExercises.length === 0}
            >
              <Text style={styles.saveWorkoutText}>
                Save Workout {selectedExercises.length > 0 && + ((selectedExercises.length))}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  scrollArea: {
    flex: 1
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    color: "#111",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center"
  },
  bodySection: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d4d4d4",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 8
  },
  sectionText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12
  },
  pickerWrapper: {
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
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
  prevWorkoutSaved: {
    fontSize: 12,
    color: "#22c55e",
    fontWeight: "500",
    marginTop: 4,
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
  activeExerciseContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },
  exerciseInfo: {
    flex: 1,
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
  modalExerciseContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "#222",
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  modalExercise: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  modalExerciseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500"
  },
  modalExerciseSubtext: {
    color: "#ccc",
    fontSize: 12,
    marginTop: 2
  },
  setsRepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#333",
    borderTopWidth: 1,
    borderTopColor: "#444",
  },
  setsRepsLabel: {
    color: "#fff",
    fontSize: 14,
    marginRight: 8,
    marginLeft: 12,
  },
  setsRepsInput: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 8,
    borderRadius: 4,
    width: 50,
    textAlign: "center",
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
  createButton: {
    backgroundColor: "#2f6cf9",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#111",
    fontSize: 16,
  },
  workoutNameInput: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#444",
  },
  setsContainer: {
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  setsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 4,
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  setNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
    width: 60,
    textAlign: "center",
  },
  setInput: {
    backgroundColor: "#fff",
    color: "#111",
    padding: 8,
    borderRadius: 4,
    width: 60,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#d4d4d4",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#d4d4d4",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxCompleted: {
    backgroundColor: "#2f6cf9",
    borderColor: "#2f6cf9",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  addSetButton: {
    backgroundColor: "#2f6cf9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  addSetButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  exerciseActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoButton: {
    padding: 8,
    marginLeft: 8,
  },
  infoButtonText: {
    fontSize: 18,
  },
});