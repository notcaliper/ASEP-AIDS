import { create } from 'zustand';
import { ESP32Data } from './types';

interface ESP32Store extends ESP32Data {
  setMoisture: (moisture: number) => void;
  setPumpStatus: (status: boolean) => void;
  setConnectionStatus: (status: ESP32Data['connectionStatus']) => void;
}

export const useESP32Store = create<ESP32Store>((set) => ({
  moisture: 0,
  pumpStatus: false,
  timestamp: Date.now(),
  connectionStatus: 'disconnected',
  setMoisture: (moisture) => set({ moisture, timestamp: Date.now() }),
  setPumpStatus: (pumpStatus) => set({ pumpStatus, timestamp: Date.now() }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
}));