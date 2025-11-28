import { AntDesign } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth"; 
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import biometricsIcon from "../../assets/images/biometrics.png";

import * as LocalAuthentication from "expo-local-authentication"; //kode for biometrisk import
import * as SecureStore from "expo-secure-store";


//Kommentert kode var for mulig implementasjon for google api loginn men vi hadde ikke devbuild

//import * as WebBrowser from "expo-web-browser";
//import * as Google from "expo-auth-session/providers/google";
//import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
//import Constants from "expo-constants";
//import { makeRedirectUri } from "expo-auth-session";
//import * as AuthSession from "expo-auth-session";

//WebBrowser.maybeCompleteAuthSession(); //Expo browser session for OAuth som sender tilbake til appen etter google auth

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  
  const [existingUser, setExistingUser] = useState<any | null>(null);


  //const extra = Constants.expoConfig?.extra as any; 

   //  console.log('WEB CLIENT ID =>', extra?.expoClientId);
   //  console.log("APP OWNERSHIP:", Constants.appOwnership);


     // const redirectUri = makeRedirectUri(); 
   // const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });       
// console.log("REDIRECT:", redirectUri);
 //Redirect proxy

//const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
//  clientId: Constants.expoConfig?.extra?.expoClientId!,
//  redirectUri,
//});

//useEffect(() => {
 // if (response?.type === "success") {
 //   const cred = GoogleAuthProvider.credential(response.params.id_token);
//    signInWithCredential(FIREBASE_AUTH, cred);
 // }
//}, [response]);

//Oppdatert useEffect()
useEffect(() => {
  const unsub = onAuthStateChanged(FIREBASE_AUTH, (user) => {
    setExistingUser(user);
  });
  return unsub;
}, []);



  //Første biometrisk innlogging spør bruker om har lyst bruke
const handleLogin = async () => {
  if (!email.trim() || !pass) {
    Alert.alert("Mangler info", "Skriv inn e-post og passord.");
    return;
  }
  setLoading(true);
  try {
    await signInWithEmailAndPassword(FIREBASE_AUTH, email.trim(), pass);

    // Husk meg etter biometrisk innlogging
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (compatible && enrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Aktiver biometrisk innlogging?",
        cancelLabel: "Nei takk",
      });

      if (result.success) {
        await SecureStore.setItemAsync("biometricEnabled", "true");
      } else {
        await SecureStore.deleteItemAsync("biometricEnabled");
      }
    } else {
      // Enhet støtter ikke biometrikk
      await SecureStore.deleteItemAsync("biometricEnabled");
    }
    
    // gå videre etter vellykket login
    router.replace("/(tabs)");
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


// ny handler
const handleBiometricLogin = async () => {
  if (!existingUser) return;

  const enabled = await SecureStore.getItemAsync("biometricEnabled");
  if (enabled !== "true") {
    Alert.alert("Biometrisk innlogging er ikke aktivert på denne enheten.");
    return;
  }

  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!compatible || !enrolled) {
    Alert.alert("Biometrisk innlogging er ikke tilgjengelig på denne enheten.");
    return;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Logg inn med biometrikk",
    cancelLabel: "Bruk passord",
  });

  if (result.success) {
    router.replace("/(tabs)"); 
  }
  // hvis avbrutt/feilet gjør ingenting lar bruker skrive inn annen bruker
};


const handleForgotNav = () => {
    console.log("FORGOT PRESSED");
  alert("Pressed");
  router.push("/velkommen/glemtpassord/GlemtPassord");
};


  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{flexGrow: 1, paddingBottom: 40}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
              <AntDesign name="left" size={22} />
            </TouchableOpacity>
           <Text style={styles.title}>
  <Text style={{ fontWeight: '700' }}>Logg inn </Text>
  <Text>til brukeren din</Text>
</Text>
            <View style={{width: 22}} />
          </View>
          

  {/* Funksjonalitet for knapper til google, github og twitter som vi prøvde på med sptofiy og api devbuild loginn
<View style={styles.container}>
       <TouchableOpacity
  style={styles.iconButton}
    disabled={!request}
  // @ts-ignore: useProxy is supported at runtime
  onPress={() => promptAsync({ useProxy: true })}   
>
  <AntDesign name="google" size={24} color="#000" />
</TouchableOpacity>

      {/* Twitter 
      <TouchableOpacity style={[styles.iconButton, styles.twitter]}>
        <AntDesign name="twitter" size={24} color="#fff" />
      </TouchableOpacity>

      {/* GitHub 
      <TouchableOpacity style={styles.iconButton}>
        <AntDesign name="github" size={24} color="#000" />
      </TouchableOpacity>
    </View>
    */}


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
                  <AntDesign name={showPass ? "eye" : "eye-invisible"} size={18} color="#111"/>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleForgotNav} style={styles.forgotWrap}>
                <Text style={styles.forgotText}>Glemt passordet ditt?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && {opacity: 0.7}]}
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

            
{existingUser && (
  <TouchableOpacity
    onPress={handleBiometricLogin}
    activeOpacity={0.8}
    style={styles.biometricBtn}
  >
    <Image
      source={biometricsIcon}
      style={styles.biometricImg}
      resizeMode="cover"
    />
  </TouchableOpacity>
)}

            <View style={styles.bottomSection}>
              <Text style={styles.bottomTitle}>Ny til klubben?</Text>
              <TouchableOpacity onPress={() => router.push("/velkommen/Register")}>
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
      <AntDesign name={icon} size={18} style={styles.inputIcon}/>
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
  safe: {flex: 1, backgroundColor: "#fff"},

  //Biometric
biometricBtn: {
  width: 80,          
  height: 80,        
  padding: 8,         
  borderRadius: 100,
  borderColor: "#000",
  borderStyle: "solid",
  borderWidth: 2,

  overflow: "hidden",
  alignSelf: "center",
  marginTop: 15,
  marginBottom: 16,
  justifyContent: "center",
  alignItems: "center",
},

biometricImg: {
  width: "100%",
  height: "100%",
  borderRadius: 128,
},
//biometric slutt

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 6,
    marginBottom: 8,
  },
  title: {fontSize: 22, flex: 1, textAlign: "left", marginLeft: 6},

  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 16,
    marginTop: 8,
  },

  form: {marginTop: 28, gap: 18},

  inputRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6E6E6",
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 54,
  },
  inputIcon: {marginRight: 10, color: "#111"},
  input: {flex: 1, fontSize: 16, color: "#111"},

  eyeToggle: {position: "absolute", right: 14, top: 16},

  forgotWrap: {paddingVertical: 6, alignSelf: "flex-end"},
  forgotText: {color: "#111"},

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
  primaryText: {color: "#fff", fontWeight: "600", fontSize: 18},

  bottomSection: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  bottomTitle: {fontSize: 16, fontWeight: "700", marginBottom: 4},
  bottomLink: {fontSize: 14, color: "#111"},

    container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
  },
  iconButton: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  twitter: {
    backgroundColor: "#000",
  },

});
