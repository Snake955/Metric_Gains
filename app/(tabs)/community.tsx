import { IconSymbol } from "@/components/ui/icon-symbol";
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';



export default function CommunityScreen() {
  const [search, setSearch] = useState("");
  
  const updateSearch = (search?:string) => {
    setSearch(search || "");
};

  return(
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
      </View>
      <View style={styles.searchArea}>
      <View style={styles.searchBar}> 
        <IconSymbol name="magnifyingglass" size={24} color="#3f3f3fff" style={styles.searchIcon}/>
       
        <TextInput
        
          style={styles.searchInput}
          placeholder="Search"
          value={search}
          onChangeText={updateSearch}
          />
          
      </View>
      <TouchableOpacity style={styles.filterBtn}>
        <Ionicons name="filter" size={30} color="black" />
      </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.sectionTitle}>Workouts</Text>
      </View>
      <View style={styles.friendCard}>
        <View>
          <Text style={styles.cardTitle}>Strength</Text>
          <Text style={styles.cardTime}>Duration: 1h</Text>
          <Text style={styles.cardText}>Focus: Arms</Text>
          <Text style={styles.cardText}>Exercises: 3</Text>
        </View>
      </View>
      <View style={styles.friendCard}>
        <View>
          <Text style={styles.cardTitle}>Cardio</Text>
          <Text style={styles.cardTime}>Duration: 2h 30min</Text>
          <Text style={styles.cardText}>Focus: Upper Body</Text>
          <Text style={styles.cardText}>Exercises: 5</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 5, 
    paddingTop: 10,
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

  searchArea:{
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5

  },
  searchBar: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: "#00000fff",
    borderRadius: 12,
    backgroundColor: "#ffff",
    marginTop: 20,
    marginBottom: 25,
    flexDirection: "row",
    paddingLeft:15,
    flex: 1
  },

  searchIcon:{
    padding: 1,
    paddingTop: 7
  },

  searchInput: {
    borderColor: "#00000fff"
  },

  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 25,
    

  },

   sectionTitle: { 
    fontSize: 35, 
    fontWeight: "700", 
    marginTop: 12, 
    marginBottom: 6, 
    marginLeft:5,
  },

  friendCard: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    backgroundColor: '#ffffffff', 
    borderRadius: 18, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: "#e6e6e6ff", 
    marginBottom: 20
  },

  cardTitle: { 
    color: "#2f6cf9", 
    fontWeight: "700", 
    fontSize: 26, 
    marginBottom: 5
  },

  cardTime: { 
    color: "#666666ff", 
    marginBottom: 1 
  },

  cardText: { 
    color: "#666666ff", 
    marginBottom: 1
  },

});
