import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgressStore } from '@/store/progressStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { VictoryPie, VictoryChart, VictoryBar } from 'victory-native';
import { tokens, brand } from '@/utils/theme';

export default function ProgressScreen() {
  const { summary7, summary30, fetchProgress, isLoading } = useProgressStore();
  const { theme } = useThemeStore();
  const router = useRouter();
  const [selectedRange, setSelectedRange] = useState<7 | 30>(30);

  useEffect(() => {
    fetchProgress(7);
    fetchProgress(30);
  }, []);

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

  const summary = selectedRange === 7 ? summary7 : summary30;

  if (isLoading && !summary) {
    return (
      <View className={`flex-1 ${t.bg} justify-center items-center`}>
        <ActivityIndicator size="large" color={brand.primary} />
      </View>
    );
  }

  if (!summary) {
    return (
      <View className={`flex-1 ${t.bg} justify-center items-center`}>
        <Text className={t.text}>Нет данных</Text>
      </View>
    );
  }

  const statusData = [
    { x: 'К выполнению', y: summary.status_counts.todo, color: '#94A3B8' },
    { x: 'В работе', y: summary.status_counts.in_progress, color: brand.primary },
    { x: 'Выполнено', y: summary.status_counts.done, color: brand.success },
  ].filter((item) => item.y > 0);

  const priorityData = [
    { x: 'Низкий', y: summary.priority_counts.low },
    { x: 'Средний', y: summary.priority_counts.medium },
    { x: 'Высокий', y: summary.priority_counts.high },
  ].filter((item) => item.y > 0);

  return (
    <ScrollView className={`flex-1 ${t.bg}`} showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-14 pb-8">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`${t.surface} rounded-2xl items-center justify-center`}
            style={{ width: 44, height: 44, ...borderStyle }}
          >
            <Ionicons name="arrow-back" size={20} color={t.icon} />
          </TouchableOpacity>
          <Text className={`text-lg font-bold ${t.text}`}>Прогресс</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Range selector */}
        <View
          className={`${t.surface} rounded-2xl p-1 flex-row mb-5`}
          style={borderStyle}
        >
          {([7, 30] as const).map((r) => {
            const active = selectedRange === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setSelectedRange(r)}
                activeOpacity={0.85}
                className="flex-1 py-2.5 rounded-xl items-center"
                style={{ backgroundColor: active ? brand.primary : 'transparent' }}
              >
                <Text
                  className="font-bold text-sm"
                  style={{ color: active ? '#FFFFFF' : t.textSecondaryHex }}
                >
                  {r} дней
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hero stats */}
        <View
          className="rounded-3xl p-5 mb-4"
          style={{
            backgroundColor: brand.primary,
            shadowColor: brand.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <Text className="text-white/80 text-xs font-semibold uppercase">Завершено</Text>
          <Text className="text-white text-5xl font-extrabold mt-1">
            {summary.completion_rate.toFixed(0)}
            <Text className="text-2xl font-bold">%</Text>
          </Text>
          <View
            style={{
              height: 8,
              backgroundColor: 'rgba(255,255,255,0.25)',
              borderRadius: 4,
              overflow: 'hidden',
              marginTop: 12,
            }}
          >
            <View
              style={{
                width: `${Math.min(summary.completion_rate, 100)}%`,
                height: '100%',
                backgroundColor: '#FFFFFF',
                borderRadius: 4,
              }}
            />
          </View>
          <Text className="text-white/80 text-sm mt-3">
            {summary.completed_tasks} из {summary.total_tasks} задач
          </Text>
        </View>

        {/* Mini stats */}
        <View className="flex-row mb-5" style={{ gap: 10 }}>
          <View
            className={`flex-1 ${t.surface} rounded-2xl p-4`}
            style={{ ...borderStyle, ...cardShadow }}
          >
            <View className="flex-row items-center mb-1">
              <Ionicons name="flame" size={14} color={brand.warning} />
              <Text className={`${t.textSecondary} text-xs ml-1 font-semibold`}>СЕРИЯ</Text>
            </View>
            <Text className={`${t.text} text-2xl font-extrabold`}>{summary.streak}</Text>
            <Text className={`${t.textSecondary} text-xs`}>дней подряд</Text>
          </View>
          <View
            className={`flex-1 ${t.surface} rounded-2xl p-4`}
            style={{ ...borderStyle, ...cardShadow }}
          >
            <View className="flex-row items-center mb-1">
              <Ionicons name="alert-circle" size={14} color={brand.danger} />
              <Text className={`${t.textSecondary} text-xs ml-1 font-semibold`}>ПРОСРОЧЕНО</Text>
            </View>
            <Text className="text-2xl font-extrabold" style={{ color: brand.danger }}>
              {summary.overdue_tasks}
            </Text>
            <Text className={`${t.textSecondary} text-xs`}>задач</Text>
          </View>
        </View>

        {/* Status chart */}
        {statusData.length > 0 && (
          <View
            className={`${t.surface} rounded-2xl p-5 mb-4`}
            style={{ ...borderStyle, ...cardShadow }}
          >
            <Text className={`${t.text} font-bold text-base mb-3`}>Распределение статусов</Text>
            <View style={{ height: 200, alignItems: 'center' }}>
              <VictoryPie
                data={statusData}
                colorScale={statusData.map((d) => d.color)}
                width={220}
                height={200}
                innerRadius={50}
                padAngle={2}
                labelRadius={({ innerRadius }: any) => (innerRadius || 50) + 25}
                style={{
                  labels: { fill: t.textHex, fontSize: 11, fontWeight: '600' },
                }}
              />
            </View>
            <View className="mt-2">
              {statusData.map((item, index) => (
                <View key={index} className="flex-row items-center justify-between py-1.5">
                  <View className="flex-row items-center">
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: item.color,
                        marginRight: 8,
                      }}
                    />
                    <Text className={t.text}>{item.x}</Text>
                  </View>
                  <Text className={`${t.text} font-bold`}>{item.y}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Priority chart */}
        {priorityData.length > 0 && (
          <View
            className={`${t.surface} rounded-2xl p-5`}
            style={{ ...borderStyle, ...cardShadow }}
          >
            <Text className={`${t.text} font-bold text-base mb-3`}>По приоритетам</Text>
            <View style={{ height: 200 }}>
              <VictoryChart
                domainPadding={30}
                theme={{
                  axis: {
                    style: {
                      axis: { stroke: t.borderHex },
                      tickLabels: { fill: t.textSecondaryHex, fontSize: 11 },
                      grid: { stroke: 'transparent' },
                    },
                  },
                }}
              >
                <VictoryBar
                  data={priorityData}
                  x="x"
                  y="y"
                  cornerRadius={{ top: 6 }}
                  style={{
                    data: { fill: brand.primary },
                  }}
                />
              </VictoryChart>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
