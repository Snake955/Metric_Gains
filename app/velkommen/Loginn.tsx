import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, } from "firebase/auth";
import { FIREBASE_AUTH } from "../../FirebaseConfig";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) router.replace("../(tabs)");
    });
    return unsub;
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !pass) {
      Alert.alert("Mangler info", "Skriv inn e-post og passord.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(FIREBASE_AUTH, email.trim(), pass);
    } catch (e: any) {
      let msg = "Kunne ikke logge inn. Prøv igjen.";
      if (e.code === "auth/invalid-email") msg = "Ugyldig e-post.";
      if (e.code === "auth/user-not-found" || e.code === "auth/wrong-password")
        msg = "Feil e-post eller passord.";
      if (e.code === "auth/too-many-requests")
        msg = "For mange forsøk. Vent litt og prøv igjen.";
      Alert.alert("Innlogging feilet", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email.trim()) {
      Alert.alert("Skriv inn e-post", "Vi trenger e-posten for å sende lenke.");
      return;
    }
    try {
      await sendPasswordResetEmail(FIREBASE_AUTH, email.trim()); //Denne kodeblokken blir endret etterhvert var laget i midlertidig for testing på annen gammel main branch
      Alert.alert("Sjekk e-posten", "Vi har sendt en lenke for å nullstille passord.");
    } catch (e: any) {
      let msg = "Kunne ikke sende lenke.";
      if (e.code === "auth/invalid-email") msg = "Ugyldig e-post.";
      if (e.code === "auth/user-not-found") msg = "Bruker finnes ikke.";
      Alert.alert("Feil", msg);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
              <AntDesign name="left" size={22} />
            </TouchableOpacity>
            <Text style={styles.title}>
              <Text style={{ fontWeight: "700" }}>Logg inn </Text>
              til brukeren din
            </Text>
            <View style={{ width: 22 }} />
          </View>

          <View style={styles.content}>
            <View style={styles.form}>
              <LabeledInput
                icon="mail"
                placeholder="Email adresse"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View>
                <LabeledInput
                  icon="lock"
                  placeholder="Passord"
                  value={pass}
                  onChangeText={setPass}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity
                  onPress={() => setShowPass((s) => !s)}
                  style={styles.eyeToggle}
                  hitSlop={8}
                >
                  <AntDesign name={showPass ? "eye" : "eyeo"} size={18} color="#111" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleForgot} style={styles.forgotWrap}>
                <Text style={styles.forgotText}>Glemt passordet ditt?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>Logg inn</Text>
              )}
            </TouchableOpacity>

            <View style={styles.bottomSection}>
              <Text style={styles.bottomTitle}>Ny til klubben?</Text>
              <TouchableOpacity onPress={() => router.push("../auth/register")}>
                <Text style={styles.bottomLink}>Registrer deg nå!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function LabeledInput(props: {
  icon: React.ComponentProps<typeof AntDesign>["name"];
  placeholder: string;
  value: string;
  onChangeText: (s: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  const {
    icon,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
  } = props;
  return (
    <View style={styles.inputRow}>
      <AntDesign name={icon} size={18} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#6b7280"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 6,
    marginBottom: 8,
  },
  title: { fontSize: 22, flex: 1, textAlign: "left", marginLeft: 6 },

  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 16,
    marginTop: 8,
  },

  form: { marginTop: 28, gap: 18 },

  inputRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6E6E6",
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 54,
  },
  inputIcon: { marginRight: 10, color: "#111" },
  input: { flex: 1, fontSize: 16, color: "#111" },

  eyeToggle: { position: "absolute", right: 14, top: 16 },

  forgotWrap: { paddingVertical: 6, alignSelf: "flex-end" },
  forgotText: { color: "#111" },

  primaryBtn: {
    backgroundColor: "#111",
    width: "90%",
    height: 54,
    borderRadius: 27,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  primaryText: { color: "#fff", fontWeight: "600", fontSize: 18 },

  bottomSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  bottomTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  bottomLink: { fontSize: 14, color: "#111" },
});
