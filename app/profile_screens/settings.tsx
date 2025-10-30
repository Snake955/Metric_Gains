import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, useColorScheme, View, ViewStyle } from "react-native";

export default function Settings() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const styles = isDarkMode ? dark : light;



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
                  <Text style={styles.footer}>© Metric Gains 2025</Text>
      </ScrollView>
    </>
  );
}

const baseStyles: {
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
  footer: {
    fontSize: 12,
    color: "#666",
    marginTop: 20,
    marginBottom: 40,
    alignSelf: "center",
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
    backgroundColor: "#e2e0e0ff",
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
    searchBar: {
    ...baseStyles.searchBar,
    backgroundColor: "#f2f2f2",
    color: "#ffffffff",
  },
  menuText: {
    ...baseStyles.menuText,
    color: "#fff",
  },
});
