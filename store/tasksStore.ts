import { create } from 'zustand';
import { api } from '@/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreNotifications } from '@/services/notifications';

export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  course?: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
  reminder?: {
    remind_at: string;
    notification_id?: string;
  };
}

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  filters: {
    status?: string;
    priority?: string;
    course?: string;
    search?: string;
    sort_by?: string;
  };
  fetchTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: number, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  setFilters: (filters: Partial<TasksState['filters']>) => void;
  markAsDone: (id: number) => Promise<void>;
}

const TASKS_CACHE_KEY = 'tasks_cache';

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  filters: {
    sort_by: 'due_date',
  },

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.course) params.append('course', filters.course);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      
      const response = await api.get(`/tasks?${params.toString()}`);
      const tasks = response.data.tasks;
      
      set({ tasks, isLoading: false });
      
      // Кешируем для offline
      await AsyncStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(tasks));
      
      // Восстанавливаем уведомления для задач с активными reminders
      await restoreNotifications(tasks);
    } catch (error: any) {
      // Пытаемся загрузить из кеша
      try {
        const cached = await AsyncStorage.getItem(TASKS_CACHE_KEY);
        if (cached) {
          set({ tasks: JSON.parse(cached), isLoading: false });
        }
      } catch {}
      
      set({ isLoading: false });
      throw error;
    }
  },

  createTask: async (taskData: Partial<Task>) => {
    const response = await api.post('/tasks', taskData);
    const newTask = response.data.task;
    
    set((state) => ({
      tasks: [newTask, ...state.tasks],
    }));
    
    return newTask;
  },

  updateTask: async (id: number, taskData: Partial<Task>) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    const updatedTask = response.data.task;
    
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
    }));
  },

  deleteTask: async (id: number) => {
    await api.delete(`/tasks/${id}`);
    
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },

  setFilters: (newFilters: Partial<TasksState['filters']>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  markAsDone: async (id: number) => {
    await get().updateTask(id, { status: 'done' });
  },
}));

