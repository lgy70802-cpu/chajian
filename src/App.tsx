/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavigationTab, D92Device, CraftTheme, SceneWidget } from './types';
import { INITIAL_DEVICES, PRESET_THEMES } from './data/mockData';
import { TopBar } from './components/layout/TopBar';
import { DeviceManagerView } from './components/views/DeviceManagerView';
import { CreatorStudioView } from './components/views/CreatorStudioView';
import { ThemeMarketView } from './components/views/ThemeMarketView';
import { DiagnosticsView } from './components/views/DiagnosticsView';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('devices');
  const [devices, setDevices] = useState<D92Device[]>(() => {
    const saved = localStorage.getItem('d92_devices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEVICES;
      }
    }
    return INITIAL_DEVICES;
  });

  const [themes] = useState<CraftTheme[]>(PRESET_THEMES);
  const [activeWidgets, setActiveWidgets] = useState<SceneWidget[]>(() => {
    return PRESET_THEMES[0].widgets;
  });

  const [globalToast, setGlobalToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('d92_devices', JSON.stringify(devices));
  }, [devices]);

  const showGlobalToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(null), 3000);
  };

  const handleUpdateDevice = (id: string, updates: Partial<D92Device>) => {
    setDevices((prev) =>
      prev.map((dev) => (dev.id === id ? { ...dev, ...updates } : dev))
    );
  };

  const handleAddVirtualDevice = () => {
    const newId = `d92-dev-${Date.now().toString().slice(-4)}`;
    const isUltra = Math.random() > 0.5;
    const newDevice: D92Device = {
      id: newId,
      name: `D92 虚拟副屏 #${devices.length + 1}`,
      model: isUltra ? 'D92 Ultra-Wide' : 'D92 Compact Square',
      vid: '0x5548',
      pid: '0x1011',
      width: isUltra ? 960 : 480,
      height: isUltra ? 320 : 480,
      orientation: 0,
      brightness: 80,
      fps: 60,
      status: 'connected',
      activeThemeId: 'theme-aquarium',
      activeLayoutName: '动态热插拔默认布局',
      leaseToken: `session-virtual-${Date.now()}`,
      firmwareVersion: 'v2.4.12-virtual',
      temperature: 32.5,
      colorTemp: 6500,
    };
    setDevices((prev) => [...prev, newDevice]);
    showGlobalToast(`已热插拔接入新硬件端点：${newDevice.name}`);
  };

  const handleOpenThemeInStudio = (theme: CraftTheme, device?: D92Device) => {
    setActiveWidgets(theme.widgets);
    setCurrentTab('studio');
    showGlobalToast(`已加载「${theme.name}」至创作者工作台`);
  };

  const handleDeployThemeToDevice = (deviceId: string, theme: CraftTheme) => {
    handleUpdateDevice(deviceId, {
      activeThemeId: theme.id,
      activeLayoutName: `${theme.name} (实时运行)`,
    });
    showGlobalToast(`已将「${theme.name}」推送至目标副屏`);
  };

  const handleDeployWidgetsToDevice = (deviceId: string, widgets: SceneWidget[]) => {
    const target = devices.find((d) => d.id === deviceId);
    showGlobalToast(`自定义画布配置已部署至 ${target?.name || '副屏'}`);
  };

  const handleSyncAll = () => {
    showGlobalToast(`已通过 USB HID 向全部 ${devices.length} 台副屏同步硬件参数。`);
  };

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar conforming to Top Bar Contract */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        connectedCount={devices.filter((d) => d.status === 'connected').length}
        onSyncAll={handleSyncAll}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'devices' && (
          <DeviceManagerView
            devices={devices}
            themes={themes}
            onUpdateDevice={handleUpdateDevice}
            onAddVirtualDevice={handleAddVirtualDevice}
            onOpenInStudio={(themeId, dev) => {
              const th = themes.find((t) => t.id === themeId) || themes[0];
              handleOpenThemeInStudio(th, dev);
            }}
          />
        )}

        {currentTab === 'studio' && (
          <CreatorStudioView
            devices={devices}
            themes={themes}
            activeWidgets={activeWidgets}
            onChangeWidgets={setActiveWidgets}
            onDeployToDevice={handleDeployWidgetsToDevice}
          />
        )}

        {currentTab === 'themes' && (
          <ThemeMarketView
            themes={themes}
            devices={devices}
            onOpenInStudio={handleOpenThemeInStudio}
            onDeployThemeToDevice={handleDeployThemeToDevice}
          />
        )}

        {currentTab === 'diagnostics' && <DiagnosticsView devices={devices} />}
      </main>

      {/* Global Toast */}
      {globalToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 border border-sky-500/50 text-slate-100 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-mono backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{globalToast}</span>
        </div>
      )}
    </div>
  );
}
