// utils/spotifyAuth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

// ✅ ENDRING: Standard demo mode (ingen Client ID nødvendig)
const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || "DEMO_MODE";
const isDemoMode = clientId === "DEMO_MODE";

console.log(
  isDemoMode
    ? "🎭 DEMO MODE: Full funksjonalitet med simulert data"
    : "🎵 REAL MODE: Kobler til Spotify API"
);

const scopes = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "streaming",
];

const redirectUri = AuthSession.makeRedirectUri({
  scheme: "metricgains",
});

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

// ✅ NYTT: Drake og Kanye West workout playlist
const WORKOUT_PLAYLIST = [
  {
    name: "Started From The Bottom",
    artists: [{ name: "Drake" }],
    album: {
      name: "Nothing Was The Same",
      images: [
        {
          url: "https://i.scdn.co/image/ab67616d0000b273b3b07c38f60d5e5e828aa743",
        },
      ],
    },
    duration_ms: 174000,
    uri: "spotify:track:19DUFxlBxbq1MyH8bVAdo6",
  },
  {
    name: "SICKO MODE",
    artists: [{ name: "Travis Scott", feat: "Drake" }],
    album: {
      name: "ASTROWORLD",
      images: [
        {
          url: "https://i.scdn.co/image/ab67616d0000b273072e9faef2ef7b6db63834a3",
        },
      ],
    },
    duration_ms: 312000,
    uri: "spotify:track:2xLMifQCjDGFmkHkpNLD9h",
  },
  {
    name: "Stronger",
    artists: [{ name: "Kanye West" }],
    album: {
      name: "Graduation",
      images: [
        {
          url: "https://i.scdn.co/image/ab67616d0000b273a3520887457b157f89bec0fe",
        },
      ],
    },
    duration_ms: 311000,
    uri: "spotify:track:0j2T0R9dR9qdJYsB7ciXhf",
  },
  {
    name: "POWER",
    artists: [{ name: "Kanye West" }],
    album: {
      name: "My Beautiful Dark Twisted Fantasy",
      images: [
        {
          url: "https://i.scdn.co/image/ab67616d0000b273d9194aa18fa4c9362b47464f",
        },
      ],
    },
    duration_ms: 292000,
    uri: "spotify:track:2gZUPNdnz5Y45eiGxpHGSc",
  },
  {
    name: "Going Bad",
    artists: [{ name: "Meek Mill", feat: "Drake" }],
    album: {
      name: "Championships",
      images: [
        {
          url: "https://i.scdn.co/image/ab67616d0000b2739f5c0e32bb8a09ea28610b27",
        },
      ],
    },
    duration_ms: 180000,
    uri: "spotify:track:6pwfJxqnFbfJVdq3VWGxfP",
  },
  {
    name: "Black Skinhead",
    artists: [{ name: "Kanye West" }],
    album: {
      name: "Yeezus",
      images: [
        {
          url: "https://i.scdn.co/image/ab67616d0000b2732d5cd5baa3f2d063323de26a",
        },
      ],
    },
    duration_ms: 188000,
    uri: "spotify:track:3SktMqZmo3M9zbB7oKMIF7",
  },
  {
    name: "God's Plan",
    artists: [{ name: "Drake" }],
    album: {
      name: "Scorpion",
      images: [
        {
          url: "https://i.scdn.co/image/ab67616d0000b273f907de96b9a4fbc04accc0d5",
        },
      ],
    },
    duration_ms: 198000,
    uri: "spotify:track:6DCZcSspjsKoFjzjrWoCdn",
  },
  {
    name: "All of the Lights",
    artists: [{ name: "Kanye West" }],
    album: {
      name: "My Beautiful Dark Twisted Fantasy",
      images: [
        {
          url: "https://i.scdn.co/image/ab67616d0000b273d9194aa18fa4c9362b47464f",
        },
      ],
    },
    duration_ms: 300000,
    uri: "spotify:track:2HbKqm4o0w5wEeEFXm2sD4",
  },
];

// ✅ NYTT: Demo state management
let currentTrackIndex = 0;
let isPlaying = false;
let currentProgress = 0;
let lastUpdateTime = Date.now();

// ✅ NYTT: Automatisk progress update
setInterval(() => {
  if (isDemoMode && isPlaying) {
    const now = Date.now();
    const elapsed = now - lastUpdateTime;
    currentProgress += elapsed;
    lastUpdateTime = now;

    const currentTrack = WORKOUT_PLAYLIST[currentTrackIndex];
    if (currentProgress >= currentTrack.duration_ms) {
      // Auto-skip til neste sang
      currentTrackIndex = (currentTrackIndex + 1) % WORKOUT_PLAYLIST.length;
      currentProgress = 0;
      console.log("⏭️ Auto-skipped to:", WORKOUT_PLAYLIST[currentTrackIndex].name);
    }
  }
}, 1000);

