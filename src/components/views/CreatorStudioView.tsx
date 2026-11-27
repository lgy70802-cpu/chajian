import React, { useState, useRef } from 'react';
import { 
  SceneWidget, 
  WidgetType, 
  CraftTheme, 
  D92Device, 
  PresetWidgetDef 
} from '../../types';
import { PRESET_WIDGET_CATALOG } from '../../data/mockData';
import { DeviceBezel } from '../layout/DeviceBezel';
import { WidgetRenderer } from '../crafts/WidgetRenderer';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Sliders, 
  Layers, 
  Grid, 
  Maximize2, 
  RotateCcw, 
  Save, 
  Send,
  Move,
  CheckCircle2
} from 'lucide-react';

interface CreatorStudioViewProps {
  devices: D92Device[];
  themes: CraftTheme[];
  activeWidgets: SceneWidget[];
  onChangeWidgets: (widgets: SceneWidget[]) => void;
  onDeployToDevice: (deviceId: string, widgets: SceneWidget[]) => void;
}

export const CreatorStudioView: React.FC<CreatorStudioViewProps> = ({
  devices,
  themes,
  activeWidgets,
  onChangeWidgets,
  onDeployToDevice,
}) => {
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>(activeWidgets[0]?.id || '');
  const [leftTab, setLeftTab] = useState<'palette' | 'layers'>('palette');
  const [targetRatio, setTargetRatio] = useState<'3:1' | '1:1' | '16:9'>('3:1');
  const [zoomLevel, setZoomLevel] = useState<number>(0.75);
  const [snapGrid, setSnapGrid] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dragging state on canvas
  const [draggingWidgetId, setDraggingWidgetId] = useState<string | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const canvasWidth = targetRatio === '3:1' ? 960 : targetRatio === '1:1' ? 480 : 960;
  const canvasHeight = targetRatio === '3:1' ? 320 : targetRatio === '1:1' ? 480 : 540;

  const selectedWidget = activeWidgets.find((w) => w.id === selectedWidgetId);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Add widget from palette
  const handleAddWidget = (def: PresetWidgetDef) => {
    const newWidget: SceneWidget = {
      id: `w-${def.type}-${Date.now().toString().slice(-4)}`,
      type: def.type,
      title: def.title,
      x: 10,
      y: 10,
      width: def.defaultWidth,
      height: def.defaultHeight,
      zIndex: activeWidgets.length + 1,
      visible: true,
      locked: false,
      props: { ...def.defaultProps },
    };
    const updated = [...activeWidgets, newWidget];
    onChangeWidgets(updated);
    setSelectedWidgetId(newWidget.id);
    showToast(`已向画布添加组件：${def.title}`);
  };

  // Delete selected widget
  const handleDeleteWidget = (id: string) => {
    const updated = activeWidgets.filter((w) => w.id !== id);
    onChangeWidgets(updated);
    if (selectedWidgetId === id) {
      setSelectedWidgetId(updated[0]?.id || '');
    }
    showToast('已从画布移除该组件');
  };

  // Duplicate widget
  const handleDuplicate = (w: SceneWidget) => {
    const dup: SceneWidget = {
      ...w,
      id: `w-${w.type}-${Date.now().toString().slice(-4)}`,
      x: Math.min(80, w.x + 5),
      y: Math.min(80, w.y + 5),
      zIndex: activeWidgets.length + 1,
    };
    onChangeWidgets([...activeWidgets, dup]);
    setSelectedWidgetId(dup.id);
    showToast('已复制图层');
  };

  // Reorder layer
  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    const index = activeWidgets.findIndex((w) => w.id === id);
    if (index === -1) return;
    if (direction === 'up' && index < activeWidgets.length - 1) {
      const copy = [...activeWidgets];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      onChangeWidgets(copy);
    } else if (direction === 'down' && index > 0) {
      const copy = [...activeWidgets];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      onChangeWidgets(copy);
    }
  };

  // Update specific property on selected widget
  const handleUpdateSelected = (updates: Partial<SceneWidget>) => {
    if (!selectedWidget) return;
    const updated = activeWidgets.map((w) =>
      w.id === selectedWidget.id ? { ...w, ...updates } : w
    );
    onChangeWidgets(updated);
  };

  const handleUpdateProps = (propKey: string, val: any) => {
    if (!selectedWidget) return;
    const updatedProps = { ...selectedWidget.props, [propKey]: val };
    handleUpdateSelected({ props: updatedProps });
  };

  // Canvas Drag Handling
  const handleMouseDown = (e: React.MouseEvent, widget: SceneWidget) => {
    if (widget.locked) return;
    e.stopPropagation();
    setSelectedWidgetId(widget.id);
    setDraggingWidgetId(widget.id);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: widget.x,
      origY: widget.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingWidgetId || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    // Convert pixel delta to percentage
    const deltaXPercent = (dx / (canvasWidth * zoomLevel)) * 100;
    const deltaYPercent = (dy / (canvasHeight * zoomLevel)) * 100;

    let newX = dragStartRef.current.origX + deltaXPercent;
    let newY = dragStartRef.current.origY + deltaYPercent;

    if (snapGrid) {
      newX = Math.round(newX / 5) * 5;
      newY = Math.round(newY / 5) * 5;
    }

    newX = Math.max(0, Math.min(100 - (selectedWidget?.width || 20), newX));
    newY = Math.max(0, Math.min(100 - (selectedWidget?.height || 20), newY));

    handleUpdateSelected({ x: Math.round(newX), y: Math.round(newY) });
  };

  const handleMouseUp = () => {
    setDraggingWidgetId(null);
    dragStartRef.current = null;
  };

  return (
    <div
      className="flex-1 flex flex-col w-full h-[calc(100vh-60px)] overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* 三栏式工作区布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧栏：组件库与图层树 (280px) */}
        <aside className="w-72 bg-slate-900/70 border-r border-slate-800 flex flex-col shrink-0">
          {/* Tab 切换 */}
          <div className="flex items-center border-b border-slate-800 p-2 gap-1 bg-slate-950/40">
            <button
              onClick={() => setLeftTab('palette')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                leftTab === 'palette'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700/80 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>组件资源库</span>
            </button>
            <button
              onClick={() => setLeftTab('layers')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                leftTab === 'layers'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700/80 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>图层管理 ({activeWidgets.length})</span>
            </button>
          </div>

          {/* 组件库列表 */}
          {leftTab === 'palette' ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider px-1">
                点击快速添加至副屏画布
              </div>
              {PRESET_WIDGET_CATALOG.map((def, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAddWidget(def)}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-sky-500/50 hover:bg-slate-800/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-sky-300">
                      {def.title}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {def.description}
                  </div>
                  <div className="text-[10px] text-sky-400/70 font-mono mt-1.5">
                    {def.category}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 图层列表 */
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider px-1 mb-2">
                场景图层树与堆叠顺序
              </div>
              {activeWidgets.map((widget, idx) => {
                const isSelected = widget.id === selectedWidgetId;
                return (
                  <div
                    key={widget.id}
                    onClick={() => setSelectedWidgetId(widget.id)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500/40 text-sky-200 font-semibold'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-mono text-slate-500">#{idx + 1}</span>
                      <span className="truncate">{widget.title}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        title={widget.visible ? '隐藏部件' : '显示部件'}
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = activeWidgets.map((w) =>
                            w.id === widget.id ? { ...w, visible: !w.visible } : w
                          );
                          onChangeWidgets(updated);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-200"
                      >
                        {widget.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-rose-400" />}
                      </button>

                      <button
                        title={widget.locked ? '解锁图层' : '锁定图层位置'}
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = activeWidgets.map((w) =>
                            w.id === widget.id ? { ...w, locked: !w.locked } : w
                          );
                          onChangeWidgets(updated);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-200"
                      >
                        {widget.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3" />}
                      </button>

                      <button
                        title="下移图层"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveLayer(widget.id, 'down');
                        }}
                        className="p-1 text-slate-400 hover:text-slate-200"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>

                      <button
                        title="上移图层"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveLayer(widget.id, 'up');
                        }}
                        className="p-1 text-slate-400 hover:text-slate-200"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>

        {/* 中间栏：画布舞台与硬件框 (flex-1) */}
        <main className="flex-1 flex flex-col bg-[#070A10] overflow-hidden">
          {/* 画布顶部工具栏 */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800/80 bg-slate-900/50">
            {/* 屏幕比例与型号切换 */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-mono text-[11px] mr-1">显示比例:</span>
              {(['3:1', '1:1', '16:9'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTargetRatio(r)}
                  className={`px-2.5 py-1 rounded-md font-mono transition-colors ${
                    targetRatio === r
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {r} {r === '3:1' ? '(D92 Pro 超宽)' : r === '1:1' ? '(D92 方屏)' : '(16:9 宽屏)'}
                </button>
              ))}
            </div>

            {/* 画布缩放与网格吸附 */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSnapGrid(!snapGrid)}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition-colors ${
                  snapGrid
                    ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Grid className="w-3 h-3" />
                <span>5% 网格吸附</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-xs font-mono text-slate-300">
                <button
                  onClick={() => setZoomLevel(Math.max(0.4, zoomLevel - 0.1))}
                  className="px-2 py-0.5 hover:bg-slate-800 rounded"
                >
                  -
                </button>
                <span className="px-1 text-[11px] tabular-nums font-semibold">
                  {Math.round(zoomLevel * 100)}% 视口
                </span>
                <button
                  onClick={() => setZoomLevel(Math.min(1.2, zoomLevel + 0.1))}
                  className="px-2 py-0.5 hover:bg-slate-800 rounded"
                >
                  +
                </button>
              </div>

              {/* 直接应用至硬件 */}
              <button
                onClick={() => {
                  if (devices[0]) {
                    onDeployToDevice(devices[0].id, activeWidgets);
                    showToast(`已将当前画布布局应用至 ${devices[0].name}`);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-sm"
              >
                <Send className="w-3 h-3" />
                <span>应用至副屏</span>
              </button>
            </div>
          </div>

          {/* 交互式画布舞台 */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            <DeviceBezel
              name={`画布视口 (${canvasWidth}×${canvasHeight})`}
              width={canvasWidth}
              height={canvasHeight}
              orientation={0}
              brightness={90}
              fps={60}
              status="connected"
              scale={zoomLevel}
              showHardwareDetails={true}
            >
              <div className="relative w-full h-full bg-[#030712] overflow-hidden">
                {activeWidgets.map((widget) => {
                  const isSelected = widget.id === selectedWidgetId;

                  return (
                    <div
                      key={widget.id}
                      onMouseDown={(e) => handleMouseDown(e, widget)}
                      style={{
                        position: 'absolute',
                        left: `${widget.x}%`,
                        top: `${widget.y}%`,
                        width: `${widget.width}%`,
                        height: `${widget.height}%`,
                        zIndex: widget.zIndex,
                        opacity: widget.visible ? 1 : 0,
                      }}
                      className={`cursor-move transition-shadow ${
                        isSelected
                          ? 'ring-2 ring-sky-400 ring-offset-1 ring-offset-black shadow-lg shadow-sky-500/20'
                          : 'hover:ring-1 hover:ring-sky-400/40'
                      }`}
                    >
                      <WidgetRenderer widget={widget} />

                      {/* 选中图层时的控制把手与浮动坐标 */}
                      {isSelected && (
                        <>
                          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-sky-500 rounded-sm" />
                          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-sky-500 rounded-sm" />
                          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-sky-500 rounded-sm" />
                          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-sky-500 rounded-sm" />

                          {/* 坐标气泡 */}
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-sky-500 text-slate-950 text-[9px] font-mono font-bold rounded shadow pointer-events-none whitespace-nowrap">
                            X:{widget.x}% Y:{widget.y}% 宽:{widget.width}% 高:{widget.height}%
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </DeviceBezel>
          </div>
        </main>

        {/* 右侧栏：精确属性检查器 (300px) */}
        <aside className="w-80 bg-slate-900/70 border-l border-slate-800 flex flex-col p-4 overflow-y-auto space-y-5 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>属性检查器</span>
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              {selectedWidget ? selectedWidget.title : '未选中任何图层'}
            </div>
          </div>

          {selectedWidget ? (
            <div className="space-y-4">
              {/* 空间位置与几何尺寸 */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                  位置与尺寸 (TRANSFORM)
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">X 轴起点 (%)</label>
                    <input
                      type="number"
                      value={selectedWidget.x}
                      onChange={(e) => handleUpdateSelected({ x: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Y 轴起点 (%)</label>
                    <input
                      type="number"
                      value={selectedWidget.y}
                      onChange={(e) => handleUpdateSelected({ y: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">宽度 (%)</label>
                    <input
                      type="number"
                      value={selectedWidget.width}
                      onChange={(e) => handleUpdateSelected({ width: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">高度 (%)</label>
                    <input
                      type="number"
                      value={selectedWidget.height}
                      onChange={(e) => handleUpdateSelected({ height: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* 各类型组件定制参数 */}
              {selectedWidget.type === 'aquarium' && (
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="text-[11px] font-mono text-sky-400 uppercase tracking-wider font-semibold">
                    水族箱生态模拟参数
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">鱼群总数</span>
                      <span className="font-mono text-sky-400 font-bold">
                        {selectedWidget.props.fishCount || 6} 条
                      </span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={15}
                      value={selectedWidget.props.fishCount || 6}
                      onChange={(e) => handleUpdateProps('fishCount', Number(e.target.value))}
                      className="w-full accent-sky-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">波光焦散强度</span>
                      <span className="font-mono text-sky-400 font-bold">
                        {selectedWidget.props.causticsIntensity || 0.7}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={selectedWidget.props.causticsIntensity || 0.7}
                      onChange={(e) => handleUpdateProps('causticsIntensity', Number(e.target.value))}
                      className="w-full accent-sky-400"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={selectedWidget.props.showClock !== false}
                      onChange={(e) => handleUpdateProps('showClock', e.target.checked)}
                      className="rounded accent-sky-400"
                    />
                    <span>显示水族箱环境时钟 HUD</span>
                  </label>
                </div>
              )}

              {selectedWidget.type === 'clock' && (
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                    时钟拟物样式与配置
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">表盘样式</label>
                    <select
                      value={selectedWidget.props.style || 'nixie'}
                      onChange={(e) => handleUpdateProps('style', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-1.5 text-slate-200"
                    >
                      <option value="nixie">IN-14 辉光真空管 (Nixie)</option>
                      <option value="flip">机械分叶翻页钟 (Flip)</option>
                      <option value="digital">赛博数码 LED (Digital)</option>
                      <option value="analog">包豪斯指针腕表 (Analog)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">辉光色调</label>
                    <select
                      value={selectedWidget.props.colorHue || 'amber'}
                      onChange={(e) => handleUpdateProps('colorHue', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-1.5 text-slate-200"
                    >
                      <option value="amber">经典琥珀暖金 (Amber Glow)</option>
                      <option value="cyan">赛博朋克青蓝 (Cyber Cyan)</option>
                      <option value="green">黑客帝国翠绿 (Matrix Green)</option>
                      <option value="white">纯净冷白光 (Cold White)</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={selectedWidget.props.showSeconds !== false}
                      onChange={(e) => handleUpdateProps('showSeconds', e.target.checked)}
                      className="rounded accent-amber-400"
                    />
                    <span>显示秒钟走时</span>
                  </label>
                </div>
              )}

              {selectedWidget.type === 'stocks' && (
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                    金融与行情参数
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">默认标的代码</label>
                    <select
                      value={selectedWidget.props.selectedSymbol || 'NVDA'}
                      onChange={(e) => handleUpdateProps('selectedSymbol', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs rounded p-1.5 text-slate-200"
                    >
                      <option value="NVDA">NVDA (英伟达)</option>
                      <option value="AAPL">AAPL (苹果)</option>
                      <option value="BTC">BTC (比特币)</option>
                      <option value="ETH">ETH (以太坊)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 动作按钮：复制与删除 */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleDuplicate(selectedWidget)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制此图层</span>
                </button>
                <button
                  onClick={() => handleDeleteWidget(selectedWidget.id)}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg transition-colors border border-rose-500/30"
                  title="删除部件"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-12">
              在中间画布中点击任意组件，即可在此处精确调整坐标位置、显示样式与数据绑定。
            </div>
          )}
        </aside>
      </div>

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
