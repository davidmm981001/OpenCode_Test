export type TimerStatus = 'RUNNING' | 'COMPLETED';

export interface TimerSession {
  id: string;
  status: TimerStatus;
  startedAt: string;
  endedAt: string | null;
  durationMillis: number | null;
}
