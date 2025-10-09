import AsyncStorage from '@react-native-async-storage/async-storage';
import { authorize, refresh } from 'react-native-app-auth';

const Config = {
  clientId: 'e716b7afacd54a93940cb4c88f6bafd8',
  clientSecret: '781319718e014ebfa27d7370a4efb939',
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
        const result = await authorize(Config);
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
    const result = await refresh(Config, { refreshToken });
    await AsyncStorage.setItem('spotifyAccessToken', result.accessToken);
    console.log('Token refreshed');
    return result;
  } catch (error) {
    console.error('Token refresh error:', error);
  }
}



