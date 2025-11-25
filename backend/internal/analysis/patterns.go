package analysis

import (
	"math"
	"stocking-chain/internal/models"
)

// ============================================================================
// HELPER UTILITY FUNCTIONS
// ============================================================================

// isBullish returns true if the candle closed higher than it opened
func isBullish(candle models.StockData) bool {
	return candle.Close > candle.Open
}

// isBearish returns true if the candle closed lower than it opened
func isBearish(candle models.StockData) bool {
	return candle.Close < candle.Open
}

// bodySize returns the absolute size of the candle body
func bodySize(candle models.StockData) float64 {
	return math.Abs(candle.Close - candle.Open)
}

// upperShadow returns the size of the upper shadow/wick
func upperShadow(candle models.StockData) float64 {
	return candle.High - math.Max(candle.Open, candle.Close)
}

// lowerShadow returns the size of the lower shadow/wick
func lowerShadow(candle models.StockData) float64 {
	return math.Min(candle.Open, candle.Close) - candle.Low
}

// totalRange returns the total price range of the candle (high - low)
func totalRange(candle models.StockData) float64 {
	return candle.High - candle.Low
}

// bodyMidpoint returns the midpoint of the candle body
func bodyMidpoint(candle models.StockData) float64 {
	return (candle.Open + candle.Close) / 2
}

// isSmallBody checks if the body is small relative to the range
func isSmallBody(candle models.StockData, threshold float64) bool {
	r := totalRange(candle)
	if r == 0 {
		return true
	}
	return bodySize(candle)/r < threshold
}

// isInUptrend checks if recent price action suggests an uptrend
func isInUptrend(data []models.StockData, lookback int) bool {
	if len(data) < lookback+1 {
		return false
	}
	start := data[len(data)-lookback-1].Close
	end := data[len(data)-1].Close
	return end > start
}

// isInDowntrend checks if recent price action suggests a downtrend
func isInDowntrend(data []models.StockData, lookback int) bool {
	if len(data) < lookback+1 {
		return false
	}
	start := data[len(data)-lookback-1].Close
	end := data[len(data)-1].Close
	return end < start
}

// almostEqual checks if two prices are approximately equal (within tolerance)
func almostEqual(a, b, tolerance float64) bool {
	return math.Abs(a-b) <= tolerance
}

// ============================================================================
// SINGLE CANDLE PATTERNS
// ============================================================================

// isDoji detects a Doji pattern (very small body)
func isDoji(candle models.StockData) bool {
	r := totalRange(candle)
	if r == 0 {
		return false
	}
	return bodySize(candle)/r < 0.1
}

// isDragonflyDoji detects a Dragonfly Doji (bullish reversal signal)
// Long lower shadow, no upper shadow, tiny body at top
func isDragonflyDoji(candle models.StockData) bool {
	r := totalRange(candle)
	if r == 0 {
		return false
	}
	body := bodySize(candle)
	lower := lowerShadow(candle)
	upper := upperShadow(candle)

	return body/r < 0.1 && lower > r*0.7 && upper < r*0.1
}

// isGravestoneDoji detects a Gravestone Doji (bearish reversal signal)
// Long upper shadow, no lower shadow, tiny body at bottom
func isGravestoneDoji(candle models.StockData) bool {
	r := totalRange(candle)
	if r == 0 {
		return false
	}
	body := bodySize(candle)
	lower := lowerShadow(candle)
	upper := upperShadow(candle)

	return body/r < 0.1 && upper > r*0.7 && lower < r*0.1
}

// isSpinningTop detects a Spinning Top pattern (indecision)
// Small body with upper and lower shadows roughly equal
func isSpinningTop(candle models.StockData) bool {
	r := totalRange(candle)
	if r == 0 {
		return false
	}
	body := bodySize(candle)
	upper := upperShadow(candle)
	lower := lowerShadow(candle)

	// Body should be small (less than 30% of range)
	// Both shadows should exist and be roughly similar
	smallBody := body/r < 0.3 && body/r > 0.05
	hasShadows := upper > body*0.5 && lower > body*0.5
	shadowsBalanced := math.Abs(upper-lower) < r*0.3

	return smallBody && hasShadows && shadowsBalanced
}

