import { toMinutes } from '../lib/scheduleUtils';
import type { NextDeparture, ProcessedRoute } from '../types';
import { TimeChip } from './TimeChip';

const BUS_COLORS: Record<string, string> = {
  '10b': 'bg-orange-500',
  '11': 'bg-blue-600',
  '12': 'bg-purple-600',
  '32': 'bg-rose-600',
};

function getBusColor(bus: string): string {
  return BUS_COLORS[bus] ?? 'bg-gray-600';
}

interface RouteCardProps {
  route: ProcessedRoute;
  nowMinutes: number;
  nextDeparture: NextDeparture | null;
}

export function RouteCard({ route, nowMinutes, nextDeparture }: RouteCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`${getBusColor(route.bus)} text-white text-lg font-bold rounded-xl px-3 py-1 min-w-[3rem] text-center`}
        >
          {route.bus}
        </span>
        <span className="text-gray-700 font-medium text-base">{route.departureStation}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {route.times.map((time) => {
          const mins = toMinutes(time);
          const isPast = mins <= nowMinutes;
          const isNext =
            nextDeparture !== null &&
            nextDeparture.routeId === route.id &&
            nextDeparture.time === time;
          return <TimeChip key={time} time={time} isPast={isPast} isNext={isNext} />;
        })}
      </div>
    </div>
  );
}
