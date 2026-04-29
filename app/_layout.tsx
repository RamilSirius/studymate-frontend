import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { StatusBar } from 'expo-status-bar';
import { requestPermissions } from '@/services/notifications';
import '../global.css';
import { useColorScheme } from 'nativewind';

// Полифилл для веб-платформы
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  // @ts-ignore
  if (!window._expoModulesCore) {
    // @ts-ignore
    window._expoModulesCore = {
      registerWebModule: () => {},
    };
  }
}

export default function RootLayout() {
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();
  const { initTheme, theme } = useThemeStore();
  const segments = useSegments();
  const router = useRouter();
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    initTheme();
    checkAuth();
    requestPermissions();
  }, []);

  useEffect(() => {
    // Устанавливаем цветовую схему для NativeWind
    if (theme) {
      setColorScheme(theme);
    }
  }, [theme, setColorScheme]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

