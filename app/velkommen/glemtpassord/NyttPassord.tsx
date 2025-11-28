import React, { useState } from "react";
import { Alert, ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions(undefined, "europe-west1");

export default function NyttPassord() {
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const router = useRouter();
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetPassword = async () => {
    if (!email || !code) {
      Alert.alert("Feil", "Mangler data. Gå tilbake og prøv igjen.");
      return;
    }
    if (pwd1.length < 6) {
      Alert.alert("For kort", "Passordet må være minst 6 tegn.");
      return;
    }
    if (pwd1 !== pwd2) {
      Alert.alert("Feil", "Passordene er ikke like.");
      return;
    }

    setLoading(true);
    try {
      const resetFn = httpsCallable(functions, "resetPasswordWithCode");
      await resetFn({ email, code, newPassword: pwd1 });

      Alert.alert("Suksess", "Passordet er oppdatert.", [
        {
          text: "OK",
          onPress: () =>
            router.replace("/velkommen/Loginn"), 
        },
      ]);
    } catch (err: any) {
      console.log(err);
      Alert.alert(
        "Feil",
        err?.message ?? "Kunne ikke oppdatere passord. Prøv igjen."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Bekreft nytt passord</Text>

        <Text style={styles.label}>Skriv inn nytt passord</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={pwd1}
          onChangeText={setPwd1}
        />

        <Text style={styles.label}>Bekreft passordet</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={pwd2}
          onChangeText={setPwd2}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Bekreft</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 24, textAlign: "center" },
  label: { fontSize: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
