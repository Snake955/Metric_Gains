import React, { useState } from "react";
import { Alert, ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions(undefined, "europe-west1");

export default function VerifiserKode() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email) {
      Alert.alert("Feil", "Mangler e-post. Gå tilbake og prøv igjen.");
      return;
    }
    if (code.length !== 4) {
      Alert.alert("Feil", "Koden må være 4 sifre.");
      return;
    }

    setLoading(true);
    try {
      const verifyFn = httpsCallable(functions, "verifyPasswordResetCode");
      await verifyFn({ email, code });

      router.push({
        pathname: "/velkommen/glemtpassord/NyttPassord",
        params: { email: String(email), code },
      });
    } catch (err: any) {
      console.log(err);
      Alert.alert(
        "Feil",
        err?.message ?? "Kunne ikke verifisere kode. Prøv igjen."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      const requestCode = httpsCallable(functions, "requestPasswordResetCode");
      await requestCode({ email });
      Alert.alert("Ny kode sendt", "Sjekk e-posten (eller loggene) igjen.");
    } catch (err) {
      Alert.alert("Feil", "Kunne ikke sende ny kode.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Verifiser</Text>
        <Text style={styles.subtitle}>
          Vi har sendt en 4-sifret kode til {"\n"}
          <Text style={{ fontWeight: "600" }}>{email}</Text>
        </Text>

        <Text style={styles.label}>Skriv inn verifikasjonskoden</Text>

        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ""))}
          maxLength={4}
          keyboardType="number-pad"
          textAlign="center"
        />

        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resendText}>Fikk du ikke kode? Send på nytt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleVerify}
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
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#555", textAlign: "center", marginBottom: 32 },
  label: { fontSize: 14, marginBottom: 8, textAlign: "center" },
  codeInput: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 24,
    width: 140,
    marginBottom: 16,
  },
  resendText: {
    textAlign: "center",
    color: "#2563EB",
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
