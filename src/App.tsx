import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { JsonEditor } from './components/JsonEditor';
import { RouteCard } from './components/RouteCard';
import { DEFAULT_SCHEDULE } from './data/defaultSchedule';
import {
  findNextDeparture,
  getCurrentMinutes,
  getDayType,
  processRoutes,
} from './lib/scheduleUtils';
import { loadSchedule, saveSchedule } from './lib/storage';
import type { BusRoute } from './types';

export default function App() {
  const [rawData, setRawData] = useState<BusRoute[]>(DEFAULT_SCHEDULE);
  const [now, setNow] = useState<Date>(new Date());
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    const saved = loadSchedule();
    if (saved) setRawData(saved);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dayType = getDayType(now);
  const processedRoutes = processRoutes(rawData, dayType);
  const nowMinutes = getCurrentMinutes(now);
  const nextDeparture = findNextDeparture(processedRoutes, nowMinutes);

  function handleSave(data: BusRoute[]) {
    setRawData(data);
    saveSchedule(data);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 pt-8 pb-48 md:px-8">
        <Header dayType={dayType} now={now} />
        <main className="max-w-4xl mx-auto space-y-4">
          {processedRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              nowMinutes={nowMinutes}
              nextDeparture={nextDeparture}
            />
          ))}
          {processedRoutes.length === 0 && (
            <p className="text-center text-gray-400 py-12">No departures available for today.</p>
          )}
        </main>
      </div>
      <JsonEditor
        rawData={rawData}
        isOpen={editorOpen}
        onToggle={() => setEditorOpen((o) => !o)}
        onSave={handleSave}
      />
    </div>
  );
}
