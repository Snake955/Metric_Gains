import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { FIREBASE_AUTH, FIREBASE_STORAGE, FIRESTORE_DB } from "../../FirebaseConfig";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPass, setConfirmPass] = useState(""); //Confirm passord
  const [showPass, setShowPass] = useState(false); //Vis passord
  const [showConfirmPass, setShowConfirmPass] = useState(false);


  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordsMatch = confirmPass.length > 0 && pass === confirmPass; //Grønn border passord confirm
  const passwordsMismatch = confirmPass.length > 0 && pass !== confirmPass; //Rød border for password confirm


  // Henter bilde fra galleri med expo funksjon bilde
  const askAndPick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Tillatelse kreves", "Gi tilgang til bilder for å velge profilbilde.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
     mediaTypes: ImagePicker.MediaTypeOptions.Images
,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Last opp selektert url og returner download url
  const uploadProfilePhoto = async (uid: string, localUri: string) => {
    setUploading(true);
    try {
      const res = await fetch(localUri);
      const blob = await res.blob();
      const storageRef = ref(FIREBASE_STORAGE, `users/${uid}/profile.jpg`);
      await uploadBytes(storageRef, blob, { contentType: blob.type || "image/jpeg" });
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } finally {
      setUploading(false);
    }
  };

  // Registrer bruker, deretter optionelt lagre bruker bilder
  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !pass) {
      Alert.alert("Manglende info", "Fyll inn navn, e-post og passord.");
      return;
    }
    if (pass.length < 6) {
      Alert.alert("Svakt passord", "Passord må ha minst 6 tegn.");
      return;
    }
    if (!confirmPass) {
  Alert.alert("Manglende info", "Bekreft passordet.");
  return;
}
if (pass !== confirmPass) {
  Alert.alert("Passord-mismatch", "Passordene må være like.");
  return;
}

    setLoading(true);
    try {
      // Opprett bruker
      const cred = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email.trim(),
        pass
      );

      // Setter display navn
      await updateProfile(cred.user, { displayName: name.trim() });

      let photoURL: string | "" = "";

      // Hvis bruker valgte bilde, Last opp til storage og set URL
      if (imageUri) {
        try {
          photoURL = await uploadProfilePhoto(cred.user.uid, imageUri);
          await updateProfile(cred.user, { photoURL });
        } catch (e: any) {
          console.warn("Upload failed, continuing without photo:", e?.message);
        }
      }

      await setDoc(
        doc(FIRESTORE_DB, "users", cred.user.uid),
        {
          displayName: name.trim(),
          email: email.trim().toLowerCase(),
          phoneNumber: phone.trim() || null,
          photoURL,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      router.replace("/(tabs)");
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
      setLoading(false); //lengere passord sikkerhe svak ikke
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* head */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
              <AntDesign name="left" size={22} />
            </TouchableOpacity>
            <Text style={styles.title}>
  <Text style={{ fontWeight: "700" }}>Opprett</Text>
  din nye bruker
</Text>
            <View style={{ width: 22 }} />
          </View>

          {/* photo */}
          <View style={styles.photoWrap}>
  <Pressable
    onPress={askAndPick}
    disabled={uploading}
    style={({pressed}) => [{ opacity: (uploading || pressed) ? 0.7 : 1 }]}
    android_ripple={{ borderless: true }}
    hitSlop={8}
  >
           <View style={styles.photoCircle}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width: 146, height: 146, borderRadius: 73 }} />
      ) : (
        <>
          <View style={styles.photoLine1} />
          <View style={styles.photoLine2} />
        </>
      )}

      {uploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}

      <TouchableOpacity
        style={[styles.editBadge, uploading && { opacity: 0.5 }]}
        onPress={askAndPick}
        disabled={uploading}
        hitSlop={10}
      >
        {uploading ? (
          <ActivityIndicator size="small" />
        ) : (
          <AntDesign name="edit" size={16} />
        )}
      </TouchableOpacity>
    </View>
  </Pressable>
</View>

          <View style={styles.form}>
            <LabeledInput icon="user" placeholder="Skriv inn navn" value={name} onChangeText={setName} />
           <View>
<LabeledInput
  icon="lock"
  placeholder="Skriv inn passord"
  value={pass}
  onChangeText={setPass}
  secureTextEntry={!showPass}
  style={[
    passwordsMismatch && { borderColor: "#dc2626" },
    passwordsMatch && { borderColor: "#22c55e" }
  ]}
