'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { StockData } from '@/types';
import EducationalTooltip from './EducationalTooltip';

interface EffortResultChartProps {
  priceHistory: StockData[];
  effortResult: string;
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return (vol / 1000000).toFixed(2) + 'M';
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K';
    return vol.toString();
  };

  const isDiverging = data.isDiverging;

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl">
      <p className="text-gray-400 text-sm mb-2">{data.formattedDate}</p>

      <div className="space-y-2">
        <div>
          <span className="text-gray-400 text-sm">Volume (Effort): </span>
          <span className="text-blue-400 font-medium text-sm">{formatVolume(data.volume)}</span>
        </div>

        <div>
          <span className="text-gray-400 text-sm">Price Change (Result): </span>
          <span className={`font-medium text-sm ${
            data.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {data.priceChangePercent > 0 ? '+' : ''}{data.priceChangePercent.toFixed(2)}%
          </span>
        </div>

        {isDiverging && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <p className="text-xs text-orange-400 font-semibold">⚠️ Divergence Detected</p>
            <p className="text-xs text-gray-400 mt-1">
              High volume but low price movement suggests potential reversal
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function EffortResultChart({ priceHistory, effortResult }: EffortResultChartProps) {
  // Prepare chart data with effort vs result analysis
  const chartData = useMemo(() => {
    if (!priceHistory || priceHistory.length < 2) return [];

    // Use last 60 days for better visualization
    const recentData = priceHistory.slice(-60);

    // Calculate average volume for divergence detection
    const avgVolume = recentData.reduce((sum, d) => sum + d.volume, 0) / recentData.length;

    return recentData.map((item, index) => {
      if (index === 0) {
        return {
          ...item,
          priceChangePercent: 0,
          isDiverging: false,
          formattedDate: new Date(item.date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit'
          }),
        };
      }

      const prevItem = recentData[index - 1];
      const priceChange = ((item.close - prevItem.close) / prevItem.close) * 100;

      // Divergence detection: high volume but small price movement
      const isHighVolume = item.volume > avgVolume * 1.5;
      const isSmallPriceMove = Math.abs(priceChange) < 2;
      const isDiverging = isHighVolume && isSmallPriceMove;

      return {
        ...item,
        priceChangePercent: priceChange,
        isDiverging,
        volumeColor: isDiverging ? '#f97316' : '#6366f1',
        formattedDate: new Date(item.date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit'
        }),
      };
    });
  }, [priceHistory]);

  // Calculate volume range
  const volumeMax = useMemo(() => {
    if (chartData.length === 0) return 1000000;
    return Math.max(...chartData.map(d => d.volume)) * 1.2;
  }, [chartData]);

  // Calculate price change range
  const priceChangeRange = useMemo(() => {
    if (chartData.length === 0) return { min: -10, max: 10 };

    const changes = chartData.map(d => d.priceChangePercent || 0);
    const min = Math.min(...changes);
    const max = Math.max(...changes);
    const padding = Math.max(Math.abs(min), Math.abs(max)) * 0.2;

    return {
      min: Math.floor(min - padding),
      max: Math.ceil(max + padding)
    };
  }, [chartData]);

  const formatVolumeAxis = (value: number) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
    return value.toString();
  };

  const divergingCount = chartData.filter(d => d.isDiverging).length;

  if (!priceHistory || priceHistory.length < 2) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 text-center border border-gray-800">
        <p className="text-gray-400">Insufficient data for effort vs result analysis</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">Effort vs Result Analysis</h3>
            <EducationalTooltip
              title="Effort vs Result"
              content="Compares volume (effort) to price movement (result). When high volume produces little price movement, it suggests accumulation or distribution by smart money. Divergence between effort and result often precedes trend reversals."
            />
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            effortResult === 'confirming'
              ? 'bg-green-500/20 text-green-400'
              : effortResult === 'diverging'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-gray-700 text-gray-400'
          }`}>
            {effortResult.charAt(0).toUpperCase() + effortResult.slice(1)}
          </div>
        </div>

        {divergingCount > 0 && (
          <p className="text-sm text-orange-400 mt-2">
            ⚠️ {divergingCount} divergence points detected in last {chartData.length} days
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />

            <XAxis
              dataKey="formattedDate"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={{ stroke: '#4b5563' }}
              interval={Math.floor(chartData.length / 10)}
            />

            {/* Left Y-axis for Volume */}
            <YAxis
              yAxisId="left"
              domain={[0, volumeMax]}
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={{ stroke: '#4b5563' }}
              tickFormatter={formatVolumeAxis}
              width={60}
              label={{ value: 'Volume (Effort)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
            />

            {/* Right Y-axis for Price Change % */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[priceChangeRange.min, priceChangeRange.max]}
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={{ stroke: '#4b5563' }}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              width={60}
              label={{ value: 'Price Change % (Result)', angle: 90, position: 'insideRight', fill: '#9ca3af', fontSize: 12 }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Zero reference line for price change */}
            <ReferenceLine yAxisId="right" y={0} stroke="#6b7280" strokeDasharray="3 3" />

            {/* Volume bars (Effort) */}
            <Bar
              yAxisId="left"
              dataKey="volume"
              fill="#6366f1"
              opacity={0.7}
              radius={[2, 2, 0, 0]}
              name="Volume (Effort)"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isDiverging ? '#f97316' : '#6366f1'}
                />
              ))}
            </Bar>

            {/* Price change line (Result) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="priceChangePercent"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="Price Change % (Result)"
            />

            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value: string) => (
                <span className="text-gray-300 text-sm">{value}</span>
              )}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Educational Note */}
      <div className="px-6 py-4 border-t border-gray-800 bg-gray-800/50">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Understanding Effort vs Result</h4>
        <div className="space-y-2 text-xs text-gray-400">
          <p>
            <strong className="text-green-400">Confirming:</strong> Volume (effort) and price movement (result) are aligned.
            High volume leads to significant price movement. This confirms the current trend is healthy.
          </p>
          <p>
            <strong className="text-red-400">Diverging:</strong> High volume but little price movement. The market is absorbing
            large amounts of buying/selling without moving price. This suggests smart money accumulation or distribution
            and often precedes trend reversals.
          </p>
          <p className="mt-3 text-orange-400">
            <strong>Orange bars</strong> indicate divergence points where high volume produced minimal price movement.
          </p>
        </div>
      </div>
    </div>
  );
}
