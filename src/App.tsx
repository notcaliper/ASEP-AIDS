import React, { useEffect } from 'react';
import { Icons } from './components/icons';
import { MoistureMeter } from './components/MoistureMeter';
import { ConnectionStatus } from './components/ConnectionStatus';
import { ManualControl } from './components/ManualControl';
import { ESP32WebSocket } from './lib/websocket';
import { useESP32Store } from './lib/store';

// Initialize WebSocket connection with default config
const ws = new ESP32WebSocket();

function App() {
  const { moisture } = useESP32Store();

  useEffect(() => {
    ws.connect();
    return () => ws.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Icons.Droplets className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-800">
                Soil Moisture Monitor
              </h1>
            </div>
            <ConnectionStatus />
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Status Card */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Current Moisture Level
              </h2>
              <MoistureMeter moisture={moisture} />
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Current moisture level: {moisture}%
                </p>
              </div>
            </div>

            {/* Control Card */}
            <ManualControl />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;