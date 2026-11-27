import React, { useEffect, useState } from 'react';

interface ClockWidgetProps {
  style?: 'nixie' | 'flip' | 'digital' | 'analog';
  showSeconds?: boolean;
  colorHue?: 'amber' | 'cyan' | 'green' | 'white';
  className?: string;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({
  style = 'nixie',
  showSeconds = true,
  colorHue = 'amber',
  className = '',
}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const dateFormatted = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Color mapping
  const hueStyles = {
    amber: {
      glow: 'rgba(245, 158, 11, 0.7)',
      text: '#F59E0B',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
    },
    cyan: {
      glow: 'rgba(56, 189, 248, 0.7)',
      text: '#38BDF8',
      border: 'border-sky-500/30',
      bg: 'bg-sky-500/10',
    },
    green: {
      glow: 'rgba(16, 185, 129, 0.7)',
      text: '#10B981',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
    },
    white: {
      glow: 'rgba(255, 255, 255, 0.6)',
      text: '#F8FAFC',
      border: 'border-slate-500/30',
      bg: 'bg-slate-500/10',
    },
  }[colorHue];

  // 1. Nixie Tube Style
  if (style === 'nixie') {
    const renderNixieDigit = (d: string, index: number) => (
      <div
        key={index}
        className="relative flex items-center justify-center w-11 h-20 bg-gradient-to-b from-slate-900/90 via-slate-950 to-black rounded-lg border border-amber-500/20 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Glass reflection highlight */}
        <div className="absolute inset-x-1 top-0 h-4 bg-gradient-to-b from-white/15 to-transparent rounded-t" />

        {/* Wire mesh background texture */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: 'radial-gradient(circle, #F59E0B 1px, transparent 1px)',
            backgroundSize: '4px 4px',
          }}
        />

        {/* Amber glowing filament digit */}
        <span
          className="font-mono text-3xl font-black tabular-nums transition-all duration-300"
          style={{
            color: '#FED7AA',
            textShadow: `0 0 6px #F59E0B, 0 0 16px #D97706, 0 0 28px rgba(245, 158, 11, 0.6)`,
          }}
        >
          {d}
        </span>

        {/* Subtle base glow */}
        <div className="absolute bottom-0 inset-x-2 h-1.5 bg-amber-500/40 blur-xs rounded-full" />
      </div>
    );

    return (
      <div className={`w-full h-full bg-[#080705] flex flex-col items-center justify-center p-3 select-none ${className}`}>
        <div className="text-[10px] font-mono tracking-widest text-amber-500/50 mb-2 uppercase">
          IN-14 NIXIE VACUUM CHRONOMETER
        </div>
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-neutral-950/90 border border-neutral-800 shadow-2xl">
          {renderNixieDigit(hours[0], 0)}
          {renderNixieDigit(hours[1], 1)}

          <div className="flex flex-col gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-pulse" />
          </div>

          {renderNixieDigit(minutes[0], 2)}
          {renderNixieDigit(minutes[1], 3)}

          {showSeconds && (
            <>
              <div className="flex flex-col gap-2 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B] animate-pulse" />
              </div>
              {renderNixieDigit(seconds[0], 4)}
              {renderNixieDigit(seconds[1], 5)}
            </>
          )}
        </div>
        <div className="text-xs font-mono text-amber-400/70 mt-2 tracking-wider">
          {dateFormatted}
        </div>
      </div>
    );
  }

