import { View, Text, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { tokens, brand } from '@/utils/theme';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const router = useRouter();

  const t = tokens(theme);
  const isDark = theme === 'dark';

  const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.25 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  };
  const borderStyle = { borderWidth: isDark ? 0 : 1, borderColor: t.borderHex };

  const handleLogout = () => {
    Alert.alert('Выйти?', 'Вы уверены, что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const Row = ({
    icon,
    iconColor,
    iconBg,
    title,
    subtitle,
    onPress,
    right,
    danger,
  }: {
    icon: any;
    iconColor: string;
    iconBg: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    right?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      className="flex-row items-center py-3.5 px-4"
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View className="flex-1 ml-3">
        <Text className={`${danger ? '' : t.text} font-semibold`} style={danger ? { color: brand.danger } : undefined}>
          {title}
        </Text>
        {subtitle ? <Text className={`${t.textSecondary} text-xs mt-0.5`}>{subtitle}</Text> : null}
      </View>
      {right ? right : onPress ? <Ionicons name="chevron-forward" size={18} color={t.iconMuted} /> : null}
    </TouchableOpacity>
  );

  const Divider = () => <View style={{ height: 1, backgroundColor: t.borderHex, marginLeft: 56 }} />;

  return (
    <ScrollView className={`flex-1 ${t.bg}`} showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-14 pb-8">
        <Text className={`text-3xl font-extrabold ${t.text} mb-6`}>Профиль</Text>

        {/* Profile card */}
        <View
          className="rounded-3xl p-5 mb-5 flex-row items-center"
          style={{
            backgroundColor: brand.primary,
            shadowColor: brand.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text className="text-white text-3xl font-extrabold">
              {(user?.email?.[0] || '?').toUpperCase()}
            </Text>
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-white/80 text-xs">Аккаунт</Text>
            <Text className="text-white font-bold text-base mt-0.5" numberOfLines={1}>
              {user?.email || '—'}
            </Text>
          </View>
        </View>

        {/* Settings group */}
        <Text className={`${t.textSecondary} text-xs font-semibold uppercase mb-2 ml-1`}>
          Настройки
        </Text>
        <View
          className={`${t.surface} rounded-2xl mb-5`}
          style={{ ...borderStyle, ...cardShadow, overflow: 'hidden' }}
        >
          <Row
            icon={isDark ? 'moon' : 'sunny'}
            iconColor={isDark ? '#A78BFA' : '#F59E0B'}
            iconBg={isDark ? '#312E8140' : '#FEF3C7'}
            title="Тёмная тема"
            subtitle={isDark ? 'Включена' : 'Выключена'}
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#CBD5E1', true: brand.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#CBD5E1"
              />
            }
          />
          <Divider />
          <Row
            icon="stats-chart"
            iconColor={brand.success}
            iconBg={isDark ? '#06402040' : '#D1FAE5'}
            title="Статистика прогресса"
            subtitle="Графики и отчёты"
            onPress={() => router.push('/(tabs)/progress')}
          />
        </View>

        {/* About */}
        <Text className={`${t.textSecondary} text-xs font-semibold uppercase mb-2 ml-1`}>
          О приложении
        </Text>
        <View
          className={`${t.surface} rounded-2xl mb-5`}
          style={{ ...borderStyle, ...cardShadow, overflow: 'hidden' }}
        >
          <Row
            icon="information-circle"
            iconColor={brand.primary}
            iconBg={isDark ? '#312E8140' : '#EEF2FF'}
            title="Версия"
            subtitle="StudyMate 1.0.0"
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.85}
          className="rounded-2xl py-4 flex-row items-center justify-center"
          style={{
            backgroundColor: isDark ? '#7F1D1D40' : '#FEE2E2',
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={brand.danger} />
          <Text className="font-bold ml-2" style={{ color: brand.danger }}>
            Выйти из аккаунта
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
