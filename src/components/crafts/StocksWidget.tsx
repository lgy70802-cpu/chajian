import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, RefreshCw } from 'lucide-react';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: string;
  history: number[];
}

interface StocksWidgetProps {
  selectedSymbol?: string;
  symbols?: string[];
  chartType?: 'candlestick' | 'area';
  className?: string;
}

const INITIAL_STOCKS: Record<string, StockData> = {
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corp',
    price: 138.25,
    change: 4.82,
    changePercent: 3.61,
    high: 139.5,
    low: 133.1,
    volume: '48.2M',
    history: [132, 133.5, 131.8, 134.2, 135.0, 134.6, 136.2, 137.4, 136.9, 138.25],
  },
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc',
    price: 232.14,
    change: -1.22,
    changePercent: -0.52,
    high: 234.8,
    low: 231.4,
    volume: '34.7M',
    history: [235, 234.2, 234.8, 233.1, 232.8, 233.5, 232.0, 231.8, 232.5, 232.14],
  },
  BTC: {
    symbol: 'BTC/USD',
    name: 'Bitcoin Core',
    price: 68420.0,
    change: 1850.5,
    changePercent: 2.78,
    high: 69120.0,
    low: 66400.0,
    volume: '$28.4B',
    history: [66200, 66500, 66100, 67200, 66900, 67800, 68100, 67900, 68300, 68420],
  },
  ETH: {
    symbol: 'ETH/USD',
    name: 'Ethereum',
    price: 3512.4,
    change: 94.2,
    changePercent: 2.75,
    high: 3580.0,
    low: 3390.0,
    volume: '$14.2B',
    history: [3400, 3420, 3390, 3440, 3460, 3450, 3480, 3500, 3490, 3512.4],
  },
};

export const StocksWidget: React.FC<StocksWidgetProps> = ({
  selectedSymbol: initialSymbol = 'NVDA',
  className = '',
}) => {
  const [stocks, setStocks] = useState<Record<string, StockData>>(INITIAL_STOCKS);
  const [activeKey, setActiveKey] = useState<string>(initialSymbol);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M'>('1D');
  const [isTickUp, setIsTickUp] = useState<boolean>(true);

  // Live price fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks((prev) => {
        const current = prev[activeKey];
        if (!current) return prev;
        const delta = (Math.random() - 0.48) * (current.price * 0.002);
        const newPrice = Number((current.price + delta).toFixed(2));
        const newChange = Number((current.change + delta).toFixed(2));
        const newPercent = Number(((newChange / (newPrice - newChange)) * 100).toFixed(2));
        const updatedHistory = [...current.history.slice(1), newPrice];

        setIsTickUp(delta >= 0);

        return {
          ...prev,
          [activeKey]: {
            ...current,
            price: newPrice,
            change: newChange,
            changePercent: newPercent,
            history: updatedHistory,
          },
        };
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [activeKey]);

  const stock = stocks[activeKey] || stocks['NVDA'];
  const isPositive = stock.change >= 0;

  // Compute SVG chart coordinates
  const minVal = Math.min(...stock.history) * 0.998;
  const maxVal = Math.max(...stock.history) * 1.002;
  const range = maxVal - minVal || 1;

  const chartWidth = 360;
  const chartHeight = 110;

  const points = stock.history.map((val, idx) => {
    const x = (idx / (stock.history.length - 1)) * chartWidth;
    const y = chartHeight - ((val - minVal) / range) * (chartHeight - 16) - 8;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  return (
    <div className={`w-full h-full bg-[#0B0F17] text-slate-100 flex flex-col p-4 select-none ${className}`}>
      {/* Top Bar: Symbol Tabs & Timeframe */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-2.5">
        <div className="flex items-center gap-1.5">
          {Object.keys(stocks).map((key) => (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeKey === key
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900/90 p-0.5 rounded border border-slate-800">
          {(['1D', '1W', '1M'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded ${timeframe === tf ? 'bg-slate-800 text-slate-100 font-bold' : 'hover:text-slate-200'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Header */}
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide text-slate-200">{stock.name}</span>
            <span className="text-xs text-slate-500 font-mono">纳斯达克 · 实时行情</span>
          </div>
          <div className="flex items-baseline gap-2.5 mt-0.5">
            <span className={`text-2xl font-mono font-bold tracking-tight tabular-nums transition-colors duration-300 ${
              isTickUp ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`flex items-center text-xs font-mono font-semibold tabular-nums ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {isPositive ? '+' : ''}{stock.change} ({isPositive ? '+' : ''}{stock.changePercent}%)
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end text-xs font-mono text-slate-400 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">24H 最高</span>
            <span className="text-slate-300 tabular-nums">${stock.high}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">24H 最低</span>
            <span className="text-slate-300 tabular-nums">${stock.low}</span>
          </div>
        </div>
      </div>

      {/* Real-time SVG Chart */}
      <div className="relative flex-1 w-full min-h-[90px] overflow-hidden rounded bg-slate-950/60 border border-slate-800/40 p-1">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={`grad-${activeKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.35" />
              <stop offset="100%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
          <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

          {/* Area fill */}
          <path d={areaD} fill={`url(#grad-${activeKey})`} />

          {/* Line stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={isPositive ? '#10B981' : '#F43F5E'}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current price point pulse dot */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].split(',')[0]}
              cy={points[points.length - 1].split(',')[1]}
              r="4"
              fill={isPositive ? '#10B981' : '#F43F5E'}
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Live status badge */}
        <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>连续交易中 · 24H 成交量: {stock.volume}</span>
        </div>
      </div>
    </div>
  );
};
