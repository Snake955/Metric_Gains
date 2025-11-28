import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../FirebaseConfig";


export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

/*Logikk for skriving til firebase sin auth og realtime database */

  const handleRegister = async () => {
  if (!name.trim() || !email.trim() || !pass) {
    Alert.alert("Manglende info", "Fyll inn navn, e-post og passord.");
    return;
  }
  if (pass.length < 6) {
    Alert.alert("Svakt passord", "Passord må ha minst 6 tegn.");
    return;
  }

  setLoading(true);
  try {
    // Dette er logikk kodeblokk for opprette bruker
    const cred = await createUserWithEmailAndPassword(FIREBASE_AUTH, email.trim(), pass);

    // Dette oppdatterer visningsnavnet til brukeren
    await updateProfile(cred.user, {displayName: name.trim()});

    // Denne kodeblokken skriver til databasen
await setDoc(doc(FIRESTORE_DB, "users", cred.user.uid), {
  displayName: name.trim(),
  email: email.trim().toLowerCase(),
  phoneNumber: phone.trim() || null,
  photoURL: "",               // er ikke fullstendig implementert enda blir muligens fjernet eller står igjen til neste iterasjon
  createdAt: serverTimestamp(),
}, { merge: true }); 

    // Catch bolk som sender deg viderer hvis det vellykkes
    router.replace("../(tabs)/index");
  } catch (e: any) {
    let msg = "Noe gikk galt. Prøv igjen.";
    switch (e.code) {
      case "auth/email-already-in-use":
        msg = "E-posten er allerede i bruk.";
        break;
      case "auth/invalid-email":
        msg = "Ugyldig e-post.";
        break;
      case "auth/weak-password":
        msg = "Passordet er for svakt (minst 6 tegn).";
        break;
    }
    Alert.alert("Registrering feilet", msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ScrollView
      contentContainerStyle={{flexGrow: 1, paddingBottom: 40}}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      >
        {/* head */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <AntDesign name="left" size={22} />
          </TouchableOpacity>
          <Text style={styles.title}>
            <Text style={{fontWeight: "700"}}>Opprett </Text>din nye bruker
          </Text>
          <View style={{width: 22}} />
        </View>

        <View style={styles.photoWrap}>
          <View style={styles.photoCircle}>
            <View style={styles.photoLine1} />
            <View style={styles.photoLine2} />
            <TouchableOpacity style={styles.editBadge}>
              <AntDesign name="edit" size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* input felter */}
        <View style={styles.form}>
          <LabeledInput
            icon="user"
            placeholder="Skriv inn navn"
            value={name}
            onChangeText={setName}
          />
          <LabeledInput
            icon="lock" 
            placeholder="Skriv inn passord"
            value={pass}
            onChangeText={setPass}
            secureTextEntry
          />
          <LabeledInput
            icon="mail"
            placeholder="Email adresse"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <LabeledInput
            icon="phone"
            placeholder="Tlf nummer"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotInactive]} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>

          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.replace("/velkommen/Loginn")}
            >
              <Text style={styles.secondaryText}>Logg inn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && {opacity: 0.7}]}
               onPress={handleRegister}
               activeOpacity={0.85}
               disabled={loading}
                  >
              {loading ? <ActivityIndicator /> : <Text style={styles.primaryText}>Registrer</Text>}
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
  safe: {flex: 1, backgroundColor: "#fff", paddingHorizontal: 16},
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    marginBottom: 8,
  },
  title: {fontSize: 20, flex: 1, textAlign: "left", marginLeft: 6},

  photoWrap: {alignItems: "center", marginVertical: 8},
  photoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#cfcfcf",
    justifyContent: "center",
    alignItems: "center",
  },
  photoLine1: {
    position: "absolute",
    width: 120,
    height: 2,
    backgroundColor: "#cfcfcf",
    transform: [{rotate: "45deg"}],
  },
  photoLine2: {
    position: "absolute",
    width: 120,
    height: 2,
    backgroundColor: "#cfcfcf",
    transform: [{rotate: "-45deg"}],
  },
  editBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },

  form: {marginTop: 10, gap: 33},

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6E6E6",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 54,
  },
  inputIcon: {marginRight: 10, color: "#111"},
  input: {flex: 1, fontSize: 16},

  footer: {marginTop: 24, marginBottom: 16},
  dots: {flexDirection: "row", gap: 10, marginBottom: 16, paddingLeft: 8},
  dot: {width: 36, height: 8, borderRadius: 4},
  dotActive: {backgroundColor: "#111"},
  dotInactive: {backgroundColor: "#e5e5e5"},

  ctaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingRight: 8,
  },
  primaryBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {color: "#fff", fontWeight: "600"},

  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#111",
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {color: "#111", fontWeight: "600"},
});
