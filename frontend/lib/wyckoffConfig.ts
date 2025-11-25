// Wyckoff Analysis Configuration

export const PHASE_COLORS = {
  accumulation: {
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700',
    badge: 'bg-green-500',
    chart: '#22c55e',
  },
  distribution: {
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
    badge: 'bg-red-500',
    chart: '#ef4444',
  },
  markup: {
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700',
    badge: 'bg-blue-500',
    chart: '#3b82f6',
  },
  markdown: {
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    badge: 'bg-orange-500',
    chart: '#f97316',
  },
  unknown: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-800 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-700',
    badge: 'bg-gray-500',
    chart: '#6b7280',
  },
  insufficient_data: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-800 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-700',
    badge: 'bg-gray-500',
    chart: '#6b7280',
  },
};

export const EVENT_COLORS: Record<string, string> = {
  accumulation: '#22c55e',
  distribution: '#ef4444',
};

export const EVENT_ICONS: Record<string, string> = {
  'Spring': '🔄',
  'Upthrust': '⬆️',
  'Selling Climax': '📉',
  'Buying Climax': '📈',
  'Sign of Strength': '💪',
  'Sign of Weakness': '😰',
};

export const EVENT_DESCRIPTIONS: Record<string, string> = {
  'Spring': 'A false breakdown below the trading range support. This tests remaining supply and often leads to an upward move as weak hands are shaken out.',
  'Upthrust': 'A false breakout above the trading range resistance. This tests demand and often leads to a downward move as weak buyers are trapped.',
  'Selling Climax': 'Panic selling with exceptionally high volume and wide price spread downward. Often marks a bottom as all weak holders are flushed out.',
  'Buying Climax': 'Euphoric buying with exceptionally high volume and wide price spread upward. Often marks a top as the public rushes in at the worst time.',
  'Sign of Strength': 'Price rises strongly on good volume, breaking above resistance. Confirms accumulation phase is ending and markup is beginning.',
  'Sign of Weakness': 'Price falls strongly on good volume, breaking below support. Confirms distribution phase is ending and markdown is beginning.',
};

export const PHASE_DESCRIPTIONS: Record<string, string> = {
  accumulation: 'Smart money (institutions, insiders) is quietly accumulating shares from weak hands. Price consolidates in a range after a downtrend. Look for Springs (false breakdowns) and Signs of Strength as signals the phase is ending and markup will begin.',
  markup: 'Price is advancing strongly as demand exceeds supply. The trend is up with healthy volume support. This is typically where the public becomes interested and starts buying. Smart money may be taking partial profits.',
  distribution: 'Smart money is distributing shares to the public who are now bullish after the markup. Price consolidates in a range after an uptrend. Look for Upthrusts (false breakouts) and Signs of Weakness as warnings that markdown is coming.',
  markdown: 'Price is declining as supply exceeds demand. The trend is down. Sellers are in control and weak holders panic. This phase ends when selling is exhausted and accumulation begins again.',
  unknown: 'The current market structure does not clearly fit any Wyckoff phase. This could be a transition period or the data may not yet reveal a clear pattern. More time or data may be needed for clarity.',
  insufficient_data: 'Not enough historical data is available to perform a comprehensive Wyckoff analysis. At least 30 trading days of price and volume data are required to identify phases and events.',
};

export const PHASE_TITLES: Record<string, string> = {
  accumulation: 'Accumulation Phase',
  markup: 'Markup Phase',
  distribution: 'Distribution Phase',
  markdown: 'Markdown Phase',
  unknown: 'Unknown Phase',
  insufficient_data: 'Insufficient Data',
};

export const EFFORT_RESULT_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  confirming: {
    title: 'Effort and Result are Confirming',
    description: 'Volume (effort) and price movement (result) are aligned. When volume increases, price moves accordingly. This confirms the current trend is healthy and likely to continue.',
  },
  diverging: {
    title: 'Effort and Result are Diverging',
    description: 'Volume (effort) and price movement (result) are misaligned. High volume but little price movement suggests potential trend reversal. The market is absorbing large amounts of buying/selling without moving price, indicating smart money distribution or accumulation.',
  },
  unknown: {
    title: 'Effort vs Result is Unknown',
    description: 'Insufficient recent data to determine the relationship between volume and price movement. More trading activity is needed for analysis.',
  },
};
