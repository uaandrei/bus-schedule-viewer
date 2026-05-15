import type { BusGraph } from '../types';

export const defaultGraphData: BusGraph = {
  nodes: [
    { id: 'unirii-foto', label: 'Unirii (Foto)' },
    { id: 'unirii-foto-plopilor', label: 'Unirii (Foto-Plopilor)' },
    { id: 'bardestiului', label: 'Intersecția Bărdeștiului' },
    { id: 'centrofarm', label: 'Centrofarm' },
    { id: 'shopping-city', label: 'Shopping City' },
    { id: 'sapientia', label: 'Sapientia' },
  ],
  edges: [
    { id: 'e-12-c-u', from: 'centrofarm', to: 'unirii-foto-plopilor', bus: '12' },
    { id: 'e-12-u-c', from: 'unirii-foto-plopilor', to: 'centrofarm', bus: '12' },
    { id: 'e-32-s-u', from: 'shopping-city', to: 'unirii-foto-plopilor', bus: '32' },
    { id: 'e-32-u-s', from: 'unirii-foto-plopilor', to: 'shopping-city', bus: '32' },
    { id: 'e-11-u-b', from: 'unirii-foto', to: 'bardestiului', bus: '11' },
    { id: 'e-10b-b-s', from: 'bardestiului', to: 'sapientia', bus: '10b' },
    { id: 'e-26-s-u', from: 'sapientia', to: 'unirii-foto', bus: '26' },
  ],
};