export async function loginToSpotify() {
  // ✅ ENDRING: Demo mode - ingen ekte login
  if (isDemoMode) {
    console.log("🎭 Demo login: Ingen autentisering nødvendig");
    const mockToken = "DEMO_TOKEN_" + Date.now();
    await AsyncStorage.setItem("spotifyAccessToken", mockToken);
    await AsyncStorage.setItem(
      "spotifyTokenExpiry",
      String(Date.now() + 86400000) // 24 timer
    );
    return mockToken;
  }

  // Ekte Spotify login
  try {
    console.log("🎵 Starting real Spotify login...");
    console.log("🔗 Redirect URI:", redirectUri);

    const authRequest = new AuthSession.AuthRequest({
      clientId,
      scopes,
      redirectUri,
      usePKCE: false,
      responseType: AuthSession.ResponseType.Token,
    });

    const result = await authRequest.promptAsync(discovery);

// ✅ NY VERSJON (fikset)
if (result.type === "success" && result.params.access_token) {
  const token = result.params.access_token;
  const expiresIn = parseInt(result.params.expires_in || "3600", 10); // ✅ Konverter til number

  await AsyncStorage.setItem("spotifyAccessToken", token);
  await AsyncStorage.setItem(
    "spotifyTokenExpiry",
    String(Date.now() + expiresIn * 1000) // ✅ Nå fungerer det
  );

  console.log("✅ Real Spotify login successful!");
  return token;
}


    return null;
  } catch (error) {
    console.error("Spotify login error:", error);
    return null;
  }
}

export async function getStoredSpotifyToken() {
  try {
    const token = await AsyncStorage.getItem("spotifyAccessToken");
    const expiry = await AsyncStorage.getItem("spotifyTokenExpiry");

    if (token && expiry) {
      const now = Date.now();
      const expiryTime = parseInt(expiry, 10);

      if (now < expiryTime) {
        return token;
      } else {
        await logoutFromSpotify();
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
}

export async function logoutFromSpotify() {
  try {
    await AsyncStorage.multiRemove([
      "spotifyAccessToken",
      "spotifyTokenExpiry",
    ]);
    console.log("👋 Logged out");
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// ✅ NYTT: Get currently playing (demo eller ekte)
export async function getCurrentlyPlaying(token: string) {
  if (token.startsWith("DEMO_TOKEN_")) {
    const track = WORKOUT_PLAYLIST[currentTrackIndex];
    return {
      is_playing: isPlaying,
      progress_ms: currentProgress,
      item: track,
    };
  }

  // Ekte Spotify API
  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 204 || response.status === 304) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching currently playing:", error);
    return null;
  }
}

// ✅ NYTT: Play track
export async function playTrack(token: string, trackUri?: string) {
  if (token.startsWith("DEMO_TOKEN_")) {
    console.log("▶️ Demo: Playing", trackUri || "current track");
    isPlaying = true;
    lastUpdateTime = Date.now();

    if (trackUri) {
      const index = WORKOUT_PLAYLIST.findIndex((t) => t.uri === trackUri);
      if (index !== -1) {
        currentTrackIndex = index;
        currentProgress = 0;
      }
    }
    return true;
  }

  // Ekte Spotify API
  try {
    const body = trackUri ? { uris: [trackUri] } : {};
    const response = await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return response.ok || response.status === 204;
  } catch (error) {
    console.error("Error playing:", error);
    return false;
  }
}

// ✅ NYTT: Pause playback
export async function pausePlayback(token: string) {
  if (token.startsWith("DEMO_TOKEN_")) {
    console.log("⏸️ Demo: Paused");
    isPlaying = false;
    return true;
  }

  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/pause",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.ok || response.status === 204;
  } catch (error) {
    console.error("Error pausing:", error);
    return false;
  }
}

// ✅ NYTT: Skip to next
export async function skipToNext(token: string) {
  if (token.startsWith("DEMO_TOKEN_")) {
    console.log("⏭️ Demo: Next track");
    currentTrackIndex = (currentTrackIndex + 1) % WORKOUT_PLAYLIST.length;
    currentProgress = 0;
    lastUpdateTime = Date.now();
    return true;
  }

  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/next",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.ok || response.status === 204;
  } catch (error) {
    console.error("Error skipping:", error);
    return false;
  }
}

// ✅ NYTT: Skip to previous
export async function skipToPrevious(token: string) {
  if (token.startsWith("DEMO_TOKEN_")) {
    console.log("⏮️ Demo: Previous track");
    currentTrackIndex =
      currentTrackIndex === 0
        ? WORKOUT_PLAYLIST.length - 1
        : currentTrackIndex - 1;
    currentProgress = 0;
    lastUpdateTime = Date.now();
    return true;
  }

  try {
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/previous",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.ok || response.status === 204;
  } catch (error) {
    console.error("Error going back:", error);
    return false;
  }
}

// ✅ NYTT: Export demo mode status og playlist
export const getIsDemoMode = () => isDemoMode;
export const getDemoPlaylist = () => WORKOUT_PLAYLIST;
