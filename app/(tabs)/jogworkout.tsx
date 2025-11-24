import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';

type Coord = { latitude: number; longitude: number; timestamp: number };

export default function JogWorkoutFullScreen() {
  const [path, setPath] = useState<Coord[]>([]);
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [steps, setSteps] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [tempC, setTempC] = useState<number | null>(null);
  const [weatherIcon, setWeatherIcon] = useState<string>('🌤️');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [initialRegion, setInitialRegion] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showRecenterButton, setShowRecenterButton] = useState(false);
  const [compassRotation, setCompassRotation] = useState(0);

  const mapRef = useRef<MapView>(null);
  const locSubscription = useRef<Location.LocationSubscription | null>(null);
  const pedSub = useRef<any>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const userHasInteracted = useRef(false);
  const isAnimating = useRef(false);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isLocationVisible = (userLoc: { latitude: number; longitude: number }, region: Region) => {
    const latDelta = region.latitudeDelta;
    const lonDelta = region.longitudeDelta;
    return (
      userLoc.latitude >= region.latitude - latDelta / 2 &&
      userLoc.latitude <= region.latitude + latDelta / 2 &&
      userLoc.longitude >= region.longitude - lonDelta / 2 &&
      userLoc.longitude <= region.longitude + lonDelta / 2
    );
  };

  const calculateBearing = (from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) => {
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const toDeg = (rad: number) => rad * (180 / Math.PI);
    
    const lat1 = toRad(from.latitude);
    const lat2 = toRad(to.latitude);
    const dLon = toRad(to.longitude - from.longitude);
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  };

  async function fetchTemperature(lat: number, lon: number) {
    try {
      const response = await fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'MetricGains/1.0 (workout-app)',
          },
        }
      );
      
      const data = await response.json();
      const timeseries = data?.properties?.timeseries;
      
      if (timeseries && timeseries.length > 0) {
        const current = timeseries[0].data.instant.details;
        const nextHour = timeseries[0].data.next_1_hours;

        if (current?.air_temperature !== undefined) {
          setTempC(Math.round(current.air_temperature));
        }
        const symbolCode = nextHour?.summary?.symbol_code || 'clearsky_day';
        
        if (symbolCode.includes('clearsky')) setWeatherIcon('☀️');
        else if (symbolCode.includes('fair')) setWeatherIcon('🌤️');
        else if (symbolCode.includes('partlycloudy')) setWeatherIcon('⛅');
        else if (symbolCode.includes('cloudy')) setWeatherIcon('☁️');
        else if (symbolCode.includes('fog')) setWeatherIcon('🌫️');
        else if (symbolCode.includes('lightrain')) setWeatherIcon('🌦️');
        else if (symbolCode.includes('rain')) setWeatherIcon('🌧️');
        else if (symbolCode.includes('sleet')) setWeatherIcon('🌨️');
        else if (symbolCode.includes('snow')) setWeatherIcon('❄️');
        else if (symbolCode.includes('thunder')) setWeatherIcon('⛈️');
        else setWeatherIcon('🌤️');
      }
    } catch (e) {
      console.warn('Yr.no API error:', e);
      try {
        const r = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
        );
        const j = await r.json();
        if (j?.current_weather?.temperature !== undefined) {
          setTempC(Math.round(j.current_weather.temperature));
        }
      } catch (fallbackError) {
        console.warn('Fallback weather API also failed');
      }
    }
  }

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const last = await Location.getLastKnownPositionAsync({});
      if (last) {
        setInitialRegion({
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setCurrentLocation({
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerInterval.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
      }
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (!isRunning || isPaused) return;

    let subscription: any;

    (async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        if (!isAvailable) {
          console.warn('Stepcounter not available on this device');
          Alert.alert(
            'Steg-telling ikke tilgjengelig',
            'Steg-telling er ikke støttet på denne enheten.',
            [{ text: 'OK' }]
          );
          return;
        }
        try {
          const permissionResponse = await Pedometer.requestPermissionsAsync();
          if (permissionResponse.status === 'denied') {
            Alert.alert(
              'Tillatelse for steg-telling nektet',
              'For å måle steg, gå til Innstillinger og gi appen tilgang til bevegelsesdata.\n(Expo Go støtter ikke dette)',
              [{ text: 'OK' }]
            );
            return;
          }
        } catch (permError) {
          console.log('Permission request not supported due to Expo Go limitations.');
        }
        subscription = Pedometer.watchStepCount((result) => {
          setSteps((prev) => prev + result.steps);
        });
      } catch (error) {
        Alert.alert('Feil med stegteller', 'Kunne ikke starte stegtelling.', [{ text: 'OK' }]);
      }
    })();
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (!isRunning || isPaused) return;
    (async () => {
      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, timeInterval: 1000, distanceInterval: 1 },
        (loc) => {
          const { latitude, longitude } = loc.coords;
          const next = { latitude, longitude, timestamp: loc.timestamp };
          
          setCurrentLocation({ latitude, longitude });
          
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

          if (!userHasInteracted.current && mapRef.current) {
            isAnimating.current = true;
            mapRef.current.animateCamera({
              center: { latitude, longitude },
              zoom: 17,
            }, { duration: 500 });
            
            setTimeout(() => {
              isAnimating.current = false;
            }, 600);
          }

          fetchTemperature(latitude, longitude);
        }
      );
      locSubscription.current = sub;
    })();
    return () => {
      locSubscription.current?.remove();
    };
  }, [isRunning, isPaused]);

  function toggleWorkout() {
    if (isRunning) {
      locSubscription.current?.remove();
      pedSub.current?.remove();
      locSubscription.current = null;
      pedSub.current = null;
      setIsRunning(false);
      setIsPaused(false);
      setDistanceMeters(0);
      setSteps(0);
      setSpeed(0);
      setElapsedSeconds(0);
      setShowRecenterButton(false);
    } else {
      setPath([]);
      setDistanceMeters(0);
      setSteps(0);
      setSpeed(0);
      setElapsedSeconds(0);
      setIsRunning(true);
      setIsPaused(false);
      userHasInteracted.current = false;
      setShowRecenterButton(false);
    }
  }

  function togglePause() {
    setIsPaused((prev) => !prev);
  }

  const handleRegionChangeComplete = (region: Region) => {
    if (isAnimating.current) {
      return;
    }

    if (isRunning && currentLocation) {
      const visible = isLocationVisible(currentLocation, region);
      setShowRecenterButton(!visible);
      
      if (!visible) {
        const bearing = calculateBearing(
          { latitude: region.latitude, longitude: region.longitude },
          currentLocation
        );
        setCompassRotation(bearing);
        userHasInteracted.current = true;
      }
    }
  };

  const recenterToLocation = () => {
    if (currentLocation && mapRef.current) {
      isAnimating.current = true;
      mapRef.current.animateCamera({
        center: currentLocation,
        zoom: 17,
      }, { duration: 800 });
      
      setTimeout(() => {
        isAnimating.current = false;
        userHasInteracted.current = false;
        setShowRecenterButton(false);
      }, 900);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {initialRegion && (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          userInterfaceStyle="light"
          loadingEnabled
          onRegionChangeComplete={handleRegionChangeComplete}
        >
          {path.length > 1 && (
            <Polyline coordinates={path} strokeColor="#2D7FF9" strokeWidth={6} />
          )}
          {path.length > 0 && (
            <Marker coordinate={path[0]} title="Start" pinColor="#2D7FF9" />
          )}
          {path.length > 1 && (
            <Marker coordinate={path[path.length - 1]} title="LØP DA!!!" pinColor="#FF4747" />
          )}
        </MapView>
      )}

      {showRecenterButton && isRunning && (
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={recenterToLocation}
          activeOpacity={0.8}
        >
          <View style={[styles.recenterCircle, { transform: [{ rotate: `${compassRotation}deg` }] }]}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.logoIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.topOverlay}>
        <LinearGradient colors={['#ffffff40', '#ffffff1a']} style={styles.glassCard}>
          <Text style={styles.title}>WORKOUT I GANG</Text>
          <View style={styles.timerContainer}>
            <Text style={styles.timer}>{formatTime(elapsedSeconds)}</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.topStats}>
        <View style={styles.glassStatCard}>
          <Text style={styles.statLabel}>Distanse</Text>
          <Text style={[styles.statValue, styles.statValueBlue]}>{Math.round(distanceMeters)} m</Text>
        </View>
        <View style={styles.glassStatCard}>
          <Text style={styles.statLabel}>Steg</Text>
          <Text style={[styles.statValue, styles.statValueOrange]}>{steps}</Text>
        </View>
      </View>

      <View style={styles.bottomStats}>
        <View style={styles.glassStatCard}>
          <Text style={styles.statLabel}>{weatherIcon}</Text>
          <Text style={[styles.statValue, styles.statValueRed]}>{tempC !== null ? `${tempC}°C` : '—'}</Text>
        </View>
        <View style={styles.glassStatCard}>
          <Text style={styles.statLabel}>Hastighet</Text>
          <Text style={[styles.statValue, styles.statValueGreen]}>{speed.toFixed(2)} m/s</Text>
        </View>
      </View>

      <View style={styles.bottomOverlay}>
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={toggleWorkout}>
            <View style={[styles.glassButton, isRunning && styles.glassButtonRed]}>
              <Text style={styles.buttonText}>
                {isRunning ? 'STOPP WORKOUT' : 'START WORKOUT'}
              </Text>
            </View>
          </TouchableOpacity>

          {isRunning && (
            <TouchableOpacity onPress={togglePause} style={styles.pauseBtn}>
              <View style={[styles.glassPauseCircle, isPaused && styles.glassPauseGreen]}>
                {isPaused ? (
                  <View style={styles.playIcon} />
                ) : (
                  <View style={styles.pauseIconBars}>
                    <View style={styles.pauseBar} />
                    <View style={styles.pauseBar} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e5e5e5' },
  map: { flex: 1 },
  topOverlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 50,
    alignItems: 'center',
  },
  glassCard: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#0000004d',
    backgroundColor: '#00000026',
    backdropFilter: 'blur(20px)',
    shadowColor: '#000000ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    alignItems: 'center',
    minWidth: 280,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 120,
    alignItems: 'center',
  },
  title: {
    color: '#FFF2AF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
    textShadowColor: '#000000b3',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  timerContainer: {
    backgroundColor: '#ffffff33',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffffff66',
  },
  timer: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: '#00000080',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  topStats: {
    position: 'absolute',
    top: 230,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  bottomStats: {
    position: 'absolute',
    bottom: 170,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  glassStatCard: {
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 90,
    backgroundColor: '#00000033',
    borderWidth: 1,
    borderColor: '#0000004d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textShadowColor: '#000000b3',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
    textShadowColor: '#000000cc',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  statValueBlue: { color: '#b9e5ffff' },
  statValueOrange: { color: '#ffe0b1ff' },
  statValueRed: { color: '#ffcdcdff' },
  statValueGreen: { color: '#b4f4cbff' },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  glassButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 24,
    marginTop: 40,
    marginBottom: -20,
    backgroundColor: '#1a68d64d',
    borderWidth: 1.5,
    borderColor: '#0000004d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  glassButtonRed: {
    backgroundColor: '#ff00004d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: '#00000066',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  pauseBtn: {
    marginTop: 40,
    marginBottom: -20,
  },
  glassPauseCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5b7cd761',
    borderWidth: 1.5,
    borderColor: '#0000004d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  glassPauseGreen: {
    backgroundColor: '#39b52066',
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderRightWidth: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: '#fff',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 4,
  },
  pauseIconBars: {
    flexDirection: 'row',
    gap: 6,
  },
  pauseBar: {
    width: 5,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 320,
    right: 20,
    zIndex: 1000,
  },
  recenterCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00000033',
    borderWidth: 1.5,
    borderColor: '#0000004d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#bdbcbcff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  logoIcon: {
    width: 40,
    height: 40,
  },
});
