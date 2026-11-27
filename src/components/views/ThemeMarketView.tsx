import React, { useState } from 'react';
import { CraftTheme, D92Device } from '../../types';
import { WidgetRenderer } from '../crafts/WidgetRenderer';
import { DeviceBezel } from '../layout/DeviceBezel';
import { Sparkles, Wand2, Send, Download, Tag, CheckCircle2, X } from 'lucide-react';

interface ThemeMarketViewProps {
  themes: CraftTheme[];
  devices: D92Device[];
  onOpenInStudio: (theme: CraftTheme) => void;
  onDeployThemeToDevice: (deviceId: string, theme: CraftTheme) => void;
}

export const ThemeMarketView: React.FC<ThemeMarketViewProps> = ({
  themes,
  devices,
  onOpenInStudio,
  onDeployThemeToDevice,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectingTheme, setInspectingTheme] = useState<CraftTheme | null>(null);
  const [deployTargetTheme, setDeployTargetTheme] = useState<CraftTheme | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: '全部主题' },
    { id: 'aquatic', label: '水族与生态景观' },
    { id: 'finance', label: '金融与实时走势' },
    { id: 'audio', label: '音乐与律动歌词' },
    { id: 'clock', label: '精密时计与拟物' },
    { id: 'hardware', label: '硬件体征监控' },
  ];

  const filteredThemes =
    selectedCategory === 'all'
      ? themes
      : themes.filter((t) => t.category === selectedCategory);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full select-none">
      {/* 顶部标题与分类过滤 */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <span>Craft 原生主题生态市场</span>
          </h1>
          <div className="text-xs text-slate-400 mt-1">
            精心调优、在 D92 副屏上 60 帧丝滑运行的独立微组件与动态景观
          </div>
        </div>

        {/* 分类切换器 */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-lg border border-slate-800">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 主题网格卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredThemes.map((theme) => (
          <div
            key={theme.id}
            className="flex flex-col rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 overflow-hidden transition-all group hover:shadow-xl hover:shadow-black/50"
          >
            {/* 实时运行中的预览视口 (点击进入大图微调) */}
            <div
              onClick={() => setInspectingTheme(theme)}
              className="relative h-44 bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer border-b border-slate-800/60 p-2"
            >
              <div className="w-full h-full relative rounded overflow-hidden">
                {theme.widgets.map((w) => (
                  <div
                    key={w.id}
                    className="absolute inset-0"
                    style={{ zIndex: w.zIndex }}
                  >
                    <WidgetRenderer widget={w} />
                  </div>
                ))}
              </div>

              {/* 悬停提示 */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-xs">
                <span className="px-3 py-1 text-xs font-semibold bg-sky-500 text-slate-950 rounded-full shadow-lg">
                  点击查看大图与真机模拟
                </span>
              </div>
            </div>

            {/* 卡片详情 */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                    {theme.name}
                  </span>
                  <span className="text-[10px] font-mono text-sky-400/90 font-semibold uppercase">
                    {theme.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {theme.description}
                </p>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 mt-2.5">
                  <span>作者: {theme.author}</span>
                  <span>·</span>
                  <span>v{theme.version}</span>
                  <span>·</span>
                  <span>推荐: {theme.recommendedResolution.width}×{theme.recommendedResolution.height}</span>
                </div>
              </div>

              {/* 卡片底部动作栏 */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/60">
                <button
                  onClick={() => onOpenInStudio(theme)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700/80"
                >
                  <Wand2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>在工作台中定制</span>
                </button>

                <button
                  onClick={() => setDeployTargetTheme(theme)}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>推送至副屏</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 推送目标选择弹窗 */}
      {deployTargetTheme && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                推送「{deployTargetTheme.name}」至副屏
              </h3>
              <button
                onClick={() => setDeployTargetTheme(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              请选择要接收此主题并即时开始渲染的 D92 硬件副屏设备：
            </p>

            <div className="space-y-2">
              {devices.map((dev) => (
                <div
                  key={dev.id}
                  onClick={() => {
                    onDeployThemeToDevice(dev.id, deployTargetTheme);
                    showToast(`已将「${deployTargetTheme.name}」成功推送至 ${dev.name}`);
                    setDeployTargetTheme(null);
                  }}
                  className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/40 cursor-pointer flex items-center justify-between text-xs transition-all"
                >
                  <div>
                    <div className="font-semibold text-white">{dev.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {dev.model} · {dev.width}×{dev.height}px · {dev.fps} FPS
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-sky-400 font-semibold">
                    选择并推送 →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 大屏详情与真机模拟弹窗 */}
      {inspectingTheme && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-4xl w-full shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{inspectingTheme.name}</h3>
                <span className="text-xs text-slate-400">
                  作者：{inspectingTheme.author} · 版本号：v{inspectingTheme.version}
                </span>
              </div>
              <button
                onClick={() => setInspectingTheme(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 大尺寸真机边框模拟器 */}
            <div className="py-4 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800">
              <DeviceBezel
                name={inspectingTheme.name}
                width={inspectingTheme.recommendedResolution.width}
                height={inspectingTheme.recommendedResolution.height}
                orientation={0}
                brightness={90}
                fps={60}
                status="connected"
                scale={0.65}
                showHardwareDetails={true}
              >
                <div className="w-full h-full relative">
                  {inspectingTheme.widgets.map((w) => (
                    <div
                      key={w.id}
                      className="absolute inset-0"
                      style={{ zIndex: w.zIndex }}
                    >
                      <WidgetRenderer widget={w} />
                    </div>
                  ))}
                </div>
              </DeviceBezel>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {inspectingTheme.description}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  onOpenInStudio(inspectingTheme);
                  setInspectingTheme(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
              >
                <Wand2 className="w-3.5 h-3.5 text-sky-400" />
                <span>在工作台中定制</span>
              </button>
              <button
                onClick={() => {
                  setDeployTargetTheme(inspectingTheme);
                  setInspectingTheme(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>推送到副屏</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 悬浮提示框 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 border border-sky-500/40 text-slate-100 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
