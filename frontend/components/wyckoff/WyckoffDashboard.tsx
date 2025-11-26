'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { AnalysisReport } from '@/types';
import WyckoffRecommendationCard from './WyckoffRecommendationCard';
import WyckoffPhaseCard from './WyckoffPhaseCard';
import WyckoffPriceChart from './WyckoffPriceChart';
import EffortResultChart from './EffortResultChart';
import TradingRangeCard from './TradingRangeCard';
import EventsTimeline from './EventsTimeline';

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) return 'http://localhost:8080';
  // Add https:// if no protocol specified (Render's host property doesn't include protocol)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

const API_URL = getApiUrl();

interface WyckoffDashboardProps {
  symbol: string;
}

export default function WyckoffDashboard({ symbol }: WyckoffDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(`${API_URL}/api/analyze`, {
          symbol: symbol.toUpperCase(),
          days_back: 365,
        });

        setAnalysis(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch analysis. Please try again.');
        console.error('Analysis error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [symbol]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-gray-400">Analyzing {symbol}...</p>
          <p className="text-gray-500 text-sm mt-2">Performing Wyckoff Method analysis</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <div className="text-red-400 text-2xl">⚠️</div>
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Analysis Failed</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Insufficient data state
  if (analysis && analysis.wyckoff.phase === 'insufficient_data') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
          <div className="flex items-start gap-4">
            <div className="text-gray-400 text-2xl">ℹ️</div>
            <div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">Insufficient Data</h3>
              <p className="text-gray-400 mb-4">
                Not enough historical data is available to perform a comprehensive Wyckoff analysis for {analysis.symbol}.
                At least 30 trading days of price and volume data are required.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href={`/?symbol=${analysis.symbol}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  View Standard Analysis
                </a>
                <a
                  href="/wyckoff"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Try Another Stock
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render full dashboard
  if (!analysis) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {analysis.symbol}
              {analysis.company_name && analysis.company_name !== analysis.symbol && (
                <span className="text-gray-400 font-normal text-xl ml-3">• {analysis.company_name}</span>
              )}
            </h1>
            <p className="text-gray-400">
              Current Price: <span className="text-white font-semibold">
                {new Intl.NumberFormat('vi-VN').format(analysis.current_price)} VND
              </span>
            </p>
          </div>
          <a
            href={`/?symbol=${analysis.symbol}`}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
          >
            View Standard Analysis
          </a>
        </div>
      </div>

      {/* Wyckoff Recommendation Card - NEW */}
      <WyckoffRecommendationCard
        analysis={analysis.wyckoff}
        currentPrice={analysis.current_price}
      />

      {/* Phase Overview Card */}
      <WyckoffPhaseCard
        analysis={analysis.wyckoff}
        currentPrice={analysis.current_price}
      />

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <WyckoffPriceChart
          priceHistory={analysis.price_history}
          events={analysis.wyckoff.events}
          tradingRange={analysis.wyckoff.trading_range}
          buyZone={analysis.wyckoff.buy_zone}
          accumulationZone={analysis.wyckoff.accumulation_zone}
          distributionZone={analysis.wyckoff.distribution_zone}
          sellZone={analysis.wyckoff.sell_zone}
          symbol={analysis.symbol}
          companyName={analysis.company_name}
        />
        <EffortResultChart
          priceHistory={analysis.price_history}
          effortResult={analysis.wyckoff.effort_result}
        />
      </div>

      {/* Trading Range Visualization */}
      <TradingRangeCard
        tradingRange={analysis.wyckoff.trading_range}
        currentPrice={analysis.current_price}
      />

      {/* Events Timeline */}
      <EventsTimeline events={analysis.wyckoff.events} />
    </div>
  );
}
