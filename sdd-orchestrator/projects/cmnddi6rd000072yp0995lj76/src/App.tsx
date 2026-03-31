import { useEffect, useState, type ChangeEvent } from 'react';
import { curatedZones, formatClock, type TimeZoneClock } from './clock';

function getZoneById(zoneId: string): TimeZoneClock {
  return curatedZones.find((zone) => zone.id === zoneId) ?? curatedZones[0];
}

export default function App() {
  const [now, setNow] = useState(() => new Date());
  const [activeZoneId, setActiveZoneId] = useState(curatedZones[1].id);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const activeZone = getZoneById(activeZoneId);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Clock</p>
        <h1>Reloj multizona</h1>
        <p className="subtitle">
          Sigue la hora actual en varias zonas y cambia la destacada con un clic.
        </p>

        <label className="zone-picker">
          <span>Zona destacada</span>
          <select
            aria-label="Zona destacada"
            value={activeZoneId}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              setActiveZoneId(event.target.value);
            }}
          >
            {curatedZones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="featured-clock" aria-live="polite">
        <div>
          <p className="card-label">Zona activa</p>
          <h2>{activeZone.label}</h2>
        </div>
        <p className="clock-time">{formatClock(now, activeZone.timeZone).time}</p>
        <p className="clock-date">{formatClock(now, activeZone.timeZone).date}</p>
      </section>

      <section>
        <h2 className="section-title">Zonas disponibles</h2>
        <div className="clock-grid">
          {curatedZones.map((zone) => {
            const current = formatClock(now, zone.timeZone);
            const isActive = zone.id === activeZoneId;

            return (
              <article
                key={zone.id}
                className={`clock-card${isActive ? ' clock-card--active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`${zone.label} ${isActive ? 'destacada' : 'fija'}`}
              >
                <p className="card-label">{isActive ? 'Destacada' : 'Zona fija'}</p>
                <h3>{zone.label}</h3>
                <p className="clock-time clock-time--small">{current.time}</p>
                <p className="clock-date">{current.date}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
