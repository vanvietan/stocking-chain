'use client';

import { useState } from 'react';
import { MarketType, MARKET_CONFIG } from '../types';

interface StockInputProps {
  onAnalyze: (symbol: string, marketType: MarketType) => void;
  loading: boolean;
}

export default function StockInput({ onAnalyze, loading }: StockInputProps) {
  const [symbol, setSymbol] = useState('');
  const [marketType, setMarketType] = useState<MarketType>('vietnamese');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onAnalyze(symbol.trim(), marketType);
    }
  };

  const config = MARKET_CONFIG[marketType];

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
      {/* Market Type Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => {
            setMarketType('vietnamese');
            setSymbol('');
          }}
          disabled={loading}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
            marketType === 'vietnamese'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Vietnamese Stocks
        </button>
        <button
          type="button"
          onClick={() => {
            setMarketType('crypto');
            setSymbol('');
          }}
          disabled={loading}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
            marketType === 'crypto'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Cryptocurrencies
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="symbol" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter Stock Symbol
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder={config.placeholder}
              className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !symbol.trim()}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Analyze
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Popular {marketType === 'crypto' ? 'cryptocurrencies' : 'stocks'}:
          </p>
          <div className="flex flex-wrap gap-2">
            {config.popularSymbols.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => setSymbol(sym)}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
