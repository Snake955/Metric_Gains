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

const WORKOUT_PLAYLIST = [
  {
    name: "Runaway",
    artists: [{ name: "Kanye West" }],
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
    name: "What Did I Miss",
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
    artists: [{ name: "Young Thug" }],
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
    name: "Ima Boss",
    artists: [{ name: "Meek Mill" }],
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
    name: "Hustlers Ambition",
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
    artists: [{ name: "Rowdy Rebel" }],
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

let sound: Audio.Sound | null = null;
let currentTrackIndex = 0;
let isPlaying = false;
let currentProgress = 0;
let isLoadingSound = false;

Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
  shouldDuckAndroid: true,
});

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