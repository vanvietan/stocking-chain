'use client';

import { useState } from 'react';
import axios from 'axios';
import StockInput from '@/components/StockInput';
import AnalysisReport from '@/components/AnalysisReport';
import { AnalysisReport as AnalysisReportType } from '@/types';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AnalysisReportType | null>(null);

  const handleAnalyze = async (symbol: string) => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await axios.post('http://localhost:8080/api/analyze', {
        symbol: symbol.toUpperCase(),
        days_back: 365,
      });

      setReport(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to analyze stock. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Vietnamese Stock Market Analyzer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Advanced technical analysis with AI-powered recommendations
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
