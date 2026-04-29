import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => Promise<void>;
  initTheme: () => Promise<void>;
}

const THEME_KEY = 'app_theme';

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',

  initTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        set({ theme: savedTheme });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  },

  toggleTheme: async () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_KEY, newTheme);
      return { theme: newTheme };
    });
  },
}));

