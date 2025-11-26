'use client';

import { useMemo, useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from 'recharts';
import { StockData, TechnicalIndicators, SupportResistance } from '@/types';

interface StockChartProps {
  priceHistory: StockData[];
  indicators: TechnicalIndicators;
  supportResistance: SupportResistance;
  symbol: string;
  companyName?: string;
}

type ChartView = 'candlestick' | 'line' | 'both';

// Custom candlestick shape for recharts
const Candlestick = (props: any) => {
  const { x, y, width, height, payload } = props;
  
  if (!payload) return null;
  
  const { open, close, high, low } = payload;
  const isGreen = close >= open;
  const color = isGreen ? '#22c55e' : '#ef4444';
  
  // Calculate positions
  const candleWidth = Math.max(width * 0.6, 2);
  const xCenter = x + width / 2;
  const xLeft = xCenter - candleWidth / 2;
  
  // Scale values to chart coordinates
  const yScale = props.yScale || ((val: number) => val);
  const yHigh = yScale(high);
  const yLow = yScale(low);
  const yOpen = yScale(open);
  const yClose = yScale(close);
  
  const bodyTop = Math.min(yOpen, yClose);
  const bodyBottom = Math.max(yOpen, yClose);
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
  
  return (
    <g>
      {/* Wick */}
      <line
        x1={xCenter}
        y1={yHigh}
        x2={xCenter}
        y2={yLow}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={xLeft}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={isGreen ? color : color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

// Custom tooltip for candlestick data
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0]?.payload;
  if (!data) return null;
  
  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return (vol / 1000000).toFixed(2) + 'M';
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K';
    return vol.toString();
  };
  
  const isGreen = data.close >= data.open;
  
  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl">
      <p className="text-gray-400 text-sm mb-2">{data.formattedDate}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span className="text-gray-400">Open:</span>
        <span className="text-white font-medium">{formatPrice(data.open)}</span>
        <span className="text-gray-400">High:</span>
        <span className="text-green-400 font-medium">{formatPrice(data.high)}</span>
        <span className="text-gray-400">Low:</span>
        <span className="text-red-400 font-medium">{formatPrice(data.low)}</span>
        <span className="text-gray-400">Close:</span>
        <span className={`font-medium ${isGreen ? 'text-green-400' : 'text-red-400'}`}>
          {formatPrice(data.close)}
        </span>
        <span className="text-gray-400">Volume:</span>
        <span className="text-blue-400 font-medium">{formatVolume(data.volume)}</span>
      </div>
      {data.change !== undefined && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <span className={`text-sm font-medium ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default function StockChart({ 
  priceHistory, 
  indicators, 
  supportResistance,
  symbol,
  companyName 
}: StockChartProps) {
  const [chartView, setChartView] = useState<ChartView>('both');
  const [showVolume, setShowVolume] = useState(true);
  const [showSMA, setShowSMA] = useState(true);
  const [showLevels, setShowLevels] = useState(true);

  // Calculate SMA values for each data point
  const calculateSMA = (data: number[], period: number): (number | null)[] => {
    const result: (number | null)[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(null);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  };

  const chartData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return [];
    
    const closes = priceHistory.map(d => d.close);
    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    const sma200 = calculateSMA(closes, 200);
    
    return priceHistory.map((item, index) => {
      const prevClose = index > 0 ? priceHistory[index - 1].close : item.open;
      const change = ((item.close - prevClose) / prevClose) * 100;
      
      return {
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        }),
        shortDate: new Date(item.date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit'
        }),
        sma20: sma20[index],
        sma50: sma50[index],
        sma200: sma200[index],
        change,
        // For candlestick coloring
        fill: item.close >= item.open ? '#22c55e' : '#ef4444',
        // Volume color based on price movement
        volumeColor: item.close >= item.open ? '#22c55e40' : '#ef444440',
      };
    });
  }, [priceHistory]);

  // Calculate price range for Y axis
  const priceRange = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 100 };
    
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    
    return {
      min: Math.floor(min - padding),
      max: Math.ceil(max + padding)
    };
  }, [chartData]);

  // Calculate volume range
  const volumeMax = useMemo(() => {
    if (chartData.length === 0) return 1000000;
    return Math.max(...chartData.map(d => d.volume)) * 1.2;
  }, [chartData]);

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);
  
  const formatYAxis = (value: number) => {
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value.toString();
  };

  const formatVolumeAxis = (value: number) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value.toString();
  };

  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 text-center">
        <p className="text-gray-400">No price data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">
            {symbol} {companyName && companyName !== symbol && <span className="text-gray-400 font-normal">• {companyName}</span>}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {chartData.length} trading days • Last updated: {chartData[chartData.length - 1]?.formattedDate}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setChartView('candlestick')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                chartView === 'candlestick' 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Candlestick
            </button>
            <button
              onClick={() => setChartView('line')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                chartView === 'line' 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartView('both')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                chartView === 'both' 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Both
            </button>
          </div>
          
          {/* Overlay Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                showSMA 
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400' 
                  : 'border-gray-700 text-gray-500 hover:text-gray-300'
              }`}
            >
              SMA
            </button>
            <button
              onClick={() => setShowLevels(!showLevels)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                showLevels 
                  ? 'border-amber-500 bg-amber-500/20 text-amber-400' 
                  : 'border-gray-700 text-gray-500 hover:text-gray-300'
              }`}
            >
              S/R Levels
            </button>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                showVolume 
                  ? 'border-purple-500 bg-purple-500/20 text-purple-400' 
                  : 'border-gray-700 text-gray-500 hover:text-gray-300'
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            
            <XAxis 
              dataKey="shortDate" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={{ stroke: '#4b5563' }}
              interval={Math.floor(chartData.length / 10)}
            />
            
            <YAxis 
              domain={[priceRange.min, priceRange.max]}
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={{ stroke: '#4b5563' }}
              tickFormatter={formatYAxis}
              width={60}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Support & Resistance Lines */}
            {showLevels && supportResistance.support_levels.slice(0, 3).map((level, idx) => (
              <ReferenceLine 
                key={`support-${idx}`}
                y={level} 
                stroke="#22c55e" 
                strokeDasharray="5 5"
                strokeOpacity={0.7}
                label={{ 
                  value: `S${idx + 1}: ${formatPrice(level)}`, 
                  fill: '#22c55e', 
                  fontSize: 10,
                  position: 'right'
                }}
              />
            ))}
            
            {showLevels && supportResistance.resistance_levels.slice(0, 3).map((level, idx) => (
              <ReferenceLine 
                key={`resistance-${idx}`}
                y={level} 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                strokeOpacity={0.7}
                label={{ 
                  value: `R${idx + 1}: ${formatPrice(level)}`, 
                  fill: '#ef4444', 
                  fontSize: 10,
                  position: 'right'
                }}
              />
            ))}
            
            {/* Area under line chart */}
            {(chartView === 'line' || chartView === 'both') && (
              <Area
                type="monotone"
                dataKey="close"
                stroke="transparent"
                fill="url(#priceGradient)"
              />
            )}
            
            {/* Candlestick bars */}
            {(chartView === 'candlestick' || chartView === 'both') && (
              <Bar
                dataKey="high"
                fill="transparent"
                shape={(props: any) => {
                  const { x, width, payload } = props;
                  if (!payload) return <g />;
                  
                  const yScale = (val: number) => {
                    const range = priceRange.max - priceRange.min;
                    const chartHeight = 360; // Approximate height
                    return 20 + ((priceRange.max - val) / range) * chartHeight;
                  };
                  
                  const { open, close, high, low } = payload;
                  const isGreen = close >= open;
                  const color = isGreen ? '#22c55e' : '#ef4444';
                  
                  const candleWidth = Math.max(width * 0.6, 2);
                  const xCenter = x + width / 2;
                  const xLeft = xCenter - candleWidth / 2;
                  
                  const yHigh = yScale(high);
                  const yLow = yScale(low);
                  const yOpen = yScale(open);
                  const yClose = yScale(close);
                  
                  const bodyTop = Math.min(yOpen, yClose);
                  const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1);
                  
                  return (
                    <g>
                      <line
                        x1={xCenter}
                        y1={yHigh}
                        x2={xCenter}
                        y2={yLow}
                        stroke={color}
                        strokeWidth={1}
                      />
                      <rect
                        x={xLeft}
                        y={bodyTop}
                        width={candleWidth}
                        height={bodyHeight}
                        fill={color}
                        stroke={color}
                        strokeWidth={1}
                      />
                    </g>
                  );
                }}
              />
            )}
            
            {/* Line chart */}
            {(chartView === 'line' || chartView === 'both') && (
              <Line
                type="monotone"
                dataKey="close"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="Close"
              />
            )}
            
            {/* SMA Lines */}
            {showSMA && (
              <>
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  name="SMA 20"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dot={false}
                  name="SMA 50"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="sma200"
                  stroke="#a855f7"
                  strokeWidth={1.5}
                  dot={false}
                  name="SMA 200"
                  connectNulls={false}
                />
              </>
            )}
            
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value: string) => (
                <span className="text-gray-300 text-sm">{value}</span>
              )}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      {showVolume && (
        <div className="px-4 pb-4">
          <ResponsiveContainer width="100%" height={100}>
            <ComposedChart data={chartData} margin={{ top: 0, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="shortDate" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickLine={{ stroke: '#4b5563' }}
                interval={Math.floor(chartData.length / 10)}
                height={20}
              />
              <YAxis 
                domain={[0, volumeMax]}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickLine={{ stroke: '#4b5563' }}
                tickFormatter={formatVolumeAxis}
                width={60}
              />
              <Bar
                dataKey="volume"
                fill="#6366f1"
                opacity={0.6}
                radius={[2, 2, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend for indicators */}
      {showSMA && (
        <div className="px-6 py-3 border-t border-gray-800 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-400">SMA 20: {formatPrice(indicators.sma_20)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-400">SMA 50: {formatPrice(indicators.sma_50)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-gray-400">SMA 200: {formatPrice(indicators.sma_200)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

