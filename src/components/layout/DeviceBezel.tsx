import React from 'react';
import { DeviceOrientation } from '../../types';

interface DeviceBezelProps {
  name?: string;
  width?: number; // e.g. 960
  height?: number; // e.g. 320
  orientation?: DeviceOrientation;
  brightness?: number; // 0-100
  fps?: number;
  status?: 'connected' | 'standby' | 'disconnected';
  scale?: number; // scaling factor for preview
  showHardwareDetails?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const DeviceBezel: React.FC<DeviceBezelProps> = ({
  name = 'D92 Ultra-Wide',
  width = 960,
  height = 320,
  orientation = 0,
  brightness = 85,
  fps = 60,
  status = 'connected',
  scale = 1.0,
  showHardwareDetails = true,
  children,
  className = '',
}) => {
  // Darken overlay according to brightness
  const dimOpacity = Math.max(0, (100 - brightness) / 100) * 0.75;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Outer Anodized Aluminum Physical Casing */}
      <div
        className="relative rounded-2xl p-3 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300"
        style={{
          transform: `scale(${scale}) rotate(${orientation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        {/* Subtle Top Bezel Chamfer Light & Laser Engraved Logo */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-60 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
          <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase font-semibold">
            D92 STUDIO
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
        </div>

        {/* Physical USB Cable Notch simulation at the left/back */}
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-neutral-700 rounded-l border border-neutral-600 pointer-events-none shadow-sm" />

        {/* Display Glass Frame with Anti-Glare Polish */}
        <div
          className="relative overflow-hidden rounded-lg bg-black border border-neutral-700/60 shadow-[inset_0_2px_12px_rgba(0,0,0,0.9)]"
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          {/* Active Screen Content */}
          <div className="w-full h-full relative">
            {status === 'disconnected' ? (
              <div className="w-full h-full bg-[#05080E] flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 mb-2 animate-ping" />
                <span>USB HID 物理连接断开 · 0x5548:0x1011</span>
              </div>
            ) : status === 'standby' ? (
              <div className="w-full h-full bg-[#03060A] flex flex-col items-center justify-center text-slate-600 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500/70 mb-2" />
                <span>副屏低功耗待机中 · 休眠</span>
              </div>
            ) : (
              children
            )}
          </div>

          {/* Hardware Brightness Dimming Layer */}
          <div
            className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-200"
            style={{ opacity: dimOpacity }}
          />

          {/* Glass Surface Glare / Specular Highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.06] pointer-events-none" />
        </div>
      </div>

      {/* Hardware Telemetry Footnote */}
      {showHardwareDetails && (
        <div className="flex items-center gap-4 mt-3 text-xs font-mono text-slate-400">
          <span className="text-slate-200 font-semibold">{name}</span>
          <span>·</span>
          <span>{width}×{height}</span>
          <span>·</span>
          <span className="text-sky-400">{fps} 帧</span>
          <span>·</span>
          <span className="text-amber-400">{brightness}% 亮度</span>
          <span>·</span>
          <span className={status === 'connected' ? 'text-emerald-400' : 'text-amber-400'}>
            {status === 'connected' ? '正常在线' : status === 'standby' ? '待机休眠' : '已断开'}
          </span>
        </div>
      )}
    </div>
  );
};
