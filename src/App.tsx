import { useEffect, useState } from 'react';
import { GraphEditor } from './components/GraphEditor';
import { Header } from './components/Header';
import { JsonEditor } from './components/JsonEditor';
import { RouteCard } from './components/RouteCard';
import { defaultGraphData } from './data/defaultGraphData';
import { DEFAULT_SCHEDULE } from './data/defaultSchedule';
import { clearGraph, loadGraph, saveGraph } from './lib/graphStorage';
import {
  findNextDeparture,
  getCurrentMinutes,
  getDayType,
  processRoutes,
} from './lib/scheduleUtils';
import { clearSchedule, loadSchedule, saveSchedule } from './lib/storage';
import type { BusGraph, BusRoute } from './types';

export default function App() {
  const [rawData, setRawData] = useState<BusRoute[]>(DEFAULT_SCHEDULE);
  const [graphData, setGraphData] = useState<BusGraph>(defaultGraphData);
  const [now, setNow] = useState<Date>(new Date());
  const [editorOpen, setEditorOpen] = useState(false);
  const [graphEditorOpen, setGraphEditorOpen] = useState(false);

  useEffect(() => {
    const saved = loadSchedule();
    if (saved) setRawData(saved);
    const savedGraph = loadGraph();
    if (savedGraph) setGraphData(savedGraph);
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

  function handleResetToDefault() {
    clearSchedule();
    setRawData(DEFAULT_SCHEDULE);
  }

  function handleGraphSave(graph: BusGraph) {
    setGraphData(graph);
    saveGraph(graph);
  }

  function handleGraphResetToDefault() {
    clearGraph();
    setGraphData(defaultGraphData);
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
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col">
        <GraphEditor
          graph={graphData}
          isOpen={graphEditorOpen}
          onToggle={() => setGraphEditorOpen((o) => !o)}
          onSave={handleGraphSave}
          onResetToDefault={handleGraphResetToDefault}
        />
        <JsonEditor
          rawData={rawData}
          isOpen={editorOpen}
          onToggle={() => setEditorOpen((o) => !o)}
          onSave={handleSave}
          onResetToDefault={handleResetToDefault}
        />
      </div>
    </div>
  );
}
