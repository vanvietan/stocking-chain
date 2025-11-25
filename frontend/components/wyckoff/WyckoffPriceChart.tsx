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
  ReferenceArea,
  Area,
  Scatter,
} from 'recharts';
import { StockData, WyckoffEvent, PriceRange, WyckoffAnalysis } from '@/types';
import { EVENT_COLORS, EVENT_ICONS, EVENT_DESCRIPTIONS } from '@/lib/wyckoffConfig';

interface WyckoffPriceChartProps {
  priceHistory: StockData[];
  events: WyckoffEvent[];
  tradingRange: PriceRange;
  buyZone: PriceRange;
  accumulationZone: PriceRange;
  distributionZone: PriceRange;
  sellZone: PriceRange;
  symbol: string;
  companyName?: string;
}

// Custom Event Marker Component
const EventMarker = (props: any) => {
  const { cx, cy, payload } = props;

  if (!payload || !payload.eventType) return null;

  const color = EVENT_COLORS[payload.eventType] || '#6b7280';

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={color}
        stroke="white"
        strokeWidth={2}
        opacity={0.9}
      />
    </g>
  );
};

// Custom tooltip showing event details
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
    <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl max-w-sm">
      <p className="text-gray-400 text-sm mb-2">{data.formattedDate}</p>

      {/* Price data */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-2">
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

      {/* Event information if this data point has an event */}
      {data.eventName && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{EVENT_ICONS[data.eventName] || '📍'}</span>
            <span className={`text-sm font-semibold ${
              data.eventType === 'accumulation' ? 'text-green-400' : 'text-red-400'
            }`}>
              {data.eventName}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {EVENT_DESCRIPTIONS[data.eventName] || 'Wyckoff event detected'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Confidence: {Math.round(data.eventConfidence * 100)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default function WyckoffPriceChart({
  priceHistory,
  events,
  tradingRange,
  buyZone,
  accumulationZone,
  distributionZone,
  sellZone,
  symbol,
  companyName
}: WyckoffPriceChartProps) {
  const [showEvents, setShowEvents] = useState(true);
  const [showRange, setShowRange] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showZones, setShowZones] = useState(true);

  // Prepare chart data with events mapped
  const chartData = useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return [];

    // Create a map of dates to events for quick lookup
    const eventMap = new Map<string, WyckoffEvent>();
    events.forEach(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      eventMap.set(eventDate, event);
    });

    return priceHistory.map((item) => {
      const itemDate = new Date(item.date).toISOString().split('T')[0];
      const event = eventMap.get(itemDate);

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
        // Event data if exists
        eventName: event?.name,
        eventType: event?.type,
        eventConfidence: event?.confidence,
        // For event markers on scatter plot
        eventMarker: event ? item.high : null,
      };
    });
  }, [priceHistory, events]);

  // Filter to last 90 days for better visualization
  const recentData = useMemo(() => {
    const days = 90;
    return chartData.slice(-days);
  }, [chartData]);

  // Calculate price range for Y axis
  const priceRange = useMemo(() => {
    if (recentData.length === 0) return { min: 0, max: 100 };

    const prices = recentData.flatMap(d => [d.high, d.low]);
    // Include zones in the min/max calculation
    const zoneValues = [
      tradingRange.min,
      tradingRange.max,
      buyZone?.min,
      buyZone?.max,
      sellZone?.min,
      sellZone?.max,
    ].filter((v): v is number => v !== undefined && v !== null && !isNaN(v));
    
    const min = Math.min(...prices, ...zoneValues);
    const max = Math.max(...prices, ...zoneValues);
    const padding = (max - min) * 0.1;

    return {
      min: Math.floor(min - padding),
      max: Math.ceil(max + padding)
    };
  }, [recentData, tradingRange, buyZone, sellZone]);

  // Calculate volume range
  const volumeMax = useMemo(() => {
    if (recentData.length === 0) return 1000000;
    return Math.max(...recentData.map(d => d.volume)) * 1.2;
  }, [recentData]);

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
      <div className="bg-gray-900 rounded-xl p-8 text-center border border-gray-800">
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
            {symbol} Price Chart with Wyckoff Events
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Last {recentData.length} trading days
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowEvents(!showEvents)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              showEvents
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                : 'border-gray-700 text-gray-500 hover:text-gray-300'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setShowRange(!showRange)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              showRange
                ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                : 'border-gray-700 text-gray-500 hover:text-gray-300'
            }`}
          >
            Trading Range
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
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              showZones
                ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                : 'border-gray-700 text-gray-500 hover:text-gray-300'
            }`}
          >
            Zones
          </button>
        </div>
      </div>

      {/* Price Chart */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={recentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />

            {/* Trading Zones - rendered first so they're behind the price line */}
            {showZones && buyZone && (
              <ReferenceArea
                y1={buyZone.min}
                y2={buyZone.max}
                fill="#10b981"
                fillOpacity={0.15}
                stroke="#10b981"
                strokeOpacity={0.3}
                strokeDasharray="3 3"
              />
            )}
            {showZones && accumulationZone && (
              <ReferenceArea
                y1={accumulationZone.min}
                y2={accumulationZone.max}
                fill="#22c55e"
                fillOpacity={0.1}
                stroke="#22c55e"
                strokeOpacity={0.2}
                strokeDasharray="3 3"
              />
            )}
            {showZones && distributionZone && (
              <ReferenceArea
                y1={distributionZone.min}
                y2={distributionZone.max}
                fill="#f97316"
                fillOpacity={0.1}
                stroke="#f97316"
                strokeOpacity={0.2}
                strokeDasharray="3 3"
              />
            )}
            {showZones && sellZone && (
              <ReferenceArea
                y1={sellZone.min}
                y2={sellZone.max}
                fill="#ef4444"
                fillOpacity={0.15}
                stroke="#ef4444"
                strokeOpacity={0.3}
                strokeDasharray="3 3"
              />
            )}

            <XAxis
              dataKey="shortDate"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={{ stroke: '#4b5563' }}
              interval={Math.floor(recentData.length / 10)}
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

            {/* Trading Range Lines */}
            {showRange && (
              <>
                <ReferenceLine
                  y={tradingRange.max}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  strokeOpacity={0.8}
                  label={{
                    value: `Range High: ${formatPrice(tradingRange.max)}`,
                    fill: '#f59e0b',
                    fontSize: 10,
                    position: 'right'
                  }}
                />
                <ReferenceLine
                  y={tradingRange.min}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  strokeOpacity={0.8}
                  label={{
                    value: `Range Low: ${formatPrice(tradingRange.min)}`,
                    fill: '#f59e0b',
                    fontSize: 10,
                    position: 'right'
                  }}
                />
              </>
            )}

            {/* Area under line chart */}
            <Area
              type="monotone"
              dataKey="close"
              stroke="transparent"
              fill="url(#priceGradient)"
            />

            {/* Price Line */}
            <Line
              type="monotone"
              dataKey="close"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="Close Price"
            />

            {/* Event Markers */}
            {showEvents && (
              <Scatter
                dataKey="eventMarker"
                fill="#8884d8"
                shape={<EventMarker />}
                name="Wyckoff Events"
              />
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
            <ComposedChart data={recentData} margin={{ top: 0, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="shortDate"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickLine={{ stroke: '#4b5563' }}
                interval={Math.floor(recentData.length / 10)}
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

      {/* Legend for events */}
      {showEvents && events.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Detected Events:</p>
          <div className="flex flex-wrap gap-3 text-xs">
            {events.map((event, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-base">{EVENT_ICONS[event.name] || '📍'}</span>
                <span className={`font-medium ${
                  event.type === 'accumulation' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {event.name}
                </span>
                <span className="text-gray-500">({Math.round(event.confidence * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend for trading zones */}
      {showZones && (
        <div className="px-6 py-3 border-t border-gray-800">
          <p className="text-sm text-gray-400 mb-2">Trading Zones:</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded bg-emerald-500/30 border border-emerald-500/50"></div>
              <span className="text-emerald-400 font-medium">Buy Zone</span>
              <span className="text-gray-500">({formatPrice(buyZone.min)} - {formatPrice(buyZone.max)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded bg-green-500/20 border border-green-500/40"></div>
              <span className="text-green-400 font-medium">Accumulation</span>
              <span className="text-gray-500">({formatPrice(accumulationZone.min)} - {formatPrice(accumulationZone.max)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded bg-orange-500/20 border border-orange-500/40"></div>
              <span className="text-orange-400 font-medium">Distribution</span>
              <span className="text-gray-500">({formatPrice(distributionZone.min)} - {formatPrice(distributionZone.max)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded bg-red-500/30 border border-red-500/50"></div>
              <span className="text-red-400 font-medium">Sell Zone</span>
              <span className="text-gray-500">({formatPrice(sellZone.min)} - {formatPrice(sellZone.max)})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
