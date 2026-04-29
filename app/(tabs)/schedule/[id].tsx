import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useScheduleStore } from '@/store/scheduleStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { tokens, brand } from '@/utils/theme';

const DAYS_SHORT = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

export default function ScheduleDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { schedule, fetchSchedule, updateItem } = useScheduleStore();
  const { theme } = useThemeStore();
  const router = useRouter();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [course, setCourse] = useState('');

  const item = schedule.find((s) => s.id === parseInt(id || '0'));

  useEffect(() => {
    if (!item) {
      fetchSchedule();
    } else {
      setTitle(item.title);
      setLocation(item.location || '');
      setCourse(item.course || '');
      setDayOfWeek(item.day_of_week);
      const [startHour, startMin] = item.start_time.split(':').map(Number);
      const [endHour, endMin] = item.end_time.split(':').map(Number);
      setStartTime(new Date(2000, 0, 1, startHour, startMin));
      setEndTime(new Date(2000, 0, 1, endHour, endMin));
    }
  }, [item]);

  const t = tokens(theme);
  const isDark = theme === 'dark';

  const inputBox = `${t.surface} rounded-2xl px-4 py-3.5`;
  const inputBorderStyle = { borderWidth: isDark ? 0 : 1, borderColor: t.borderHex };

  const handleSave = async () => {
    if (!item) return;
    try {
      await updateItem(item.id, {
        title,
        day_of_week: dayOfWeek,
        start_time: startTime.toTimeString().slice(0, 5),
        end_time: endTime.toTimeString().slice(0, 5),
        location: location || undefined,
        course: course || undefined,
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Ошибка', error.message);
    }
  };

  if (!item) {
    return (
      <View className={`flex-1 ${t.bg} justify-center items-center`}>
        <ActivityIndicator size="large" color={brand.primary} />
      </View>
    );
  }

  return (
    <ScrollView className={`flex-1 ${t.bg}`} keyboardShouldPersistTaps="handled">
      <View className="px-5 pt-14 pb-8">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`${t.surface} rounded-2xl items-center justify-center`}
            style={{ width: 44, height: 44, ...inputBorderStyle }}
          >
            <Ionicons name="arrow-back" size={20} color={t.icon} />
          </TouchableOpacity>
          <Text className={`${t.text} text-lg font-bold`}>Редактирование</Text>
          <TouchableOpacity
            onPress={handleSave}
            className="rounded-2xl items-center justify-center px-4"
            style={{ height: 44, backgroundColor: brand.primary }}
          >
            <Text className="text-white font-bold text-sm">Сохранить</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>Название</Text>
          <TextInput
            className={`${inputBox} ${t.text} text-base`}
            style={inputBorderStyle}
            value={title}
            onChangeText={setTitle}
            placeholder="Название"
            placeholderTextColor={t.placeholder}
          />
        </View>

        <View className="mb-4">
          <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>День недели</Text>
          <View className="flex-row" style={{ gap: 6 }}>
            {DAYS_SHORT.map((day, index) => {
              const active = dayOfWeek === index;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setDayOfWeek(index)}
                  activeOpacity={0.85}
                  className="flex-1 rounded-xl py-3 items-center"
                  style={{
                    backgroundColor: active ? brand.primary : t.surfaceHex,
                    borderWidth: active ? 0 : isDark ? 0 : 1,
                    borderColor: t.borderHex,
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: active ? '#FFFFFF' : t.textHex }}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="flex-row mb-4" style={{ gap: 10 }}>
          <View className="flex-1">
            <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>Начало</Text>
            <TouchableOpacity
              className={`${inputBox} flex-row items-center`}
              style={inputBorderStyle}
              onPress={() => setShowStartPicker(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="time-outline" size={18} color={brand.primary} />
              <Text className={`${t.text} ml-2 font-semibold`}>
                {startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onChange={(event, date) => {
                  setShowStartPicker(false);
                  if (date) setStartTime(date);
                }}
              />
            )}
          </View>

          <View className="flex-1">
            <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>Конец</Text>
            <TouchableOpacity
              className={`${inputBox} flex-row items-center`}
              style={inputBorderStyle}
              onPress={() => setShowEndPicker(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="time-outline" size={18} color={brand.primary} />
              <Text className={`${t.text} ml-2 font-semibold`}>
                {endTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="default"
                onChange={(event, date) => {
                  setShowEndPicker(false);
                  if (date) setEndTime(date);
                }}
              />
            )}
          </View>
        </View>

        <View className="mb-4">
          <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>Место</Text>
          <TextInput
            className={`${inputBox} ${t.text}`}
            style={inputBorderStyle}
            value={location}
            onChangeText={setLocation}
            placeholder="Аудитория, адрес"
            placeholderTextColor={t.placeholder}
          />
        </View>

        <View className="mb-4">
          <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>Курс</Text>
          <TextInput
            className={`${inputBox} ${t.text}`}
            style={inputBorderStyle}
            value={course}
            onChangeText={setCourse}
            placeholder="Название курса"
            placeholderTextColor={t.placeholder}
          />
        </View>
      </View>
    </ScrollView>
  );
}
