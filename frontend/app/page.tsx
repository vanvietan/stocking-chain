'use client';

import { useState } from 'react';
import axios from 'axios';
import Navigation from '@/components/Navigation';
import StockInput from '@/components/StockInput';
import AnalysisReport from '@/components/AnalysisReport';
import { AnalysisReport as AnalysisReportType, MarketType } from '@/types';

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

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReportType | null>(null);

  const handleAnalyze = async (symbol: string, marketType: MarketType) => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await axios.post(`${API_URL}/api/analyze`, {
        symbol: symbol.toUpperCase(),
        market_type: marketType,
        days_back: 365,
      });

      setReport(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation currentSymbol={report?.symbol} activePage="overview" />

      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Market Analyzer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Advanced technical analysis for Vietnamese stocks and cryptocurrencies
          </p>
        </header>

        <StockInput onAnalyze={handleAnalyze} loading={loading} />

        {error && (
          <div className="max-w-4xl mx-auto mt-8 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="max-w-4xl mx-auto mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Analyzing stock data...</p>
          </div>
        )}

        {report && !loading && <AnalysisReport report={report} />}
      </div>
    </div>
  );
}
