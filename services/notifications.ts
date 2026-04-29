import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from '@/api/client';

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Разрешение на уведомления необходимо для напоминаний!');
    return false;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  
  return true;
}

export async function scheduleNotification(taskId: number, title: string, remindAt: Date): Promise<string> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    throw new Error('Нет разрешения на уведомления');
  }
  
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Напоминание о задаче',
      body: title,
      data: { taskId },
    },
    trigger: remindAt,
  });
  
  // Сохраняем на сервере
  try {
    await api.post(`/tasks/${taskId}/reminder`, {
      remind_at: remindAt.toISOString(),
      notification_id: notificationId,
    });
  } catch (error) {
    console.error('Error saving reminder:', error);
  }
  
  return notificationId;
}

export async function cancelNotification(notificationId: string, taskId: number) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
  
  try {
    await api.delete(`/tasks/${taskId}/reminder`);
  } catch (error) {
    console.error('Error deleting reminder:', error);
  }
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function rescheduleNotification(taskId: number, title: string, oldNotificationId: string, newRemindAt: Date) {
  if (oldNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(oldNotificationId);
  }
  
  return await scheduleNotification(taskId, title, newRemindAt);
}

// Восстановление уведомлений из задач с активными reminders
export async function restoreNotifications(tasks: Array<{ id: number; title: string; reminder?: { remind_at: string; notification_id?: string } }>) {
  const now = new Date();
  
  for (const task of tasks) {
    if (task.reminder && task.reminder.remind_at) {
      const remindAt = new Date(task.reminder.remind_at);
      
      // Если напоминание в будущем и нет notification_id, создаем новое
      if (remindAt > now && !task.reminder.notification_id) {
        try {
          await scheduleNotification(task.id, task.title, remindAt);
        } catch (error) {
          console.error(`Error restoring notification for task ${task.id}:`, error);
        }
      }
    }
  }
}

