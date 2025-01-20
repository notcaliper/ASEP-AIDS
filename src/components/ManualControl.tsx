import React from 'react';
import { useESP32Store } from '../lib/store';
import { PumpControl } from './PumpControl';
import { Switch } from './ui/switch';

export function ManualControl() {
  const { pumpStatus, manualControl, setManualControl, togglePump } = useESP32Store();

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pump Control</h2>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${!manualControl ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            Auto
          </span>
          <Switch
            checked={manualControl}
            onCheckedChange={setManualControl}
            className="data-[state=checked]:bg-blue-500"
          />
          <span className={`text-sm ${manualControl ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            Manual
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <PumpControl 
          isOn={pumpStatus} 
          onToggle={togglePump}
        />
        <span className="text-sm text-gray-500">
          {manualControl 
            ? 'Manual control enabled. Click the button to toggle pump.' 
            : 'Automatic mode enabled. Pump controlled by moisture level.'
          }
        </span>
      </div>
    </div>
  );
}
