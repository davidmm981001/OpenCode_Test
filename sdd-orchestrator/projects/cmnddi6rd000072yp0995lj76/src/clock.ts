export type TimeZoneClock = {
  id: string;
  label: string;
  timeZone: string;
};

export const curatedZones: TimeZoneClock[] = [
  { id: 'cdmx', label: 'Ciudad de México', timeZone: 'America/Mexico_City' },
  { id: 'madrid', label: 'Madrid', timeZone: 'Europe/Madrid' },
  { id: 'tokio', label: 'Tokio', timeZone: 'Asia/Tokyo' },
  { id: 'nueva-york', label: 'Nueva York', timeZone: 'America/New_York' }
];

export function formatClock(date: Date, timeZone: string) {
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    hourCycle: 'h23'
  });

  const dateFormatter = new Intl.DateTimeFormat('es-ES', {
    timeZone,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return {
    time: timeFormatter.format(date),
    date: dateFormatter.format(date)
  };
}

export function formatReferenceDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('es-ES', {
    timeZone,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}
