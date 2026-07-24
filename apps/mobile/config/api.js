import Constants from 'expo-constants';

const fallbackBaseUrl = 'http://10.216.83.100:4000';

const getApiBaseUrl = () => {
  const fromExtra = Constants.expoConfig?.extra?.apiUrl;
  const fromEnv = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;
  const rawValue = fromExtra || fromEnv || fallbackBaseUrl;
  return rawValue.replace(/\/$/, '');
};

export const API_BASE_URL = getApiBaseUrl();

export const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
