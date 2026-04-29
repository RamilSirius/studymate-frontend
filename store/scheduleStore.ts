import { create } from 'zustand';
import { api } from '@/api/client';

export interface ScheduleItem {
  id: number;
  title: string;
  day_of_week: number; // 0-6 (Monday-Sunday)
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  location?: string;
  course?: string;
  created_at?: string;
  updated_at?: string;
}

interface ScheduleState {
  schedule: ScheduleItem[];
  isLoading: boolean;
  fetchSchedule: () => Promise<void>;
  createItem: (item: Partial<ScheduleItem>) => Promise<ScheduleItem>;
  updateItem: (id: number, item: Partial<ScheduleItem>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedule: [],
  isLoading: false,

  fetchSchedule: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/schedule');
      set({ schedule: response.data.schedule, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createItem: async (itemData: Partial<ScheduleItem>) => {
    const response = await api.post('/schedule', itemData);
    const newItem = response.data.schedule_item;
    
    set((state) => ({
      schedule: [...state.schedule, newItem],
    }));
    
    return newItem;
  },

  updateItem: async (id: number, itemData: Partial<ScheduleItem>) => {
    const response = await api.put(`/schedule/${id}`, itemData);
    const updatedItem = response.data.schedule_item;
    
    set((state) => ({
      schedule: state.schedule.map((item) => (item.id === id ? updatedItem : item)),
    }));
  },

  deleteItem: async (id: number) => {
    await api.delete(`/schedule/${id}`);
    
    set((state) => ({
      schedule: state.schedule.filter((item) => item.id !== id),
    }));
  },
}));

