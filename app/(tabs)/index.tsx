import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgressStore } from '@/store/progressStore';
import { useTasksStore } from '@/store/tasksStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { tokens, brand } from '@/utils/theme';

export default function DashboardScreen() {
  const { summary7, summary30, fetchProgress, isLoading } = useProgressStore();
  const { tasks, fetchTasks } = useTasksStore();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    fetchProgress(7);
    fetchProgress(30);
    fetchTasks();
  }, []);

  const t = tokens(theme);
  const isDark = theme === 'dark';

  const overdueTasks = tasks.filter(
    (task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
  );

  const todayTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    const due = new Date(task.due_date);
    const today = new Date();
    return (
      due.getDate() === today.getDate() &&
      due.getMonth() === today.getMonth() &&
      due.getFullYear() === today.getFullYear()
    );
  });

  const activeTasks = tasks.filter((t) => t.status !== 'done');
  const completionRate = summary7?.completion_rate ?? 0;
  const streak = summary30?.streak ?? 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 6) return 'Доброй ночи';
    if (h < 12) return 'Доброе утро';
    if (h < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const userName = user?.email?.split('@')[0] ?? 'друг';

  if (isLoading && !summary7) {
    return (
      <View className={`flex-1 ${t.bg} justify-center items-center`}>
        <ActivityIndicator size="large" color={brand.primary} />
      </View>
    );
  }

  const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.25 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  };

  return (
    <ScrollView className={`flex-1 ${t.bg}`} showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-14 pb-6">
        {/* Greeting */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <Text className={`${t.textSecondary} text-sm`}>{greeting()},</Text>
            <Text className={`text-2xl font-extrabold ${t.text} mt-0.5`} numberOfLines={1}>
              {userName} 👋
            </Text>
            <Text className={`${t.textSecondary} text-xs mt-1`}>
              {format(new Date(), 'd MMMM, EEEE', { locale: ru })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/progress')}
            className={`${t.surface} rounded-2xl items-center justify-center`}
            style={{
              width: 44,
              height: 44,
              borderWidth: isDark ? 0 : 1,
              borderColor: t.borderHex,
              ...cardShadow,
            }}
          >
            <Ionicons name="trending-up" size={20} color={brand.primary} />
          </TouchableOpacity>
        </View>

        {/* Hero card */}
        <View
          style={{
            backgroundColor: brand.primary,
            borderRadius: 24,
            padding: 20,
            marginBottom: 16,
            shadowColor: brand.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="flame" size={22} color="#FFFFFF" />
              </View>
              <View className="ml-3">
                <Text className="text-white/80 text-xs">Серия</Text>
                <Text className="text-white text-2xl font-extrabold">
                  {streak} <Text className="text-base font-medium">дней</Text>
                </Text>
              </View>
            </View>
            <View>
              <Text className="text-white/80 text-xs text-right">Прогресс</Text>
              <Text className="text-white text-2xl font-extrabold">
                {completionRate.toFixed(0)}%
              </Text>
            </View>
          </View>
          <View
            style={{
              height: 8,
              backgroundColor: 'rgba(255,255,255,0.25)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${Math.min(completionRate, 100)}%`,
                height: '100%',
                backgroundColor: '#FFFFFF',
                borderRadius: 4,
              }}
            />
          </View>
          <Text className="text-white/80 text-xs mt-2">
            {summary7?.completed_tasks || 0} из {summary7?.total_tasks || 0} задач за 7 дней
          </Text>
        </View>

        {/* Quick stats */}
        <View className="flex-row mb-4" style={{ gap: 12 }}>
          <View
            className={`flex-1 ${t.surface} rounded-2xl p-4`}
            style={{ borderWidth: isDark ? 0 : 1, borderColor: t.borderHex, ...cardShadow }}
          >
            <View className="flex-row items-center mb-2">
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#1E40AF40' : '#DBEAFE',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="today-outline" size={16} color="#3B82F6" />
              </View>
            </View>
            <Text className={`text-3xl font-extrabold ${t.text}`}>{todayTasks.length}</Text>
            <Text className={`${t.textSecondary} text-xs mt-1`}>На сегодня</Text>
          </View>

          <View
            className={`flex-1 ${t.surface} rounded-2xl p-4`}
            style={{ borderWidth: isDark ? 0 : 1, borderColor: t.borderHex, ...cardShadow }}
          >
            <View className="flex-row items-center mb-2">
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#7F1D1D40' : '#FEE2E2',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="alert-circle-outline" size={16} color={brand.danger} />
              </View>
            </View>
            <Text className="text-3xl font-extrabold" style={{ color: brand.danger }}>
              {overdueTasks.length}
            </Text>
            <Text className={`${t.textSecondary} text-xs mt-1`}>Просрочено</Text>
          </View>

          <View
            className={`flex-1 ${t.surface} rounded-2xl p-4`}
            style={{ borderWidth: isDark ? 0 : 1, borderColor: t.borderHex, ...cardShadow }}
          >
            <View className="flex-row items-center mb-2">
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#06402040' : '#D1FAE5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="checkmark-done-outline" size={16} color={brand.success} />
              </View>
            </View>
            <Text className={`text-3xl font-extrabold ${t.text}`}>{activeTasks.length}</Text>
            <Text className={`${t.textSecondary} text-xs mt-1`}>Активных</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View className="flex-row mb-6" style={{ gap: 12 }}>
          <TouchableOpacity
            className="flex-1"
            onPress={() => router.push('/(tabs)/ai')}
            activeOpacity={0.85}
            style={{
              backgroundColor: brand.accent,
              borderRadius: 20,
              padding: 16,
              shadowColor: brand.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            <Text className="text-white font-bold mt-2">AI Коуч</Text>
            <Text className="text-white/80 text-xs mt-0.5">План на день</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1"
            onPress={() => router.push('/(tabs)/tasks/create')}
            activeOpacity={0.85}
            style={{
              backgroundColor: t.surfaceHex,
              borderRadius: 20,
              padding: 16,
              borderWidth: isDark ? 0 : 1,
              borderColor: t.borderHex,
              ...cardShadow,
            }}
          >
            <Ionicons name="add-circle" size={24} color={brand.primary} />
            <Text className={`${t.text} font-bold mt-2`}>Новая задача</Text>
            <Text className={`${t.textSecondary} text-xs mt-0.5`}>Добавить</Text>
          </TouchableOpacity>
        </View>

        {/* Today's tasks section */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className={`${t.text} font-bold text-lg`}>Задачи на сегодня</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
            <Text className="text-sm font-semibold" style={{ color: brand.primary }}>
              Все →
            </Text>
          </TouchableOpacity>
        </View>

        {todayTasks.length === 0 ? (
          <View
            className={`${t.surface} rounded-2xl p-6 items-center`}
            style={{ borderWidth: isDark ? 0 : 1, borderColor: t.borderHex, ...cardShadow }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: isDark ? '#06402040' : '#D1FAE5',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons name="checkmark-circle" size={28} color={brand.success} />
            </View>
            <Text className={`${t.text} font-semibold text-base`}>Всё чисто!</Text>
            <Text className={`${t.textSecondary} text-sm mt-1 text-center`}>
              Нет задач на сегодня. Отдохни 🎉
            </Text>
          </View>
        ) : (
          todayTasks.slice(0, 4).map((task) => {
            const priorityColor =
              task.priority === 'high'
                ? brand.danger
                : task.priority === 'medium'
                ? brand.warning
                : brand.success;
            return (
              <TouchableOpacity
                key={task.id}
                className={`${t.surface} rounded-2xl p-4 mb-3 flex-row items-center`}
                style={{ borderWidth: isDark ? 0 : 1, borderColor: t.borderHex, ...cardShadow }}
                onPress={() => router.push(`/(tabs)/tasks/${task.id}`)}
                activeOpacity={0.85}
              >
                <View
                  style={{
                    width: 4,
                    height: 36,
                    borderRadius: 2,
                    backgroundColor: priorityColor,
                    marginRight: 14,
                  }}
                />
                <View className="flex-1">
                  <Text className={`${t.text} font-semibold`} numberOfLines={1}>
                    {task.title}
                  </Text>
                  {task.due_date && (
                    <Text className={`${t.textSecondary} text-xs mt-1`}>
                      <Ionicons name="time-outline" size={12} />{' '}
                      {format(new Date(task.due_date), 'HH:mm')}
                      {task.course ? ` • ${task.course}` : ''}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={t.iconMuted} />
              </TouchableOpacity>
            );
          })
        )}

        {overdueTasks.length > 0 && (
          <TouchableOpacity
            className="rounded-2xl p-4 mt-2 flex-row items-center"
            onPress={() => router.push('/(tabs)/tasks')}
            activeOpacity={0.85}
            style={{
              backgroundColor: isDark ? '#7F1D1D30' : '#FEF2F2',
              borderWidth: 1,
              borderColor: isDark ? '#991B1B' : '#FECACA',
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: brand.danger,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="alert" size={18} color="#FFFFFF" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="font-bold" style={{ color: brand.danger }}>
                {overdueTasks.length} просроченных задач
              </Text>
              <Text className={`${t.textSecondary} text-xs mt-0.5`}>
                Нажми, чтобы посмотреть
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={brand.danger} />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