/>


  <TouchableOpacity
    onPress={() => setShowPass((s) => !s)}
    style={styles.eyeToggle}
    hitSlop={8}
  >
    <AntDesign name={showPass ? "eye" : "eyeo"} size={18} color="#111" />
  </TouchableOpacity>
</View>

<View>
<LabeledInput
  icon="lock"
  placeholder="Bekreft passord"
  value={confirmPass}
  onChangeText={setConfirmPass}
  secureTextEntry={!showConfirmPass}
  style={{
    borderColor: passwordsMismatch ? "#dc2626" : passwordsMatch ? "#22c55e" : "transparent"
  }}
/>


  <TouchableOpacity
    onPress={() => setShowConfirmPass((s) => !s)}
    style={styles.eyeToggle}
    hitSlop={8}
  >
    <AntDesign name={showConfirmPass ? "eye" : "eyeo"} size={18} color="#111" />
  </TouchableOpacity>
</View>
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
              placeholder="Tlf nummer (Opsjonell)"
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
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace("/velkommen/Loginn")}>
                <Text style={styles.secondaryText}>Logg inn</Text>
              </TouchableOpacity>

           <TouchableOpacity
  style={[styles.primaryBtn, (loading || uploading || pass !== confirmPass || pass.length < 6) && { opacity: 0.7 }]}
  onPress={handleRegister}
  activeOpacity={0.85}
  disabled={loading || uploading || pass !== confirmPass || pass.length < 6}
>
              {loading ? (
  <ActivityIndicator color="#fff" />
) : (
  <Text style={styles.primaryText}>Registrer</Text>
)}
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
  style?: object;
}) {
  const { icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, style } = props;

  return (
    <View style={[styles.inputRow, style]}>
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
  safe: { flex: 1, backgroundColor: "#fff",
     paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingTop: 6, 
    marginBottom: 8 },
  title: { fontSize: 20, 
    flex: 1, 
    textAlign: "left", 
    marginLeft: 6 },
  eyeToggle: { 
  position: "absolute", 
  right: 14, 
  top: 16 
},

  loadingOverlay: {
  ...StyleSheet.absoluteFillObject,
  justifyContent: "center", alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.6)",
  borderRadius: 75, zIndex: 3,
},

  photoWrap: { alignItems: "center", 
    marginVertical: 8 },
  photoCircle: {
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    borderWidth: 2, 
    borderColor: "#cfcfcf", 
    justifyContent: "center", 
    alignItems: "center",
    overflow: "visible",
  },
  photoLine1: { position: "absolute", 
    width: 120, 
    height: 2, 
    backgroundColor: "#cfcfcf", 
    transform: [{ rotate: "45deg" }] },
  photoLine2: { position: "absolute", 
    width: 120, 
    height: 2, 
    backgroundColor: "#cfcfcf", 
    transform: [{ rotate: "-45deg" }] },
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
    zIndex: 5, 
  elevation: 5,
  },

  form: { marginTop: 10, 
    gap: 33 },
  inputRow: { flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#E6E6E6", 
    borderRadius: 14, 
    paddingHorizontal: 12, 
    height: 54,  
    borderWidth: 2,
  borderColor: "transparent" },
  inputIcon: { marginRight: 10, 
    color: "#111" },
  input: { flex: 1, 
    fontSize: 16 },

  footer: { marginTop: 24, 
    marginBottom: 16 },
  dots: { flexDirection: "row", 
    gap: 10, 
    marginBottom: 16, 
    paddingLeft: 8 },
  dot: { width: 36, 
    height: 8, 
    borderRadius: 4 },
  dotActive: { backgroundColor: "#111" },
  dotInactive: { backgroundColor: "#e5e5e5" },
  ctaRow: { flexDirection: "row", 
    justifyContent: "flex-end", 
    gap: 10, 
    paddingRight: 8 },
  primaryBtn: { backgroundColor: "#111", 
    paddingHorizontal: 16, 
    height: 36, 
    borderRadius: 18, 
    alignItems: "center", 
    justifyContent: "center" },
  primaryText: { color: "#fff", 
    fontWeight: "600" },
  secondaryBtn: { backgroundColor: "#fff", 
    borderWidth: 1, 
    borderColor: "#111", 
    paddingHorizontal: 14, 
    height: 36, 
    borderRadius: 18, 
    alignItems: "center", 
    justifyContent: "center" },
  secondaryText: { color: "#111", 
    fontWeight: "600" },
});
