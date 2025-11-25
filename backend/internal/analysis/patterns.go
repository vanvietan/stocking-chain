package analysis

import (
	"math"
	"stocking-chain/internal/models"
)

func DetectCandlestickPatterns(data []models.StockData) []models.CandlestickPattern {
	if len(data) < 3 {
		return []models.CandlestickPattern{}
	}

	patterns := []models.CandlestickPattern{}

	current := data[len(data)-1]
	prev := data[len(data)-2]

	if isDoji(current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Doji",
			Type:       "neutral",
			Confidence: 0.7,
		})
	}

	if isHammer(current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Hammer",
			Type:       "bullish",
			Confidence: 0.75,
		})
	}

	if isShootingStar(current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Shooting Star",
			Type:       "bearish",
			Confidence: 0.75,
		})
	}

	if isBullishEngulfing(prev, current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Bullish Engulfing",
			Type:       "bullish",
			Confidence: 0.85,
		})
	}

	if isBearishEngulfing(prev, current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Bearish Engulfing",
			Type:       "bearish",
			Confidence: 0.85,
		})
	}

	if len(data) >= 3 {
		prevPrev := data[len(data)-3]
		if isMorningStar(prevPrev, prev, current) {
			patterns = append(patterns, models.CandlestickPattern{
				Name:       "Morning Star",
				Type:       "bullish",
				Confidence: 0.9,
			})
		}

		if isEveningStar(prevPrev, prev, current) {
			patterns = append(patterns, models.CandlestickPattern{
				Name:       "Evening Star",
				Type:       "bearish",
				Confidence: 0.9,
			})
		}
	}

	return patterns
}

func isDoji(candle models.StockData) bool {
	body := math.Abs(candle.Close - candle.Open)
	range_ := candle.High - candle.Low

	if range_ == 0 {
		return false
	}

	return body/range_ < 0.1
}

func isHammer(candle models.StockData) bool {
	body := math.Abs(candle.Close - candle.Open)
	lowerShadow := math.Min(candle.Open, candle.Close) - candle.Low
	upperShadow := candle.High - math.Max(candle.Open, candle.Close)

	return lowerShadow > body*2 && upperShadow < body*0.5
}

func isShootingStar(candle models.StockData) bool {
	body := math.Abs(candle.Close - candle.Open)
	upperShadow := candle.High - math.Max(candle.Open, candle.Close)
	lowerShadow := math.Min(candle.Open, candle.Close) - candle.Low

	return upperShadow > body*2 && lowerShadow < body*0.5
}

func isBullishEngulfing(prev, current models.StockData) bool {
	prevBearish := prev.Close < prev.Open
	currentBullish := current.Close > current.Open

	prevBody := math.Abs(prev.Close - prev.Open)
	currentBody := math.Abs(current.Close - current.Open)

	return prevBearish && currentBullish &&
		current.Open <= prev.Close &&
		current.Close >= prev.Open &&
		currentBody > prevBody
}

func isBearishEngulfing(prev, current models.StockData) bool {
	prevBullish := prev.Close > prev.Open
	currentBearish := current.Close < current.Open

	prevBody := math.Abs(prev.Close - prev.Open)
	currentBody := math.Abs(current.Close - current.Open)

	return prevBullish && currentBearish &&
		current.Open >= prev.Close &&
		current.Close <= prev.Open &&
		currentBody > prevBody
}

func isMorningStar(first, second, third models.StockData) bool {
	firstBearish := first.Close < first.Open
	thirdBullish := third.Close > third.Open

	secondBody := math.Abs(second.Close - second.Open)
	secondSmall := secondBody < math.Abs(first.Close-first.Open)*0.3

	return firstBearish && secondSmall && thirdBullish &&
		third.Close > (first.Open+first.Close)/2
}

func isEveningStar(first, second, third models.StockData) bool {
	firstBullish := first.Close > first.Open
	thirdBearish := third.Close < third.Open

	secondBody := math.Abs(second.Close - second.Open)
	secondSmall := secondBody < math.Abs(first.Close-first.Open)*0.3

	return firstBullish && secondSmall && thirdBearish &&
		third.Close < (first.Open+first.Close)/2
}
