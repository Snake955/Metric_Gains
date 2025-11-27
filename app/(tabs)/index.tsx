import SpotifyLogo from "@/assets/images/spotify-blue.png";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentlyPlaying, getStoredSpotifyToken, pausePlayback, playTrack, resumePlayback, skipToNext, skipToPrevious } from "../utils/spotifyAuth";


import { onAuthStateChanged, User } from "firebase/auth";
import { FIREBASE_AUTH } from "../../FirebaseConfig";

export default function HomeScreen() {
const [displayName, setDisplayName] = useState<string | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isUpdatingRef = useRef(false);

const initSpotify = useCallback(async () => {
  const token = await getStoredSpotifyToken();
  setSpotifyToken(token);

  if (token) {
    const track = await getCurrentlyPlaying(token);
    if (track) {
      setCurrentTrack(track);
      setIsPlaying(track.is_playing);
    } else {
      await playTrack(token);
      setTimeout(async () => {
        const newTrack = await getCurrentlyPlaying(token);
        if (newTrack) {
          setCurrentTrack(newTrack);
          setIsPlaying(newTrack.is_playing);
        }
      }, 1000);
    }
  }
}, []);



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user: User | null) => {
      if (user) {
        let name = user.displayName ?? null; //get displayname from metric gain firebase
        setDisplayName(name ?? "User"); //display name user if no name found
      } else {
        setDisplayName(null); //No user is logged inn also displays no name then
      }
    });
    return unsubscribe; //removes text if user logs out and into new user 
  }, []);

  useFocusEffect(
    useCallback(() => {
      initSpotify();
    }, [initSpotify])
  );

  useEffect(() => {
    initSpotify();
  }, [initSpotify]);

  const fetchCurrentTrack = async (token: string) => {
    if (isUpdatingRef.current) return;

    const track = await getCurrentlyPlaying(token);
    if (track && track.item) {
      setCurrentTrack(track);
    }
  };

  useEffect(() => {
    if (!spotifyToken) return;

    const interval = setInterval(() => {
      fetchCurrentTrack(spotifyToken);
    }, 2000);

    return () => clearInterval(interval);
  }, [spotifyToken]);

  const handlePlayPause = async () => {
    if (!spotifyToken) return;

    isUpdatingRef.current = true;
    const newPlayState = !isPlaying;

    try {
      setIsPlaying(newPlayState);

      if (newPlayState) {
        if (currentTrack) {
          await resumePlayback(spotifyToken);
        } else {
          await playTrack(spotifyToken);
        }
      } else {
        await pausePlayback(spotifyToken);
      }

      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 3000);
    } catch (error) {
      console.error("Play/Pause error:", error);
      setIsPlaying(!newPlayState);
      isUpdatingRef.current = false;
    }
  };

  const handleSkipNext = async () => {
    if (!spotifyToken) return;

    isUpdatingRef.current = true;

    try {
      await skipToNext(spotifyToken);

      setTimeout(async () => {
        const track = await getCurrentlyPlaying(spotifyToken);
        if (track) {
          setCurrentTrack(track);
          setIsPlaying(track.is_playing);
        }
        isUpdatingRef.current = false;
      }, 500);
    } catch (error) {
      console.error("Skip next error:", error);
      isUpdatingRef.current = false;
    }
  };

  const handleSkipPrevious = async () => {
    if (!spotifyToken) return;

    isUpdatingRef.current = true;

    try {
      await skipToPrevious(spotifyToken);

      setTimeout(async () => {
        const track = await getCurrentlyPlaying(spotifyToken);
        if (track) {
          setCurrentTrack(track);
          setIsPlaying(track.is_playing);
        }
        isUpdatingRef.current = false;
      }, 500);
    } catch (error) {
      console.error("Skip previous error:", error);
      isUpdatingRef.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.greyDate}>{new Date().toLocaleDateString("no-NO",
          {
          weekday: "long",
          day: "numeric",
          month: "long",})}
          </ThemedText>
          <IconSymbol name="bell.fill" size={24} color="#3f3f3fff" />
        </View>
        {/* This part will be changed later so that instead of Erik it will take the assigned user's name */}
        <ThemedText type="default">
          Good Morning{displayName ? `, ${displayName}!` : "!"}
        </ThemedText>

        <ThemedText style={styles.topbar_index}>
          You are on a <ThemedText type="title" style={styles.blue}>2x week</ThemedText> streak!
        </ThemedText>
            
      {/* Activity */}
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Today´s activity
      </ThemedText>
      <View style={styles.activityRow}>
        <ThemedView style={styles.activityCard}>
          <Progress.Circle
            size={100}
            progress={6742 / 10000}
            thickness={8}
            color="#2D7FF9"
            showsText={false}
          />
          
          <ThemedText type="defaultSemiBold">6742 steps</ThemedText>
          <ThemedText type="default">10,000 goal</ThemedText>
        </ThemedView>
        </View>

        <View style={styles.body}>
          <View style={styles.activityRow}>
            <ThemedView style={styles.activityCard}>
              <Progress.Circle
                size={100}
                progress={6742 / 10000}
                thickness={8}
                color="#2D7FF9"
                showsText={false}
              />
              <ThemedText type="defaultSemiBold">6742 steps</ThemedText>
              <ThemedText type="default">10,000 goal</ThemedText>
            </ThemedView>

            <ThemedView style={styles.activityCard}>
              <Progress.Circle
                size={100}
                progress={240 / 500}
                thickness={8}
                color="#2D7FF9"
                showsText={false}
              />
              <ThemedText type="defaultSemiBold">240 kcal</ThemedText>
              <ThemedText type="default">500 goal</ThemedText>
            </ThemedView>
          </View>

          {/* Last Workout */}
          <ThemedView style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <ThemedText type="defaultSemiBold">Last workout</ThemedText>
              <ThemedText type="default">Friday, 12 Sept - 18:30</ThemedText>
            </View>
            <ThemedText>Category: Strength</ThemedText>
            <ThemedText>Duration: 1h 32min</ThemedText>
            <ThemedText>Calories burned: 420 kcal</ThemedText>
            <ThemedText>Exercises: 8</ThemedText>
            <ThemedText>Focus: Upper body</ThemedText>
          </ThemedView>
        </View>
      {/* Music Player */}
      {spotifyToken && currentTrack ? (
        <ThemedView style={styles.playerCard}>
          {currentTrack.item?.album?.images?.[0]?.url && (
            <View style={styles.albumContainer}>
              <Image
                source={{ uri: currentTrack.item.album.images[0].url }}
                style={styles.albumArt}
              />
              <ThemedText type="defaultSemiBold" style={styles.trackName}>
                {currentTrack.item?.name || "No track"}
              </ThemedText>
              <ThemedText style={styles.artistName}>
                {currentTrack.item?.artists?.[0]?.name || "Unknown"}
              </ThemedText>
            </View>
          )}

          <View style={styles.musicControls}>
            <TouchableOpacity
              onPress={handleSkipPrevious}
              style={styles.controlButton}
              activeOpacity={0.7}
            >
              <IconSymbol name="backward.fill" size={32} color="#2D7FF9" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.playButton}
              activeOpacity={0.7}
            >
              <IconSymbol
                name={isPlaying ? "pause.circle.fill" : "play.circle.fill"}
                size={72}
                color="#2D7FF9"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkipNext}
              style={styles.controlButton}
              activeOpacity={0.7}
            >
              <IconSymbol name="forward.fill" size={32} color="#2D7FF9" />
            </TouchableOpacity>
          </View>
        </ThemedView>
      ) : (
        <View style={styles.placeholderContainer}>
          <ThemedText style={styles.placeholderText}>
            Connect Spotify in Settings
          </ThemedText>
        </View>
      )}

      {/* Spotify Branding */}
      <View style={styles.spotifyRow}>
        <ThemedText style={styles.spotifyText}>Spotify®</ThemedText>
        <Image
          source={SpotifyLogo}
          style={styles.spotifyIcon}
          resizeMode="contain"
        />
      </View>
    </ScrollView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },

  container: {
    flex: 1,
    paddingHorizontal: 5,
    paddingTop: 10,
  },
  greyDate: {
    color: "#888",
    fontSize: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  body: {
    paddingHorizontal: 15,
  },

  topbar_index: {
    fontSize: 22,
    paddingTop: 10,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  blue: {
    color: "#2D7FF9",
    fontWeight: "600",
    fontSize: 22,
  },
  sectionTitle: {
    marginVertical: 15,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  activityCard: {
    flex: 1,
    padding: 15,
    margin: 5,
    borderRadius: 12,
    alignItems: "center",
  },
  workoutCard: {
    padding: 15,
    marginVertical: 20,
    borderRadius: 12,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  playerCard: {
    padding: 20,
    marginVertical: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  albumContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  albumArt: {
    width: 220,
    height: 220,
    borderRadius: 16,
    marginBottom: 16,
  },
  trackName: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  artistName: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  musicControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    marginTop: 10,
  },
  controlButton: {
    padding: 12,
    backgroundColor: "rgba(45, 127, 249, 0.1)",
    borderRadius: 50,
  },
  playButton: {
    padding: 8,
  },
  placeholderContainer: {
    padding: 30,
    alignItems: "center",
    marginVertical: 20,
  },
  placeholderText: {
    textAlign: "center",
    fontSize: 14,
    color: "#000000ff",
  },
  spotifyRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  spotifyText: {
    textAlign: "center",
    fontSize: 12,
    marginRight: 5,
  },
  spotifyIcon: {
    width: 16,
    height: 16,
  }
});