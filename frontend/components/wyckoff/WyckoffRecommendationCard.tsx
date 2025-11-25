'use client';

import { WyckoffAnalysis } from '@/types';

interface WyckoffRecommendationCardProps {
  analysis: WyckoffAnalysis;
  currentPrice: number;
}

export default function WyckoffRecommendationCard({
  analysis,
  currentPrice,
}: WyckoffRecommendationCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return 'bg-emerald-500';
      case 'sell':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRecommendationTextColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return 'text-emerald-400';
      case 'sell':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getScoreStrength = (score: number) => {
    const absScore = Math.abs(score);
    if (absScore >= 0.7) return 'Very Strong';
    if (absScore >= 0.5) return 'Strong';
    if (absScore >= 0.3) return 'Moderate';
    return 'Weak';
  };

  const getCurrentZone = () => {
    if (currentPrice >= analysis.buy_zone.min && currentPrice <= analysis.buy_zone.max) {
      return { name: 'Buy Zone', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' };
    }
    if (currentPrice >= analysis.accumulation_zone.min && currentPrice <= analysis.accumulation_zone.max) {
      return { name: 'Accumulation Zone', color: 'text-green-400', bgColor: 'bg-green-500/10' };
    }
    if (currentPrice >= analysis.distribution_zone.min && currentPrice <= analysis.distribution_zone.max) {
      return { name: 'Distribution Zone', color: 'text-orange-400', bgColor: 'bg-orange-500/10' };
    }
    if (currentPrice >= analysis.sell_zone.min && currentPrice <= analysis.sell_zone.max) {
      return { name: 'Sell Zone', color: 'text-red-400', bgColor: 'bg-red-500/10' };
    }
    return { name: 'Outside Trading Range', color: 'text-gray-400', bgColor: 'bg-gray-500/10' };
  };

  const getSuggestedAction = () => {
    const currentZone = getCurrentZone();

    if (analysis.recommendation === 'buy') {
      if (currentZone.name === 'Buy Zone') {
        return 'Strong accumulation opportunity - Consider aggressive entry';
      }
      if (currentZone.name === 'Accumulation Zone') {
        return 'Good accumulation opportunity - Consider moderate entry';
      }
      return 'Wyckoff signals suggest accumulation, but price is above ideal entry zones';
    }

    if (analysis.recommendation === 'sell') {
      if (currentZone.name === 'Sell Zone') {
        return 'Strong distribution signal - Consider taking profits or exiting';
      }
      if (currentZone.name === 'Distribution Zone') {
        return 'Distribution phase detected - Consider reducing positions';
      }
      return 'Wyckoff signals suggest distribution, monitor for exit opportunities';
    }

    return 'Wait for clearer Wyckoff signals before taking action';
  };

  const currentZone = getCurrentZone();
  const scoreStrength = getScoreStrength(analysis.recommendation_score);

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Wyckoff Recommendation</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Educational Analysis</span>
          <div className="group relative">
            <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xs cursor-help">
              ?
            </div>
            <div className="absolute right-0 top-8 w-80 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-10">
              <p className="text-xs text-gray-300 mb-2">
                This recommendation is based purely on the Wyckoff Method, analyzing smart money behavior through price and volume patterns.
              </p>
              <p className="text-xs text-gray-400">
                Key factors: Market phase, trading range position, recent Wyckoff events, and effort vs result analysis.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Recommendation Badge */}
        <div className="md:col-span-1 flex flex-col items-center justify-center bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className={`w-24 h-24 rounded-full ${getRecommendationColor(analysis.recommendation)} flex items-center justify-center mb-4 shadow-lg`}>
            <span className="text-3xl font-bold text-white uppercase">
              {analysis.recommendation}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">Recommendation Score</p>
            <p className={`text-2xl font-bold ${getRecommendationTextColor(analysis.recommendation)}`}>
              {(analysis.recommendation_score * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">{scoreStrength}</p>
          </div>
        </div>

        {/* Trading Zones */}
        <div className="md:col-span-2 space-y-3">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-400">Buy Zone (Aggressive)</span>
              <span className="text-sm text-emerald-300">
                {formatPrice(analysis.buy_zone.min)} - {formatPrice(analysis.buy_zone.max)}
              </span>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-400">Accumulation Zone (Moderate)</span>
              <span className="text-sm text-green-300">
                {formatPrice(analysis.accumulation_zone.min)} - {formatPrice(analysis.accumulation_zone.max)}
              </span>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-400">Distribution Zone (Take Profit)</span>
              <span className="text-sm text-orange-300">
                {formatPrice(analysis.distribution_zone.min)} - {formatPrice(analysis.distribution_zone.max)}
              </span>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-400">Sell Zone (Exit/Short)</span>
              <span className="text-sm text-red-300">
                {formatPrice(analysis.sell_zone.min)} - {formatPrice(analysis.sell_zone.max)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Position & Action */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`rounded-lg p-4 ${currentZone.bgColor} border border-gray-700`}>
            <p className="text-sm text-gray-400 mb-1">Current Price Position</p>
            <p className={`text-lg font-bold ${currentZone.color}`}>
              {currentZone.name}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Price: {formatPrice(currentPrice)} VND
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-2">Suggested Action</p>
            <p className="text-sm text-gray-300">
              {getSuggestedAction()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
