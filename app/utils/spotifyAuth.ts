import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";
import { Audio } from "expo-av";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || "";
const isDemoMode = clientId === "DEMO_MODE";

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

// playlist med lokale filer
const WORKOUT_PLAYLIST = [
  {
    name: "Runaway",
    artists: [{ name: "Kanye West", feat: "Pusha T" }],
    album: {
      name: "My Beautiful Dark Twisted Fantasy",
      images: [
        {
          url: "https://i.scdn.co/image/ab67616d0000b273d9194aa18fa4c9362b47464f",
        },
      ],
    },
    duration_ms: 548000,
    uri: "spotify:track:3DK6m7It6Pw857FcQftMds",
    localFile: require("@/assets/songs/Runaway (feat. Pusha T).mp3"),
  },
  {
    name: "What Did I Miss?",
    artists: [{ name: "Drake" }],
    album: {
      name: "What Did I Miss? - Single",
      images: [
        {
          url: "https://i1.sndcdn.com/artworks-gSI4z3wJezAQD9IR-FHNPMg-t500x500.png",
        },
      ],
    },
    duration_ms: 195000,
    uri: "spotify:track:0RiRZpuVRbi7oqRdSMwhQY",
    localFile: require("@/assets/songs/What Did I Miss.mp3"),
  },
  {
    name: "Diamonds Dancing",
    artists: [{ name: "Young Thug", feat: "Gunna, Travis Scott" }],
    album: {
      name: "Young Slime Language 2",
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/en/c/cd/YSL_Records_-_Slime_Language_2.png",
        },
      ],
    },
    duration_ms: 242000,
    uri: "spotify:track:5W3cjX2J3tjhG8zb6u0qHn",
    localFile: require("@/assets/songs/Diamonds Dancing (feat. Travis Scott).mp3"),
  },
  {
    name: "I'm a Boss",
    artists: [{ name: "Meek Mill", feat: "Rick Ross" }],
    album: {
      name: "Dreamchasers 2",
      images: [
        {
          url: "https://i1.sndcdn.com/artworks-000017991472-ccvybm-t500x500.jpg",
        },
      ],
    },
    duration_ms: 252000,
    uri: "spotify:track:2U0HZFfqMMbwxVBFAgdWGd",
    localFile: require("@/assets/songs/Ima Boss (feat. Rick Ross).mp3"),
  },
  {
    name: "Digits",
    artists: [{ name: "Young Thug" }],
    album: {
      name: "Slime Season 3",
      images: [
        {
          url: "https://i.scdn.co/image/ab67616d0000b273a875c3ec944b4f164ab5c350",
        },
      ],
    },
    duration_ms: 176000,
    uri: "spotify:track:3ee8Jmje8o58CHK66QrVC2",
    localFile: require("@/assets/songs/Digits.mp3"),
  },
  {
    name: "Hustler's Ambition",
    artists: [{ name: "50 Cent" }],
    album: {
      name: "Get Rich or Die Tryin'",
      images: [
        {
          url: "https://upload.wikimedia.org/wikipedia/en/1/17/Get_Rich_or_Die_Tryin%27_Soundtrack_-_CD_album_cover.jpg",
        },
      ],
    },
    duration_ms: 237000,
    uri: "spotify:track:3CNnjspCLg3Vb1uWZW9jlw",
    localFile: require("@/assets/songs/Hustler's Ambition.mp3"),
  },
  {
    name: "Computers",
    artists: [{ name: "Rowdy Rebel", feat: "Bobby Shmurda" }],
    album: {
      name: "Computers - Single",
      images: [
        {
          url: "https://i.scdn.co/image/ab67616d0000b2737c319902ae28adae216b49ac",
        },
      ],
    },
    duration_ms: 192000,
    uri: "spotify:track:6M2wZ9GZgrQXHCFfjv46we",
    localFile: require("@/assets/songs/Computers (feat. Bobby Shmurda).mp3"),
  },
];

// lydavspiller
let sound: Audio.Sound | null = null;
let currentTrackIndex = 0;
let isPlaying = false;
let currentProgress = 0;
let isShuffleEnabled = false;
let repeatMode: 'off' | 'context' | 'track' = 'off';
let shuffledIndices: number[] = [];
let shufflePosition = 0;

// audio mode
Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
  shouldDuckAndroid: true,
});

export async function seekToPosition(token: string, positionMs: number) {
  if (token.startsWith("DEMO_TOKEN_")) {
    if (sound) {
      await sound.setPositionAsync(positionMs);
      currentProgress = positionMs;
      return true;
    }
    return false;
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/seek?position_ms=${positionMs}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.ok || response.status === 204;
  } catch (error) {
    console.error("Error seeking:", error);
    return false;
  }
}

function generateShuffledIndices() {
  shuffledIndices = Array.from({ length: WORKOUT_PLAYLIST.length }, (_, i) => i);
  
  for (let i = shuffledIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
  }
  
  shufflePosition = 0;
}

export async function toggleShuffle(token: string) {
  if (token.startsWith("DEMO_TOKEN_")) {
    isShuffleEnabled = !isShuffleEnabled;
    
    if (isShuffleEnabled) {
      generateShuffledIndices();
      const currentIndex = shuffledIndices.indexOf(currentTrackIndex);
      if (currentIndex !== -1) {
        shufflePosition = currentIndex;
      }
    }
    
    return isShuffleEnabled;
  }

  try {
    const newState = !isShuffleEnabled;
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/shuffle?state=${newState}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok || response.status === 204) {
      isShuffleEnabled = newState;
      return isShuffleEnabled;
    }
    return isShuffleEnabled;
  } catch (error) {
    console.error("Error toggling shuffle:", error);
    return isShuffleEnabled;
  }
}

