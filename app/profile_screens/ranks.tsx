import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";


export default function RanksScreen() {
    const sections = ["Chest", "Arms", "Core", "Legs", "Back"] as const;
    const [selected, setSelected] = useState<(typeof sections)[number]>("Chest");
    const currentIndexRef = useRef(0);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 20,
            onPanResponderRelease: (_, gesture) => {
                const currentIndex = currentIndexRef.current;
                if (gesture.dx < -50 && currentIndex < sections.length - 1) {
                    const next = currentIndex + 1;
                    setSelected(sections[next]);
                    currentIndexRef.current = next;
                } else if (gesture.dx > 50 && currentIndex > 0) {
                    const prev = currentIndex - 1;
                    setSelected(sections[prev]);
                    currentIndexRef.current = prev;
                }
            },
        })
    ).current;

    useEffect(() => {
        currentIndexRef.current = sections.indexOf(selected);
    }, [selected]);

    const ranks = {
        Chest: [
            { name: "Upper Chest", color: "#00BFFF" },
            { name: "Mid Chest", color: "gray" },
            { name: "Lower Chest", color: "#CD853F" },
        ],
        Arms: [
            { name: "Biceps", color: "#00BFFF" },
            { name: "Triceps", color: "#00BFFF" },
            { name: "Forearms", color: "gray" },
            { name: "Shoulders", color: "#CD853F" },
        ],
        Core: [
            { name: "Abdominals", color: "#00BFFF" },
            { name: "Obliques", color: "#CD853F" },
        ],
        Legs: [
            { name: "Quads", color: "#00BFFF" },
            { name: "Hamstrings", color: "gray" },
            { name: "Calves", color: "#CD853F" },
        ],
        Back: [
            { name: "Lats", color: "#00BFFF" },
            { name: "Traps", color: "gray" },
            { name: "Lower Back", color: "#CD853F" },
        ],
    };

    return (
                <>
          <Stack.Screen
            options={{
              title: "Ranking",
              headerBackTitle: "Profile",
              headerTitleAlign: "center",
            }}
          />
        
        <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
            <View style={styles.header}>
                <Ionicons name="arrow-back" size={24} color="black" />
                <Text style={styles.headerTitle}>Ranks</Text>
            </View>
            <View style={styles.tabContainer}>
                {sections.map((section) => {
                    const isActive = selected === section;
                    return (
                        <TouchableOpacity
                            key={section}
                            onPress={() => setSelected(section)}
                            activeOpacity={0.7}
                        >
                            <Animated.Text
                                style={[
                                    styles.tab,
                                    {
                                        color: isActive ? "black" : "gray",
                                        fontSize: isActive ? 22 : 16,
                                        fontWeight: isActive ? "bold" : "400",
                                        transform: [{ scale: isActive ? 1.15 : 1 }],
                                    },
                                ]}
                            >
                                {section}
                            </Animated.Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
            {ranks[selected].map((item, index) => (
                <View key={index} style={styles.rankRow}>
                    <Text style={styles.muscle}>{item.name}</Text>
                    <View style={styles.progressContainer}>
                        <Progress.Bar
                            progress={0}
                            width={200}
                            color={item.color}
                            height={12}
                            borderWidth={0}
                            unfilledColor="#ffffff"
                        />
                        <Text style={styles.rankText}>Rank --</Text>
                    </View>
                </View>
            ))}
            <View style={styles.badgeContainer}>
                <View style={styles.hexagon}>
                    <Ionicons name="chevron-down-outline" size={32} color="#FFD700" />
                </View>
            </View>
        </SafeAreaView>
        </>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EAEAEA",
        padding: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 10,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    tab: {
        marginHorizontal: 15,
    },
    rankRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    muscle: {
        width: 90,
        fontSize: 16,
        fontWeight: "bold",
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    rankText: {
        marginLeft: 10,
    },
    badgeContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    hexagon: {
        width: 100,
        height: 100,
        borderWidth: 4,
        borderColor: "#FFD700",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    bottomNav: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        padding: 10,
        backgroundColor: "white",
    },
});