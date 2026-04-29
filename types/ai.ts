// Типы для AI Coach

export interface TimeBlock {
  time_block: string;
  task_title: string;
  why: string;
  tips: string[];
}


export interface AIPlanResponse {
  headline: string;
  today_plan: TimeBlock[];
  top3_priorities: string[];
  risk_alerts: string[];
  next_step: string;
}

export interface AIBreakdownStep {
  step_number: number;
  title: string;
  description: string;
  estimated_time: string;
  tips: string[];
}

export interface AIBreakdownResponse {
  task_title: string;
  estimated_total_time: string;
  steps: AIBreakdownStep[];
  motivation: string;
}

export interface AIPlanRequest {
  tasks: {
    title: string;
    due_date?: string;
    priority: string;
    status: string;
    course?: string;
  }[];
  schedule: {
    title: string;
    start_time: string;
    end_time: string;
    location?: string;
  }[];
  timezone: string;
  free_minutes?: number;
}

export interface AIBreakdownRequest {
  title: string;
  description?: string;
  due_date?: string;
}

