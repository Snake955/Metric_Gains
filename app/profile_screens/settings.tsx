// app/profile_screens/settings.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { getStoredSpotifyToken, loginToSpotify } from "../utils/spotifyAuth";

export default function Settings() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const styles = isDarkMode ? darkStyles : lightStyles;
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
      if (isDemoMode) {
        Alert.alert(
          "🎭 Demo Mode",
          "Connected!\n\nDrake & Kanye West workout playlist ready.",
          [{ text: "OK" }]
        );
      }
      const result = await loginToSpotify();
      if (result) setSpotifyConnected(true);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Settings",
          headerStyle: {
            backgroundColor: isDarkMode ? "#111" : "#e5e5e5",
          },
          headerTintColor: isDarkMode ? "#fff" : "#000",
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search settings..."
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/profile_screens/setting_screens/user_settings")}
          >
            <Ionicons name="person" size={24} color={isDarkMode ? "#fff" : "#000"} />
            <Text style={styles.menuText}>User</Text>
            <Ionicons name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/profile_screens/setting_screens/display_settings")}
          >
            <Ionicons name="color-palette" size={24} color={isDarkMode ? "#fff" : "#000"} />
            <Text style={styles.menuText}>Display</Text>
            <Ionicons name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/profile_screens/setting_screens/security_settings")}
          >
            <Ionicons name="shield" size={24} color={isDarkMode ? "#fff" : "#000"} />
            <Text style={styles.menuText}>Security</Text>
            <Ionicons name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/profile_screens/setting_screens/noti_settings")}
          >
            <Ionicons name="notifications" size={24} color={isDarkMode ? "#fff" : "#000"} />
            <Text style={styles.menuText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("../velkommen/Velkommen")}
          >
            <Ionicons name="log-out" size={24} color="#FF4444" />
            <Text style={[styles.menuText, { color: "#FF4444" }]}>Log out</Text>
          </TouchableOpacity>
        </View>

        {isDemoMode && (
          <View style={styles.demoBox}>
            <Ionicons name="musical-notes" size={20} color="#1DB954" />
            <Text style={styles.demoText}>Demo: Drake & Kanye 🔥</Text>
          </View>
        )}

        <View style={styles.musicButtons}>
          <TouchableOpacity style={styles.appleButton}>
            <Image
              source={require("@/assets/images/apple-music.png")}
              style={styles.logo}
            />
            <Text style={styles.buttonText}>Login to Apple Music</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.spotifyButton,
              spotifyConnected && styles.spotifyActive,
            ]}
            onPress={handleSpotifyLogin}
            disabled={spotifyConnected}
          >
            <Image
              source={require("@/assets/images/spotify-white.png")}
              style={styles.logo}
            />
            <Text style={styles.buttonText}>
              {spotifyConnected
                ? isDemoMode
                  ? "✓ Demo Connected"
                  : "✓ Connected"
                : "Login to Spotify"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>© Metric Gains 2025</Text>
      </ScrollView>
    </View>
  );
}

const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e5e5e5",
  },
  scrollContent: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
  },
  searchContainer: {
    width: "100%",
    position: "relative",
    marginBottom: 20,
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: 10,
    zIndex: 1,
  },
  searchBar: {
    width: "100%",
    height: 40,
    backgroundColor: "#e2e0e0",
    borderRadius: 8,
    paddingLeft: 40,
    color: "#000",
  },
  menu: {
    width: "100%",
    marginBottom: 20,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  menuText: {
    flex: 1,
    fontSize: 18,
    marginLeft: 10,
    color: "#000",
  },
  demoBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1DB954",
    marginBottom: 15,
  },
  demoText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
  },
  musicButtons: {
    width: "100%",
    marginBottom: 20,
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FC3C44",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  spotifyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1DB954",
    padding: 15,
    borderRadius: 10,
  },
  spotifyActive: {
    backgroundColor: "#1ed760",
    opacity: 0.9,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  footer: {
    fontSize: 14,
    color: "#888",
    marginTop: 20,
  },
});

const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  scrollContent: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  searchContainer: {
    width: "100%",
    position: "relative",
    marginBottom: 20,
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: 10,
    zIndex: 1,
  },
  searchBar: {
    width: "100%",
    height: 40,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingLeft: 40,
    color: "#fff",
  },
  menu: {
    width: "100%",
    marginBottom: 20,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  menuText: {
    flex: 1,
    fontSize: 18,
    marginLeft: 10,
    color: "#fff",
  },
  demoBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 12,
    backgroundColor: "#1a2e1a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1DB954",
    marginBottom: 15,
  },
  demoText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#81C784",
  },
  musicButtons: {
    width: "100%",
    marginBottom: 20,
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FC3C44",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  spotifyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1DB954",
    padding: 15,
    borderRadius: 10,
  },
  spotifyActive: {
    backgroundColor: "#1ed760",
    opacity: 0.9,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  footer: {
    fontSize: 14,
    color: "#888",
    marginTop: 20,
  },
});
