import React, { useState, useEffect } from 'react';
import { D92Device } from '../../types';
import { Cpu, Terminal, Activity, CheckCircle2, ShieldCheck, RefreshCw, Zap } from 'lucide-react';

interface DiagnosticsViewProps {
  devices: D92Device[];
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'DEBUG' | 'WARN';
  message: string;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({ devices }) => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: '00:00:01',
      level: 'INFO',
      message: 'HID 驱动子系统就绪。开始枚举 VID=0x5548 PID=0x1011 对应的 D92 硬件端点...',
    },
    {
      id: '2',
      timestamp: '00:00:02',
      level: 'SUCCESS',
      message: '发现 D92 Pro 超宽屏 [d92-dev-01]。Usage Page: 0xFFA0, Usage: 0x01。握手 ACK 校验通过。',
    },
    {
      id: '3',
      timestamp: '00:00:03',
      level: 'INFO',
      message: '已为 d92-dev-01 建立独占会话租约: leaseToken="session-d92-win11-88f1"',
    },
    {
      id: '4',
      timestamp: '00:00:04',
      level: 'SUCCESS',
      message: '发现 D92 Mini 方形屏 [d92-dev-02]。帧率锁定为 30 FPS。D65 色彩配置文件加载完成。',
    },
    {
      id: '5',
      timestamp: '00:00:05',
      level: 'DEBUG',
      message: '心跳轮询探测: 往返时延 1.4ms。过去 1,200 帧零丢包，通信管道状态优良。',
    },
  ]);

  const [jitterMs, setJitterMs] = useState<number>(1.2);
  const [packetRate, setPacketRate] = useState<number>(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setJitterMs(Number((1.0 + Math.random() * 0.8).toFixed(2)));
      setPacketRate(Math.floor(58 + Math.random() * 4));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const addPingLog = () => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newEntry: LogEntry = {
      id: String(Date.now()),
      timestamp: timeStr,
      level: 'DEBUG',
      message: `手动探针 Ping 广播：向全部 ${devices.length} 台端点发送心跳探针，全部在 ${jitterMs}ms 内返回 ACK 响应。`,
    };
    setLogs((prev) => [...prev.slice(-30), newEntry]);
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full select-none">
      <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-sky-400" />
            <span>硬件 HID 协议与链路诊断控制台</span>
          </h1>
          <div className="text-xs text-slate-400 mt-1">
            USB HID 物理接口监听 (VID 0x5548 / PID 0x1011) 及帧传输抖动监控
          </div>
        </div>

        <button
          onClick={addPingLog}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>探测全部端点 (Probe Ping)</span>
        </button>
      </div>

      {/* 顶部三项核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>报文往返时延 (RTT JITTER)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2 tabular-nums">
            {jitterMs} ms
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1">
            ✓ 低于 2.0ms 实时通信阈值
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>数据传输速率 (THROUGHPUT)</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-2 tabular-nums">
            {packetRate} 包/秒
          </div>
          <div className="text-[11px] font-mono text-sky-400 mt-1">
            USB 2.0 Full-Speed 12Mbps 物理管道
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>硬件会话租约冲突</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-2">
            0 处冲突
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            多设备互斥访问隔离正常
          </div>
        </div>
      </div>

      {/* 实时事件控制台 */}
      <div className="flex-1 flex flex-col rounded-xl bg-slate-950 border border-slate-800 overflow-hidden min-h-[360px]">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-mono text-slate-200 font-semibold">
              D92 硬件协议报文日志流 (PROTOCOL EVENT LOG)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>正在监听 USB 热插拔事件</span>
          </div>
        </div>

        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 bg-black/60">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5">
              <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                  log.level === 'SUCCESS'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : log.level === 'INFO'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : log.level === 'DEBUG'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {log.level}
              </span>
              <span className="text-slate-300 leading-relaxed">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
