import { create } from 'zustand';
import { ESP32Data } from './types';

interface ESP32Store extends ESP32Data {
  setMoisture: (moisture: number) => void;
  setPumpStatus: (status: boolean) => void;
  setConnectionStatus: (status: ESP32Data['connectionStatus']) => void;
  manualControl: boolean;
  setManualControl: (status: boolean) => void;
  togglePump: () => void;
}

export const useESP32Store = create<ESP32Store>((set, get) => ({
  moisture: 0,
  pumpStatus: false,
  manualControl: false,
  timestamp: Date.now(),
  connectionStatus: 'disconnected',
  setMoisture: (moisture) => set({ moisture, timestamp: Date.now() }),
  setPumpStatus: (pumpStatus) => set({ pumpStatus, timestamp: Date.now() }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setManualControl: (manualControl) => set({ manualControl }),
  togglePump: () => {
    const { pumpStatus, manualControl } = get();
    if (manualControl) {
      set({ pumpStatus: !pumpStatus });
    }
  }
}));