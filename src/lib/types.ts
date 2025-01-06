export interface ESP32Data {
  moisture: number;
  pumpStatus: boolean;
  timestamp: number;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}