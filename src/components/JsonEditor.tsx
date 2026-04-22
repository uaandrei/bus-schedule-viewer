import { useEffect, useState } from 'react';
import { isValidSchedule } from '../lib/scheduleUtils';
import type { BusRoute } from '../types';

interface JsonEditorProps {
  rawData: BusRoute[];
  isOpen: boolean;
  onToggle: () => void;
  onSave: (data: BusRoute[]) => void;
}

export function JsonEditor({ rawData, isOpen, onToggle, onSave }: JsonEditorProps) {
  const [editorText, setEditorText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEditorText(JSON.stringify(rawData, null, 2));
      setError(null);
    }
  }, [isOpen]);

  function handleSave() {
    try {
      const parsed = JSON.parse(editorText);
      if (!isValidSchedule(parsed)) {
        throw new Error(
          'Invalid structure. Each entry must have id, bus, departureStation, and departureTimes[].'
        );
      }
      setError(null);
      onSave(parsed);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function handleReset() {
    setEditorText(JSON.stringify(rawData, null, 2));
    setError(null);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-2xl z-50">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Edit Schedule Data
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <textarea
            value={editorText}
            onChange={(e) => setEditorText(e.target.value)}
            className="w-full h-64 font-mono text-xs border border-gray-300 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            spellCheck={false}
          />
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