// isBullishMarubozu detects a Bullish Marubozu (strong bullish signal)
// Full bullish body with very small or no shadows
func isBullishMarubozu(candle models.StockData) bool {
	if !isBullish(candle) {
		return false
	}
	r := totalRange(candle)
	if r == 0 {
		return false
	}
	body := bodySize(candle)
	upper := upperShadow(candle)
	lower := lowerShadow(candle)

	// Body should be at least 95% of the range
	return body/r > 0.95 && upper < r*0.03 && lower < r*0.03
}

// isBearishMarubozu detects a Bearish Marubozu (strong bearish signal)
// Full bearish body with very small or no shadows
func isBearishMarubozu(candle models.StockData) bool {
	if !isBearish(candle) {
		return false
	}
	r := totalRange(candle)
	if r == 0 {
		return false
	}
	body := bodySize(candle)
	upper := upperShadow(candle)
	lower := lowerShadow(candle)

	// Body should be at least 95% of the range
	return body/r > 0.95 && upper < r*0.03 && lower < r*0.03
}

// isHammer detects a Hammer pattern (bullish reversal at bottom)
// Small body at top, long lower shadow, minimal upper shadow
func isHammer(candle models.StockData) bool {
	body := bodySize(candle)
	if body == 0 {
		return false
	}
	lower := lowerShadow(candle)
	upper := upperShadow(candle)

	return lower > body*2 && upper < body*0.5
}

// isInvertedHammer detects an Inverted Hammer pattern (bullish reversal at bottom)
// Small body at bottom, long upper shadow, minimal lower shadow
func isInvertedHammer(candle models.StockData, data []models.StockData) bool {
	body := bodySize(candle)
	if body == 0 {
		return false
	}
	upper := upperShadow(candle)
	lower := lowerShadow(candle)

	hasShape := upper > body*2 && lower < body*0.5

	// Must be in a downtrend for it to be an inverted hammer
	inDowntrend := isInDowntrend(data, 5)

	return hasShape && inDowntrend
}

// isHangingMan detects a Hanging Man pattern (bearish reversal at top)
// Same shape as hammer but appears after an uptrend
func isHangingMan(candle models.StockData, data []models.StockData) bool {
	body := bodySize(candle)
	if body == 0 {
		return false
	}
	lower := lowerShadow(candle)
	upper := upperShadow(candle)

	hasHammerShape := lower > body*2 && upper < body*0.5

	// Must be in an uptrend for it to be a hanging man
	inUptrend := isInUptrend(data, 5)

	return hasHammerShape && inUptrend
}

// isShootingStar detects a Shooting Star pattern (bearish reversal at top)
// Small body at bottom, long upper shadow, minimal lower shadow
func isShootingStar(candle models.StockData) bool {
	body := bodySize(candle)
	if body == 0 {
		return false
	}
	upper := upperShadow(candle)
	lower := lowerShadow(candle)

	return upper > body*2 && lower < body*0.5
}

// ============================================================================
// TWO CANDLE PATTERNS
// ============================================================================

// isBullishEngulfing detects a Bullish Engulfing pattern
// A bearish candle followed by a larger bullish candle that engulfs it
func isBullishEngulfing(prev, current models.StockData) bool {
	if !isBearish(prev) || !isBullish(current) {
		return false
	}

	prevBody := bodySize(prev)
	currentBody := bodySize(current)

	return current.Open <= prev.Close &&
		current.Close >= prev.Open &&
		currentBody > prevBody
}

// isBearishEngulfing detects a Bearish Engulfing pattern
// A bullish candle followed by a larger bearish candle that engulfs it
func isBearishEngulfing(prev, current models.StockData) bool {
	if !isBullish(prev) || !isBearish(current) {
		return false
	}

	prevBody := bodySize(prev)
	currentBody := bodySize(current)

	return current.Open >= prev.Close &&
		current.Close <= prev.Open &&
		currentBody > prevBody
}

// isPiercingLine detects a Piercing Line pattern (bullish reversal)
// Bearish candle followed by bullish candle opening below and closing above midpoint
func isPiercingLine(prev, current models.StockData) bool {
	if !isBearish(prev) || !isBullish(current) {
		return false
	}

	prevMid := bodyMidpoint(prev)

	// Current opens below previous close and closes above previous midpoint
	// but not above previous open (that would be engulfing)
	return current.Open < prev.Close &&
		current.Close > prevMid &&
		current.Close < prev.Open
}

