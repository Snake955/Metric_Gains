import AsyncStorage from '@react-native-async-storage/async-storage';
import { authorize, refresh } from 'react-native-app-auth';

export const spotifyConfig = {
  clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '',
  clientSecret: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET || '',
  redirectUrl: 'exp://192.168.0.84:8081',
  scopes: [ 'user-read-email',
    'playlist-read-private',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',],
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
  },
};

export async function loginToSpotify() {
    try {
        const result = await authorize(spotifyConfig);
        await AsyncStorage.setItem('spotifyAccessToken', result.accessToken);
        await AsyncStorage.setItem('spotifyRefreshToken', result.refreshToken || '');

        console.log('Spotify login successful');
        return result;
    } catch (error) {
        console.error('Error during Spotify login', error);
    }

}

export async function getStoredSpotifyToken() {
  const token = await AsyncStorage.getItem('spotifyAccessToken');
  return token;
}

export async function refreshSpotifyToken() {
  const refreshToken = await AsyncStorage.getItem('spotifyRefreshToken');
  if (!refreshToken) return null;

  try {
    const result = await refresh(spotifyConfig, { refreshToken });
    await AsyncStorage.setItem('spotifyAccessToken', result.accessToken);
    console.log('Token refreshed');
    return result;
  } catch (error) {
    console.error('Token refresh error:', error);
  }
}



