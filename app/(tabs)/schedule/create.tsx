import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useScheduleStore } from '@/store/scheduleStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { tokens, brand } from '@/utils/theme';

const scheduleSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  day_of_week: z.number().min(0).max(6),
  course: z.string().optional(),
  location: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

const DAYS_SHORT = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

export default function CreateScheduleScreen() {
  const { createItem } = useScheduleStore();
  const { theme } = useThemeStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(10, 30, 0, 0);
    return d;
  });

  const t = tokens(theme);
  const isDark = theme === 'dark';

  const inputBox = `${t.surface} rounded-2xl px-4 py-3.5`;
  const inputBorderStyle = { borderWidth: isDark ? 0 : 1, borderColor: t.borderHex };

  const { control, handleSubmit, formState: { errors } } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      day_of_week: (() => {
        const d = new Date().getDay();
        return d === 0 ? 6 : d - 1;
      })(),
    },
  });

  const onSubmit = async (data: ScheduleFormData) => {
    setLoading(true);
    try {
      await createItem({
        ...data,
        start_time: startTime.toTimeString().slice(0, 5),
        end_time: endTime.toTimeString().slice(0, 5),
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Ошибка', error.message);
    } finally {
      setLoading(false);
    }
  };

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
          <Text className={`${t.text} text-lg font-bold`}>Новое занятие</Text>
          <View style={{ width: 44 }} />
        </View>

        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>Название</Text>
              <TextInput
                className={`${inputBox} ${t.text}`}
                style={inputBorderStyle}
                placeholder="Например, Алгебра"
                placeholderTextColor={t.placeholder}
                value={value}
                onChangeText={onChange}
              />
              {errors.title && (
                <Text className="text-red-500 text-xs mt-1">{errors.title.message}</Text>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          name="day_of_week"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>День недели</Text>
              <View className="flex-row" style={{ gap: 6 }}>
                {DAYS_SHORT.map((day, index) => {
                  const active = value === index;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => onChange(index)}
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
          )}
        />

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

        <Controller
          control={control}
          name="location"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>Место</Text>
              <TextInput
                className={`${inputBox} ${t.text}`}
                style={inputBorderStyle}
                placeholder="Аудитория, адрес..."
                placeholderTextColor={t.placeholder}
                value={value}
                onChangeText={onChange}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="course"
          render={({ field: { onChange, value } }) => (
            <View className="mb-8">
              <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>Курс</Text>
              <TextInput
                className={`${inputBox} ${t.text}`}
                style={inputBorderStyle}
                placeholder="Название курса"
                placeholderTextColor={t.placeholder}
                value={value}
                onChangeText={onChange}
              />
            </View>
          )}
        />

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
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
            <Text className="text-white text-center font-bold text-base">Создать</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
