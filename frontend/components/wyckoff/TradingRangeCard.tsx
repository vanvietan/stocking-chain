import { PriceRange } from '@/types';
import EducationalTooltip from './EducationalTooltip';

interface TradingRangeCardProps {
  tradingRange: PriceRange;
  currentPrice: number;
}

export default function TradingRangeCard({ tradingRange, currentPrice }: TradingRangeCardProps) {
  const rangeSize = tradingRange.max - tradingRange.min;
  const rangeMidpoint = tradingRange.min + (rangeSize / 2);

  // Calculate current price position within range (0-100%)
  const pricePosition = ((currentPrice - tradingRange.min) / rangeSize) * 100;
  const clampedPosition = Math.max(0, Math.min(100, pricePosition));

  // Determine if price is in range
  const isInRange = currentPrice >= tradingRange.min && currentPrice <= tradingRange.max;

  // Calculate distances
  const distanceToHigh = tradingRange.max - currentPrice;
  const distanceToLow = currentPrice - tradingRange.min;
  const distanceToMidpoint = currentPrice - rangeMidpoint;

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);
  const formatPercent = (value: number) => value.toFixed(2) + '%';

  // Determine color based on position
  const getPositionColor = () => {
    if (!isInRange) return 'text-red-400';
    if (pricePosition < 30) return 'text-green-400';  // Lower third - accumulation zone
    if (pricePosition > 70) return 'text-red-400';    // Upper third - distribution zone
    return 'text-blue-400';  // Middle zone
  };

  const getPositionLabel = () => {
    if (!isInRange) {
      if (currentPrice < tradingRange.min) return 'Below Range';
      return 'Above Range';
    }
    if (pricePosition < 30) return 'Lower Zone (Accumulation)';
    if (pricePosition > 70) return 'Upper Zone (Distribution)';
    return 'Middle Zone';
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-white">Trading Range Analysis</h3>
          <EducationalTooltip
            title="Trading Range"
            content="The consolidation zone where accumulation or distribution occurs. Price oscillates between support (min) and resistance (max) levels. Position within the range provides clues about market phase."
          />
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Visual Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Price Position in Range</span>
            <span className={`text-sm font-bold ${getPositionColor()}`}>
              {getPositionLabel()}
            </span>
          </div>

          {/* Range visualization */}
          <div className="relative">
            {/* Background bar */}
            <div className="w-full h-12 bg-gray-800 rounded-lg overflow-hidden relative">
              {/* Gradient fill showing zones */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-red-500/20" />

              {/* Position marker */}
              {isInRange && (
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all duration-500"
                  style={{ left: `${clampedPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full" />
                </div>
              )}

              {/* Labels */}
              <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
                <span className="text-green-400">Support</span>
                <span className="text-blue-400">Mid</span>
                <span className="text-red-400">Resistance</span>
              </div>
            </div>

            {/* Range labels */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{formatPrice(tradingRange.min)}</span>
              <span>{formatPrice(rangeMidpoint)}</span>
              <span>{formatPrice(tradingRange.max)}</span>
            </div>
          </div>
        </div>

        {/* Current Price Card */}
        <div className={`p-4 rounded-lg border ${
          isInRange
            ? 'bg-blue-900/20 border-blue-800'
            : 'bg-red-900/20 border-red-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Current Price</span>
            {!isInRange && (
              <span className="text-xs text-red-400 font-medium">
                {currentPrice < tradingRange.min ? '⬇️ Below Range' : '⬆️ Above Range'}
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-white">
            {formatPrice(currentPrice)}
          </div>
          {isInRange && (
            <div className="text-sm text-gray-400 mt-1">
              {formatPercent(pricePosition)} through range
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Distance to High */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-gray-400">To Resistance</span>
              <EducationalTooltip
                title="Distance to Resistance"
                content="How far the current price is from the trading range high (resistance level). Smaller distance suggests potential selling pressure or distribution."
              />
            </div>
            <div className={`text-lg font-bold ${
              distanceToHigh > 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              {distanceToHigh > 0 ? '+' : ''}{formatPrice(distanceToHigh)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatPercent((distanceToHigh / currentPrice) * 100)} from current
            </div>
          </div>

          {/* Distance to Midpoint */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-gray-400">To Midpoint</span>
              <EducationalTooltip
                title="Distance to Midpoint"
                content="Distance from the center of the trading range. Positive means above center, negative means below. Helps identify whether price is in accumulation or distribution territory."
              />
            </div>
            <div className={`text-lg font-bold ${
              distanceToMidpoint > 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              {distanceToMidpoint > 0 ? '+' : ''}{formatPrice(distanceToMidpoint)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {distanceToMidpoint > 0 ? 'Above' : 'Below'} center
            </div>
          </div>

          {/* Distance to Low */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-gray-400">To Support</span>
              <EducationalTooltip
                title="Distance to Support"
                content="How far the current price is from the trading range low (support level). Smaller distance suggests potential buying opportunity or accumulation."
              />
            </div>
            <div className={`text-lg font-bold ${
              distanceToLow > 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {distanceToLow > 0 ? '+' : ''}{formatPrice(distanceToLow)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatPercent((distanceToLow / currentPrice) * 100)} from current
            </div>
          </div>
        </div>

        {/* Range Statistics */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Range Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Range Size:</span>
              <span className="text-white font-medium ml-2">{formatPrice(rangeSize)}</span>
            </div>
            <div>
              <span className="text-gray-400">Range %:</span>
              <span className="text-white font-medium ml-2">
                {formatPercent((rangeSize / tradingRange.min) * 100)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Support:</span>
              <span className="text-green-400 font-medium ml-2">{formatPrice(tradingRange.min)}</span>
            </div>
            <div>
              <span className="text-gray-400">Resistance:</span>
              <span className="text-red-400 font-medium ml-2">{formatPrice(tradingRange.max)}</span>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="p-4 bg-blue-900/10 border border-blue-800/50 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">Interpretation</h4>
          <p className="text-xs text-gray-300 leading-relaxed">
            {isInRange ? (
              pricePosition < 30 ? (
                <>Price is in the <strong>lower third</strong> of the trading range, suggesting potential <strong className="text-green-400">accumulation</strong> activity. Smart money may be building positions.</>
              ) : pricePosition > 70 ? (
                <>Price is in the <strong>upper third</strong> of the trading range, suggesting potential <strong className="text-red-400">distribution</strong> activity. Smart money may be selling into strength.</>
              ) : (
                <>Price is in the <strong>middle</strong> of the trading range. Watch for movement toward support (accumulation) or resistance (distribution) for clearer signals.</>
              )
            ) : currentPrice < tradingRange.min ? (
              <>Price has broken <strong className="text-red-400">below</strong> the trading range support. This could indicate a genuine breakdown or a Spring (false breakdown) if followed by a reversal.</>
            ) : (
              <>Price has broken <strong className="text-green-400">above</strong> the trading range resistance. This could indicate a genuine breakout or an Upthrust (false breakout) if followed by a reversal.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
