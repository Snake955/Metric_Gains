// app/profile_screens/settings.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ LAGT TIL
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageStyle,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { getStoredSpotifyToken, loginToSpotify, logoutFromSpotify } from "../utils/spotifyAuth"; // ✅ LAGT TIL logoutFromSpotify

export default function Settings() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const styles = isDarkMode ? dark : light;
  const router = useRouter();

  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const isDemoMode = !process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;

  useEffect(() => {
    const checkSpotifyConnection = async () => {
      const token = await getStoredSpotifyToken();
      setSpotifyConnected(!!token);
    };
    checkSpotifyConnection();
  }, []);

  const handleSpotifyLogin = async () => {
    try {
      if (spotifyConnected) {
        Alert.alert(
          "Disconnect Spotify?",
          "Are you sure you want to disconnect?",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Disconnect",
              style: "destructive",
              onPress: async () => {
                await logoutFromSpotify();
                setSpotifyConnected(false);
              },
            },
          ]
        );
        return;
      }

      // Login flow
      if (isDemoMode) {
        console.log("Demo mode: Setting mock token");
        
        const mockToken = "DEMO_TOKEN_" + Date.now();
        await AsyncStorage.setItem("spotifyAccessToken", mockToken);
        await AsyncStorage.setItem(
          "spotifyTokenExpiry",
          String(Date.now() + 86400000)
        );
        
        setSpotifyConnected(true);
        
        Alert.alert(
          "Demo Mode",
          "Connected!\n\nYour songs are ready.",
          [{ text: "Let's Go!" }]
        );
        
        return;
      }

      const result = await loginToSpotify();
      if (result) {
        setSpotifyConnected(true);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerBackTitle: "Profile",
          headerTitleAlign: "center",
        }}
      />

      <ScrollView
        style={styles.scroll as any}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={isDarkMode ? "#aaa" : "#666"}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchBar as any}
            placeholder="Search"
            placeholderTextColor={isDarkMode ? "#aaa" : "#666"}
          />
        </View>

        <Text style={styles.title as TextStyle}>Settings</Text>

        <Ionicons
          name="settings-outline"
          size={70}
          color={isDarkMode ? "#fff" : "#000"}
          style={{ marginBottom: 25 }}
        />

        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              router.push("/profile_screens/setting_screens/user_settings")
            }
          >
            <View style={styles.menuRow}>
              <Ionicons
                name="person-outline"
                size={22}
                color={isDarkMode ? "#fff" : "#000"}
              />
              <Text style={styles.menuText}>User</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={18}
                color={isDarkMode ? "#fff" : "#000"}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              router.push("/profile_screens/setting_screens/display_settings")
            }
          >
            <View style={styles.menuRow}>
              <Ionicons
                name="eye-outline"
                size={22}
                color={isDarkMode ? "#fff" : "#000"}
              />
              <Text style={styles.menuText}>Display</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={18}
                color={isDarkMode ? "#fff" : "#000"}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              router.push("/profile_screens/setting_screens/security_settings")
            }
          >
            <View style={styles.menuRow}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={isDarkMode ? "#fff" : "#000"}
              />
              <Text style={styles.menuText}>Security</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={18}
                color={isDarkMode ? "#fff" : "#000"}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() =>
              router.push("/profile_screens/setting_screens/noti_settings")
            }
          >
            <View style={styles.menuRow}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={isDarkMode ? "#fff" : "#000"}
              />
              <Text style={styles.menuText}>Notifications</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={18}
                color={isDarkMode ? "#fff" : "#000"}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, { borderBottomWidth: 0 }]}
            onPress={() => router.push("../velkommen/Velkommen")}
          >
            <View style={styles.menuRow}>
              <Ionicons name="log-out-outline" size={22} color="#f87171" />
              <Text style={[styles.menuText, { color: "#f87171" }]}>
                Log out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.musicButtonsContainer}>
          <TouchableOpacity style={styles.appleMusicButton}>
            <View style={styles.musicButtonRow}>
              <Image
                source={{
                  uri: "https://www.apple.com/newsroom/images/product/apple-music/apple_music-update_hero_08242021.jpg.news_app_ed.jpg",
                }}
                style={styles.appleLogo}
              />
              <Text style={[styles.musicButtonText, { color: "#ffffffff" }]}>
                Login to Apple Music
              </Text>
              <Ionicons name="chevron-forward-outline" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.spotifyButton,
              spotifyConnected && styles.spotifyConnected,
            ]}
            onPress={handleSpotifyLogin} // håndterer både login og disconnect
          >
            <View style={styles.musicButtonRow}>
              <Image
                source={{
                  uri: "https://e7.pngegg.com/pngimages/4/438/png-clipart-spotify-logo-spotify-mobile-app-computer-icons-app-store-music-free-icon-spotify-miscellaneous-logo.png",
                }}
                style={styles.spotifyLogo}
              />
              <Text style={[styles.musicButtonText, { color: "#000" }]}>
                {spotifyConnected
                  ? "Spotify Account Connected"
                  : "Login to Spotify"}
              </Text>
              <Ionicons name="chevron-forward-outline" size={18} color="#000" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>© Metric Gains 2025</Text>
      </ScrollView>
    </>
  );
}

