import { useRouter } from "expo-router";
import React from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

const ProfileScreen = () => {
  const colorScheme = useColorScheme();
  const placeholderImage = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  const isDarkMode = colorScheme === 'dark';
  const styles = isDarkMode ? dark : light;
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Image source={{ uri: placeholderImage }} style={styles.avatar} />


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
        <TouchableOpacity style={styles.menuButton}>
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
};

const baseStyles: Styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
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
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: '#e5e5e5',
  },
  title: {
    ...baseStyles.title,
    color: '#000',
  },
  menuText: {
    ...baseStyles.menuText,
    color: '#000',
  },
});

const dark = StyleSheet.create<Styles>({
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: '#111',
  },
  title: {
    ...baseStyles.title,
    color: '#fff',
  },
  menuText: {
    ...baseStyles.menuText,
    color: '#fff',
  },
  rankBarBackground: {
    ...baseStyles.rankBarBackground,
    backgroundColor: '#222',
    borderColor: '#333',
  },
});

export default ProfileScreen;
