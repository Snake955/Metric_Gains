import UpperBody from "@/assets/images/UpperbodyIcon.png";
import { Colors } from '@/constants/theme';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';
import { SafeAreaView } from "react-native-safe-area-context";

type Workout = {
  id: string;
  name: string;
  exercises: any[];
  userId?: string;
  createdAt?: string;
};

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const today = new Date().toISOString().slice(0, 10);
  const [selected, setSelected] = useState<string>(today);
  const [plannedDate, setPlannedDate] = useState<Date>(new Date());

  const [startTime, setStartTime] = useState<Date>(() => {
  const d = new Date();
    d.setHours(10, 0, 0, 0);    // 10:00
    return d;
  });

  const [endTime, setEndTime] = useState<Date>(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);    // 12:00
    return d;
  });



  const [user, setUser] = useState<User | null>(null);
  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([]);

  const DEFAULT_WORKOUT = [
    {
      id: "jog",
      name: "Joggetur",
      exercises: [],
    }
  ];

  const allWorkouts = [...DEFAULT_WORKOUT, ...userWorkouts];

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(
    allWorkouts.length > 0 ? String(allWorkouts[0].id) : ""
  );

  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['75%'], []);

  const openSheet = useCallback(() => {
    setPlannedDate(new Date(selected));
    sheetRef.current?.present();
  }, [selected]);
  const closeSheet = useCallback(() => sheetRef.current?.dismiss(), []);

  const onAdd = useCallback(() => {
    function formatTime(date: Date): string {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const hh = hours < 10 ? `0${hours}` : `${hours}`;
      const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
      return `${hh}:${mm}`;
    }

    const dateString = plannedDate.toISOString().slice(0, 10);
    const startTimeString = formatTime(startTime);
    const endTimeString = formatTime(endTime);

    console.log("Planlagt økt:", { // send dette til firebase
      date: dateString,
      workoutId: selectedWorkoutId,
      startTimeString,
      endTimeString,
    });

    closeSheet(); // lukk etter “legg til”
  }, [closeSheet, plannedDate, selectedWorkoutId, startTime, endTime]);

  const [visibleMonth, setVisibleMonth] = useState<{year: number; month: number}>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  function monthLabel(year: number, month: number) {
    return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

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

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <TouchableOpacity style={styles.addButton} onPress={openSheet}>
            <Ionicons name="add" size={28} color={"#000000ff"} />
          </TouchableOpacity>
        </View>

        <Text style={styles.currentMonth}>
          {monthLabel(visibleMonth.year, visibleMonth.month)}
        </Text>

        <View style={styles.WeekCal}>
          <CalendarProvider
            date={selected}
            onDateChanged={(dateString) => {
              setSelected(dateString);
              const d = new Date(dateString);
              setVisibleMonth({ year: d.getFullYear(), month: d.getMonth() + 1 });
            }}
            onMonthChange={(m) => {
              // m: {year, month, day, timestamp, dateString}
              setVisibleMonth({ year: m.year, month: m.month });
            }}

          >
            <WeekCalendar
              firstDay={1}
              style={{ paddingHorizontal: 0 }}
              dayComponent={({ date, state }) => {
                const isToday = date?.dateString === today;
                const isSelected = date?.dateString === selected;

                return (
                  <TouchableOpacity
                    onPress={() => date?.dateString && setSelected(date.dateString)}
                    hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
                    activeOpacity={0.7}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 6,
                    }}
                  >
                    <View
                      style={[
                        {
                          minWidth: 32,
                          minHeight: 32,
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 16,
                        },
                        isSelected && {
                          backgroundColor: "#ffffff", // fylt hvit sirkel for valgt dag
                        },
                      ]}
                    >
                      <Text
                        allowFontScaling={false}
                        style={{
                          textAlign: "center",
                          includeFontPadding: false,
                          color: isToday ? tint : "#000000ff", // blå tekst for dagens dato
                          opacity: state === "disabled" ? 0.4 : 1,
                        }}
                      >
                        {date?.day ?? ""}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              
              theme={{
                calendarBackground: '#f2f2f2'
              }}
            />
          </CalendarProvider>
        </View>

        <Text style={styles.sectionTitle}>My workouts</Text>
        <View style={styles.body}>
          <View style={styles.card}>
            <View style={styles.cardLeftContent}>
              <Text style={styles.cardTitle}>Strength</Text>
              <Text style={styles.cardTime}>10:00 - 14:00</Text>
              <Text>    </Text>
              <Text style={styles.cardText}>Focus: Upper Body</Text>
              <Text style={styles.cardText}>Exercises: 8</Text>
            </View>

            <View style={styles.cardRightContent}>
              <Image source={UpperBody} style={styles.UpperBodyIcon} resizeMode="contain" />
              <TouchableOpacity style={[styles.btn, { backgroundColor: "#2f6cf9"}]}>
                <Text style={styles.btnText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Friend workouts</Text>
        <View style={styles.body}>
          <View style={styles.friendCard}>
            <View>
              <Text style={styles.cardTitle}>Strength</Text>
              <Text style={styles.cardTime}>12:00 - 14:00</Text>
              <Text style={styles.cardText}>Focus: Arms</Text>
            </View>

            <TouchableOpacity style={[styles.joinBtn, { borderColor: tint }]}>
              <Text style={[styles.joinText, { color: tint }]}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <BottomSheetModal 
        ref={sheetRef}
        snapPoints={snapPoints}
        index={0} // bruker første index i snappointsa våre (akkurat nå har vi bare ett uansett)
        enableDynamicSizing={false} // tvinger at den bruker snappointsa våre og ikke egne dynamiske snappoints
        enablePanDownToClose
        backdropComponent={({ style }) => (
          <View style={[style, { backgroundColor: 'rgba(0,0,0,0.25)' }]} /> // litt grå bakgrunn når man har modulen aktiv
        )}
      >
        <BottomSheetView style={{ padding: 16 }}>
          {/* header */}
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={closeSheet} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.sheetBtnText}>Avbryt</Text>
            </TouchableOpacity>

            <Text style={styles.sheetTitle}>Planlegg ny økt</Text>

            <TouchableOpacity onPress={onAdd} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.sheetBtnText, styles.sheetPrimary]}>Legg til</Text>
            </TouchableOpacity>
          </View>

          {/* tynn skillelinje */}
          <View style={styles.sheetDivider} />

          {/* body */}
          <View style={{ gap: 12 }}>
            {/* dato picker */}
            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.timeLabel}>Dato</Text>
                <DateTimePicker
                  value={plannedDate}
                  mode="date"
                  display="compact"
                  onChange={(event, date) => {
                    if (date) setPlannedDate(date);
                  }}
                />
              </View>
            </View>

            {/* tids picker */}
            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.timeLabel}>Start</Text>
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="compact"
                  onChange={(event, date) => {
                    if (date) setStartTime(date);
                  }}
                />
              </View>

              <View style={styles.timeField}>
                <Text style={styles.timeLabel}>Slutt</Text>
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="compact"
                  onChange={(event, date) => {
                    if (date) setEndTime(date);
                  }}
                />
              </View>
            </View>


            {/* workout picker */}
            <View style={styles.pickerWrapper}>
              <Text style={styles.pickerLabel}>Velg workout:</Text>
              <Picker
                selectedValue={selectedWorkoutId}
                onValueChange={(value) => setSelectedWorkoutId(String(value))}
                style={styles.picker}
              >
                {allWorkouts.map((w) => (
                  <Picker.Item key={w.id} label={w.name} value={w.id} />
                ))}
              </Picker>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },

  container: { 
    flex: 1, 
    paddingHorizontal: 5, 
    paddingTop: 10,
  },

  WeekCal: {
    borderRadius:20,
    overflow: "hidden",
    marginHorizontal: -5,
  },

  header: { 
    flexDirection: "row", 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 1,
    position: "relative",
  },

  body: {
    paddingHorizontal: 15,
  },

  title: { 
    fontSize: 32, 
    fontWeight: "700",
    textAlign: "center",
  },

  addButton: {
    position: "absolute",
    right: 1,
  },

  currentMonth: {
    fontSize: 15,
    fontWeight: "300",
    justifyContent: "center",
    textAlign: "center",
  },

  sectionTitle: { 
    fontSize: 25, 
    fontWeight: "700", 
    marginTop: 12, 
    marginBottom: 6, 
    marginLeft:5,
  },

   card: { 
    backgroundColor: "#ffffff", 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 10, 
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  cardLeftContent: {
    flex: 1,
    marginRight: 12,
  },

  cardRightContent: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop:30,
  },

  cardTitle: { 
    color: "#2f6cf9", 
    fontWeight: "700", 
    fontSize: 16, 
    marginBottom: 4 
  },

  cardTime: { 
    color: "#666666ff", 
    marginBottom: 6 
  },

  cardText: { 
    color: "#666666ff", 
    marginBottom: 4 
  },

  btn: { 
    alignSelf: "flex-start", 
    paddingVertical: 3, 
    marginRight:15,
    borderRadius: 12, 
    marginLeft:20,
    paddingLeft: 20,
    paddingRight:20,
  },

  btnText: { 
    color: "#ffffffff", 
    fontWeight: '600' 
  },

  friendCard: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    backgroundColor: '#ffffffff', 
    borderRadius: 12, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: "#e6e6e6ff", 
    marginBottom: 10 
  },
    
  joinBtn: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 999, 
    borderWidth: 1 
    },

  joinText: { 
    fontWeight: "600"

  },

  UpperBodyIcon: {
    marginBottom: 20,
    width: 90,
    height: 90,
    marginLeft: 10,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  sheetBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },

  sheetPrimary: {
    color: '#2f6cf9',
  },

  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e6e6e6',
    marginBottom: 12,
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
    fontWeight: "600",
    color: "#111",
    padding: 12
  },

  picker: {
    width: "100%"
  },

  timeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },

  timeField: {
    flex: 1,
    alignItems: "center",
  },

  timeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  }
});
