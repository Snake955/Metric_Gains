import UpperBody from "@/assets/images/UpperbodyIcon.png";
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DateData, WeekCalendar } from 'react-native-calendars';


type Workout = {
  type: string;
  time: number;
  focus: string;
  exercises: number;
  user?: string;
};

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const today = new Date().toISOString().slice(0, 10);
  const [selected, setSelected] = useState<string>(today);
  const getCurrentMonth = () => {
  return new Date().toLocaleString('default', { month: 'long' });
};

  const markedDates= {
    [selected]: {
      selected: true,
      selectedColor: "#ffffffff",
    }
  }

  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => {}}>
          <Ionicons name="add" size={28} color={"#000000ff"} />
        </TouchableOpacity>
      </View>

      <Text style={styles.currentMonth}>{getCurrentMonth()}</Text>

      <View style={styles.WeekCal}>
      <WeekCalendar style={styles.WeekCal}
       firstDay={1}       
       onDayPress={(day: DateData) => setSelected(day.dateString)}
       current={selected}
       markedDates={markedDates}
      theme={{
        selectedDayBackgroundColor: "#ffffffff",
        selectedDayTextColor: "#000000ff",
        todayTextColor: tint,
        dayTextColor: "#000000ff",
        backgroundColor: "#001333ff",
        calendarBackground: "#f2f2f2"
        
  }}
      />
      </View>

      <Text style={styles.sectionTitle}>Your workouts</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Strength</Text>
        <Text style={styles.cardTime}>6:00 - 7:00</Text>
        <Text style={styles.cardText}>Focus: Upper Body</Text>
        <Text style={styles.cardText}>Exercies: 8</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: tint }]}>
          <Text style={styles.btnText}>Change</Text>
        </TouchableOpacity>
          <Image source={UpperBody} style={styles.UpperBodyIcon} resizeMode="contain" />
  
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
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 5, 
    paddingTop: 10,
  },

  WeekCal: {
    borderRadius:20,
    overflow: "hidden",
    justifyContent: "center",
  

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
    fontSize: 18, 
    fontWeight: "700", 
    marginTop: 12, 
    marginBottom: 6 
  },

  card: { 
    backgroundColor: "#ffffff", 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 10, 
    borderWidth: 1, 
  },

  cardTitle: { 
    color: '#2f6cf9', 
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
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    marginTop: 8 
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
    width: 50,
  }
});
