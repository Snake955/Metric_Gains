import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";  
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View, ActivityIndicator } from 'react-native';

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../FirebaseConfig";


const avatarFallback = require("../../assets/images/avatar-placeholder.png"); // local png som placeholder hvis brukeren mangler/ikke har pfp



export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = isDarkMode ? dark : light;

  //Photoconst og photo useeffect function
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
useEffect(() => {
  const unsub = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
    if (!user) {
      setPhotoURL(null);  //Bedre firestore code mot double string error 
      setLoading(false);
      return;
    }

    let url: string | null = typeof user.photoURL === "string" ? user.photoURL : null;

    if (!url) {
      const snap = await getDoc(doc(FIRESTORE_DB, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data() as { photoURL?: unknown };
        if (typeof data.photoURL === "string") {
          url = data.photoURL;
        }
      }
    }

    setPhotoURL(url);
    setLoading(false);
  });

  return unsub;
}, []);

//End of useeffect function


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

{loading ? (
  <ActivityIndicator style={{ marginTop: 20 }} />
) : (
  <View style={styles.profileHeader}>
    <Image
      source={photoURL ? { uri: photoURL } : avatarFallback}
      style={styles.avatar}
    />
  </View>
)}

      <View style={styles.achievementsContainer}>
        <View style={styles.achievement}>
          <Text style={styles.achievementText}>🌟 Newbie</Text>
        </View>


        <View style={styles.rowAchievements}>
          <View style={[styles.achievement, { backgroundColor: '#11c5fc' }]}>
            <Text style={styles.achievementText}>🏃🏿‍♂️ Runner</Text>
          </View>
          <View style={[styles.achievement, { backgroundColor: '#fca311' }]}>
            <Text style={styles.achievementText}>🔥 7x streak</Text>
          </View>
        </View>
      </View>


      <View style={styles.rankBarContainer}>
        <View style={styles.rankBarBackground}>
          <View style={styles.rankBarFill}>
            <Text style={styles.rankBarText}>Rank 6 📈</Text>
          </View>
        </View>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>Bodymap</Text>
        </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}
          onPress={() => router.push('/profile_screens/ranks')}>
          <Text style={styles.menuText}>Ranks</Text>
        </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}
          onPress={() => router.push('/profile_screens/stats')}>
          <Text style={styles.menuText}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}
        onPress={() => router.push('/profile_screens/settings')}>
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

type Styles = {
  container: ViewStyle;
  avatar: ImageStyle;
  title: TextStyle;
  achievementsContainer: ViewStyle;
  rowAchievements: ViewStyle;
  achievement: ViewStyle;
  achievementText: TextStyle;
  rankBarContainer: ViewStyle;
  rankBarBackground: ViewStyle;
  rankBarFill: ViewStyle;
  rankBarText: TextStyle;
  link: TextStyle
  menu: ViewStyle;
  menuButton: ViewStyle;
  menuText: TextStyle;
  profileHeader: ViewStyle;
};

const Styles: Styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
    profileHeader: {        
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 10,
  },
  achievementsContainer: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  rowAchievements: {
    flexDirection: 'row',
    gap: 10,
  },
  achievement: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  achievementText: {
    color: '#000000ff',
    fontWeight: '600',
  },
  rankBarContainer: {
    width: '85%',
    marginBottom: 30,
  },
  rankBarBackground: {
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  rankBarFill: {
    width: '60%',
    height: '100%',
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBarText: {
    color: '#000000ff',
    fontWeight: '600',
  },
  link: {
    textDecorationLine: "none",
  },
  menu: {
    width: '85%',
    marginTop: 10,
  },
  menuButton: {
    borderBottomWidth: 1,
    borderBottomColor: '#888',
    paddingVertical: 14,
  },
  menuText: {
    fontSize: 18,
  },
};

const light = StyleSheet.create<Styles>({
  ...Styles,
  container: {
    ...Styles.container,
    backgroundColor: '#e5e5e5',
  },
  title: {
    ...Styles.title,
    color: '#000',
  },
  menuText: {
    ...Styles.menuText,
    color: '#000',
  },
});

const dark = StyleSheet.create<Styles>({
  ...Styles,
  container: {
    ...Styles.container,
    backgroundColor: '#111',
  },
  title: {
    ...Styles.title,
    color: '#fff',
  },
  menuText: {
    ...Styles.menuText,
    color: '#fff',
  },
  rankBarBackground: {
    ...Styles.rankBarBackground,
    backgroundColor: '#222',
    borderColor: '#333',
  },
});
