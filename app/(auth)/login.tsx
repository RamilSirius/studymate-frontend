import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { tokens, brand } from '@/utils/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { theme } = useThemeStore();
  const router = useRouter();

  const t = tokens(theme);
  const isDark = theme === 'dark';

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Ошибка входа', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className={`flex-1 ${t.bg}`}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="items-center mb-10">
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: brand.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: brand.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Ionicons name="school" size={40} color="#FFFFFF" />
          </View>
          <Text className={`text-3xl font-extrabold ${t.text} mt-5`}>StudyMate</Text>
          <Text className={`text-base ${t.textSecondary} mt-1`}>
            С возвращением 👋
          </Text>
        </View>

        {/* Card */}
        <View
          className={`${t.surface} rounded-3xl p-6`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 16,
            elevation: 4,
            borderWidth: isDark ? 0 : 1,
            borderColor: t.borderHex,
          }}
        >
          <Text className={`${t.text} font-semibold mb-2`}>Email</Text>
          <View
            className={`flex-row items-center ${t.surfaceAlt} rounded-2xl px-4 mb-4`}
            style={{ height: 52 }}
          >
            <Ionicons name="mail-outline" size={20} color={t.icon} />
            <TextInput
              className={`flex-1 ml-3 ${t.text}`}
              style={{ height: '100%' }}
              placeholder="you@example.com"
              placeholderTextColor={t.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text className={`${t.text} font-semibold mb-2`}>Пароль</Text>
          <View
            className={`flex-row items-center ${t.surfaceAlt} rounded-2xl px-4 mb-6`}
            style={{ height: 52 }}
          >
            <Ionicons name="lock-closed-outline" size={20} color={t.icon} />
            <TextInput
              className={`flex-1 ml-3 ${t.text}`}
              style={{ height: '100%' }}
              placeholder="••••••••"
              placeholderTextColor={t.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={t.icon} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: brand.primary,
              borderRadius: 16,
              paddingVertical: 16,
              shadowColor: brand.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-base">Войти</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <TouchableOpacity className="mt-8" onPress={() => router.push('/(auth)/register')}>
          <Text className={`${t.textSecondary} text-center`}>
            Нет аккаунта?{' '}
            <Text style={{ color: brand.primary, fontWeight: '700' }}>Создать</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
