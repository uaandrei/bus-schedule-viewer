import type { BusRoute, DayType, NextDeparture, ProcessedRoute } from '../types';

export function getDayType(date: Date = new Date()): DayType {
  const day = date.getDay();
  return day === 0 || day === 6 ? 'weekend' : 'weekday';
}

export function filterTimes(departureTimes: string[], dayType: DayType): string[] {
  if (dayType === 'weekend') {
    return departureTimes.filter((t) => t.startsWith('*')).map((t) => t.slice(1));
  }
  return departureTimes.filter((t) => !t.startsWith('*'));
}

export function processRoutes(routes: BusRoute[], dayType: DayType): ProcessedRoute[] {
  return routes
    .map((route) => ({
      id: route.id,
      bus: route.bus,
      departureStation: route.departureStation,
      times: filterTimes(route.departureTimes, dayType),
    }))
    .filter((r) => r.times.length > 0);
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function getCurrentMinutes(date: Date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function findNextDeparture(
  routes: ProcessedRoute[],
  nowMinutes: number
): NextDeparture | null {
  let earliest: { routeId: string; time: string; minutes: number } | null = null;
  for (const route of routes) {
    for (const time of route.times) {
      const mins = toMinutes(time);
      if (mins > nowMinutes && (!earliest || mins < earliest.minutes)) {
        earliest = { routeId: route.id, time, minutes: mins };
      }
    }
  }
  return earliest ? { routeId: earliest.routeId, time: earliest.time } : null;
}

export function isValidSchedule(data: unknown): data is BusRoute[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        ['id', 'bus', 'departureStation'].every(
          (k) => typeof (item as Record<string, unknown>)[k] === 'string'
        ) &&
        Array.isArray((item as Record<string, unknown>).departureTimes) &&
        ((item as Record<string, unknown>).departureTimes as unknown[]).every(
          (t) => typeof t === 'string'
        )
    )
  );
}
