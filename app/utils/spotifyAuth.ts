import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const clientId = "e716b7afacd54a93940cb4c88f6bafd8";

const scopes = [
  "user-read-email",
  "playlist-read-private", 
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
];

// For Expo Go - denne vil automatisk fungere
const redirectUri = AuthSession.makeRedirectUri();

console.log('Redirect URI:', redirectUri);

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export async function loginToSpotify() {
  try {
    console.log("Starting Spotify login...");
    
    // Opprett auth request
    const authRequest = new AuthSession.AuthRequest({
      clientId,
      scopes,
      redirectUri,
      usePKCE: false,
    });

    // Kjør auth flow
    const result = await authRequest.promptAsync(discovery);

    console.log("Auth result:", result);

    if (result.type === "success" && result.params.access_token) {
      const token = result.params.access_token;
      await AsyncStorage.setItem("spotifyAccessToken", token);
      console.log("Spotify login successful!");
      return token;
    } else {
      console.log("Spotify login cancelled or failed:", result.type);
      return null;
    }
  } catch (error) {
    console.error("Spotify login error:", error);
    return null;
  }
}

export async function getStoredSpotifyToken() {
  try {
    const token = await AsyncStorage.getItem("spotifyAccessToken");
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
}

export async function logoutFromSpotify() {
  try {
    await AsyncStorage.removeItem("spotifyAccessToken");
    console.log("Spotify logout successful");
  } catch (error) {
    console.error("Spotify logout error:", error);
  }
}