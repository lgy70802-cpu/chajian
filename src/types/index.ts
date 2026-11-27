export type NavigationTab = 'devices' | 'studio' | 'themes' | 'diagnostics';

export type DeviceOrientation = 0 | 90 | 180 | 270;

export interface D92Device {
  id: string;
  name: string;
  model: 'D92 Ultra-Wide' | 'D92 Compact Square' | 'DeskDisplay Sub' | 'Virtual Display';
  vid: string;
  pid: string;
  width: number;
  height: number;
  orientation: DeviceOrientation;
  brightness: number; // 0-100
  fps: number;
  status: 'connected' | 'standby' | 'disconnected';
  activeThemeId: string;
  activeLayoutName?: string;
  leaseToken: string | null;
  firmwareVersion: string;
  temperature: number; // °C
  colorTemp: number; // 4000K-9300K
}

export type WidgetType = 
  | 'clock' 
  | 'aquarium' 
  | 'stocks' 
  | 'lyrics' 
  | 'telemetry' 
  | 'weather' 
  | 'banner';

export interface SceneWidget {
  id: string;
  type: WidgetType;
  title: string;
  x: number; // percentage (0 - 100) or px
  y: number;
  width: number; // percentage (0 - 100)
  height: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  props: Record<string, any>;
}

export interface CraftTheme {
  id: string;
  name: string;
  category: 'aquatic' | 'finance' | 'audio' | 'clock' | 'hardware';
  author: string;
  version: string;
  description: string;
  badge: string;
  accentColor: string;
  supportedRatios: ('3:1' | '1:1' | '16:9' | 'any')[];
  recommendedResolution: { width: number; height: number };
  widgets: SceneWidget[];
}

export interface PresetWidgetDef {
  type: WidgetType;
  title: string;
  description: string;
  category: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultProps: Record<string, any>;
}
