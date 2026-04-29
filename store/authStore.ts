import { create } from 'zustand';
import { storage } from '@/utils/storage';
import { api, setAuthToken, initAuthToken } from '@/api/client';

interface User {
  id: number;
  email: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const TOKEN_KEY = 'auth_token';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      // Сначала устанавливаем токен в API
      setAuthToken(access_token);
      // Затем сохраняем в storage
      await storage.setItem(TOKEN_KEY, access_token);
      
      set({
        token: access_token,
        user,
        isAuthenticated: true,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Ошибка входа');
    }
  },

  register: async (email: string, password: string, confirmPassword: string) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        confirm_password: confirmPassword,
      });
      const { access_token, user } = response.data;
      
      // Сначала устанавливаем токен в API
      setAuthToken(access_token);
      // Затем сохраняем в storage
      await storage.setItem(TOKEN_KEY, access_token);
      
      set({
        token: access_token,
        user,
        isAuthenticated: true,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Ошибка регистрации');
    }
  },

  logout: async () => {
    setAuthToken(null);
    await storage.removeItem(TOKEN_KEY);
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },

  checkAuth: async () => {
    try {
      // Инициализируем токен из storage
      const token = await initAuthToken();
      if (token) {
        // Проверяем токен через /me
        const response = await api.get('/auth/me');
        set({
          token,
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      setAuthToken(null);
      await storage.removeItem(TOKEN_KEY);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