// isDarkCloudCover detects a Dark Cloud Cover pattern (bearish reversal)
// Bullish candle followed by bearish candle opening above and closing below midpoint
func isDarkCloudCover(prev, current models.StockData) bool {
	if !isBullish(prev) || !isBearish(current) {
		return false
	}

	prevMid := bodyMidpoint(prev)

	// Current opens above previous close and closes below previous midpoint
	// but not below previous open (that would be engulfing)
	return current.Open > prev.Close &&
		current.Close < prevMid &&
		current.Close > prev.Open
}

// isBullishHarami detects a Bullish Harami pattern (bullish reversal)
// A bearish candle followed by a smaller bullish candle contained within it
func isBullishHarami(prev, current models.StockData) bool {
	if !isBearish(prev) || !isBullish(current) {
		return false
	}

	prevBody := bodySize(prev)
	currentBody := bodySize(current)

	// Current body must be smaller and contained within previous body
	return currentBody < prevBody*0.5 &&
		current.Open > prev.Close &&
		current.Close < prev.Open
}

// isBearishHarami detects a Bearish Harami pattern (bearish reversal)
// A bullish candle followed by a smaller bearish candle contained within it
func isBearishHarami(prev, current models.StockData) bool {
	if !isBullish(prev) || !isBearish(current) {
		return false
	}

	prevBody := bodySize(prev)
	currentBody := bodySize(current)

	// Current body must be smaller and contained within previous body
	return currentBody < prevBody*0.5 &&
		current.Open < prev.Close &&
		current.Close > prev.Open
}

// isTweezerTop detects a Tweezer Top pattern (bearish reversal)
// Two candles with nearly identical highs, first bullish, second bearish
func isTweezerTop(prev, current models.StockData) bool {
	if !isBullish(prev) || !isBearish(current) {
		return false
	}

	avgPrice := (prev.High + current.High) / 2
	tolerance := avgPrice * 0.002 // 0.2% tolerance

	return almostEqual(prev.High, current.High, tolerance)
}

// isTweezerBottom detects a Tweezer Bottom pattern (bullish reversal)
// Two candles with nearly identical lows, first bearish, second bullish
func isTweezerBottom(prev, current models.StockData) bool {
	if !isBearish(prev) || !isBullish(current) {
		return false
	}

	avgPrice := (prev.Low + current.Low) / 2
	tolerance := avgPrice * 0.002 // 0.2% tolerance

	return almostEqual(prev.Low, current.Low, tolerance)
}

// ============================================================================
// THREE CANDLE PATTERNS
// ============================================================================

// isMorningStar detects a Morning Star pattern (bullish reversal)
// Bearish candle, small body candle, bullish candle closing above midpoint of first
func isMorningStar(first, second, third models.StockData) bool {
	if !isBearish(first) || !isBullish(third) {
		return false
	}

	firstBody := bodySize(first)
	secondBody := bodySize(second)

	// Second candle should have a small body (less than 30% of first)
	secondSmall := secondBody < firstBody*0.3

	// Third candle should close above the midpoint of the first
	return secondSmall && third.Close > bodyMidpoint(first)
}

// isEveningStar detects an Evening Star pattern (bearish reversal)
// Bullish candle, small body candle, bearish candle closing below midpoint of first
func isEveningStar(first, second, third models.StockData) bool {
	if !isBullish(first) || !isBearish(third) {
		return false
	}

	firstBody := bodySize(first)
	secondBody := bodySize(second)

	// Second candle should have a small body (less than 30% of first)
	secondSmall := secondBody < firstBody*0.3

	// Third candle should close below the midpoint of the first
	return secondSmall && third.Close < bodyMidpoint(first)
}

// isThreeWhiteSoldiers detects Three White Soldiers pattern (strong bullish)
// Three consecutive bullish candles, each opening within previous body and closing higher
func isThreeWhiteSoldiers(first, second, third models.StockData) bool {
	// All three must be bullish
	if !isBullish(first) || !isBullish(second) || !isBullish(third) {
		return false
	}

	// Each should have a decent body (not too small)
	firstBody := bodySize(first)
	secondBody := bodySize(second)
	thirdBody := bodySize(third)

	if firstBody == 0 || secondBody == 0 || thirdBody == 0 {
		return false
	}

	// Each candle opens within the previous body
	secondOpensInFirst := second.Open >= first.Open && second.Open <= first.Close
	thirdOpensInSecond := third.Open >= second.Open && third.Open <= second.Close

	// Each closes higher than the previous
	progressiveCloses := second.Close > first.Close && third.Close > second.Close

	// Small upper shadows (strong conviction)
	firstSmallUpper := upperShadow(first) < firstBody*0.3
	secondSmallUpper := upperShadow(second) < secondBody*0.3
	thirdSmallUpper := upperShadow(third) < thirdBody*0.3

	return secondOpensInFirst && thirdOpensInSecond &&
		progressiveCloses &&
		firstSmallUpper && secondSmallUpper && thirdSmallUpper
}

