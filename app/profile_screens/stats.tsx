import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { Stack } from "expo-router";
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import * as Progress from "react-native-progress";


type WorkoutSession = {
  id: string;
  workoutName: string;
  startedAt: string;
  durationSeconds: number;
  totalExercises: number;
  completedSets: number;
  totalSets: number;
  userId: string;
};

type StatsData = {
  totalWorkouts: number;
  totalWorkoutTime: number;
  completedSets: number;
  totalSets: number;
  completionRate: number;
  weeklyWorkouts: number;
  workoutTrend: { value: number }[];
  monthlyGoal: number;
  averageWorkoutDuration: number;
};

export default function StatsScreen() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const currentUser = FIREBASE_AUTH.currentUser;

      if (!currentUser) {
        console.log("No user signed in");
        setLoading(false);
        return;
      }

      const userId = currentUser.uid;
      console.log("Loading stats for user:", userId);

      const sessionsQuery = query(
        collection(FIRESTORE_DB, 'workout_sessions'),
        where('userId', '==', userId),
        orderBy('startedAt', 'desc')
      );

      const querySnapshot = await getDocs(sessionsQuery);
      const sessions: WorkoutSession[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkoutSession[];

      console.log(`Found ${sessions.length} workout sessions for user ${userId}`);

      if (sessions.length > 0) {
        const totalWorkouts = sessions.length;
        const totalWorkoutTime = sessions.reduce((sum, session) => sum + session.durationSeconds, 0);
        const totalSets = sessions.reduce((sum, session) => sum + session.totalSets, 0);
        const completedSets = sessions.reduce((sum, session) => sum + session.completedSets, 0);
        const completionRate = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
        const averageWorkoutDuration = Math.round(totalWorkoutTime / totalWorkouts);

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weeklyWorkouts = sessions.filter(session => {
          const sessionDate = new Date(session.startedAt);
          return sessionDate > oneWeekAgo;
        }).length;

        const recentWorkouts = sessions.slice(0, 7).reverse();
        const workoutTrend = recentWorkouts.map(session => ({
          value: session.completedSets || 0
        }));

        while (workoutTrend.length < 7) {
          workoutTrend.unshift({ value: 0 });
        }

        const monthlyGoal = 12;

        const statsData: StatsData = {
          totalWorkouts,
          totalWorkoutTime,
          completedSets,
          totalSets,
          completionRate,
          weeklyWorkouts,
          workoutTrend,
          monthlyGoal,
          averageWorkoutDuration
        };

        console.log("Calculated stats:", statsData);
        setStats(statsData);
      } else {
        console.log("No workouts found for user");
        const defaultStats: StatsData = {
          totalWorkouts: 0,
          totalWorkoutTime: 0,
          completedSets: 0,
          totalSets: 0,
          completionRate: 0,
          weeklyWorkouts: 0,
          workoutTrend: [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
          monthlyGoal: 12,
          averageWorkoutDuration: 0
        };
        setStats(defaultStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      const errorStats: StatsData = {
        totalWorkouts: 0,
        totalWorkoutTime: 0,
        completedSets: 0,
        totalSets: 0,
        completionRate: 0,
        weeklyWorkouts: 0,
        workoutTrend: [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }],
        monthlyGoal: 12,
        averageWorkoutDuration: 0
      };
      setStats(errorStats);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secondsTotal: number): string => {
    const hours = Math.floor(secondsTotal / 3600);
    const mins = Math.floor((secondsTotal % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatSteps = (workoutTime: number): number => {
    return Math.round((workoutTime / 60) * 100);
  };

  const calculateCalories = (workoutTime: number): number => {
    return Math.round((workoutTime / 60) * 5);
  };

  if (loading) {
    return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Loading statistics...
            </ThemedText>
          </ScrollView>
        </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Overall Stats",
          headerBackTitle: "Profile",
          headerTitleAlign: "center",
        }}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollViewContent}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Workout Statistics
          </ThemedText>

          <View style={styles.activityRow}>
            <ThemedView style={styles.activityCard}>
              <Progress.Circle
                size={100}
                progress={stats ? Math.min(formatSteps(stats.totalWorkoutTime) / 10000, 1) : 0}
                thickness={8}
                color="#2D7FF9"
                showsText={false}
              />
              <ThemedText type="defaultSemiBold" style={styles.statValue}>
                {stats ? formatSteps(stats.totalWorkoutTime).toLocaleString() : "0"}
              </ThemedText>
              <ThemedText type="default" style={styles.statLabel}>steps</ThemedText>
              <ThemedText type="default" style={styles.statSubtext}>10,000 goal</ThemedText>
            </ThemedView>

            <ThemedView style={styles.activityCard}>
              <Progress.Circle
                size={100}
                progress={stats ? Math.min(calculateCalories(stats.totalWorkoutTime) / 500, 1) : 0}
                thickness={8}
                color="#2D7FF9"
                showsText={false}
              />
              <ThemedText type="defaultSemiBold" style={styles.statValue}>
                {stats ? calculateCalories(stats.totalWorkoutTime) : 0}
              </ThemedText>
              <ThemedText type="default" style={styles.statLabel}>kcal</ThemedText>
              <ThemedText type="default" style={styles.statSubtext}>500 goal</ThemedText>
            </ThemedView>

            <ThemedView style={styles.activityCard}>
              <ThemedText type="defaultSemiBold" style={styles.statLabel}>Workouts</ThemedText>
              <ThemedText type="default" style={styles.largeNumber}>
                {stats ? stats.weeklyWorkouts : 0}
              </ThemedText>
              <ThemedText style={styles.statSubtext}>this week</ThemedText>
            </ThemedView>

            <ThemedView style={styles.activityCard}>
              <ThemedText style={styles.statLabel}>Completion</ThemedText>
              <ThemedText style={styles.largeNumber}>
                {stats ? stats.completionRate : 0}%
              </ThemedText>
              <ThemedText style={styles.statSubtext}>sets completed</ThemedText>
            </ThemedView>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Monthly Progress
            </ThemedText>
            <ThemedView style={styles.progressCard}>
              <Progress.Bar
                progress={stats ? Math.min(stats.totalWorkouts / stats.monthlyGoal, 1) : 0}
                width={null}
                height={12}
                color="#2D7FF9"
                style={styles.progressBar}
              />
              <View style={styles.progressTextContainer}>
                <ThemedText type="default">
                  {stats ? stats.totalWorkouts : 0} / {stats ? stats.monthlyGoal : 12} workouts
                </ThemedText>
                <ThemedText type="defaultSemiBold">
                  {stats ? Math.round((stats.totalWorkouts / stats.monthlyGoal) * 100) : 0}%
                </ThemedText>
              </View>
            </ThemedView>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Progress Trend
            </ThemedText>
            <ThemedView style={styles.chartCard}>
              <LineChart
                data={stats ? stats.workoutTrend : [{ value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }]}
                color="#2D7FF9"
                hideRules
                dataPointsColor="#2D7FF9"
                dataPointsRadius={4}
                yAxisColor="transparent"
                xAxisColor="transparent"
                hideYAxisText
                curved={false}
                areaChart
                startFillColor="rgba(45, 127, 249, 0.1)"
                endFillColor="rgba(45, 127, 249, 0.1)"
                startOpacity={0.1}
                endOpacity={0.1}
                height={120}
              />
              <ThemedText style={styles.chartLabel}>
                Completed sets per workout (last 7 sessions)
              </ThemedText>
            </ThemedView>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Workout Summary
            </ThemedText>
            <ThemedView style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <ThemedText type="default">Total Workouts:</ThemedText>
                <ThemedText type="defaultSemiBold">{stats ? stats.totalWorkouts : 0}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText type="default">Total Time:</ThemedText>
                <ThemedText type="defaultSemiBold">
                  {stats ? formatTime(stats.totalWorkoutTime) : "0m"}
                </ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText type="default">Avg. Duration:</ThemedText>
                <ThemedText type="defaultSemiBold">
                  {stats ? formatTime(stats.averageWorkoutDuration) : "0m"}
                </ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText type="default">Sets Completed:</ThemedText>
                <ThemedText type="defaultSemiBold">
                  {stats ? stats.completedSets : 0} / {stats ? stats.totalSets : 0}
                </ThemedText>
              </View>
            </ThemedView>
          </View>
        </ScrollView>
      </View>
      </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  topbar_index: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  }, 
   scrollViewContent: {
    paddingHorizontal: 20,
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
    shadowRadius: 8,
    elevation: 2,
  },
  section: {
    marginBottom: 16,
  },
  progressCard: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  chartCard: {
    width: "100%",
    padding: 15,
    borderRadius: 12,
    shadowRadius: 8,
    elevation: 2,
  },
  largeNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D7FF9",
    marginVertical: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statSubtext: {
    fontSize: 12,
    color: "#999",
  },
  progressBar: {
    marginVertical: 8,
  },
  progressTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  chartLabel: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
  summaryCard: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
});