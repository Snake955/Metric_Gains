import UpperBody from "@/assets/images/UpperbodyIcon.png";
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';
import { SafeAreaView } from "react-native-safe-area-context";

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const today = new Date().toISOString().slice(0, 10);
  const [selected, setSelected] = useState<string>(today);

  const [visibleMonth, setVisibleMonth] = useState<{year: number; month: number}>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  function monthLabel(year: number, month: number) {
    return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => {}}>
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

        <Text style={styles.sectionTitle}>Friend workouts</Text>
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
      </ScrollView>
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
  }
});
