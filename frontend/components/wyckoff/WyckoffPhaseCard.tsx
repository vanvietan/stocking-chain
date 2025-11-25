import { WyckoffAnalysis } from '@/types';
import {
  PHASE_COLORS,
  PHASE_TITLES,
  PHASE_DESCRIPTIONS,
  EFFORT_RESULT_DESCRIPTIONS
} from '@/lib/wyckoffConfig';
import EducationalTooltip from './EducationalTooltip';

interface WyckoffPhaseCardProps {
  analysis: WyckoffAnalysis;
  currentPrice: number;
}

export default function WyckoffPhaseCard({ analysis, currentPrice }: WyckoffPhaseCardProps) {
  const phaseColors = PHASE_COLORS[analysis.phase] || PHASE_COLORS.unknown;
  const phaseTitle = PHASE_TITLES[analysis.phase] || 'Unknown Phase';
  const phaseDescription = PHASE_DESCRIPTIONS[analysis.phase] || 'Unable to determine phase.';
  const effortResultInfo = EFFORT_RESULT_DESCRIPTIONS[analysis.effort_result] || EFFORT_RESULT_DESCRIPTIONS.unknown;

  const confidencePercentage = Math.round(analysis.phase_confidence * 100);
  const rangeSize = analysis.trading_range.max - analysis.trading_range.min;
  const rangePercentage = ((rangeSize / analysis.trading_range.min) * 100).toFixed(2);

  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 border-b ${phaseColors.border} ${phaseColors.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{phaseTitle}</h2>
            <EducationalTooltip
              title={phaseTitle}
              content={phaseDescription}
            />
          </div>
          <div className={`px-4 py-2 rounded-full ${phaseColors.badge} text-white font-semibold text-sm`}>
            {analysis.phase.charAt(0).toUpperCase() + analysis.phase.slice(1)}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Phase Confidence */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300">Phase Confidence</span>
              <EducationalTooltip
                title="Phase Confidence"
                content="Indicates how strongly the current market structure fits the identified Wyckoff phase. Higher confidence means clearer signals and more reliable phase identification."
              />
            </div>
            <span className={`text-sm font-bold ${phaseColors.text}`}>
              {confidencePercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${phaseColors.badge} transition-all duration-500 ease-out rounded-full`}
              style={{ width: `${confidencePercentage}%` }}
            />
          </div>
        </div>

        {/* Phase Description */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-300 leading-relaxed">{phaseDescription}</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Events Count */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400">Events Detected</span>
              <EducationalTooltip
                title="Wyckoff Events"
                content="Number of significant Wyckoff events identified (Springs, Upthrusts, Climaxes, Signs of Strength/Weakness). More events provide more confidence in phase identification."
              />
            </div>
            <div className="text-2xl font-bold text-white">{analysis.events.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              {analysis.events.filter(e => e.type === 'accumulation').length} bullish •{' '}
              {analysis.events.filter(e => e.type === 'distribution').length} bearish
            </div>
          </div>

          {/* Trading Range */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400">Trading Range</span>
              <EducationalTooltip
                title="Trading Range"
                content="The consolidation zone boundaries where accumulation or distribution is occurring. Price oscillates between support (min) and resistance (max)."
              />
            </div>
            <div className="text-2xl font-bold text-white">{rangePercentage}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Intl.NumberFormat('vi-VN').format(analysis.trading_range.min)} -{' '}
              {new Intl.NumberFormat('vi-VN').format(analysis.trading_range.max)}
            </div>
          </div>

          {/* Effort vs Result */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-400">Effort vs Result</span>
              <EducationalTooltip
                title={effortResultInfo.title}
                content={effortResultInfo.description}
              />
            </div>
            <div className={`text-lg font-bold ${
              analysis.effort_result === 'confirming' ? 'text-green-400' :
              analysis.effort_result === 'diverging' ? 'text-red-400' :
              'text-gray-400'
            }`}>
              {analysis.effort_result.charAt(0).toUpperCase() + analysis.effort_result.slice(1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {analysis.effort_result === 'confirming' && 'Trend healthy'}
              {analysis.effort_result === 'diverging' && 'Potential reversal'}
              {analysis.effort_result === 'unknown' && 'Need more data'}
            </div>
          </div>
        </div>

        {/* Current Price Position (if in range) */}
        {currentPrice >= analysis.trading_range.min && currentPrice <= analysis.trading_range.max && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-400">Current Price Position</span>
              <EducationalTooltip
                title="Price Position in Range"
                content="Shows where the current price sits within the trading range. Price near the bottom suggests potential accumulation zone, near the top suggests distribution zone."
              />
            </div>
            <div className="text-lg font-bold text-white">
              {new Intl.NumberFormat('vi-VN').format(currentPrice)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Within trading range ({analysis.trading_range.min.toFixed(0)} - {analysis.trading_range.max.toFixed(0)})
            </div>
          </div>
        )}

        {/* Price outside range warning */}
        {(currentPrice < analysis.trading_range.min || currentPrice > analysis.trading_range.max) && (
          <div className={`mt-6 p-4 rounded-lg border ${
            currentPrice < analysis.trading_range.min
              ? 'bg-red-900/20 border-red-800'
              : 'bg-green-900/20 border-green-800'
          }`}>
            <div className={`text-sm font-medium ${
              currentPrice < analysis.trading_range.min ? 'text-red-400' : 'text-green-400'
            }`}>
              {currentPrice < analysis.trading_range.min
                ? '⚠️ Price Below Trading Range'
                : '🚀 Price Above Trading Range'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Current: {new Intl.NumberFormat('vi-VN').format(currentPrice)} |
              Range: {analysis.trading_range.min.toFixed(0)} - {analysis.trading_range.max.toFixed(0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
