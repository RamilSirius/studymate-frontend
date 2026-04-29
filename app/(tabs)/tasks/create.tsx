import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTasksStore } from '@/store/tasksStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { tokens, brand } from '@/utils/theme';

const taskSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'done']),
  course: z.string().optional(),
  tags: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

const priorityMeta: Record<string, { label: string; color: string }> = {
  low: { label: 'Низкий', color: brand.success },
  medium: { label: 'Средний', color: brand.warning },
  high: { label: 'Высокий', color: brand.danger },
};

export default function CreateTaskScreen() {
  const { createTask } = useTasksStore();
  const { theme } = useThemeStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const t = tokens(theme);
  const isDark = theme === 'dark';

  const { control, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      status: 'todo',
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    setLoading(true);
    try {
      const tags = data.tags ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [];
      await createTask({
        ...data,
        tags,
        due_date: dueDate?.toISOString(),
      });
      router.back();
    } catch (error: any) {
      Alert.alert('Ошибка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputBox = `${t.surface} rounded-2xl px-4 py-3.5`;
  const inputBorderStyle = {
    borderWidth: isDark ? 0 : 1,
    borderColor: t.borderHex,
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
          <Text className={`${t.text} text-lg font-bold`}>Новая задача</Text>
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
                placeholder="Например, подготовиться к экзамену"
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
          name="description"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>Описание</Text>
              <TextInput
                className={`${inputBox} ${t.text}`}
                style={[inputBorderStyle, { minHeight: 100, textAlignVertical: 'top' }]}
                placeholder="Опишите подробности..."
                placeholderTextColor={t.placeholder}
                value={value}
                onChangeText={onChange}
                multiline
              />
            </View>
          )}
        />

        <View className="mb-4">
          <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>Дедлайн</Text>
          <TouchableOpacity
            className={`${inputBox} flex-row items-center justify-between`}
            style={inputBorderStyle}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.85}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons name="calendar-outline" size={20} color={brand.primary} />
              <Text className={`ml-3 ${dueDate ? t.text : t.textSecondary}`}>
                {dueDate ? dueDate.toLocaleString('ru-RU') : 'Выберите дату и время'}
              </Text>
            </View>
            {dueDate ? (
              <TouchableOpacity onPress={() => setDueDate(null)} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={t.iconMuted} />
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="datetime"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setDueDate(date);
              }}
            />
          )}
        </View>

        <Controller
          control={control}
          name="priority"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>Приоритет</Text>
              <View className="flex-row" style={{ gap: 8 }}>
                {(['low', 'medium', 'high'] as const).map((priority) => {
                  const meta = priorityMeta[priority];
                  const active = value === priority;
                  return (
                    <TouchableOpacity
                      key={priority}
                      onPress={() => onChange(priority)}
                      activeOpacity={0.85}
                      className="flex-1 rounded-2xl py-3 items-center"
                      style={{
                        backgroundColor: active ? meta.color : t.surfaceHex,
                        borderWidth: active ? 0 : isDark ? 0 : 1,
                        borderColor: t.borderHex,
                      }}
                    >
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: active ? '#FFFFFF' : meta.color }}
                      >
                        {meta.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        />

        <Controller
          control={control}
          name="course"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
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

        <Controller
          control={control}
          name="tags"
          render={({ field: { onChange, value } }) => (
            <View className="mb-8">
              <Text className={`${t.textSecondary} text-xs font-semibold mb-2 uppercase`}>
                Теги (через запятую)
              </Text>
              <TextInput
                className={`${inputBox} ${t.text}`}
                style={inputBorderStyle}
                placeholder="математика, экзамен"
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
            <Text className="text-white text-center font-bold text-base">Создать задачу</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
