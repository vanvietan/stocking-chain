export interface StockData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adj_close: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  macd_signal: number;
  macd_histogram: number;
  sma_20: number;
  sma_50: number;
  sma_200: number;
  ema_12: number;
  ema_26: number;
  bollinger_upper: number;
  bollinger_mid: number;
  bollinger_lower: number;
}

export interface CandlestickPattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

export interface SupportResistance {
  support_levels: number[];
  resistance_levels: number[];
}

export interface TrendAnalysis {
  trend: 'uptrend' | 'downtrend' | 'sideways';
  strength: number;
  trend_line: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface AnalysisReport {
  symbol: string;
  company_name: string;
  date: string;
  current_price: number;
  indicators: TechnicalIndicators;
  patterns: CandlestickPattern[];
  support_resistance: SupportResistance;
  trend: TrendAnalysis;
  buy_range: PriceRange;
  half_buy_range: PriceRange;
  sell_range: PriceRange;
  recommendation: 'buy' | 'sell' | 'hold';
  recommendation_score: number;
  price_history: StockData[];
}
