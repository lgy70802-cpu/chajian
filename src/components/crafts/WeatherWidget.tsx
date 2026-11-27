import React from 'react';
import { Sun, CloudRain, Wind, Droplets } from 'lucide-react';

interface WeatherWidgetProps {
  city?: string;
  condition?: string;
  temperature?: number;
  humidity?: number;
  className?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  city = 'Tokyo / 東京',
  condition = 'Clear Sky',
  temperature = 22,
  humidity = 48,
  className = '',
}) => {
  return (
    <div className={`w-full h-full bg-[#0A111C] text-slate-100 flex flex-col justify-between p-4 select-none ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">{city}</span>
          <div className="text-sm text-slate-400 font-medium">{condition}</div>
        </div>
        <Sun className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '30s' }} />
      </div>

      <div className="flex items-baseline gap-2 my-2">
        <span className="text-4xl font-mono font-bold tracking-tight text-white tabular-nums">
          {temperature}°
        </span>
        <span className="text-sm text-slate-400 font-mono">C</span>
        <span className="text-xs text-slate-500 font-mono ml-auto">体感温度 23°C</span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-sky-400" />
          <span>湿度 {humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-teal-400" />
          <span>风速 14 km/h</span>
        </div>
      </div>
    </div>
  );
};
