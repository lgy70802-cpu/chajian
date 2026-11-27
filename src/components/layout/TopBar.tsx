import React from 'react';
import { NavigationTab } from '../../types';
import { Monitor, Wand2, Sparkles, Cpu, Send, Layers } from 'lucide-react';

interface TopBarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  connectedCount: number;
  onSyncAll: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  connectedCount,
  onSyncAll,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-[#0B0F17]/90 backdrop-blur-md sticky top-0 z-40 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-900/30 border border-sky-400/30">
          <Monitor className="w-4 h-4 text-white" />
        </div>
        <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          DeskDisplay Studio
        </span>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="flex items-center gap-2">
        <button
          onClick={() => onSelectTab('devices')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'devices'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>设备管理 ({connectedCount}台)</span>
        </button>

        <button
          onClick={() => onSelectTab('studio')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'studio'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>创作者工作台</span>
        </button>

        <button
          onClick={() => onSelectTab('themes')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'themes'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Craft 主题库</span>
        </button>

        <button
          onClick={() => onSelectTab('diagnostics')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'diagnostics'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>HID 硬件诊断</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <a
          href="/DeskDisplay_Studio_Interactive_Prototype.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700 hover:text-white rounded-lg transition-all border border-slate-700 shadow-xs whitespace-nowrap shrink-0"
          title="在新标签页中打开独立的单文件交互设计稿 HTML"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>打开设计稿 HTML</span>
        </a>

        <button
          onClick={onSyncAll}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 active:scale-95 rounded-lg transition-all shadow-md shadow-sky-600/20 whitespace-nowrap shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>同步至全部副屏</span>
        </button>
      </div>
    </header>
  );
};
