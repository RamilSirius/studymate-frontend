import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { tokens, brand } from '@/utils/theme';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const { theme } = useThemeStore();
  const router = useRouter();

  const t = tokens(theme);
  const isDark = theme === 'dark';

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, confirmPassword);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Ошибка регистрации', error.message);
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
        contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 56 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={`${t.surface} rounded-2xl items-center justify-center mb-6`}
          style={{
            width: 44,
            height: 44,
            borderWidth: isDark ? 0 : 1,
            borderColor: t.borderHex,
          }}
        >
          <Ionicons name="arrow-back" size={20} color={t.icon} />
        </TouchableOpacity>

        <Text className={`text-3xl font-extrabold ${t.text} mb-2`}>Создать аккаунт</Text>
        <Text className={`text-base ${t.textSecondary} mb-8`}>
          Зарегистрируйся, чтобы начать учиться эффективно
        </Text>

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
          <View
            className={`flex-row items-center ${t.surfaceAlt} rounded-2xl px-4 mb-4`}
            style={{ height: 52 }}
          >
            <Ionicons name="mail-outline" size={20} color={t.icon} />
            <TextInput
              className={`flex-1 ml-3 ${t.text}`}
              style={{ height: '100%' }}
              placeholder="Email"
              placeholderTextColor={t.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View
            className={`flex-row items-center ${t.surfaceAlt} rounded-2xl px-4 mb-4`}
            style={{ height: 52 }}
          >
            <Ionicons name="lock-closed-outline" size={20} color={t.icon} />
            <TextInput
              className={`flex-1 ml-3 ${t.text}`}
              style={{ height: '100%' }}
              placeholder="Пароль (мин. 6 символов)"
              placeholderTextColor={t.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={t.icon} />
            </TouchableOpacity>
          </View>

          <View
            className={`flex-row items-center ${t.surfaceAlt} rounded-2xl px-4 mb-4`}
            style={{ height: 52 }}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={t.icon} />
            <TextInput
              className={`flex-1 ml-3 ${t.text}`}
              style={{ height: '100%' }}
              placeholder="Подтвердите пароль"
              placeholderTextColor={t.placeholder}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: brand.primary,
              borderRadius: 16,
              paddingVertical: 16,
              marginTop: 8,
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
              <Text className="text-white text-center font-bold text-base">Зарегистрироваться</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="mt-8" onPress={() => router.back()}>
          <Text className={`${t.textSecondary} text-center`}>
            Уже есть аккаунт?{' '}
            <Text style={{ color: brand.primary, fontWeight: '700' }}>Войти</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
