import axios from 'axios';
import type { TimerSession } from './types';

const api = axios.create({
  baseURL: '/api'
});

export async function fetchTimers(): Promise<TimerSession[]> {
  const response = await api.get<TimerSession[]>('/timers');
  return response.data;
}

export async function startTimer(): Promise<TimerSession> {
  const response = await api.post<TimerSession>('/timers/start');
  return response.data;
}

export async function stopTimer(id: string): Promise<TimerSession> {
  const response = await api.post<TimerSession>(`/timers/${id}/stop`);
  return response.data;
}
