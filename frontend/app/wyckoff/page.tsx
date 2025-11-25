'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navigation from '@/components/Navigation';
import StockInput from '@/components/StockInput';
import WyckoffDashboard from '@/components/wyckoff/WyckoffDashboard';

function WyckoffContent() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <Navigation activePage="wyckoff" />

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                Wyckoff Method Analysis
              </h1>
              <p className="text-gray-400 text-lg">
                Advanced market analysis based on Richard Wyckoff's methodology
              </p>
            </div>

            {/* Stock Input */}
            <div className="mb-12">
              <StockInput
                onAnalyze={(sym) => {
                  window.location.href = `/wyckoff?symbol=${sym}`;
                }}
                loading={false}
              />
            </div>

            {/* Educational Content */}
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">What is the Wyckoff Method?</h2>

              <div className="space-y-6 text-gray-300">
                <p>
                  The Wyckoff Method is a comprehensive technical analysis approach developed by Richard D. Wyckoff
                  in the early 1900s. It focuses on understanding the behavior of smart money (institutions, insiders)
                  through price and volume analysis.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-green-400 mb-3">Accumulation Phase</h3>
                    <p className="text-sm text-gray-400">
                      Smart money quietly buys from weak hands after a downtrend.
                      Look for Springs (false breakdowns) as signals.
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-blue-400 mb-3">Markup Phase</h3>
                    <p className="text-sm text-gray-400">
                      Price rises as demand exceeds supply. Public becomes interested
                      and starts buying.
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-red-400 mb-3">Distribution Phase</h3>
                    <p className="text-sm text-gray-400">
                      Smart money sells to the public after an uptrend.
                      Watch for Upthrusts (false breakouts) as warnings.
                    </p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-orange-400 mb-3">Markdown Phase</h3>
                    <p className="text-sm text-gray-400">
                      Price declines as supply exceeds demand. Weak holders panic sell
                      until exhaustion.
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-blue-900/20 border border-blue-800 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Key Concepts</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
                    <li><strong className="text-gray-300">Effort vs Result:</strong> Compare volume (effort) to price movement (result)</li>
                    <li><strong className="text-gray-300">Trading Range:</strong> Consolidation zones where accumulation/distribution occurs</li>
                    <li><strong className="text-gray-300">Wyckoff Events:</strong> Spring, Upthrust, Climax, Sign of Strength/Weakness</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Suggested Stocks */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm mb-4">Try analyzing these popular Vietnamese stocks:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['VCB', 'BID', 'TCB', 'VHM', 'VIC', 'HPG', 'FPT'].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => {
                      window.location.href = `/wyckoff?symbol=${sym}`;
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Navigation currentSymbol={symbol} activePage="wyckoff" />

      <div className="container mx-auto px-4 py-8">
        <WyckoffDashboard symbol={symbol} />
      </div>
    </div>
  );
}

export default function WyckoffPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <WyckoffContent />
    </Suspense>
  );
}
