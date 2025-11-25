'use client';

import { useState } from 'react';

interface StockInputProps {
  onAnalyze: (symbol: string) => void;
  loading: boolean;
}

export default function StockInput({ onAnalyze, loading }: StockInputProps) {
  const [symbol, setSymbol] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      onAnalyze(symbol.trim());
    }
  };

  const popularSymbols = ['VNM', 'VIC', 'VHM', 'HPG', 'FPT', 'MSN', 'TCB', 'VCB', 'MBB', 'ACB'];

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
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
              placeholder="e.g., VNM, VIC, HPG..."
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
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Popular stocks:</p>
          <div className="flex flex-wrap gap-2">
            {popularSymbols.map((sym) => (
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
