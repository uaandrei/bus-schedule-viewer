import { useMemo, useState } from 'react';
import type { BusGraph, GraphEdge, GraphNode } from '../types';

interface GraphEditorProps {
  graph: BusGraph;
  isOpen: boolean;
  onToggle: () => void;
  onSave: (graph: BusGraph) => void;
  onResetToDefault: () => void;
}

interface EditorBodyProps {
  initialGraph: BusGraph;
  onSave: (graph: BusGraph) => void;
  onResetToDefault: () => void;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueId(base: string, taken: Set<string>): string {
  const slug = slugify(base) || 'item';
  if (!taken.has(slug)) return slug;
  let i = 2;
  while (taken.has(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

export function GraphEditor({ graph, isOpen, onToggle, onSave, onResetToDefault }: GraphEditorProps) {
  return (
    <div className="border-t border-gray-200 bg-white shadow-2xl">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="18" cy="6" r="2.5" />
            <circle cx="12" cy="18" r="2.5" />
            <path strokeLinecap="round" d="M7.5 7.5 L11 16.5 M16.5 7.5 L13 16.5 M8 6 L16 6" />
          </svg>
          Bus Line Graph
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
        <EditorBody
          initialGraph={graph}
          onSave={onSave}
          onResetToDefault={onResetToDefault}
        />
      )}
    </div>
  );
}

function EditorBody({ initialGraph, onSave, onResetToDefault }: EditorBodyProps) {
  const [draft, setDraft] = useState<BusGraph>(initialGraph);
  const [error, setError] = useState<string | null>(null);

  const nodeIds = useMemo(() => new Set(draft.nodes.map((n) => n.id)), [draft.nodes]);

  function updateNode(index: number, patch: Partial<GraphNode>) {
    setDraft((d) => ({
      ...d,
      nodes: d.nodes.map((n, i) => (i === index ? { ...n, ...patch } : n)),
    }));
  }

  function addNode() {
    setDraft((d) => {
      const taken = new Set(d.nodes.map((n) => n.id));
      const id = uniqueId('station', taken);
      return { ...d, nodes: [...d.nodes, { id, label: 'New station' }] };
    });
  }

  function removeNode(index: number) {
    setDraft((d) => {
      const removed = d.nodes[index];
      return {
        nodes: d.nodes.filter((_, i) => i !== index),
        edges: d.edges.filter((e) => e.from !== removed.id && e.to !== removed.id),
      };
    });
  }

  function updateEdge(index: number, patch: Partial<GraphEdge>) {
    setDraft((d) => ({
      ...d,
      edges: d.edges.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    }));
  }

  function addEdge() {
    setDraft((d) => {
      const taken = new Set(d.edges.map((e) => e.id));
      const id = uniqueId('edge', taken);
      const fallback = d.nodes[0]?.id ?? '';
      return {
        ...d,
        edges: [...d.edges, { id, from: fallback, to: fallback, bus: '' }],
      };
    });
  }

  function removeEdge(index: number) {
    setDraft((d) => ({ ...d, edges: d.edges.filter((_, i) => i !== index) }));
  }

  function validate(g: BusGraph): string | null {
    const ids = new Set<string>();
    for (const n of g.nodes) {
      if (!n.id.trim()) return 'Every node needs an id.';
      if (!n.label.trim()) return `Node "${n.id}" needs a label.`;
      if (ids.has(n.id)) return `Duplicate node id "${n.id}".`;
      ids.add(n.id);
    }
    const edgeIds = new Set<string>();
    for (const e of g.edges) {
      if (!e.id.trim()) return 'Every edge needs an id.';
      if (edgeIds.has(e.id)) return `Duplicate edge id "${e.id}".`;
      edgeIds.add(e.id);
      if (!ids.has(e.from)) return `Edge "${e.id}" references unknown source "${e.from}".`;
      if (!ids.has(e.to)) return `Edge "${e.id}" references unknown target "${e.to}".`;
      if (!e.bus.trim()) return `Edge "${e.id}" needs a bus line.`;
    }
    return null;
  }

  function handleSave() {
    const message = validate(draft);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    onSave(draft);
  }

  function handleResetDraft() {
    setDraft(initialGraph);
    setError(null);
  }

  return (
    <div className="px-4 pb-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <GraphPreview graph={draft} />

          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Stations (nodes)</h3>
              <button
                onClick={addNode}
                className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                + Add station
              </button>
            </div>
            <div className="space-y-2">
              {draft.nodes.map((node, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={node.id}
                    onChange={(e) => updateNode(i, { id: e.target.value })}
                    placeholder="id"
                    className="w-40 font-mono text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    value={node.label}
                    onChange={(e) => updateNode(i, { label: e.target.value })}
                    placeholder="label"
                    className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeNode(i)}
                    className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {draft.nodes.length === 0 && (
                <p className="text-xs text-gray-400">No stations yet.</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Directed connections (edges)</h3>
              <button
                onClick={addEdge}
                disabled={draft.nodes.length === 0}
                className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add edge
              </button>
            </div>
            <div className="space-y-2">
              {draft.edges.map((edge, i) => (
                <div key={i} className="flex gap-2 items-center flex-wrap">
                  <input
                    value={edge.id}
                    onChange={(e) => updateEdge(i, { id: e.target.value })}
                    placeholder="id"
                    className="w-32 font-mono text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={edge.from}
                    onChange={(e) => updateEdge(i, { from: e.target.value })}
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {!nodeIds.has(edge.from) && <option value={edge.from}>{edge.from || '(none)'}</option>}
                    {draft.nodes.map((n) => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                  <span className="text-gray-400 text-xs">→</span>
                  <select
                    value={edge.to}
                    onChange={(e) => updateEdge(i, { to: e.target.value })}
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {!nodeIds.has(edge.to) && <option value={edge.to}>{edge.to || '(none)'}</option>}
                    {draft.nodes.map((n) => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                  <input
                    value={edge.bus}
                    onChange={(e) => updateEdge(i, { bus: e.target.value })}
                    placeholder="bus"
                    className="w-20 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeEdge(i)}
                    className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {draft.edges.length === 0 && (
                <p className="text-xs text-gray-400">No connections yet.</p>
              )}
            </div>
          </section>

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
              onClick={handleResetDraft}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onResetToDefault}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors ml-auto"
            >
              Reset to Default
            </button>
          </div>
    </div>
  );
}

interface GraphPreviewProps {
  graph: BusGraph;
}

function GraphPreview({ graph }: GraphPreviewProps) {
  const width = 600;
  const height = 260;
  const radius = 22;

  const positions = useMemo(() => {
    const n = graph.nodes.length;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) / 2 - radius - 16;
    const map = new Map<string, { x: number; y: number }>();
    graph.nodes.forEach((node, i) => {
      if (n === 1) {
        map.set(node.id, { x: cx, y: cy });
      } else {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        map.set(node.id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
      }
    });
    return map;
  }, [graph.nodes]);

  if (graph.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg h-32">
        Add stations to see the graph.
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
        <defs>
          <marker
            id="graph-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#6b7280" />
          </marker>
        </defs>
        {graph.edges.map((edge) => {
          const a = positions.get(edge.from);
          const b = positions.get(edge.to);
          if (!a || !b) return null;
          if (edge.from === edge.to) {
            const loopR = radius + 8;
            const lx = a.x + loopR;
            const ly = a.y - loopR;
            return (
              <g key={edge.id}>
                <path
                  d={`M ${a.x} ${a.y - radius} C ${a.x + loopR * 1.5} ${a.y - loopR * 1.8}, ${lx + loopR} ${ly}, ${a.x + radius} ${a.y}`}
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth={1.5}
                  markerEnd="url(#graph-arrow)"
                />
                <text x={a.x + loopR} y={a.y - loopR} textAnchor="middle" className="fill-gray-600" fontSize="10">
                  {edge.bus}
                </text>
              </g>
            );
          }
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const offsetX = (dx / dist) * radius;
          const offsetY = (dy / dist) * radius;
          const reverseOffset = 6;
          const perpX = -dy / dist;
          const perpY = dx / dist;
          const sx = a.x + offsetX + perpX * reverseOffset;
          const sy = a.y + offsetY + perpY * reverseOffset;
          const tx = b.x - offsetX + perpX * reverseOffset;
          const ty = b.y - offsetY + perpY * reverseOffset;
          const mx = (sx + tx) / 2 + perpX * 10;
          const my = (sy + ty) / 2 + perpY * 10;
          return (
            <g key={edge.id}>
              <line
                x1={sx}
                y1={sy}
                x2={tx}
                y2={ty}
                stroke="#6b7280"
                strokeWidth={1.5}
                markerEnd="url(#graph-arrow)"
              />
              <text
                x={mx}
                y={my}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-600"
                fontSize="10"
              >
                {edge.bus}
              </text>
            </g>
          );
        })}
        {graph.nodes.map((node) => {
          const p = positions.get(node.id);
          if (!p) return null;
          return (
            <g key={node.id}>
              <circle cx={p.x} cy={p.y} r={radius} fill="#dbeafe" stroke="#3b82f6" strokeWidth={1.5} />
              <text
                x={p.x}
                y={p.y + radius + 12}
                textAnchor="middle"
                className="fill-gray-700"
                fontSize="11"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
