import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTasksStore } from '@/store/tasksStore';
import { useThemeStore } from '@/store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Task } from '@/store/tasksStore';
import { tokens, brand } from '@/utils/theme';

export default function TasksScreen() {
  const { tasks, fetchTasks, isLoading, filters, setFilters, markAsDone } = useTasksStore();
  const { theme } = useThemeStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters({ search: searchQuery || undefined });
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const t = tokens(theme);
  const isDark = theme === 'dark';

  const cardShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.25 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  };

  const getPriorityMeta = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: brand.danger, label: 'Высокий', bg: isDark ? '#7F1D1D30' : '#FEE2E2' };
      case 'medium':
        return { color: brand.warning, label: 'Средний', bg: isDark ? '#78350F30' : '#FEF3C7' };
      case 'low':
        return { color: brand.success, label: 'Низкий', bg: isDark ? '#06402030' : '#D1FAE5' };
      default:
        return { color: '#6B7280', label: '—', bg: '#E5E7EB' };
    }
  };

  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'done':
        return { color: brand.success, label: 'Выполнено' };
      case 'in_progress':
        return { color: brand.primary, label: 'В работе' };
      case 'todo':
        return { color: '#94A3B8', label: 'К выполнению' };
      default:
        return { color: '#94A3B8', label: 'К выполнению' };
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'done') return false;
    return new Date(task.due_date) < new Date();
  };

  const renderTask = ({ item }: { item: Task }) => {
    const priority = getPriorityMeta(item.priority);
    const status = getStatusMeta(item.status);
    const overdue = isOverdue(item);
    const isDone = item.status === 'done';

    return (
      <TouchableOpacity
        className={`${t.surface} rounded-2xl mb-3 flex-row`}
        style={{
          borderWidth: isDark ? 0 : 1,
          borderColor: t.borderHex,
          opacity: isDone ? 0.7 : 1,
          ...cardShadow,
        }}
        onPress={() => router.push(`/(tabs)/tasks/${item.id}`)}
        activeOpacity={0.85}
      >
        <View
          style={{
            width: 4,
            backgroundColor: priority.color,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          }}
        />
        <View className="flex-1 p-4">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 mr-2">
              <Text
                className={`${t.text} font-semibold text-base`}
                style={{ textDecorationLine: isDone ? 'line-through' : 'none' }}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              {item.description ? (
                <Text className={`${t.textSecondary} text-sm mt-1`} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={async (e) => {
                e.stopPropagation();
                await markAsDone(item.id);
              }}
              hitSlop={8}
              className="ml-1"
            >
              <Ionicons
                name={isDone ? 'checkmark-circle' : 'ellipse-outline'}
                size={28}
                color={isDone ? brand.success : t.iconMuted}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center flex-wrap mt-3" style={{ gap: 6 }}>
            <View
              className="rounded-full px-2.5 py-1 flex-row items-center"
              style={{ backgroundColor: priority.bg }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: priority.color,
                  marginRight: 6,
                }}
              />
              <Text className="text-xs font-semibold" style={{ color: priority.color }}>
                {priority.label}
              </Text>
            </View>
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: isDark ? `${status.color}25` : `${status.color}20` }}
            >
              <Text className="text-xs font-semibold" style={{ color: status.color }}>
                {status.label}
              </Text>
            </View>
            {item.course ? (
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: isDark ? '#312E8140' : '#EEF2FF' }}
              >
                <Text className="text-xs font-semibold" style={{ color: brand.primary }}>
                  {item.course}
                </Text>
              </View>
            ) : null}
            {overdue ? (
              <View
                className="rounded-full px-2.5 py-1 flex-row items-center"
                style={{ backgroundColor: isDark ? '#7F1D1D40' : '#FEE2E2' }}
              >
                <Ionicons name="alert-circle" size={11} color={brand.danger} />
                <Text className="text-xs font-semibold ml-1" style={{ color: brand.danger }}>
                  Просрочено
                </Text>
              </View>
            ) : null}
          </View>

          {item.due_date ? (
            <Text className={`${t.textSecondary} text-xs mt-3`}>
              <Ionicons name="calendar-outline" size={11} />{' '}
              {format(new Date(item.due_date), 'dd MMM, HH:mm')}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  const filterChips: Array<{ key: any; label: string; status: any }> = [
    { key: 'all', label: 'Все', status: undefined },
    { key: 'todo', label: 'К выполнению', status: 'todo' },
    { key: 'in_progress', label: 'В работе', status: 'in_progress' },
    { key: 'done', label: 'Выполнено', status: 'done' },
  ];

  return (
    <View className={`flex-1 ${t.bg}`}>
      <View className="px-5 pt-14 pb-3">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className={`text-3xl font-extrabold ${t.text}`}>Задачи</Text>
            <Text className={`${t.textSecondary} text-sm mt-0.5`}>
              {tasks.length} {tasks.length === 1 ? 'задача' : 'всего'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/tasks/create')}
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

        <View
          className={`${t.surface} flex-row items-center rounded-2xl px-4 mb-3`}
          style={{
            height: 48,
            borderWidth: isDark ? 0 : 1,
            borderColor: t.borderHex,
            ...cardShadow,
          }}
        >
          <Ionicons name="search" size={18} color={t.iconMuted} />
          <TextInput
            className={`flex-1 ml-3 ${t.text}`}
            style={{ height: '100%' }}
            placeholder="Поиск задач..."
            placeholderTextColor={t.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={t.iconMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {filterChips.map((chip) => {
            const active =
              chip.status === undefined ? !filters.status : filters.status === chip.status;
            return (
              <TouchableOpacity
                key={chip.key}
                onPress={() => setFilters({ status: chip.status })}
                activeOpacity={0.85}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: active ? brand.primary : t.surfaceHex,
                  borderWidth: active ? 0 : isDark ? 0 : 1,
                  borderColor: t.borderHex,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: active ? '#FFFFFF' : t.textSecondaryHex }}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={brand.primary} />
        </View>
      ) : tasks.length === 0 ? (
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
            <Ionicons name="document-text-outline" size={48} color={brand.primary} />
          </View>
          <Text className={`${t.text} font-bold text-xl`}>Задач пока нет</Text>
          <Text className={`${t.textSecondary} text-sm mt-2 text-center`}>
            Добавьте первую задачу и приступайте к делу!
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/tasks/create')}
            className="mt-6 rounded-2xl px-6 py-3"
            style={{ backgroundColor: brand.primary }}
          >
            <Text className="text-white font-bold">+ Создать задачу</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
