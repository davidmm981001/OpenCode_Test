import { useEffect, useMemo, useState } from 'react';
import { fetchTimers, startTimer, stopTimer } from './api';
import type { TimerSession } from './types';
import { formatDuration } from './utils/formatDuration';

export default function App() {
  const [timers, setTimers] = useState<TimerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const activeTimer = useMemo(
    () => timers.find((timer) => timer.status === 'RUNNING') ?? null,
    [timers]
  );

  useEffect(() => {
    void loadTimers();
  }, []);

  useEffect(() => {
    if (!activeTimer) {
      return;
    }

    const interval = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeTimer]);

  async function loadTimers() {
    try {
      setLoading(true);
      setError(null);
      setTimers(await fetchTimers());
    } catch {
      setError('No se pudo cargar el historial.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    try {
      setError(null);
      await startTimer();
      await loadTimers();
    } catch {
      setError('No se pudo iniciar el tiempo.');
    }
  }

  async function handleStop() {
    if (!activeTimer) {
      return;
    }

    try {
      setError(null);
      await stopTimer(activeTimer.id);
      await loadTimers();
    } catch {
      setError('No se pudo detener el tiempo.');
    }
  }

  const liveElapsed = activeTimer
    ? Date.now() - new Date(activeTimer.startedAt).getTime() + tick * 0
    : 0;

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Stopwatch simple</p>
          <h1>Cronometra, detiene y guarda cada tiempo.</h1>
        </div>
        <div className="clock-card">
          <span className="label">Tiempo actual</span>
          <strong className="clock-value">{formatDuration(activeTimer ? liveElapsed : 0)}</strong>
          <div className="actions">
            <button onClick={handleStart} disabled={Boolean(activeTimer)}>
              Iniciar
            </button>
            <button onClick={handleStop} disabled={!activeTimer} className="secondary">
              Detener
            </button>
          </div>
          {error ? <p className="error">{error}</p> : null}
        </div>
      </section>

      <section className="history">
        <div className="section-title">
          <h2>Historial</h2>
          <span>{loading ? 'Cargando...' : `${timers.length} registros`}</span>
        </div>

        <div className="history-list">
          {timers.length === 0 && !loading ? (
            <p className="empty">Aun no hay tiempos guardados.</p>
          ) : null}

          {timers.map((timer) => {
            const duration = timer.status === 'RUNNING'
              ? formatDuration(Date.now() - new Date(timer.startedAt).getTime())
              : formatDuration(timer.durationMillis ?? 0);

            return (
              <article className="history-item" key={timer.id}>
                <div>
                  <p className="history-status">{timer.status === 'RUNNING' ? 'En curso' : 'Finalizado'}</p>
                  <strong>{duration}</strong>
                </div>
                <time dateTime={timer.startedAt}>
                  Inicio: {new Date(timer.startedAt).toLocaleString('es-ES')}
                </time>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
