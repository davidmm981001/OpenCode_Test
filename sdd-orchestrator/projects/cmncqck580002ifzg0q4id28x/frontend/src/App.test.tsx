import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const fetchTimers = vi.fn();
const startTimer = vi.fn();
const stopTimer = vi.fn();

vi.mock('./api', () => ({
  fetchTimers: () => fetchTimers(),
  startTimer: () => startTimer(),
  stopTimer: (id: string) => stopTimer(id)
}));

describe('App', () => {
  beforeEach(() => {
    vi.useRealTimers();
    fetchTimers.mockReset();
    startTimer.mockReset();
    stopTimer.mockReset();
  });

  it('muestra el historial y permite detener un tiempo activo', async () => {
    fetchTimers.mockResolvedValue([
      {
        id: '2',
        status: 'COMPLETED',
        startedAt: '2026-03-30T11:58:00.000Z',
        endedAt: '2026-03-30T11:59:30.000Z',
        durationMillis: 90000
      },
      {
        id: '1',
        status: 'RUNNING',
        startedAt: '2026-03-30T11:59:00.000Z',
        endedAt: null,
        durationMillis: null
      }
    ]);

    startTimer.mockResolvedValue({});
    stopTimer.mockResolvedValue({});

    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByText('Historial')).toBeInTheDocument();
    expect(screen.getByText('En curso')).toBeInTheDocument();
    expect(screen.getByText('00:01:30')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Detener' }));

    await waitFor(() => {
      expect(stopTimer).toHaveBeenCalledWith('1');
    });
  });
});
