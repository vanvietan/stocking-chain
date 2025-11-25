'use client';

import { AnalysisReport as ReportType } from '@/types';

interface AnalysisReportProps {
  report: ReportType;
}

export default function AnalysisReport({ report }: AnalysisReportProps) {
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'sell':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'uptrend':
        return 'text-green-600';
      case 'downtrend':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'bullish':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'bearish':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{report.symbol}</h2>
            <p className="text-gray-500 dark:text-gray-400">Current Price: {formatPrice(report.current_price)} VND</p>
          </div>
          <div className={`px-6 py-3 rounded-lg border-2 ${getRecommendationColor(report.recommendation)}`}>
            <p className="text-sm font-medium">Recommendation</p>
            <p className="text-2xl font-bold uppercase">{report.recommendation}</p>
            <p className="text-sm">Score: {(report.recommendation_score * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3">Buy Range</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Strong buy zone</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-2">
              {formatPrice(report.buy_range.min)} - {formatPrice(report.buy_range.max)}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">Half Buy Range</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Moderate buy zone</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-2">
              {formatPrice(report.half_buy_range.min)} - {formatPrice(report.half_buy_range.max)}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3">Sell Range</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Take profit zone</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400 mt-2">
              {formatPrice(report.sell_range.min)} - {formatPrice(report.sell_range.max)}
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Trend Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Trend Direction</p>
              <p className={`text-lg font-bold uppercase ${getTrendColor(report.trend.trend)}`}>
                {report.trend.trend}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Trend Strength</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {(report.trend.strength * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Technical Indicators</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">RSI (14)</span>
              <span className={`font-bold ${report.indicators.rsi < 30 ? 'text-green-600' : report.indicators.rsi > 70 ? 'text-red-600' : 'text-gray-800 dark:text-white'}`}>
                {report.indicators.rsi.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">MACD</span>
              <span className="font-bold text-gray-800 dark:text-white">{report.indicators.macd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">SMA 20</span>
              <span className="font-bold text-gray-800 dark:text-white">{formatPrice(report.indicators.sma_20)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">SMA 50</span>
              <span className="font-bold text-gray-800 dark:text-white">{formatPrice(report.indicators.sma_50)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">SMA 200</span>
              <span className="font-bold text-gray-800 dark:text-white">{formatPrice(report.indicators.sma_200)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Candlestick Patterns</h3>
          {report.patterns.length > 0 ? (
            <div className="space-y-3">
              {report.patterns.map((pattern, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getPatternColor(pattern.type)}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{pattern.name}</span>
                    <span className="text-sm">
                      {(pattern.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <p className="text-xs mt-1 capitalize">{pattern.type} signal</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No significant patterns detected</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Support & Resistance Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-green-700 dark:text-green-400 mb-3">Support Levels</h4>
            {report.support_resistance.support_levels.length > 0 ? (
              <div className="space-y-2">
                {report.support_resistance.support_levels.map((level, index) => (
                  <div key={index} className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                    <p className="font-semibold text-green-800 dark:text-green-300">
                      Level {index + 1}: {formatPrice(level)} VND
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No support levels identified</p>
            )}
          </div>
          <div>
            <h4 className="text-lg font-medium text-red-700 dark:text-red-400 mb-3">Resistance Levels</h4>
            {report.support_resistance.resistance_levels.length > 0 ? (
              <div className="space-y-2">
                {report.support_resistance.resistance_levels.map((level, index) => (
                  <div key={index} className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                    <p className="font-semibold text-red-800 dark:text-red-300">
                      Level {index + 1}: {formatPrice(level)} VND
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No resistance levels identified</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