// isThreeBlackCrows detects Three Black Crows pattern (strong bearish)
// Three consecutive bearish candles, each opening within previous body and closing lower
func isThreeBlackCrows(first, second, third models.StockData) bool {
	// All three must be bearish
	if !isBearish(first) || !isBearish(second) || !isBearish(third) {
		return false
	}

	// Each should have a decent body (not too small)
	firstBody := bodySize(first)
	secondBody := bodySize(second)
	thirdBody := bodySize(third)

	if firstBody == 0 || secondBody == 0 || thirdBody == 0 {
		return false
	}

	// Each candle opens within the previous body
	secondOpensInFirst := second.Open <= first.Open && second.Open >= first.Close
	thirdOpensInSecond := third.Open <= second.Open && third.Open >= second.Close

	// Each closes lower than the previous
	progressiveCloses := second.Close < first.Close && third.Close < second.Close

	// Small lower shadows (strong conviction)
	firstSmallLower := lowerShadow(first) < firstBody*0.3
	secondSmallLower := lowerShadow(second) < secondBody*0.3
	thirdSmallLower := lowerShadow(third) < thirdBody*0.3

	return secondOpensInFirst && thirdOpensInSecond &&
		progressiveCloses &&
		firstSmallLower && secondSmallLower && thirdSmallLower
}

// isThreeInsideUp detects Three Inside Up pattern (bullish reversal)
// Bearish candle, bullish harami, bullish confirmation closing above first candle's open
func isThreeInsideUp(first, second, third models.StockData) bool {
	// First: bearish, Second: bullish harami inside first, Third: bullish confirmation
	if !isBearish(first) || !isBullish(second) || !isBullish(third) {
		return false
	}

	// Second candle is contained within first (harami)
	secondContained := second.Open > first.Close && second.Close < first.Open

	// Third candle closes above the first candle's open (confirmation)
	confirmation := third.Close > first.Open

	return secondContained && confirmation
}

// isThreeInsideDown detects Three Inside Down pattern (bearish reversal)
// Bullish candle, bearish harami, bearish confirmation closing below first candle's open
func isThreeInsideDown(first, second, third models.StockData) bool {
	// First: bullish, Second: bearish harami inside first, Third: bearish confirmation
	if !isBullish(first) || !isBearish(second) || !isBearish(third) {
		return false
	}

	// Second candle is contained within first (harami)
	secondContained := second.Open < first.Close && second.Close > first.Open

	// Third candle closes below the first candle's open (confirmation)
	confirmation := third.Close < first.Open

	return secondContained && confirmation
}

// isThreeOutsideUp detects Three Outside Up pattern (bullish reversal)
// Bearish candle, bullish engulfing, bullish confirmation
func isThreeOutsideUp(first, second, third models.StockData) bool {
	// First: bearish, Second: bullish engulfing, Third: bullish confirmation
	if !isBearish(first) || !isBullish(second) || !isBullish(third) {
		return false
	}

	// Second candle engulfs first
	engulfing := second.Open <= first.Close && second.Close >= first.Open

	// Third candle closes higher than second (confirmation)
	confirmation := third.Close > second.Close

	return engulfing && confirmation
}

// isThreeOutsideDown detects Three Outside Down pattern (bearish reversal)
// Bullish candle, bearish engulfing, bearish confirmation
func isThreeOutsideDown(first, second, third models.StockData) bool {
	// First: bullish, Second: bearish engulfing, Third: bearish confirmation
	if !isBullish(first) || !isBearish(second) || !isBearish(third) {
		return false
	}

	// Second candle engulfs first
	engulfing := second.Open >= first.Close && second.Close <= first.Open

	// Third candle closes lower than second (confirmation)
	confirmation := third.Close < second.Close

	return engulfing && confirmation
}

// ============================================================================
// MAIN PATTERN DETECTION FUNCTION
// ============================================================================

