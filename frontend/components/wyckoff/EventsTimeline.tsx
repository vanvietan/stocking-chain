import { WyckoffEvent } from '@/types';
import { EVENT_ICONS, EVENT_DESCRIPTIONS, EVENT_COLORS } from '@/lib/wyckoffConfig';
import EducationalTooltip from './EducationalTooltip';

interface EventsTimelineProps {
  events: WyckoffEvent[];
}

export default function EventsTimeline({ events }: EventsTimelineProps) {
  // Sort events chronologically (most recent first)
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return (vol / 1000000).toFixed(2) + 'M';
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K';
    return vol.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (events.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-gray-400 mb-2">No Wyckoff Events Detected</h3>
        <p className="text-gray-500">
          No significant structural events have been identified in the recent price action.
          This could indicate the stock is in a quiet consolidation phase or trending smoothly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">Wyckoff Events Timeline</h3>
            <EducationalTooltip
              title="Wyckoff Events"
              content="Significant structural events that provide clues about smart money activity. Springs and Signs of Strength indicate accumulation. Upthrusts and Signs of Weakness indicate distribution."
            />
          </div>
          <div className="text-sm text-gray-400">
            {events.length} event{events.length !== 1 ? 's' : ''} detected
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEvents.map((event, index) => {
            const icon = EVENT_ICONS[event.name] || '📍';
            const description = EVENT_DESCRIPTIONS[event.name] || 'Wyckoff event detected';
            const color = EVENT_COLORS[event.type] || '#6b7280';
            const confidencePercent = Math.round(event.confidence * 100);

            return (
              <div
                key={index}
                className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
              >
                {/* Event Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{icon}</span>
                    <div>
                      <h4
                        className="font-semibold text-sm"
                        style={{ color }}
                      >
                        {event.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {event.type === 'accumulation' ? 'Bullish Signal' : 'Bearish Signal'}
                      </p>
                    </div>
                  </div>
                  <EducationalTooltip
                    title={event.name}
                    content={description}
                  />
                </div>

                {/* Event Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white font-medium">{formatDate(event.date)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-white font-medium">{formatPrice(event.price)}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Volume:</span>
                    <span className="text-blue-400 font-medium">{formatVolume(event.volume)}</span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Confidence</span>
                    <span className="text-xs font-semibold" style={{ color }}>
                      {confidencePercent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${confidencePercent}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                </div>

                {/* Event Description */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Event Types</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Accumulation Events */}
            <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-green-400 mb-2">Accumulation Events (Bullish)</h5>
              <ul className="space-y-1 text-xs text-gray-400">
                <li><strong className="text-green-400">{EVENT_ICONS['Spring']} Spring:</strong> False breakdown, bullish reversal signal</li>
                <li><strong className="text-green-400">{EVENT_ICONS['Sign of Strength']} Sign of Strength:</strong> Strong move up, confirms accumulation ending</li>
                <li><strong className="text-green-400">{EVENT_ICONS['Selling Climax']} Selling Climax:</strong> Panic selling exhaustion, potential bottom</li>
              </ul>
            </div>

            {/* Distribution Events */}
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-red-400 mb-2">Distribution Events (Bearish)</h5>
              <ul className="space-y-1 text-xs text-gray-400">
                <li><strong className="text-red-400">{EVENT_ICONS['Upthrust']} Upthrust:</strong> False breakout, bearish reversal signal</li>
                <li><strong className="text-red-400">{EVENT_ICONS['Sign of Weakness']} Sign of Weakness:</strong> Strong move down, confirms distribution ending</li>
                <li><strong className="text-red-400">{EVENT_ICONS['Buying Climax']} Buying Climax:</strong> Euphoric buying exhaustion, potential top</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
