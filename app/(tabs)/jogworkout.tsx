import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';

type Coord = { latitude: number; longitude: number; timestamp: number };

export default function JogWorkoutFullScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [path, setPath] = useState<Coord[]>([]);
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [steps, setSteps] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [tempC, setTempC] = useState<number | null>(null);
  const [weatherIcon, setWeatherIcon] = useState('🌤️');

  const [isRunning, setIsRunning] = useState(false); // ← NY

  const locSubscription = useRef<Location.LocationSubscription | null>(null);
  const pedSub = useRef<any>(null);

  // ---------------------------------------------
  // Distance math
  // ---------------------------------------------
  const haversine = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const aa = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  };

  // ---------------------------------------------
  // Weather from open-meteo
  // ---------------------------------------------
  async function fetchTemperature(lat: number, lon: number) {
    try {
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
      );
      const j = await r.json();
      if (j?.current_weather?.temperature !== undefined) setTempC(j.current_weather.temperature);

      const code = j?.current_weather?.weathercode;
      if (code !== undefined) {
        if ([0, 1].includes(code)) setWeatherIcon('☀️');
        else if ([2, 3].includes(code)) setWeatherIcon('⛅');
        else if ([61, 63, 65].includes(code)) setWeatherIcon('🌧️');
        else if ([71, 73, 75].includes(code)) setWeatherIcon('❄️');
        else setWeatherIcon('🌤️');
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // ---------------------------------------------
  // Startup
  // ---------------------------------------------
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const last = await Location.getLastKnownPositionAsync({});
      if (last) {
        setRegion({
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    })();
  }, []);

  // ---------------------------------------------
  // LOCATION + STEPS subscription
  // ---------------------------------------------
  useEffect(() => {
    if (!isRunning) return;

    (async () => {
      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, timeInterval: 1000, distanceInterval: 1 },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          const next = { latitude, longitude, timestamp: loc.timestamp };

          setPath((p) => {
            const updated = [...p, next];
            if (p.length > 0) {
              const seg = haversine(p[p.length - 1], next);
              const dt = (next.timestamp - p[p.length - 1].timestamp) / 1000;
              setSpeed(dt > 0 ? seg / dt : 0);
              setDistanceMeters((d) => d + seg);
            }
            return updated;
          });

          setRegion((r) =>
            r
              ? { ...r, latitude, longitude }
              : { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
          );

          fetchTemperature(latitude, longitude);
        }
      );

      locSubscription.current = sub;

      Pedometer.isAvailableAsync().then((avail) => {
        if (avail) pedSub.current = Pedometer.watchStepCount((res) => setSteps(res.steps));
      });
    })();

    return () => {
      locSubscription.current?.remove();
      pedSub.current?.remove();
    };
  }, [isRunning]);

  // ---------------------------------------------
  // Toggle workout
  // ---------------------------------------------
  function toggleWorkout() {
    if (isRunning) {
      // STOPPER
      locSubscription.current?.remove();
      pedSub.current?.remove();
      locSubscription.current = null;
      pedSub.current = null;
      setIsRunning(false);
    } else {
      // STARTER IGJEN
      setPath([]);
      setDistanceMeters(0);
      setSteps(0);
      setSpeed(0);
      setIsRunning(true);
    }
  }

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#e5e5e5" />

      {region && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          showsUserLocation
          followsUserLocation
        >
          {path.length > 0 && (
            <Polyline coordinates={path} strokeWidth={6} strokeColor={'rgba(54,150,255,0.9)'} />
          )}
          {path.length > 0 && <Marker coordinate={path[path.length - 1]} title="Løp !" />}
        </MapView>
      )}

      {/* TOP OVERLAY */}
      <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent']} style={styles.topOverlay}>
        <Text style={styles.title}>Workout i gang</Text>

        <View style={styles.topStats}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(59,130,246,0.8)' }]}>
            <Text style={styles.statLabel}>Distanse</Text>
            <Text style={styles.statValue}>{Math.round(distanceMeters)} m</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(245,158,11,0.8)' }]}>
            <Text style={styles.statLabel}>Steg</Text>
            <Text style={styles.statValue}>{steps}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* BOTTOM OVERLAY */}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.bottomOverlay}>
        <View style={styles.bottomStats}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(239,68,68,0.8)' }]}>
            <Text style={styles.statLabel}>{weatherIcon}</Text>
            <Text style={styles.statValue}>{tempC !== null ? `${tempC}°C` : '—'}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: 'rgba(16,185,129,0.8)' }]}>
            <Text style={styles.statLabel}>Hastighet</Text>
            <Text style={styles.statValue}>{speed.toFixed(2)} m/s</Text>
          </View>
        </View>

        {/* START / STOP BUTTON */}
        <TouchableOpacity
          onPress={toggleWorkout}
          style={[
            styles.button,
            { backgroundColor: isRunning ? '#ef4444' : '#3b82f6' }, // rød / blå
          ]}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Start workout' : 'Stopp workout'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ---------------------------------------------
// STYLES
// ---------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e5e5e5' },
  map: { flex: 1 },

  topOverlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    paddingHorizontal: 10,
    paddingTop: 50,
    paddingBottom: 100,
  },

  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 140,
    alignItems: 'center',
  },

  title: {
    color: '#e5e5e5',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },

  topStats: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  bottomStats: {
    position: 'absolute',
    bottom: 170, // ← flyttet opp
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  statCard: {
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 70,
  },

  statLabel: { color: '#fff', fontSize: 12, fontWeight: '500' },
  statValue: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 4 },

  button: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 40,
    marginBottom: -20,
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
