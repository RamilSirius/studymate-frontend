import { create } from 'zustand';
import { api } from '@/api/client';

export interface ProgressSummary {
  range_days: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  status_counts: {
    todo: number;
    in_progress: number;
    done: number;
  };
  priority_counts: {
    low: number;
    medium: number;
    high: number;
  };
  streak: number;
}

interface ProgressState {
  summary7: ProgressSummary | null;
  summary30: ProgressSummary | null;
  isLoading: boolean;
  fetchProgress: (range: 7 | 30) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set) => ({
  summary7: null,
  summary30: null,
  isLoading: false,

  fetchProgress: async (range: 7 | 30) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/progress/summary?range=${range}`);
      const summary = response.data;
      
      if (range === 7) {
        set({ summary7: summary, isLoading: false });
      } else {
        set({ summary30: summary, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));

