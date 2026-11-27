import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipForward, Disc3, Music2 } from 'lucide-react';

interface LyricLine {
  time: number;
  text: string;
  translation?: string;
}

const SAMPLE_LYRICS: LyricLine[] = [
  { time: 0, text: 'City is my church, it wraps in the blinding twilight', translation: '城市是我的教堂，将我裹入炫目的暮色' },
  { time: 5, text: 'Waiting in a car, looking out at neon street lights', translation: '静候车中，遥望街头斑斓的霓虹' },
  { time: 10, text: 'The city is my church, it wraps in the blinding twilight', translation: '城市是我的圣殿，将我浸入不眠的流光' },
  { time: 16, text: 'Waiting in the car, waiting for a ride in the dark', translation: '在夜幕中等待，开启一次破晓前的飞驰' },
  { time: 22, text: 'The night is my naked gown, whisper in the midnight sound', translation: '夜色是我的素裳，回荡着午夜的低语' },
  { time: 28, text: 'Looking at the city lights, electric dreams in the sky', translation: '凝视着漫天灯火，点亮苍穹中的电子梦' },
];

interface LyricsVisualizerProps {
  songTitle?: string;
  artist?: string;
  spectrumBars?: number;
  glowColor?: string;
  className?: string;
}

export const LyricsVisualizer: React.FC<LyricsVisualizerProps> = ({
  songTitle = 'Midnight City',
  artist = 'M83',
  spectrumBars = 24,
  glowColor = '#EC4899',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackTime, setPlaybackTime] = useState<number>(10);
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(2);
  const [barHeights, setBarHeights] = useState<number[]>([]);

  // Simulate audio playback and spectrum frequency animation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime((prev) => {
          const next = (prev + 0.5) % 34;
          // Find matching lyric
          let found = 0;
          for (let i = 0; i < SAMPLE_LYRICS.length; i++) {
            if (next >= SAMPLE_LYRICS[i].time) {
              found = i;
            }
          }
          setActiveLyricIndex(found);
          return next;
        });

        // Randomize spectrum frequency heights
        const newBars = Array.from({ length: spectrumBars }, (_, i) => {
          const centerBias = Math.sin((i / spectrumBars) * Math.PI);
          return Math.floor(15 + Math.random() * 75 * centerBias);
        });
        setBarHeights(newBars);
      }, 150);
    } else {
      setBarHeights(Array.from({ length: spectrumBars }, () => 8));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, spectrumBars]);

  return (
    <div className={`w-full h-full bg-[#0D0B14] text-slate-100 flex flex-col p-4 select-none ${className}`}>
      {/* Top Track Header */}
      <div className="flex items-center justify-between border-b border-purple-900/40 pb-2 mb-2">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-purple-800 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-900/30">
            <Disc3
              className={`w-6 h-6 text-white ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '4s' }}
            />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-white">{songTitle}</div>
            <div className="text-xs text-pink-400/80 font-mono">{artist} · Synthwave Master</div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 rounded-full bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 flex items-center justify-center transition-colors border border-pink-500/30"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>
          <button
            onClick={() => setPlaybackTime((p) => (p + 8) % 34)}
            className="w-7 h-7 rounded-full bg-slate-800/60 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Synchronized Scrolling Lyrics Area */}
      <div className="flex-1 flex flex-col justify-center items-center text-center my-1 overflow-hidden relative">
        <div className="space-y-2.5 transition-transform duration-300">
          {SAMPLE_LYRICS.map((line, idx) => {
            const isCurrent = idx === activeLyricIndex;
            const isNear = Math.abs(idx - activeLyricIndex) === 1;

            if (Math.abs(idx - activeLyricIndex) > 1) return null;

            return (
              <div
                key={idx}
                className={`transition-all duration-300 ${
                  isCurrent
                    ? 'text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 scale-105'
                    : isNear
                    ? 'text-xs text-slate-500'
                    : 'text-[10px] text-slate-700 opacity-40'
                }`}
              >
                <div>{line.text}</div>
                {isCurrent && line.translation && (
                  <div className="text-[11px] font-normal text-pink-300/80 mt-0.5 font-sans">
                    {line.translation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Audio Spectrum Bars */}
      <div className="border-t border-purple-900/30 pt-2 flex flex-col gap-1.5">
        <div className="flex items-end justify-between h-7 gap-1 px-1">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t transition-all duration-150"
              style={{
                height: `${h}%`,
                backgroundColor: glowColor,
                opacity: 0.4 + (h / 100) * 0.6,
                boxShadow: isPlaying ? `0 0 6px ${glowColor}66` : 'none',
              }}
            />
          ))}
        </div>

        {/* Timeline bar */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-0.5">
          <span>0:{String(Math.floor(playbackTime)).padStart(2, '0')}</span>
          <div className="flex-1 mx-3 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(playbackTime / 34) * 100}%` }}
            />
          </div>
          <span>0:34</span>
        </div>
      </div>
    </div>
  );
};
