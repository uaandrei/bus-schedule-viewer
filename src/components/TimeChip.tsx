interface TimeChipProps {
  time: string;
  isPast: boolean;
  isNext: boolean;
}

export function TimeChip({ time, isPast, isNext }: TimeChipProps) {
  let className =
    'inline-block rounded-full px-3 py-1 text-sm font-medium transition-colors';

  if (isNext) {
    className += ' text-white bg-green-500 ring-2 ring-green-300 ring-offset-1 font-bold scale-105';
  } else if (isPast) {
    className += ' text-gray-400 bg-gray-100';
  } else {
    className += ' text-gray-700 bg-gray-200';
  }

  return <span className={className}>{time}</span>;
}
