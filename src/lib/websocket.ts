import { useESP32Store } from './store';
import { config } from './config';

export class ESP32WebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;

  constructor(private readonly url: string = config.wsUrl) {
    // Validate WebSocket URL
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
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleError(error);
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
      const store = useESP32Store.getState();
      
      if (data.moisture !== undefined) {
        store.setMoisture(data.moisture);
      }
      if (data.pumpStatus !== undefined) {
        store.setPumpStatus(data.pumpStatus);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  private handleClose = () => {
    useESP32Store.getState().setConnectionStatus('disconnected');
    this.attemptReconnect();
  };

  private handleError = (error: any) => {
    console.error('WebSocket error:', error);
    useESP32Store.getState().setConnectionStatus('disconnected');
  };

  private attemptReconnect = () => {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      
      if (this.reconnectTimeout) {
        window.clearTimeout(this.reconnectTimeout);
      }
      
      this.reconnectTimeout = window.setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    }
  };

  sendCommand(command: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ command }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
    }
  }
}