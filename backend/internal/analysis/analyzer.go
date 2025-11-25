package analysis

import (
	"math"
	"stocking-chain/internal/models"
	"time"
)

type Analyzer struct{}

func NewAnalyzer() *Analyzer {
	return &Analyzer{}
}

func (a *Analyzer) Analyze(symbol string, data []models.StockData) (*models.AnalysisReport, error) {
	if len(data) == 0 {
		return nil, nil
	}

	currentData := data[len(data)-1]
	currentPrice := currentData.Close

	indicators := CalculateTechnicalIndicators(data)
	patterns := DetectAllTimeframePatterns(data)
	supportResistance := DetectSupportResistance(data)
	trend := AnalyzeTrend(data)

	recommendation, score := a.generateRecommendation(
		currentPrice,
		indicators,
		patterns,
		supportResistance,
		trend,
	)

	buyRange, halfBuyRange, sellRange := a.calculatePriceRanges(
		currentPrice,
		indicators,
		supportResistance,
		trend,
	)

	return &models.AnalysisReport{
		Symbol:              symbol,
		Date:                time.Now(),
		CurrentPrice:        currentPrice,
		Indicators:          indicators,
		Patterns:            patterns,
		SupportResistance:   supportResistance,
		Trend:               trend,
		BuyRange:            buyRange,
		HalfBuyRange:        halfBuyRange,
		SellRange:           sellRange,
		Recommendation:      recommendation,
		RecommendationScore: score,
		PriceHistory:        data,
	}, nil
}

func (a *Analyzer) generateRecommendation(
	currentPrice float64,
	indicators models.TechnicalIndicators,
	patterns models.TimeframePatterns,
	sr models.SupportResistance,
	trend models.TrendAnalysis,
) (string, float64) {
	score := 0.0

	if indicators.RSI < 30 {
		score += 2.0
	} else if indicators.RSI < 40 {
		score += 1.0
	} else if indicators.RSI > 70 {
		score -= 2.0
	} else if indicators.RSI > 60 {
		score -= 1.0
	}

	if indicators.MACD > indicators.MACDSignal {
		score += 1.5
	} else {
		score -= 1.5
	}

	if currentPrice > indicators.SMA20 && indicators.SMA20 > indicators.SMA50 {
		score += 1.5
	} else if currentPrice < indicators.SMA20 && indicators.SMA20 < indicators.SMA50 {
		score -= 1.5
	}

	if currentPrice < indicators.BollingerLower {
		score += 1.0
	} else if currentPrice > indicators.BollingerUpper {
		score -= 1.0
	}

	// Use daily patterns for recommendation scoring
	for _, pattern := range patterns.Daily {
		if pattern.Type == "bullish" {
			score += pattern.Confidence
		} else if pattern.Type == "bearish" {
			score -= pattern.Confidence
		}
	}

	if trend.Trend == "uptrend" {
		score += trend.Strength * 2
	} else if trend.Trend == "downtrend" {
		score -= trend.Strength * 2
	}

	if len(sr.SupportLevels) > 0 {
		nearestSupport := sr.SupportLevels[0]
		distanceToSupport := (currentPrice - nearestSupport) / currentPrice
		if distanceToSupport < 0.02 {
			score += 1.0
		}
	}

	if len(sr.ResistanceLevels) > 0 {
		nearestResistance := sr.ResistanceLevels[0]
		distanceToResistance := (nearestResistance - currentPrice) / currentPrice
		if distanceToResistance < 0.02 {
			score -= 1.0
		}
	}

	normalizedScore := math.Max(-1, math.Min(1, score/10))

	recommendation := "hold"
	if normalizedScore > 0.3 {
		recommendation = "buy"
	} else if normalizedScore < -0.3 {
		recommendation = "sell"
	}

	return recommendation, normalizedScore
}

func (a *Analyzer) calculatePriceRanges(
	currentPrice float64,
	indicators models.TechnicalIndicators,
	sr models.SupportResistance,
	trend models.TrendAnalysis,
) (buyRange, halfBuyRange, sellRange models.PriceRange) {
	buyMin := currentPrice
	buyMax := currentPrice

	if len(sr.SupportLevels) > 0 {
		buyMin = sr.SupportLevels[0]
	} else {
		buyMin = math.Min(indicators.BollingerLower, currentPrice*0.95)
	}

	if len(sr.SupportLevels) > 1 {
		buyMax = sr.SupportLevels[0]
	} else {
		buyMax = currentPrice * 0.98
	}

	buyRange = models.PriceRange{
		Min: buyMin,
		Max: buyMax,
	}

	halfBuyRange = models.PriceRange{
		Min: buyMax,
		Max: currentPrice,
	}

	sellMin := currentPrice * 1.05
	sellMax := currentPrice * 1.15

	if len(sr.ResistanceLevels) > 0 {
		sellMin = sr.ResistanceLevels[0]
		if len(sr.ResistanceLevels) > 1 {
			sellMax = sr.ResistanceLevels[1]
		} else {
			sellMax = sellMin * 1.05
		}
	}

	if trend.Trend == "uptrend" && trend.Strength > 0.6 {
		sellMax = sellMax * 1.1
	} else if trend.Trend == "downtrend" && trend.Strength > 0.6 {
		sellMin = sellMin * 0.95
		sellMax = sellMax * 0.95
	}

	sellRange = models.PriceRange{
		Min: sellMin,
		Max: sellMax,
	}

	return buyRange, halfBuyRange, sellRange
}
