import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TextStyle, TouchableOpacity, useColorScheme, View, ViewStyle } from "react-native";

export default function DisplaySettings() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const styles = isDarkMode ? dark : light;
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Display Settings",
          headerBackTitle: "Settings",
          headerTitleAlign: "center",
        }}
      />

      <ScrollView
        style={styles.scroll as any}
        contentContainerStyle={{ alignItems: "center" }}
      >
          

          <Text style={styles.title as TextStyle}>Display Settings</Text>

          <Ionicons
            name="eye-outline"
            size={70}
            color={isDarkMode ? "#fff" : "#000"}
            style={{ marginBottom: 25 }}
          />

          <View style={styles.menu}>
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

          </View>
      </ScrollView>
    </>
  );
}

const Styles: {
  scroll: ViewStyle;
  container?: ViewStyle;
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 20,
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
  ...Styles,
  container: {
    ...Styles.container,
    backgroundColor: "#e5e5e5",
  },
  title: {
    ...Styles.title,
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
  menuText: {
    ...Styles.menuText,
    color: "#fff",
  },
});