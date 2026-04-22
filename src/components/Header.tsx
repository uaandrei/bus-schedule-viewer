import type { DayType } from '../types';

interface HeaderProps {
  dayType: DayType;
  now: Date;
}

export function Header({ dayType, now }: HeaderProps) {
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bus Schedule</h1>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            dayType === 'weekend'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {dayType === 'weekend' ? 'Weekend' : 'Weekday'}
        </span>
      </div>
      <span className="text-gray-500 text-sm font-mono tabular-nums">{timeStr}</span>
    </header>
  );
}
