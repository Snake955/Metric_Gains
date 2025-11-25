import 'dotenv/config';

export default {
  expo: {
    name: "Metric_Gains",
    slug: "Metric_Gains",
    version: "0.1.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "metricgains",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.metricgains.app",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }
    },
    android: {
      package: "com.metricgains.app", 
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      "expo-web-browser",
      "react-native-app-auth",
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      spotifyClientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID,
      spotifyClientSecret: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET
    }
  }
};