  // 2. Mechanical Flip Clock Style
  if (style === 'flip') {
    const renderFlipCard = (digit: string, label: string) => (
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-20 bg-slate-900 rounded-lg border border-slate-700/80 shadow-lg flex items-center justify-center overflow-hidden">
          {/* Split line */}
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-slate-950 shadow-[0_1px_1px_rgba(255,255,255,0.08)] z-10" />
          {/* Side notches */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2 bg-slate-950 rounded-r z-10" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-2 bg-slate-950 rounded-l z-10" />

          <span className="text-4xl font-mono font-bold text-white tabular-nums tracking-tighter">
            {digit}
          </span>
        </div>
        <span className="text-[10px] font-mono tracking-wider text-slate-500 mt-1 uppercase">{label}</span>
      </div>
    );

    return (
      <div className={`w-full h-full bg-[#0B0F19] flex flex-col items-center justify-center p-3 select-none ${className}`}>
        <div className="flex items-center gap-2">
          {renderFlipCard(hours, 'Hour')}
          <span className="text-2xl font-mono text-slate-600 -mt-4">:</span>
          {renderFlipCard(minutes, 'Min')}
          {showSeconds && (
            <>
              <span className="text-2xl font-mono text-slate-600 -mt-4">:</span>
              {renderFlipCard(seconds, 'Sec')}
            </>
          )}
        </div>
        <div className="text-xs font-mono text-slate-400 mt-2">{dateFormatted}</div>
      </div>
    );
  }

  // 3. Cyberpunk Digital LED Style
  if (style === 'digital') {
    return (
      <div className={`w-full h-full bg-slate-950 flex flex-col items-center justify-center p-4 select-none ${className}`}>
        <div className="flex items-baseline gap-1 font-mono">
          <span
            className="text-5xl font-black tabular-nums tracking-tight"
            style={{
              color: hueStyles.text,
              textShadow: `0 0 16px ${hueStyles.glow}`,
            }}
          >
            {hours}:{minutes}
          </span>
          {showSeconds && (
            <span
              className="text-2xl font-bold tabular-nums ml-1"
              style={{ color: hueStyles.text, opacity: 0.8 }}
            >
              :{seconds}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-400">
          <span>{dateFormatted}</span>
          <span>·</span>
          <span className="text-emerald-400 font-semibold">24H SYNC</span>
        </div>
      </div>
    );
  }

  // 4. Analog Bauhaus Watch Face
  const secDeg = (time.getSeconds() / 60) * 360;
  const minDeg = (time.getMinutes() / 60) * 360 + (time.getSeconds() / 60) * 6;
  const hourDeg = ((time.getHours() % 12) / 12) * 360 + (time.getMinutes() / 60) * 30;

  return (
    <div className={`w-full h-full bg-[#0E131F] flex items-center justify-center p-2 select-none ${className}`}>
      <div className="relative w-36 h-36 rounded-full bg-slate-900 border-2 border-slate-700 shadow-2xl flex items-center justify-center">
        {/* Hour tick marks */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1.5 w-0.5 bg-slate-400"
            style={{
              height: i % 3 === 0 ? '8px' : '4px',
              backgroundColor: i % 3 === 0 ? '#E2E8F0' : '#64748B',
              transformOrigin: '50% 66px',
              transform: `rotate(${i * 30}deg)`,
            }}
          />
        ))}

        {/* Hour Hand */}
        <div
          className="absolute w-1.5 h-10 bg-slate-100 rounded-full"
          style={{
            bottom: '50%',
            transformOrigin: '50% 100%',
            transform: `rotate(${hourDeg}deg)`,
          }}
        />

        {/* Minute Hand */}
        <div
          className="absolute w-1 h-14 bg-sky-400 rounded-full shadow-[0_0_6px_rgba(56,189,248,0.5)]"
          style={{
            bottom: '50%',
            transformOrigin: '50% 100%',
            transform: `rotate(${minDeg}deg)`,
          }}
        />

        {/* Second Hand */}
        <div
          className="absolute w-0.5 h-16 bg-rose-500"
          style={{
            bottom: '46%',
            transformOrigin: '50% 80%',
            transform: `rotate(${secDeg}deg)`,
          }}
        />

        {/* Center Pivot Pin */}
        <div className="absolute w-3 h-3 rounded-full bg-slate-200 border border-slate-950 z-20 shadow-sm" />
      </div>
    </div>
  );
};
