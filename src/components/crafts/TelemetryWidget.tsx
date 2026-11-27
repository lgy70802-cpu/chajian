import React, { useEffect, useState } from 'react';
import { Cpu, Activity, Gauge, Flame, Wifi } from 'lucide-react';

interface TelemetryWidgetProps {
  cpuLoad?: number;
  gpuLoad?: number;
  ramUsage?: number;
  tempCpu?: number;
  tempGpu?: number;
  networkSpeed?: number;
  className?: string;
}

export const TelemetryWidget: React.FC<TelemetryWidgetProps> = ({
  cpuLoad: initialCpu = 32,
  gpuLoad: initialGpu = 65,
  ramUsage: initialRam = 54,
  tempCpu: initialTempCpu = 51,
  tempGpu: initialTempGpu = 63,
  networkSpeed: initialNet = 42.8,
  className = '',
}) => {
  const [cpu, setCpu] = useState(initialCpu);
  const [gpu, setGpu] = useState(initialGpu);
  const [ram, setRam] = useState(initialRam);
  const [tempCpu, setTempCpu] = useState(initialTempCpu);
  const [tempGpu, setTempGpu] = useState(initialTempGpu);
  const [netSpeed, setNetSpeed] = useState(initialNet);

  useEffect(() => {
    const timer = setInterval(() => {
      setCpu((prev) => Math.min(100, Math.max(10, Math.round(prev + (Math.random() - 0.48) * 8))));
      setGpu((prev) => Math.min(100, Math.max(15, Math.round(prev + (Math.random() - 0.5) * 10))));
      setRam((prev) => Math.min(95, Math.max(40, Math.round(prev + (Math.random() - 0.5) * 2))));
      setTempCpu((prev) => Math.min(85, Math.max(40, Math.round(prev + (Math.random() - 0.5) * 2))));
      setTempGpu((prev) => Math.min(88, Math.max(45, Math.round(prev + (Math.random() - 0.5) * 2))));
      setNetSpeed((prev) => Math.max(0.5, Number((prev + (Math.random() - 0.5) * 5).toFixed(1))));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`w-full h-full bg-[#0A0E17] text-slate-100 flex flex-col p-4 select-none ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold tracking-wider text-slate-200">主机硬件体征 · 传感器探针</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>传感器通信正常</span>
        </div>
      </div>

      {/* Main Gauges Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1 items-center">
        {/* CPU Box */}
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>CPU 核心负荷</span>
            <span className="flex items-center gap-1 text-slate-300 font-mono">
              <Flame className="w-3 h-3 text-amber-400" />
              {tempCpu}°C
            </span>
          </div>
          <div className="flex items-baseline justify-between my-1">
            <span className="text-2xl font-mono font-bold text-cyan-400 tabular-nums">{cpu}%</span>
            <span className="text-[10px] font-mono text-slate-500">4.8 GHz</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                cpu > 80 ? 'bg-rose-500' : 'bg-cyan-400'
              }`}
              style={{ width: `${cpu}%` }}
            />
          </div>
        </div>

        {/* GPU Box */}
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>GPU 显卡负荷</span>
            <span className="flex items-center gap-1 text-slate-300 font-mono">
              <Flame className="w-3 h-3 text-rose-400" />
              {tempGpu}°C
            </span>
          </div>
          <div className="flex items-baseline justify-between my-1">
            <span className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">{gpu}%</span>
            <span className="text-[10px] font-mono text-slate-500">RTX 4090</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                gpu > 85 ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${gpu}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom RAM & Network Strip */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            运行内存 (32GB)
          </span>
          <span className="text-slate-200 tabular-nums font-semibold">{ram}% ({(32 * ram / 100).toFixed(1)} GB)</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-sky-400" />
            网络吞吐
          </span>
          <span className="text-slate-200 tabular-nums font-semibold">{netSpeed} MB/s</span>
        </div>
      </div>
    </div>
  );
};