const Styles: {
  scroll: ViewStyle;
  container?: ViewStyle;
  searchContainer: ViewStyle;
  searchBar: TextStyle;
  searchIcon: TextStyle;
  title: TextStyle;
  menu: ViewStyle;
  menuButton: ViewStyle;
  menuRow: ViewStyle;
  menuText: TextStyle;
  footer: TextStyle;
  musicButtonsContainer: ViewStyle;
  appleMusicButton: ViewStyle;
  spotifyButton: ViewStyle;
  spotifyConnected: ViewStyle;
  musicButtonRow: ViewStyle;
  musicButtonText: TextStyle;
  appleLogo: ImageStyle;
  spotifyLogo: ImageStyle;
} = {
  scroll: {
    flex: 1,
  },
  searchContainer: {
    width: "85%",
    position: "relative",
    marginTop: 20,
    marginBottom: 12,
  },
  searchBar: {
    height: 40,
    borderRadius: 8,
    paddingLeft: 35,
    paddingRight: 10,
    fontSize: 16,
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: 10,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },
  menu: {
    width: "85%",
    marginTop: 10,
  },
  menuButton: {
    borderBottomWidth: 1,
    borderBottomColor: "#888",
    paddingVertical: 14,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuText: {
    flex: 1,
    fontSize: 18,
    marginLeft: 10,
  },
  musicButtonsContainer: {
    width: "85%",
    marginTop: 15,
    marginBottom: 25,
    gap: 16,
  },
  appleMusicButton: {
    backgroundColor: "#FB233B",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  spotifyButton: {
    backgroundColor: "#1ED760",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  spotifyConnected: {
    backgroundColor: "#14e15cff",
  },
  musicButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  musicButtonText: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "500",
  },
  appleLogo: {
    width: 35,
    height: 35,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fff",
  },
  spotifyLogo: {
    width: 35,
    height: 35,
    borderRadius: 8,
  },
  footer: {
    fontSize: 12,
    color: "#666",
    marginTop: 20,
    marginBottom: 40,
    alignSelf: "center",
  },
};

const light = StyleSheet.create({
  ...Styles,
  container: {
    ...Styles.container,
    backgroundColor: "#e5e5e5",
  },
  title: {
    ...Styles.title,
    color: "#000",
  },
  searchBar: {
    ...Styles.searchBar,
    backgroundColor: "#e2e0e0ff",
    color: "#000",
  },
  menuText: {
    ...Styles.menuText,
    color: "#000",
  },
});

const dark = StyleSheet.create({
  ...Styles,
  container: {
    ...Styles.container,
    backgroundColor: "#111",
  },
  title: {
    ...Styles.title,
    color: "#fff",
  },
  searchBar: {
    ...Styles.searchBar,
    backgroundColor: "#f2f2f2",
    color: "#ffffffff",
  },
  menuText: {
    ...Styles.menuText,
    color: "#fff",
  },
});