export async function toggleRepeat(token: string) {
  if (token.startsWith("DEMO_TOKEN_")) {
    if (repeatMode === 'off') repeatMode = 'context';
    else if (repeatMode === 'context') repeatMode = 'track';
    else repeatMode = 'off';
    return repeatMode;
  }

  try {
    let newMode: 'off' | 'context' | 'track' = 'off';
    if (repeatMode === 'off') newMode = 'context';
    else if (repeatMode === 'context') newMode = 'track';
    
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/repeat?state=${newMode}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok || response.status === 204) {
      repeatMode = newMode;
      return repeatMode;
    }
    return repeatMode;
  } catch (error) {
    console.error("Error toggling repeat:", error);
    return repeatMode;
  }
}

export async function loginToSpotify() {
  if (isDemoMode) {
    console.log("Demo login: Ingen autentisering nødvendig");
    const mockToken = "DEMO_TOKEN_" + Date.now();
    await AsyncStorage.setItem("spotifyAccessToken", mockToken);
    await AsyncStorage.setItem(
      "spotifyTokenExpiry",
      String(Date.now() + 86400000)
    );
    return mockToken;
  }

  try {
    const authRequest = new AuthSession.AuthRequest({
      clientId,
      scopes,
      redirectUri,
      usePKCE: false,
      responseType: AuthSession.ResponseType.Token,
    });

    const result = await authRequest.promptAsync(discovery);

    if (result.type === "success" && result.params.access_token) {
      const token = result.params.access_token;
      const expiresIn = parseInt(result.params.expires_in || "3600", 10);

      await AsyncStorage.setItem("spotifyAccessToken", token);
      await AsyncStorage.setItem(
        "spotifyTokenExpiry",
        String(Date.now() + expiresIn * 1000)
      );
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
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }

    await AsyncStorage.multiRemove([
      "spotifyAccessToken",
      "spotifyTokenExpiry",
    ]);

    isPlaying = false;
    currentProgress = 0;
    currentTrackIndex = 0;
    isShuffleEnabled = false;
    repeatMode = 'off';
    shuffledIndices = [];
    shufflePosition = 0;

  } catch (error) {
    console.error("Logout error:", error);
  }
}

export async function getCurrentlyPlaying(token: string) {
  if (token.startsWith("DEMO_TOKEN_")) {
    const track = WORKOUT_PLAYLIST[currentTrackIndex];

    if (sound && isPlaying) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        currentProgress = status.positionMillis;
      }
    }

    return {
      is_playing: isPlaying,
      progress_ms: currentProgress,
      item: track,
    };
  }

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

export async function playTrack(token: string, trackUri?: string) {
  if (token.startsWith("DEMO_TOKEN_")) {
    try {
      if (trackUri) {
        const index = WORKOUT_PLAYLIST.findIndex((t) => t.uri === trackUri);
        if (index !== -1) {
          currentTrackIndex = index;
          currentProgress = 0;
          
          if (isShuffleEnabled) {
            const shuffleIdx = shuffledIndices.indexOf(index);
            if (shuffleIdx !== -1) {
              shufflePosition = shuffleIdx;
            }
          }
        }
      }

      const track = WORKOUT_PLAYLIST[currentTrackIndex];

      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        track.localFile,
        { shouldPlay: true }
      );

      sound = newSound;
      isPlaying = true;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          if (repeatMode === 'track') {
            playTrack(token);
          } else if (repeatMode === 'off') {
            if (isShuffleEnabled || currentTrackIndex < WORKOUT_PLAYLIST.length - 1) {
              skipToNext(token);
            } else {
              isPlaying = false;
            }
          } else {
            skipToNext(token);
          }
        }
      });

      return true;
    } catch (error) {
      console.error("Error playing track:", error);
      return false;
    }
  }

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

export async function pausePlayback(token: string) {
  if (token.startsWith("DEMO_TOKEN_")) {
    if (sound) {
      await sound.pauseAsync();
      isPlaying = false;
      return true;
    }
    return false;
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

export async function resumePlayback(token: string) {
  if (token.startsWith("DEMO_TOKEN_")) {
    if (sound) {
      await sound.playAsync();
      isPlaying = true;
      return true;
    }
    return false;
  }

  return await playTrack(token);
}

export async function skipToNext(token: string) {
  if (token.startsWith("DEMO_TOKEN_")) {
    if (repeatMode === 'track') {
      currentProgress = 0;
      await playTrack(token);
      return true;
    }

    if (isShuffleEnabled) {
      shufflePosition = (shufflePosition + 1) % shuffledIndices.length;
      currentTrackIndex = shuffledIndices[shufflePosition];
      
      if (shufflePosition === 0 && repeatMode === 'context') {
        generateShuffledIndices();
      }
    } else {
      currentTrackIndex = (currentTrackIndex + 1) % WORKOUT_PLAYLIST.length;
    }
    
    currentProgress = 0;
    await playTrack(token);
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

export async function skipToPrevious(token: string) {
  if (token.startsWith("DEMO_TOKEN_")) {
    if (isShuffleEnabled) {
      shufflePosition = shufflePosition === 0 
        ? shuffledIndices.length - 1 
        : shufflePosition - 1;
      currentTrackIndex = shuffledIndices[shufflePosition];
    } else {
      currentTrackIndex =
        currentTrackIndex === 0
          ? WORKOUT_PLAYLIST.length - 1
          : currentTrackIndex - 1;
    }
    
    currentProgress = 0;
    await playTrack(token);
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

export const getIsDemoMode = () => isDemoMode;
export const getDemoPlaylist = () => WORKOUT_PLAYLIST;
export const getShuffleState = () => isShuffleEnabled;
export const getRepeatMode = () => repeatMode;