func DetectCandlestickPatterns(data []models.StockData) []models.CandlestickPattern {
	if len(data) < 3 {
		return []models.CandlestickPattern{}
	}

	patterns := []models.CandlestickPattern{}

	current := data[len(data)-1]
	prev := data[len(data)-2]

	// ========================================
	// Single Candle Patterns
	// ========================================

	// Doji patterns (check specific dojis first)
	if isDragonflyDoji(current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Dragonfly Doji",
			Type:       "bullish",
			Confidence: 0.75,
		})
	} else if isGravestoneDoji(current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Gravestone Doji",
			Type:       "bearish",
			Confidence: 0.75,
		})
	} else if isDoji(current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Doji",
			Type:       "neutral",
			Confidence: 0.7,
		})
	}

	// Spinning Top
	if isSpinningTop(current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Spinning Top",
			Type:       "neutral",
			Confidence: 0.6,
		})
	}

	// Marubozu patterns
	if isBullishMarubozu(current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Bullish Marubozu",
			Type:       "bullish",
			Confidence: 0.85,
		})
	}

	if isBearishMarubozu(current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Bearish Marubozu",
			Type:       "bearish",
			Confidence: 0.85,
		})
	}

	// Hammer-like patterns (context-dependent)
	if isHangingMan(current, data) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Hanging Man",
			Type:       "bearish",
			Confidence: 0.7,
		})
	} else if isHammer(current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Hammer",
			Type:       "bullish",
			Confidence: 0.75,
		})
	}

	// Inverted Hammer (needs downtrend context)
	if isInvertedHammer(current, data) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Inverted Hammer",
			Type:       "bullish",
			Confidence: 0.7,
		})
	} else if isShootingStar(current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Shooting Star",
			Type:       "bearish",
			Confidence: 0.75,
		})
	}

	// ========================================
	// Two Candle Patterns
	// ========================================

	// Engulfing patterns
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

	// Piercing Line and Dark Cloud Cover
	if isPiercingLine(prev, current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Piercing Line",
			Type:       "bullish",
			Confidence: 0.75,
		})
	}

	if isDarkCloudCover(prev, current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Dark Cloud Cover",
			Type:       "bearish",
			Confidence: 0.75,
		})
	}

	// Harami patterns
	if isBullishHarami(prev, current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Bullish Harami",
			Type:       "bullish",
			Confidence: 0.7,
		})
	}

	if isBearishHarami(prev, current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Bearish Harami",
			Type:       "bearish",
			Confidence: 0.7,
		})
	}

	// Tweezer patterns
	if isTweezerTop(prev, current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Tweezer Top",
			Type:       "bearish",
			Confidence: 0.7,
		})
	}

	if isTweezerBottom(prev, current) {
		patterns = append(patterns, models.CandlestickPattern{
			Name:       "Tweezer Bottom",
			Type:       "bullish",
			Confidence: 0.7,
		})
	}

	// ========================================
	// Three Candle Patterns
	// ========================================

	if len(data) >= 3 {
		prevPrev := data[len(data)-3]

		// Morning Star and Evening Star
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

		// Three White Soldiers and Three Black Crows
		if isThreeWhiteSoldiers(prevPrev, prev, current) {
			patterns = append(patterns, models.CandlestickPattern{
				Name:       "Three White Soldiers",
				Type:       "bullish",
				Confidence: 0.9,
			})
		}

		if isThreeBlackCrows(prevPrev, prev, current) {
			patterns = append(patterns, models.CandlestickPattern{
				Name:       "Three Black Crows",
				Type:       "bearish",
				Confidence: 0.9,
			})
		}

		// Three Inside Up/Down
		if isThreeInsideUp(prevPrev, prev, current) {
			patterns = append(patterns, models.CandlestickPattern{
				Name:       "Three Inside Up",
				Type:       "bullish",
				Confidence: 0.85,
			})
		}

		if isThreeInsideDown(prevPrev, prev, current) {
			patterns = append(patterns, models.CandlestickPattern{
				Name:       "Three Inside Down",
				Type:       "bearish",
				Confidence: 0.85,
			})
		}

		// Three Outside Up/Down
		if isThreeOutsideUp(prevPrev, prev, current) {
			patterns = append(patterns, models.CandlestickPattern{
				Name:       "Three Outside Up",
				Type:       "bullish",
				Confidence: 0.85,
			})
		}

		if isThreeOutsideDown(prevPrev, prev, current) {
			patterns = append(patterns, models.CandlestickPattern{
				Name:       "Three Outside Down",
				Type:       "bearish",
				Confidence: 0.85,
			})
		}
	}

	return patterns
}
