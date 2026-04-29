import axios from 'axios';
import Constants from 'expo-constants';
import { storage } from '@/utils/storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl || 'http://127.0.0.1:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Функция для установки токена
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Функция для инициализации токена из storage
export const initAuthToken = async () => {
  try {
    const token = await storage.getItem('auth_token');
    if (token) {
      setAuthToken(token);
      return token;
    }
  } catch (error) {
    console.error('Error getting token:', error);
  }
  return null;
};

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Токен истек или невалиден
      await storage.removeItem('auth_token');
      setAuthToken(null);
    }
    return Promise.reject(error);
  }
);

