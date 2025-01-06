import React from 'react';
import { Icons } from './icons';
import { useESP32Store } from '../lib/store';

export function ConnectionStatus() {
  const status = useESP32Store((state) => state.connectionStatus);
  
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'disconnected':
        return 'text-red-500';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Icons.Signal className={`w-5 h-5 ${getStatusColor()}`} />
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
}