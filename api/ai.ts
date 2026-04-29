import { api } from './client';
import { AIPlanResponse, AIPlanRequest, AIBreakdownResponse, AIBreakdownRequest } from '@/types/ai';

/**
 * Генерация AI-плана на день
 */
export async function generateAIPlan(request: AIPlanRequest): Promise<AIPlanResponse> {
  const response = await api.post('/ai/plan', request);
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Ошибка генерации плана');
  }
  
  return response.data.plan;
}

/**
 * Разбиение задачи на подзадачи
 */
export async function breakdownTask(request: AIBreakdownRequest): Promise<AIBreakdownResponse> {
  const response = await api.post('/ai/breakdown', request);
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'Ошибка разбиения задачи');
  }
  
  return response.data.breakdown;
}

