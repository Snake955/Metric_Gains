import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View, } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const screenHeight = Dimensions.get("window").height;

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.imageCard}>
          <ImageBackground
            source={require("../../assets/images/gymimage.png")}
            style={styles.Img}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.35)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.titleWrap, { paddingTop: insets.top * 0.3 }]}>
              <Text style={styles.title}>Velkommen til{"\n"}Metric Gains</Text>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Hvem er vi?</Text>
          <Text style={styles.body}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.dots}>
              <View style={[styles.dot, styles.dotActive]}/>
              <View style={styles.dot}/>
            </View>

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => router.push('../velkommen/Register')}
              activeOpacity={0.85}
              >
              <AntDesign name="right" size={22}/>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const CARD_RADIUS = 14;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 14,
  },

  imageCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  Img: {
    width: "100%",
    height: screenHeight * 0.6, // fast høyde for nå med bruk av mang absoluttverdi, men i senere iterasjon blir det utført med responsiv design
  },                            
  titleWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 34,
    textAlign: "center",
    fontWeight: "700",
  },
  card: {
    flexGrow: 1,
    backgroundColor: "#fff",
    borderRadius: CARD_RADIUS,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.06)",
  },
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  body: { fontSize: 14, color: "#4a4a4a", lineHeight: 20 },
  footerRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dots: { flexDirection: "row", gap: 10 },
  dot: {
    width: 28,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e5e5",
  },
  dotActive: { backgroundColor: "#000" },
  nextBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
