import React, { useState } from "react";
import { Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { FIREBASE_app } from "../../../FirebaseConfig";
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions(FIREBASE_app, "europe-west1");

export default function GlemtPassord() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

const handleSend = async () => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    Alert.alert("Ugyldig e-post", "Sjekk at e-postadressen er riktig.");
    return;
  }

  setLoading(true);
  try {
    const requestCode = httpsCallable(functions, "requestPasswordResetCode");

    await requestCode({ email });

    Alert.alert(
      "Code sendt",
      "CHeck your email."
    );

    router.push({
      pathname: "/velkommen/glemtpassord/VerifiserKode",
      params: { email },
    });
  } catch (err: any) {
  console.log("ERROR FROM FUNCTION:", err);
  console.log("code:", err?.code);
  console.log("message:", err?.message);
  console.log("details:", err?.details);

  const code = err?.code || "";

  if (code.includes("not-found")) {
    Alert.alert(
      "User not found",
      "No user with this email."
    );
  } else if (code.includes("permission-denied")) {
    Alert.alert(
      "Ingen tilgang",
      "'permission-denied', sjekk logs."
    );
  } else {
    Alert.alert("Feil", "Kunne ikke sende kode. Prøv igjen.");
  }
}
};

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
              <AntDesign name="left" size={22} color="#111" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Glemt passord?</Text>
            <View style={{ width: 22 }} />
          </View>

          <Text style={styles.instructions}>Skriv inn e-postadressen din</Text>

          <TextInput
            style={styles.input}
            placeholder="din@mail.no"
            placeholderTextColor="#888"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleSend}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send inn</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/velkommen/Loginn")}>
            <Text style={styles.backLink}>Tilbake til logg inn</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <Text style={styles.noteTitle}>Mangler du en bruker?</Text>
          <TouchableOpacity
            style={styles.tertiaryBtn}
            onPress={() => router.push("/velkommen/Register")}
          >
            <Text style={styles.tertiaryText}>Registrer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", flex: 1, textAlign: "left", marginLeft: 8 },
  instructions: { fontSize: 16, textAlign: "center", marginVertical: 12, color: "#333" },

  input: {
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 16,
    color: "#111",
    marginBottom: 14,
  },

  button: {
    backgroundColor: "#2f6cf9",
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  backLink: { color: "#111", textAlign: "center", marginBottom: 28 },

  noteTitle: { textAlign: "center", marginBottom: 8, color: "#666" },

  tertiaryBtn: {
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignSelf: "center",
    marginBottom: 40,
  },
  tertiaryText: { color: "#111" },
});
