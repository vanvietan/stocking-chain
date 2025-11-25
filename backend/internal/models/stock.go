package models

import "time"

type StockData struct {
	Symbol   string    `json:"symbol"`
	Date     time.Time `json:"date"`
	Open     float64   `json:"open"`
	High     float64   `json:"high"`
	Low      float64   `json:"low"`
	Close    float64   `json:"close"`
	Volume   int64     `json:"volume"`
	AdjClose float64   `json:"adj_close"`
}

type TechnicalIndicators struct {
	RSI            float64 `json:"rsi"`
	MACD           float64 `json:"macd"`
	MACDSignal     float64 `json:"macd_signal"`
	MACDHistogram  float64 `json:"macd_histogram"`
	SMA20          float64 `json:"sma_20"`
	SMA50          float64 `json:"sma_50"`
	SMA200         float64 `json:"sma_200"`
	EMA12          float64 `json:"ema_12"`
	EMA26          float64 `json:"ema_26"`
	BollingerUpper float64 `json:"bollinger_upper"`
	BollingerMid   float64 `json:"bollinger_mid"`
	BollingerLower float64 `json:"bollinger_lower"`
}

type CandlestickPattern struct {
	Name       string  `json:"name"`
	Type       string  `json:"type"` // "bullish", "bearish", "neutral"
	Confidence float64 `json:"confidence"`
}

type TimeframePatterns struct {
	Daily   []CandlestickPattern `json:"daily"`
	Weekly  []CandlestickPattern `json:"weekly"`
	Monthly []CandlestickPattern `json:"monthly"`
}

type SupportResistance struct {
	SupportLevels    []float64 `json:"support_levels"`
	ResistanceLevels []float64 `json:"resistance_levels"`
}

type TrendAnalysis struct {
	Trend     string  `json:"trend"` // "uptrend", "downtrend", "sideways"
	Strength  float64 `json:"strength"`
	TrendLine float64 `json:"trend_line"`
}

type AnalysisReport struct {
	Symbol              string              `json:"symbol"`
	CompanyName         string              `json:"company_name"`
	Date                time.Time           `json:"date"`
	CurrentPrice        float64             `json:"current_price"`
	Indicators          TechnicalIndicators `json:"indicators"`
	Patterns            TimeframePatterns   `json:"patterns"`
	SupportResistance   SupportResistance   `json:"support_resistance"`
	Trend               TrendAnalysis       `json:"trend"`
	Wyckoff             WyckoffAnalysis     `json:"wyckoff"`
	BuyRange            PriceRange          `json:"buy_range"`
	HalfBuyRange        PriceRange          `json:"half_buy_range"`
	SellRange           PriceRange          `json:"sell_range"`
	Recommendation      string              `json:"recommendation"` // "buy", "sell", "hold"
	RecommendationScore float64             `json:"recommendation_score"`
	PriceHistory        []StockData         `json:"price_history"`
}

type PriceRange struct {
	Min float64 `json:"min"`
	Max float64 `json:"max"`
}

// WyckoffEvent represents a key Wyckoff structural event
type WyckoffEvent struct {
	Name       string    `json:"name"`       // "Spring", "Upthrust", "Selling Climax", etc.
	Type       string    `json:"type"`       // "accumulation", "distribution"
	Date       time.Time `json:"date"`
	Price      float64   `json:"price"`
	Volume     int64     `json:"volume"`
	Confidence float64   `json:"confidence"`
}

// WyckoffAnalysis contains the complete Wyckoff method analysis
type WyckoffAnalysis struct {
	Phase           string         `json:"phase"`            // "accumulation", "distribution", "markup", "markdown"
	PhaseConfidence float64        `json:"phase_confidence"`
	Events          []WyckoffEvent `json:"events"`
	TradingRange    PriceRange     `json:"trading_range"`
	EffortResult    string         `json:"effort_result"` // "confirming", "diverging"

	// Wyckoff-specific recommendation and trading zones
	Recommendation      string     `json:"recommendation"`       // "buy", "sell", "hold"
	RecommendationScore float64    `json:"recommendation_score"` // -1 to 1
	BuyZone             PriceRange `json:"buy_zone"`             // Aggressive entry zone (bottom 15% of range)
	AccumulationZone    PriceRange `json:"accumulation_zone"`    // Moderate entry zone (15-35% of range)
	DistributionZone    PriceRange `json:"distribution_zone"`    // Take profit zone (65-85% of range)
	SellZone            PriceRange `json:"sell_zone"`            // Exit/short zone (top 15% of range)
}
