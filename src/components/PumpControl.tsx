import React from 'react';
import { Icons } from './icons';

type PumpControlProps = {
  isOn: boolean;
  onToggle: () => void;
};

export function PumpControl({ isOn, onToggle }: PumpControlProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
        ${isOn 
          ? 'bg-green-500 text-white hover:bg-green-600' 
          : 'bg-red-500 text-white hover:bg-red-600'
        }`}
    >
      <Icons.Power className="w-5 h-5" />
      <span>Pump {isOn ? 'ON' : 'OFF'}</span>
    </button>
  );
}