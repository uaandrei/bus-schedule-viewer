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
