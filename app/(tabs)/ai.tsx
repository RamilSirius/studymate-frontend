import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';
import { useTasksStore } from '@/store/tasksStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { generateAIPlan } from '@/api/ai';
import { AIPlanResponse, TimeBlock } from '@/types/ai';
import { tokens, brand } from '@/utils/theme';

export default function AICoachScreen() {
  const { theme } = useThemeStore();
  const { tasks } = useTasksStore();
  const { schedule } = useScheduleStore();

  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<AIPlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const getTodaySchedule = useCallback(() => {
    const today = new Date().getDay();
    const dayOfWeek = today === 0 ? 6 : today - 1;

    return schedule
      .filter((item) => item.day_of_week === dayOfWeek)
      .map((item) => ({
        title: item.title,
        start_time: item.start_time,
        end_time: item.end_time,
        location: item.location,
      }));
  }, [schedule]);

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const todaySchedule = getTodaySchedule();
      const activeTasks = tasks
        .filter((task) => task.status !== 'done')
        .map((task) => ({
          title: task.title,
          due_date: task.due_date,
          priority: task.priority,
          status: task.status,
          course: task.course,
        }));

      const result = await generateAIPlan({
        tasks: activeTasks,
        schedule: todaySchedule,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      setPlan(result);
    } catch (err: any) {
      const errorMessage = err.message || 'Не удалось получить план';
      setError(errorMessage);
      Alert.alert('Ошибка', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const TimeBlockCard = ({ block, index }: { block: TimeBlock; index: number }) => (
    <View
      className={`${t.surface} rounded-2xl p-4 mb-3`}
      style={{ ...borderStyle, ...cardShadow }}
    >
      <View className="flex-row items-center mb-3">
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: brand.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text className="text-white font-extrabold text-sm">{index + 1}</Text>
        </View>
        <View className="flex-1">
          <Text className={`${t.text} font-bold text-base`}>{block.task_title}</Text>
          <View className="flex-row items-center mt-0.5">
            <Ionicons name="time-outline" size={12} color={brand.primary} />
            <Text className="text-xs font-semibold ml-1" style={{ color: brand.primary }}>
              {block.time_block}
            </Text>
          </View>
        </View>
      </View>

      <Text className={`${t.textSecondary} text-sm mb-2 leading-5`}>{block.why}</Text>

      {block.tips.length > 0 && (
        <View
          className="rounded-xl p-3 mt-2"
          style={{ backgroundColor: t.surfaceAltHex }}
        >
          {block.tips.map((tip, i) => (
            <View key={i} className="flex-row items-start" style={{ marginBottom: i < block.tips.length - 1 ? 6 : 0 }}>
              <Text className="mr-2">💡</Text>
              <Text className={`${t.textSecondary} text-sm flex-1 leading-5`}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView className={`flex-1 ${t.bg}`} showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-14 pb-8">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              backgroundColor: brand.accent,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
              shadowColor: brand.accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Ionicons name="sparkles" size={28} color="white" />
          </View>
          <View className="flex-1">
            <Text className={`text-2xl font-extrabold ${t.text}`}>AI Коуч</Text>
            <Text className={`${t.textSecondary} text-sm`}>
              Персональный помощник по учёбе
            </Text>
          </View>
        </View>

        {/* Generate Button */}
        {!plan && !isLoading && (
          <TouchableOpacity
            onPress={handleGeneratePlan}
            activeOpacity={0.85}
            style={{
              backgroundColor: brand.accent,
              borderRadius: 24,
              padding: 20,
              marginBottom: 16,
              shadowColor: brand.accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center justify-center mb-2">
              <Ionicons name="flash" size={22} color="white" />
              <Text className="text-white font-extrabold text-base ml-2">
                Составить план на сегодня
              </Text>
            </View>
            <Text className="text-white/85 text-center text-sm">
              AI проанализирует задачи и расписание
            </Text>
          </TouchableOpacity>
        )}

        {/* Loading */}
        {isLoading && (
          <View
            className={`${t.surface} rounded-2xl p-8 items-center`}
            style={{ ...borderStyle, ...cardShadow }}
          >
            <ActivityIndicator size="large" color={brand.accent} />
            <Text className={`${t.text} font-semibold mt-4 text-center`}>
              ✨ AI анализирует твой день...
            </Text>
            <Text className={`${t.textSecondary} text-sm mt-1`}>
              Подожди несколько секунд
            </Text>
          </View>
        )}

        {/* Error */}
        {error && !isLoading && (
          <View
            className="rounded-2xl p-4 mb-4 flex-row items-start"
            style={{
              backgroundColor: isDark ? '#7F1D1D30' : '#FEF2F2',
              borderWidth: 1,
              borderColor: isDark ? '#991B1B' : '#FECACA',
            }}
          >
            <Ionicons name="alert-circle" size={22} color={brand.danger} />
            <View className="flex-1 ml-3">
              <Text className="font-bold" style={{ color: brand.danger }}>
                Что-то пошло не так
              </Text>
              <Text className={`${t.textSecondary} text-sm mt-1`}>{error}</Text>
              <TouchableOpacity
                className="mt-3 self-start rounded-xl px-3 py-2"
                style={{ backgroundColor: brand.danger }}
                onPress={handleGeneratePlan}
              >
                <Text className="text-white font-bold text-sm">Повторить</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Plan */}
        {plan && !isLoading && (
          <>
            <View
              className={`${t.surface} rounded-2xl p-5 mb-4`}
              style={{ ...borderStyle, ...cardShadow }}
            >
              <View className="flex-row items-center mb-3">
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: '#FEF3C7',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="sunny" size={20} color={brand.warning} />
                </View>
                <Text className={`${t.text} font-bold text-lg ml-3`}>Твой день</Text>
              </View>
              <Text className={`${t.text} text-base leading-6`}>{plan.headline}</Text>
            </View>

            <View
              className="rounded-2xl p-5 mb-4"
              style={{
                backgroundColor: brand.success,
                shadowColor: brand.success,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="rocket" size={20} color="white" />
                <Text className="text-white font-extrabold ml-2 uppercase text-xs tracking-wide">
                  Начни прямо сейчас
                </Text>
              </View>
              <Text className="text-white text-base leading-6">{plan.next_step}</Text>
            </View>

            <Text className={`${t.text} font-bold text-lg mb-3 mt-2`}>🎯 Топ-3 приоритета</Text>
            <View className="mb-2">
              {plan.top3_priorities.map((priority, i) => (
                <View
                  key={i}
                  className={`${t.surface} rounded-2xl p-4 mb-2 flex-row items-center`}
                  style={{ ...borderStyle, ...cardShadow }}
                >
                  <Text className="text-2xl mr-3">{['🥇', '🥈', '🥉'][i]}</Text>
                  <Text className={`${t.text} flex-1 font-semibold`}>{priority}</Text>
                </View>
              ))}
            </View>

            <Text className={`${t.text} font-bold text-lg mb-3 mt-3`}>📅 План на день</Text>
            {plan.today_plan.map((block, i) => (
              <TimeBlockCard key={i} block={block} index={i} />
            ))}

            {plan.risk_alerts.length > 0 && (
              <>
                <Text className={`${t.text} font-bold text-lg mb-3 mt-3`}>
                  ⚠️ На что обратить внимание
                </Text>
                <View
                  className="rounded-2xl p-4 mb-4"
                  style={{
                    backgroundColor: isDark ? '#78350F30' : '#FEF3C7',
                    borderWidth: 1,
                    borderColor: isDark ? '#92400E' : '#FCD34D',
                  }}
                >
                  {plan.risk_alerts.map((alert, i) => (
                    <View
                      key={i}
                      className="flex-row items-start"
                      style={{ marginBottom: i < plan.risk_alerts.length - 1 ? 8 : 0 }}
                    >
                      <Text className="mr-2">🚧</Text>
                      <Text className={`${t.text} flex-1 leading-5`}>{alert}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity
              className="rounded-2xl py-4 mt-2 flex-row items-center justify-center"
              style={{
                backgroundColor: t.surfaceAltHex,
                ...borderStyle,
              }}
              onPress={handleGeneratePlan}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={18} color={t.icon} />
              <Text className={`${t.text} ml-2 font-bold`}>
                Сгенерировать новый план
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Empty hint */}
        {!plan && !isLoading && !error && (
          <View
            className={`${t.surface} rounded-2xl p-5`}
            style={{ ...borderStyle, ...cardShadow }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="bulb" size={22} color={brand.warning} />
              <Text className={`${t.text} font-bold ml-2 text-base`}>Как это работает</Text>
            </View>
            <Text className={`${t.textSecondary} text-sm leading-5`}>
              AI проанализирует твои задачи, дедлайны и расписание, а затем предложит оптимальный
              план на сегодня с учётом приоритетов.
            </Text>

            <View className="flex-row mt-4" style={{ gap: 10 }}>
              <View
                className="flex-1 rounded-xl p-3"
                style={{ backgroundColor: t.surfaceAltHex }}
              >
                <Text className="text-2xl">📋</Text>
                <Text className={`${t.text} font-bold text-base mt-1`}>
                  {tasks.filter((task) => task.status !== 'done').length}
                </Text>
                <Text className={`${t.textSecondary} text-xs`}>активных задач</Text>
              </View>
              <View
                className="flex-1 rounded-xl p-3"
                style={{ backgroundColor: t.surfaceAltHex }}
              >
                <Text className="text-2xl">📅</Text>
                <Text className={`${t.text} font-bold text-base mt-1`}>
                  {getTodaySchedule().length}
                </Text>
                <Text className={`${t.textSecondary} text-xs`}>занятий сегодня</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
