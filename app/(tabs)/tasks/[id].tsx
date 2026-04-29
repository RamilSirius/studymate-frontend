import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTasksStore } from '@/store/tasksStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { scheduleNotification, cancelNotification } from '@/services/notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { tokens, brand } from '@/utils/theme';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, fetchTasks, deleteTask } = useTasksStore();
  const { theme } = useThemeStore();
  const router = useRouter();
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());

  const task = tasks.find((t) => t.id === parseInt(id || '0'));

  useEffect(() => {
    if (!task) {
      fetchTasks();
    }
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

  const handleDelete = () => {
    Alert.alert('Удалить задачу?', 'Это действие нельзя отменить', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          if (task?.reminder?.notification_id) {
            await cancelNotification(task.reminder.notification_id, task.id);
          }
          await deleteTask(task!.id);
          router.back();
        },
      },
    ]);
  };

  const handleSetReminder = async () => {
    if (!task) return;
    try {
      await scheduleNotification(task.id, task.title, reminderDate);
      await fetchTasks();
      setShowReminderPicker(false);
      Alert.alert('Успешно', 'Напоминание установлено');
    } catch (error: any) {
      Alert.alert('Ошибка', error.message);
    }
  };

  const handleRemoveReminder = async () => {
    if (!task?.reminder?.notification_id) return;
    try {
      await cancelNotification(task.reminder.notification_id, task.id);
      await fetchTasks();
      Alert.alert('Успешно', 'Напоминание удалено');
    } catch (error: any) {
      Alert.alert('Ошибка', error.message);
    }
  };

  if (!task) {
    return (
      <View className={`flex-1 ${t.bg} justify-center items-center`}>
        <ActivityIndicator size="large" color={brand.primary} />
      </View>
    );
  }

  const priorityColor =
    task.priority === 'high' ? brand.danger : task.priority === 'medium' ? brand.warning : brand.success;
  const priorityLabel =
    task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий';
  const statusColor =
    task.status === 'done' ? brand.success : task.status === 'in_progress' ? brand.primary : '#94A3B8';
  const statusLabel =
    task.status === 'done' ? 'Выполнено' : task.status === 'in_progress' ? 'В работе' : 'К выполнению';

  return (
    <ScrollView className={`flex-1 ${t.bg}`}>
      <View className="px-5 pt-14 pb-8">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`${t.surface} rounded-2xl items-center justify-center`}
            style={{ width: 44, height: 44, ...borderStyle }}
          >
            <Ionicons name="arrow-back" size={20} color={t.icon} />
          </TouchableOpacity>
          <View className="flex-row" style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/tasks/edit?id=${task.id}`)}
              className={`${t.surface} rounded-2xl items-center justify-center`}
              style={{ width: 44, height: 44, ...borderStyle }}
            >
              <Ionicons name="create-outline" size={20} color={t.icon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              className="rounded-2xl items-center justify-center"
              style={{
                width: 44,
                height: 44,
                backgroundColor: isDark ? '#7F1D1D40' : '#FEE2E2',
              }}
            >
              <Ionicons name="trash-outline" size={20} color={brand.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          className={`rounded-3xl p-5 mb-4`}
          style={{
            backgroundColor: priorityColor,
            shadowColor: priorityColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <Text className="text-white/80 text-xs font-semibold uppercase">Приоритет: {priorityLabel}</Text>
          <Text className="text-white text-2xl font-extrabold mt-1">{task.title}</Text>
          {task.due_date ? (
            <View className="flex-row items-center mt-3">
              <Ionicons name="time-outline" size={14} color="#FFFFFF" />
              <Text className="text-white/90 text-sm ml-1">
                {format(new Date(task.due_date), 'dd MMM yyyy, HH:mm')}
              </Text>
            </View>
          ) : null}
        </View>

        {task.description ? (
          <View
            className={`${t.surface} rounded-2xl p-5 mb-4`}
            style={{ ...borderStyle, ...cardShadow }}
          >
            <Text className={`${t.textSecondary} text-xs font-semibold uppercase mb-2`}>Описание</Text>
            <Text className={`${t.text} text-base leading-6`}>{task.description}</Text>
          </View>
        ) : null}

        <View
          className={`${t.surface} rounded-2xl p-5 mb-4`}
          style={{ ...borderStyle, ...cardShadow }}
        >
          <Text className={`${t.textSecondary} text-xs font-semibold uppercase mb-3`}>Детали</Text>

          <View className="flex-row items-center justify-between py-2.5">
            <Text className={`${t.textSecondary} text-sm`}>Статус</Text>
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: isDark ? `${statusColor}30` : `${statusColor}20` }}
            >
              <Text className="text-xs font-semibold" style={{ color: statusColor }}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {task.course ? (
            <View
              className="flex-row items-center justify-between py-2.5 border-t"
              style={{ borderColor: t.borderHex }}
            >
              <Text className={`${t.textSecondary} text-sm`}>Курс</Text>
              <Text className={`${t.text} font-semibold`}>{task.course}</Text>
            </View>
          ) : null}

          {task.tags && task.tags.length > 0 ? (
            <View
              className="py-2.5 border-t"
              style={{ borderColor: t.borderHex }}
            >
              <Text className={`${t.textSecondary} text-sm mb-2`}>Теги</Text>
              <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                {task.tags.map((tag, index) => (
                  <View
                    key={index}
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: isDark ? '#312E8140' : '#EEF2FF' }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: brand.primary }}>
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        <View
          className={`${t.surface} rounded-2xl p-5`}
          style={{ ...borderStyle, ...cardShadow }}
        >
          <View className="flex-row items-center mb-3">
            <Ionicons name="notifications-outline" size={20} color={brand.primary} />
            <Text className={`${t.text} font-bold ml-2 text-base`}>Напоминание</Text>
          </View>
          {task.reminder ? (
            <View>
              <Text className={`${t.text}`}>
                {format(new Date(task.reminder.remind_at), 'dd MMM yyyy, HH:mm')}
              </Text>
              <TouchableOpacity
                className="rounded-2xl py-3 mt-3"
                style={{ backgroundColor: isDark ? '#7F1D1D40' : '#FEE2E2' }}
                onPress={handleRemoveReminder}
              >
                <Text className="text-center font-bold" style={{ color: brand.danger }}>
                  Удалить напоминание
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="rounded-2xl py-3"
              style={{ backgroundColor: brand.primary }}
              onPress={() => setShowReminderPicker(true)}
            >
              <Text className="text-white text-center font-bold">Установить напоминание</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showReminderPicker && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <View className={`${t.surface} rounded-3xl p-6 w-full`} style={cardShadow}>
            <Text className={`${t.text} font-bold text-lg mb-4`}>Выберите время</Text>
            <DateTimePicker
              value={reminderDate}
              mode="datetime"
              display="default"
              onChange={(event, date) => {
                if (date) setReminderDate(date);
              }}
            />
            <View className="flex-row justify-end mt-4" style={{ gap: 10 }}>
              <TouchableOpacity
                className="rounded-xl px-4 py-2.5"
                style={{ backgroundColor: t.surfaceAltHex }}
                onPress={() => setShowReminderPicker(false)}
              >
                <Text className={`${t.text} font-semibold`}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-xl px-4 py-2.5"
                style={{ backgroundColor: brand.primary }}
                onPress={handleSetReminder}
              >
                <Text className="text-white font-bold">Установить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
