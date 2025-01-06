import React from 'react';
import { Icons } from './icons';

type MoistureMeterProps = {
  moisture: number;
};

export function MoistureMeter({ moisture }: MoistureMeterProps) {
  const getColor = (level: number) => {
    if (level < 30) return 'text-red-500';
    if (level < 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="flex items-center space-x-2">
      <Icons.Droplets className={`w-6 h-6 ${getColor(moisture)}`} />
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div
          className={`h-4 rounded-full ${getColor(moisture)} bg-current transition-all duration-500`}
          style={{ width: `${moisture}%` }}
        />
      </div>
      <span className="text-sm font-medium">{moisture}%</span>
    </div>
  );
}