import SpotifyLogo from "@/assets/images/spotify-blue.png";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Slider from '@react-native-community/slider';
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";
import { SafeAreaView } from "react-native-safe-area-context";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { getCurrentlyPlaying, getRepeatMode, getShuffleState, getStoredSpotifyToken, pausePlayback, playTrack, resumePlayback, seekToPosition, skipToNext, skipToPrevious, toggleRepeat, toggleShuffle } from "../utils/spotifyAuth";

export default function HomeScreen() {
const [displayName, setDisplayName] = useState<string | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'context' | 'track'>('off');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const isUpdatingRef = useRef(false);
  const lastFetchTime = useRef(Date.now());

const initSpotify = useCallback(async () => {
  const token = await getStoredSpotifyToken();
  setSpotifyToken(token);

  if (token) {
    const track = await getCurrentlyPlaying(token);
    if (track) {
      setCurrentTrack(track);
      setIsPlaying(track.is_playing);
      setProgress(track.progress_ms || 0);
      setDuration(track.item?.duration_ms || 0);
      lastFetchTime.current = Date.now();
    } else {
      await playTrack(token);
      setTimeout(async () => {
        const newTrack = await getCurrentlyPlaying(token);
        if (newTrack) {
          setCurrentTrack(newTrack);
          setIsPlaying(newTrack.is_playing);
          setProgress(newTrack.progress_ms || 0);
          setDuration(newTrack.item?.duration_ms || 0);
          lastFetchTime.current = Date.now();
        }
      }, 1000);
    }
    
    setIsShuffled(getShuffleState());
    setRepeatMode(getRepeatMode());
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
    if (isUpdatingRef.current || isSeeking) return;

    const track = await getCurrentlyPlaying(token);
    if (track && track.item) {
      setCurrentTrack(track);
      setProgress(track.progress_ms || 0);
      setDuration(track.item.duration_ms || 0);
      lastFetchTime.current = Date.now();
    }
  };

  // Smooth progress update every 100ms
  useEffect(() => {
    if (!isPlaying || isSeeking) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100;
        return newProgress < duration ? newProgress : prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, duration, isSeeking]);

  useEffect(() => {
    if (!spotifyToken) return;

    const interval = setInterval(() => {
      fetchCurrentTrack(spotifyToken);
    }, 5000);

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
          setProgress(track.progress_ms || 0);
          setDuration(track.item?.duration_ms || 0);
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
          setProgress(track.progress_ms || 0);
          setDuration(track.item?.duration_ms || 0);
        }
        isUpdatingRef.current = false;
      }, 500);
    } catch (error) {
      console.error("Skip previous error:", error);
      isUpdatingRef.current = false;
    }
  };

  const handleShuffle = async () => {
    if (!spotifyToken) return;
    const newState = await toggleShuffle(spotifyToken);
    setIsShuffled(newState);
  };

  const handleRepeat = async () => {
    if (!spotifyToken) return;
    const newMode = await toggleRepeat(spotifyToken);
    setRepeatMode(newMode);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekComplete = async (value: number) => {
    if (!spotifyToken) return;
    
    const seekPosition = Math.floor(value);
    setProgress(seekPosition);
    await seekToPosition(spotifyToken, seekPosition);
    
    setTimeout(() => {
      setIsSeeking(false);
    }, 500);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
        <View style={styles.playerContainer}>
          <LinearGradient
            colors={['#00000040', '#00000026']}
            style={styles.playerCard}
          >
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
                <IconSymbol name="backward.fill" size={32} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.playButton}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name={isPlaying ? "pause.circle.fill" : "play.circle.fill"}
                  size={72}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSkipNext}
                style={styles.controlButton}
              >
                <IconSymbol name="forward.fill" size={32} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
              <ThemedText style={styles.timeText}>{formatTime(progress)}</ThemedText>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration}
                value={progress}
                onValueChange={setProgress}
                onSlidingStart={handleSeekStart}
                onSlidingComplete={handleSeekComplete}
                minimumTrackTintColor="#fff"
                maximumTrackTintColor="#ffffff33"
                thumbTintColor="#fff"
              />
              <ThemedText style={styles.timeText}>{formatTime(duration)}</ThemedText>
            </View>

            <View style={styles.secondaryControls}>
              <TouchableOpacity
                onPress={handleShuffle}
                style={[styles.secondaryButton, isShuffled && styles.secondaryButtonActive]}
                activeOpacity={0.7}
              >
                <IconSymbol name="shuffle" size={20} color={isShuffled ? "#2D7FF9" : "#fff"} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRepeat}
                style={[styles.secondaryButton, repeatMode !== 'off' && styles.secondaryButtonActive]}
                activeOpacity={0.7}
              >
                <IconSymbol 
                  name={repeatMode === 'track' ? "repeat.1" : "repeat"} 
                  size={20} 
                  color={repeatMode !== 'off' ? "#2D7FF9" : "#fff"} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.spotifyRow}>
              <Image
                source={SpotifyLogo}
                style={styles.spotifyIcon}
                resizeMode="contain"
              />
            </View>
          </LinearGradient>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <ThemedText style={styles.placeholderText}>
            Connect Spotify in Settings
          </ThemedText>
        </View>
      )}
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
  scrollContent: {
    paddingBottom: 100,
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
  playerContainer: {
    marginVertical: 20,
    marginHorizontal: 10,
  },
  playerCard: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#0000004d',
    backdropFilter: 'blur(20px)',
    shadowColor: '#000000ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
    alignItems: "center",
  },
  albumContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  albumArt: {
    width: 250,
    height: 250,
    borderRadius: 28,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#ffffff33',
  },
  trackName: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    color: '#fff',
    textShadowColor: '#000000b3',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  artistName: {
    fontSize: 18,
    color: "#ffffffcc",
    textAlign: "center",
    fontWeight: "700",
    textShadowColor: '#000000b3',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  musicControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 50,
    marginTop: 24,
    marginBottom: 20,
  },
  controlButton: {
    padding: 20,
    backgroundColor: "#ffffff33",
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#ffffff4d",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  playButton: {
    padding: 8,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    fontSize: 12,
    color: '#ffffffcc',
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  secondaryControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 80,
    marginTop: 16,
    marginBottom: 20,
  },
  secondaryButton: {
    padding: 12,
    backgroundColor: "#ffffff20",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#ffffff33",
  },
  secondaryButtonActive: {
    backgroundColor: "#ffffff40",
    borderColor: "#2D7FF966",
  },
  spotifyRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  spotifyIcon: {
    width: 50,
    height: 50,
  },
    padding: 30,
    alignItems: "center",
    marginVertical: 20,
  },
  placeholderText: {
    textAlign: "center",
    fontSize: 14,
    color: "#888",
  },
});
