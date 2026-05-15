export interface BusRoute {
  id: string;
  bus: string;
  departureStation: string;
  departureTimes: string[];
}

export type DayType = 'weekday' | 'weekend';

export interface ProcessedRoute {
  id: string;
  bus: string;
  departureStation: string;
  times: string[];
}

export interface NextDeparture {
  routeId: string;
  time: string;
}

export interface GraphNode {
  id: string;
  label: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  bus: string;
}

export interface BusGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
