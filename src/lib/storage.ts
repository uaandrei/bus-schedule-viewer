import type { BusRoute } from '../types';

const STORAGE_KEY = 'bus-schedule-viewer:data';

function isValidSchedule(data: unknown): data is BusRoute[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        ['id', 'bus', 'departureStation'].every((k) => typeof (item as Record<string, unknown>)[k] === 'string') &&
        Array.isArray((item as Record<string, unknown>).departureTimes) &&
        ((item as Record<string, unknown>).departureTimes as unknown[]).every((t) => typeof t === 'string')
    )
  );
}

export function loadSchedule(): BusRoute[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidSchedule(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSchedule(data: BusRoute[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
