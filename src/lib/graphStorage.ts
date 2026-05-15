import type { BusGraph } from '../types';

const STORAGE_KEY = 'bus-schedule-viewer:graph';

function isValidGraph(data: unknown): data is BusGraph {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.nodes) || !Array.isArray(obj.edges)) return false;
  const nodesValid = obj.nodes.every(
    (n) =>
      typeof n === 'object' &&
      n !== null &&
      typeof (n as Record<string, unknown>).id === 'string' &&
      typeof (n as Record<string, unknown>).label === 'string'
  );
  if (!nodesValid) return false;
  return obj.edges.every(
    (e) =>
      typeof e === 'object' &&
      e !== null &&
      ['id', 'from', 'to', 'bus'].every(
        (k) => typeof (e as Record<string, unknown>)[k] === 'string'
      )
  );
}

export function loadGraph(): BusGraph | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidGraph(parsed)) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveGraph(graph: BusGraph): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(graph));
}

export function clearGraph(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
