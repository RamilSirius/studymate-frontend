import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useScheduleStore } from '@/store/scheduleStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { tokens, brand } from '@/utils/theme';

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
const DAYS_SHORT = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

export default function ScheduleScreen() {
  const { schedule, fetchSchedule, deleteItem, isLoading } = useScheduleStore();
  const { theme } = useThemeStore();
  const router = useRouter();

  const todayJs = new Date().getDay();
  const todayIndex = todayJs === 0 ? 6 : todayJs - 1;
  const [selectedDay, setSelectedDay] = useState<number>(todayIndex);

  useEffect(() => {
    fetchSchedule();
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

  const itemsByDay = schedule.reduce((acc, item) => {
    if (!acc[item.day_of_week]) acc[item.day_of_week] = [];
    acc[item.day_of_week].push(item);
    return acc;
  }, {} as Record<number, typeof schedule>);

  Object.keys(itemsByDay).forEach((k) => {
    itemsByDay[+k].sort((a, b) => a.start_time.localeCompare(b.start_time));
  });

  const dayItems = itemsByDay[selectedDay] || [];

  const handleDelete = (id: number) => {
    Alert.alert('Удалить?', 'Это действие нельзя отменить', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => deleteItem(id) },
    ]);
  };

  return (
    <View className={`flex-1 ${t.bg}`}>
      <View className="px-5 pt-14 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className={`text-3xl font-extrabold ${t.text}`}>Расписание</Text>
            <Text className={`${t.textSecondary} text-sm mt-0.5`}>{schedule.length} занятий всего</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/schedule/create')}
            activeOpacity={0.85}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: brand.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: brand.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
        >
          {DAYS.map((_, idx) => {
            const active = idx === selectedDay;
            const isToday = idx === todayIndex;
            const count = (itemsByDay[idx] || []).length;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedDay(idx)}
                activeOpacity={0.85}
                style={{
                  width: 56,
                  height: 72,
                  borderRadius: 18,
                  backgroundColor: active ? brand.primary : t.surfaceHex,
                  borderWidth: active ? 0 : isDark ? 0 : 1,
                  borderColor: t.borderHex,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...(active && {
                    shadowColor: brand.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }),
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: active ? 'rgba(255,255,255,0.85)' : t.textSecondaryHex }}
                >
                  {DAYS_SHORT[idx]}
                </Text>
                <Text
                  className="text-lg font-bold mt-0.5"
                  style={{ color: active ? '#FFFFFF' : t.textHex }}
                >
                  {count > 0 ? count : '·'}
                </Text>
                {isToday && !active ? (
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 6,
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: brand.primary,
                    }}
                  />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text className={`${t.text} font-bold text-lg mt-4 mb-3`}>{DAYS[selectedDay]}</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={brand.primary} />
        </View>
      ) : dayItems.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 32,
              backgroundColor: isDark ? '#312E8140' : '#EEF2FF',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Ionicons name="calendar-outline" size={48} color={brand.primary} />
          </View>
          <Text className={`${t.text} font-bold text-xl`}>Свободный день</Text>
          <Text className={`${t.textSecondary} text-sm mt-2 text-center`}>
            Добавьте занятие, чтобы начать планирование
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/schedule/create')}
            className="mt-6 rounded-2xl px-6 py-3"
            style={{ backgroundColor: brand.primary }}
          >
            <Text className="text-white font-bold">+ Добавить занятие</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingTop: 0, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {dayItems.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              className={`${t.surface} rounded-2xl mb-3 flex-row`}
              style={{ ...borderStyle, ...cardShadow }}
              onPress={() => router.push(`/(tabs)/schedule/${item.id}`)}
              activeOpacity={0.85}
            >
              <View
                style={{
                  width: 80,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  borderTopLeftRadius: 16,
                  borderBottomLeftRadius: 16,
                  backgroundColor: isDark ? '#312E8140' : '#EEF2FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-base font-extrabold" style={{ color: brand.primary }}>
                  {item.start_time}
                </Text>
                <View
                  style={{
                    width: 18,
                    height: 1,
                    backgroundColor: brand.primary,
                    opacity: 0.4,
                    marginVertical: 4,
                  }}
                />
                <Text className="text-xs font-semibold" style={{ color: brand.primary, opacity: 0.8 }}>
                  {item.end_time}
                </Text>
              </View>

              <View className="flex-1 p-4 flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className={`${t.text} font-bold text-base`} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.location ? (
                    <View className="flex-row items-center mt-1.5">
                      <Ionicons name="location-outline" size={13} color={t.iconMuted} />
                      <Text className={`${t.textSecondary} text-xs ml-1`}>{item.location}</Text>
                    </View>
                  ) : null}
                  {item.course ? (
                    <View
                      className="rounded-full px-2.5 py-0.5 mt-2 self-start"
                      style={{ backgroundColor: isDark ? '#312E8140' : '#EEF2FF' }}
                    >
                      <Text className="text-xs font-semibold" style={{ color: brand.primary }}>
                        {item.course}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  hitSlop={8}
                  className="ml-2"
                >
                  <Ionicons name="trash-outline" size={18} color={t.iconMuted} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
