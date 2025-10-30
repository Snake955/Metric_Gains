import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle
} from "react-native";

export default function Settings() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const styles = isDarkMode ? dark : light;
  const router = useRouter();



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
          

          <Text style={styles.title as TextStyle}>Settings</Text>

          <Ionicons
            name="settings-outline"
            size={70}
            color={isDarkMode ? "#fff" : "#000"}
            style={{ marginBottom: 25 }}
          />

          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuButton}>
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

            <TouchableOpacity style={styles.menuButton}>
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

            <TouchableOpacity style={styles.menuButton}>
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

            <TouchableOpacity style={styles.menuButton}>
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

            <TouchableOpacity style={[styles.menuButton, { borderBottomWidth: 0 }]}>
              <View style={styles.menuRow}>
                <Ionicons name="log-out-outline" size={22} color="#f87171" />
                <Text style={[styles.menuText, { color: "#f87171" }]}>Log out</Text>
              </View>
            </TouchableOpacity>
          </View>
      </ScrollView>
    </>
  );
}

const baseStyles: {
  scroll: ViewStyle;
  container: ViewStyle;
  searchBar: ViewStyle;
  title: TextStyle;
  menu: ViewStyle;
  menuButton: ViewStyle;
  menuRow: ViewStyle;
  menuText: TextStyle;
} = {
  scroll: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  searchBar: {
    width: "85%",
    backgroundColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 15,
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
};

const light = StyleSheet.create({
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#e5e5e5",
  },
  title: {
    ...baseStyles.title,
    color: "#000",
  },
  searchBar: {
    ...baseStyles.searchBar,
    backgroundColor: "#f2f2f2",
    color: "#000",
  },
  menuText: {
    ...baseStyles.menuText,
    color: "#000",
  },
});

const dark = StyleSheet.create({
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: "#111",
  },
  title: {
    ...baseStyles.title,
    color: "#fff",
  },
  menuText: {
    ...baseStyles.menuText,
    color: "#fff",
  },
});
