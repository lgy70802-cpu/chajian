import React from 'react';
import { SceneWidget } from '../../types';
import { AquariumCanvas } from './AquariumCanvas';
import { StocksWidget } from './StocksWidget';
import { LyricsVisualizer } from './LyricsVisualizer';
import { ClockWidget } from './ClockWidget';
import { TelemetryWidget } from './TelemetryWidget';
import { WeatherWidget } from './WeatherWidget';

interface WidgetRendererProps {
  widget: SceneWidget;
  className?: string;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, className = '' }) => {
  if (!widget.visible) return null;

  switch (widget.type) {
    case 'aquarium':
      return (
        <AquariumCanvas
          fishCount={widget.props?.fishCount ?? 6}
          causticsIntensity={widget.props?.causticsIntensity ?? 0.7}
          bubbleSpeed={widget.props?.bubbleSpeed ?? 1.2}
          waterTint={widget.props?.waterTint ?? '#041728'}
          showClock={widget.props?.showClock ?? true}
          className={className}
        />
      );

    case 'stocks':
      return (
        <StocksWidget
          selectedSymbol={widget.props?.selectedSymbol ?? 'NVDA'}
          symbols={widget.props?.symbols}
          chartType={widget.props?.chartType}
          className={className}
        />
      );

    case 'lyrics':
      return (
        <LyricsVisualizer
          songTitle={widget.props?.songTitle}
          artist={widget.props?.artist}
          spectrumBars={widget.props?.spectrumBars ?? 24}
          glowColor={widget.props?.glowColor ?? '#EC4899'}
          className={className}
        />
      );

    case 'clock':
      return (
        <ClockWidget
          style={widget.props?.style ?? 'nixie'}
          showSeconds={widget.props?.showSeconds ?? true}
          colorHue={widget.props?.colorHue ?? 'amber'}
          className={className}
        />
      );

    case 'telemetry':
      return (
        <TelemetryWidget
          cpuLoad={widget.props?.cpuLoad ?? 35}
          gpuLoad={widget.props?.gpuLoad ?? 68}
          ramUsage={widget.props?.ramUsage ?? 54}
          tempCpu={widget.props?.tempCpu ?? 51}
          tempGpu={widget.props?.tempGpu ?? 63}
          networkSpeed={widget.props?.networkSpeed ?? 42.8}
          className={className}
        />
      );

    case 'weather':
      return (
        <WeatherWidget
          city={widget.props?.city ?? 'Tokyo / 東京'}
          condition={widget.props?.condition ?? 'Clear Sky'}
          temperature={widget.props?.temperature ?? 22}
          humidity={widget.props?.humidity ?? 48}
          className={className}
        />
      );

    default:
      return (
        <div className={`w-full h-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-mono text-slate-400 ${className}`}>
          {widget.title}
        </div>
      );
  }
};
