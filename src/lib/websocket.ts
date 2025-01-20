import { useESP32Store } from './store';
import { config } from './config';

export class ESP32WebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;

  constructor(private readonly url: string = config.wsUrl) {
    try {
      new URL(url);
    } catch (error) {
      console.error('Invalid WebSocket URL:', url);
      throw new Error('Invalid WebSocket URL provided');
    }
  }

  connect() {
    try {
      useESP32Store.getState().setConnectionStatus('connecting');
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = this.handleOpen;
      this.ws.onmessage = this.handleMessage;
      this.ws.onclose = this.handleClose;
      this.ws.onerror = this.handleError;

      // Subscribe to store changes
      useESP32Store.subscribe((state, prevState) => {
        if (state.pumpStatus !== prevState.pumpStatus || state.manualControl !== prevState.manualControl) {
          this.sendPumpControl(state.manualControl, state.pumpStatus);
          console.log('Sending pump control:', { manualControl: state.manualControl, pumpStatus: state.pumpStatus });
        }
      });
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleError(error);
    }
  }

  private sendPumpControl(manualControl: boolean, pumpStatus: boolean) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'pump_control',
        manualControl,
        pumpStatus
      };
      console.log('Sending WebSocket message:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not ready, state:', this.ws?.readyState);
    }
  }

  private handleOpen = () => {
    console.log('Connected to ESP32');
    this.reconnectAttempts = 0;
    useESP32Store.getState().setConnectionStatus('connected');
  };

  private handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);
      const store = useESP32Store.getState();
      
      if (data.type === 'pump_state_update') {
        store.setManualControl(data.manualControl);
        store.setPumpStatus(data.pumpStatus);
      } else {
        if (data.moisture !== undefined) {
          store.setMoisture(data.moisture);
        }
        if (data.pumpStatus !== undefined) {
          store.setPumpStatus(data.pumpStatus);
        }
        if (data.manualControl !== undefined) {
          store.setManualControl(data.manualControl);
        }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  private handleClose = () => {
    console.log('Disconnected from ESP32');
    useESP32Store.getState().setConnectionStatus('disconnected');
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectTimeout = window.setTimeout(() => {
        console.log('Attempting to reconnect...');
        this.reconnectAttempts++;
        this.connect();
      }, 5000);
    }
  };

  private handleError = (error: any) => {
    console.error('WebSocket error:', error);
    useESP32Store.getState().setConnectionStatus('error');
  };

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}