import React, { useState } from 'react';
import { D92Device, CraftTheme, DeviceOrientation } from '../../types';
import { DeviceBezel } from '../layout/DeviceBezel';
import { WidgetRenderer } from '../crafts/WidgetRenderer';
import { 
  Monitor, 
  Sun, 
  RotateCw, 
  Lock, 
  Unlock, 
  Plus, 
  Power, 
  Layers, 
  Thermometer, 
  Sliders, 
  Check, 
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface DeviceManagerViewProps {
  devices: D92Device[];
  themes: CraftTheme[];
  onUpdateDevice: (id: string, updates: Partial<D92Device>) => void;
  onAddVirtualDevice: () => void;
  onOpenInStudio: (themeId: string, device: D92Device) => void;
}

export const DeviceManagerView: React.FC<DeviceManagerViewProps> = ({
  devices,
  themes,
  onUpdateDevice,
  onAddVirtualDevice,
  onOpenInStudio,
}) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || '');
  const [testPatternActive, setTestPatternActive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const getThemeById = (id: string) => {
    return themes.find((t) => t.id === id) || themes[0];
  };

  const handleRotate = (dev: D92Device) => {
    const nextRot: DeviceOrientation = ((dev.orientation + 90) % 360) as DeviceOrientation;
    onUpdateDevice(dev.id, { orientation: nextRot });
    showToast(`已将 ${dev.name} 旋转至 ${nextRot}° 方向`);
  };

  const handleToggleLease = (dev: D92Device) => {
    const newLease = dev.leaseToken ? null : `session-lease-${Date.now()}`;
    onUpdateDevice(dev.id, { leaseToken: newLease });
    showToast(newLease ? `已锁定 ${dev.name} 的硬件独占租约` : `已释放 ${dev.name} 的租约锁定`);
  };

  const handleTogglePower = (dev: D92Device) => {
    const nextStatus = dev.status === 'connected' ? 'standby' : 'connected';
    onUpdateDevice(dev.id, { status: nextStatus });
    showToast(`${dev.name} 状态已变更为: ${nextStatus === 'connected' ? '唤醒运行' : '低功耗休眠'}`);
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full select-none">
      {/* 顶部标题与快速动作栏 */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Monitor className="w-5 h-5 text-sky-400" />
            <span>硬件设备与多屏拓扑管理</span>
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
            <span>{devices.filter((d) => d.status === 'connected').length} 台在线</span>
            <span>·</span>
            <span>{devices.filter((d) => d.status === 'standby').length} 台待机休眠</span>
            <span>·</span>
            <span>USB HID 协议 (VID 0x5548 / PID 0x1011)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTestPatternActive(!testPatternActive)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              testPatternActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {testPatternActive ? '退出彩条测试' : '校准 / 测试彩条图'}
          </button>

          <button
            onClick={onAddVirtualDevice}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>模拟 D92 热插拔接入</span>
          </button>
        </div>
      </div>

      {/* 主栅格：设备卡片列表与右侧调参面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 左侧：已连接设备卡片列表 */}
        <div className="lg:col-span-8 space-y-5">
          {devices.map((device) => {
            const currentTheme = getThemeById(device.activeThemeId);
            const isSelected = device.id === selectedDeviceId;

            return (
              <div
                key={device.id}
                onClick={() => setSelectedDeviceId(device.id)}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900/90 border-sky-500/50 shadow-lg shadow-sky-950/20 ring-1 ring-sky-500/30'
                    : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                {/* 设备标题与状态 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        device.status === 'connected'
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                          : device.status === 'standby'
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{device.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            正在编辑
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {device.model} · {device.width}×{device.height}px · {device.vid}:{device.pid} · 固件 {device.firmwareVersion}
                      </div>
                    </div>
                  </div>

                  {/* 快捷微调动作 */}
                  <div className="flex items-center gap-2">
                    <button
                      title="顺时针旋转 90 度"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRotate(device);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      title={device.leaseToken ? '独占会话租约已锁定' : '会话租约未加锁'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLease(device);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        device.leaseToken
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      {device.leaseToken ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      title="切换低功耗休眠 / 唤醒"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePower(device);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        device.status === 'connected'
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 实时硬件边框微缩渲染视口 */}
                <div className="py-2 flex items-center justify-center bg-slate-950/70 rounded-xl border border-slate-800/60 overflow-hidden min-h-[140px]">
                  <div className="max-w-full overflow-hidden p-2 flex items-center justify-center">
                    <DeviceBezel
                      name={device.name}
                      width={device.width}
                      height={device.height}
                      orientation={device.orientation}
                      brightness={device.brightness}
                      fps={device.fps}
                      status={device.status}
                      scale={device.width > 1200 ? 0.38 : device.width > 600 ? 0.52 : 0.65}
                      showHardwareDetails={false}
                    >
                      {testPatternActive ? (
                        <div className="w-full h-full flex">
                          <div className="flex-1 bg-white" />
                          <div className="flex-1 bg-yellow-400" />
                          <div className="flex-1 bg-cyan-400" />
                          <div className="flex-1 bg-green-500" />
                          <div className="flex-1 bg-pink-500" />
                          <div className="flex-1 bg-red-600" />
                          <div className="flex-1 bg-blue-700" />
                          <div className="flex-1 bg-black" />
                        </div>
                      ) : (
                        <div className="w-full h-full relative">
                          {currentTheme.widgets.map((w) => (
                            <div
                              key={w.id}
                              className="absolute inset-0"
                              style={{ zIndex: w.zIndex }}
                            >
                              <WidgetRenderer widget={w} />
                            </div>
                          ))}
                        </div>
                      )}
                    </DeviceBezel>
                  </div>
                </div>

                {/* 主题与布局说明栏 */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">当前运行主题:</span>
                    <span className="text-sky-300 font-semibold">{currentTheme.name}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400 font-mono">{device.activeLayoutName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInStudio(currentTheme.id, device);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                    >
                      在工作台中定制 →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 右侧：所选设备的硬件参数调试抽屉 */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-6 sticky top-20">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>设备参数调谐：{selectedDevice.name}</span>
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              通过 HID 通道即时推送硬件寄存器参数
            </div>
          </div>

          {/* 背光亮度滑块 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                背光亮度 (Brightness)
              </span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">
                {selectedDevice.brightness}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={selectedDevice.brightness}
              onChange={(e) =>
                onUpdateDevice(selectedDevice.id, { brightness: Number(e.target.value) })
              }
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* 屏幕方向旋转控制 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                显示旋转方向 (Orientation)
              </span>
              <span className="font-mono text-sky-400 font-bold">
                {selectedDevice.orientation}°
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
              {([0, 90, 180, 270] as DeviceOrientation[]).map((deg) => (
                <button
                  key={deg}
                  onClick={() => onUpdateDevice(selectedDevice.id, { orientation: deg })}
                  className={`py-1.5 rounded-lg border transition-colors ${
                    selectedDevice.orientation === deg
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white'
                  }`}
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>

          {/* 主题快速分发 */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium block">
              推送主题至此副屏
            </label>
            <select
              value={selectedDevice.activeThemeId}
              onChange={(e) => {
                onUpdateDevice(selectedDevice.id, { activeThemeId: e.target.value });
                showToast(`已将主题推送至 ${selectedDevice.name}`);
              }}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none focus:border-sky-500/50"
            >
              {themes.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.name}
                </option>
              ))}
            </select>
          </div>

          {/* 硬件体征监控卡片 */}
          <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs font-mono">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-800/80 pb-1.5">
              硬件体征与通信链路 (TELEMETRY)
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>主控芯片温度</span>
              <span className="text-slate-200 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-rose-400" />
                {selectedDevice.temperature}°C
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>渲染刷新率</span>
              <span className="text-emerald-400 font-semibold">{selectedDevice.fps} FPS</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>会话独占租约</span>
              <span className="text-amber-400 truncate max-w-[140px]">
                {selectedDevice.leaseToken ? '已锁定所有权' : '空闲 (可分配)'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>面板色温基准</span>
              <span className="text-slate-200">{selectedDevice.colorTemp}K (D65)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部悬浮提示框 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 border border-sky-500/40 text-slate-100 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
