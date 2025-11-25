package analysis

import (
	"math"
	"stocking-chain/internal/models"
)

// ============================================================================
// WYCKOFF METHOD ANALYSIS
// ============================================================================

// AnalyzeWyckoff performs complete Wyckoff method analysis on price data
func AnalyzeWyckoff(data []models.StockData) models.WyckoffAnalysis {
	if len(data) < 30 {
		return models.WyckoffAnalysis{
			Phase:           "insufficient_data",
			PhaseConfidence: 0,
			Events:          []models.WyckoffEvent{},
			TradingRange:    models.PriceRange{},
			EffortResult:    "unknown",
			Recommendation:  "hold",
			RecommendationScore: 0,
			BuyZone:         models.PriceRange{},
			AccumulationZone: models.PriceRange{},
			DistributionZone: models.PriceRange{},
			SellZone:        models.PriceRange{},
		}
	}

	// Detect trading range (consolidation boundaries)
	tradingRange := detectTradingRange(data)

	// Detect Wyckoff events
	events := detectWyckoffEvents(data, tradingRange)

	// Determine current phase based on events and price action
	phase, phaseConfidence := determinePhase(data, events, tradingRange)

	// Analyze effort vs result (volume vs price movement)
	effortResult := analyzeEffortVsResult(data)

	// Generate Wyckoff-specific recommendation
	recommendation, recommendationScore := generateWyckoffRecommendation(
		data,
		phase,
		phaseConfidence,
		events,
		tradingRange,
		effortResult,
	)

	// Calculate trading zones
	buyZone, accumZone, distZone, sellZone := calculateWyckoffZones(
		data,
		tradingRange,
		events,
		phase,
	)

	return models.WyckoffAnalysis{
		Phase:              phase,
		PhaseConfidence:    phaseConfidence,
		Events:             events,
		TradingRange:       tradingRange,
		EffortResult:       effortResult,
		Recommendation:     recommendation,
		RecommendationScore: recommendationScore,
		BuyZone:            buyZone,
		AccumulationZone:   accumZone,
		DistributionZone:   distZone,
		SellZone:           sellZone,
	}
}

// ============================================================================
// TRADING RANGE DETECTION
// ============================================================================

// detectTradingRange identifies the consolidation range boundaries
func detectTradingRange(data []models.StockData) models.PriceRange {
	if len(data) < 20 {
		return models.PriceRange{}
	}

	// Use the last 30-60 bars to detect the trading range
	lookback := min(60, len(data))
	recentData := data[len(data)-lookback:]

	// Find swing highs and lows
	var highs, lows []float64

	for i := 2; i < len(recentData)-2; i++ {
		// Swing high: higher than 2 bars on each side
		if recentData[i].High > recentData[i-1].High &&
			recentData[i].High > recentData[i-2].High &&
			recentData[i].High > recentData[i+1].High &&
			recentData[i].High > recentData[i+2].High {
			highs = append(highs, recentData[i].High)
		}

		// Swing low: lower than 2 bars on each side
		if recentData[i].Low < recentData[i-1].Low &&
			recentData[i].Low < recentData[i-2].Low &&
			recentData[i].Low < recentData[i+1].Low &&
			recentData[i].Low < recentData[i+2].Low {
			lows = append(lows, recentData[i].Low)
		}
	}

	// Calculate range boundaries from swing points
	var rangeHigh, rangeLow float64

	if len(highs) > 0 {
		rangeHigh = averageFloat64(highs)
	} else {
		rangeHigh = maxHigh(recentData)
	}

	if len(lows) > 0 {
		rangeLow = averageFloat64(lows)
	} else {
		rangeLow = minLow(recentData)
	}

	return models.PriceRange{
		Min: rangeLow,
		Max: rangeHigh,
	}
}

// ============================================================================
// WYCKOFF EVENT DETECTION
// ============================================================================

// detectWyckoffEvents identifies key Wyckoff structural events
func detectWyckoffEvents(data []models.StockData, tradingRange models.PriceRange) []models.WyckoffEvent {
	events := []models.WyckoffEvent{}

	if len(data) < 10 {
		return events
	}

	avgVolume := calculateAverageVolume(data, 20)

	// Scan through data looking for Wyckoff events
	for i := 5; i < len(data)-2; i++ {
		current := data[i]
		prev := data[i-1]
		next := data[i+1]

		// Check for Selling Climax (SC) - high volume, wide spread down, near support
		if sc := detectSellingClimax(data, i, avgVolume, tradingRange); sc != nil {
			events = append(events, *sc)
		}

		// Check for Buying Climax (BC) - high volume, wide spread up, near resistance
		if bc := detectBuyingClimax(data, i, avgVolume, tradingRange); bc != nil {
			events = append(events, *bc)
		}

		// Check for Spring - brief break below support with reversal
		if spring := detectSpring(current, prev, next, tradingRange, avgVolume); spring != nil {
			events = append(events, *spring)
		}

		// Check for Upthrust - brief break above resistance with reversal
		if ut := detectUpthrust(current, prev, next, tradingRange, avgVolume); ut != nil {
			events = append(events, *ut)
		}

		// Check for Sign of Strength (SOS) - strong move up on high volume
		if sos := detectSignOfStrength(data, i, avgVolume, tradingRange); sos != nil {
			events = append(events, *sos)
		}

		// Check for Sign of Weakness (SOW) - strong move down on high volume
		if sow := detectSignOfWeakness(data, i, avgVolume, tradingRange); sow != nil {
			events = append(events, *sow)
		}
	}

	return events
}

// detectSellingClimax identifies a Selling Climax event
func detectSellingClimax(data []models.StockData, idx int, avgVolume float64, tr models.PriceRange) *models.WyckoffEvent {
	if idx < 3 || idx >= len(data)-1 {
		return nil
	}

	current := data[idx]
	prev := data[idx-1]

	// Selling climax characteristics:
	// 1. Very high volume (2x+ average)
	// 2. Wide price spread (large range)
	// 3. Closes near the low
	// 4. Price near or below trading range support
	// 5. Followed by reversal (price goes up)

	volumeRatio := float64(current.Volume) / avgVolume
	priceRange := current.High - current.Low
	avgRange := calculateAverageRange(data, idx, 10)
	rangeRatio := priceRange / avgRange

	// Close in lower 30% of the bar
	closePosition := (current.Close - current.Low) / priceRange
	if priceRange == 0 {
		closePosition = 0.5
	}

	// Check if near support
	nearSupport := current.Low <= tr.Min*1.02

	// Check for reversal (next bar closes higher)
	hasReversal := false
	if idx < len(data)-1 {
		hasReversal = data[idx+1].Close > current.Close
	}

	// Check for downtrend leading into this
	inDowntrend := prev.Close < data[max(0, idx-5)].Close

	if volumeRatio > 2.0 && rangeRatio > 1.5 && closePosition < 0.3 &&
		nearSupport && hasReversal && inDowntrend {
		return &models.WyckoffEvent{
			Name:       "Selling Climax",
			Type:       "accumulation",
			Date:       current.Date,
			Price:      current.Close,
			Volume:     current.Volume,
			Confidence: calculateConfidence(volumeRatio, rangeRatio, 0.8),
		}
	}

	return nil
}

// detectBuyingClimax identifies a Buying Climax event
func detectBuyingClimax(data []models.StockData, idx int, avgVolume float64, tr models.PriceRange) *models.WyckoffEvent {
	if idx < 3 || idx >= len(data)-1 {
		return nil
	}

	current := data[idx]
	prev := data[idx-1]

	// Buying climax characteristics:
	// 1. Very high volume (2x+ average)
	// 2. Wide price spread
	// 3. Closes near the high
	// 4. Price near or above trading range resistance
	// 5. Followed by reversal (price goes down)

	volumeRatio := float64(current.Volume) / avgVolume
	priceRange := current.High - current.Low
	avgRange := calculateAverageRange(data, idx, 10)
	rangeRatio := priceRange / avgRange

	// Close in upper 30% of the bar
	closePosition := (current.Close - current.Low) / priceRange
	if priceRange == 0 {
		closePosition = 0.5
	}

	// Check if near resistance
	nearResistance := current.High >= tr.Max*0.98

	// Check for reversal (next bar closes lower)
	hasReversal := false
	if idx < len(data)-1 {
		hasReversal = data[idx+1].Close < current.Close
	}

	// Check for uptrend leading into this
	inUptrend := prev.Close > data[max(0, idx-5)].Close

	if volumeRatio > 2.0 && rangeRatio > 1.5 && closePosition > 0.7 &&
		nearResistance && hasReversal && inUptrend {
		return &models.WyckoffEvent{
			Name:       "Buying Climax",
			Type:       "distribution",
			Date:       current.Date,
			Price:      current.Close,
			Volume:     current.Volume,
			Confidence: calculateConfidence(volumeRatio, rangeRatio, 0.8),
		}
	}

	return nil
}

// detectSpring identifies a Spring pattern (false breakdown below support)
func detectSpring(current, prev, next models.StockData, tr models.PriceRange, avgVolume float64) *models.WyckoffEvent {
	// Spring characteristics:
	// 1. Price breaks below support (trading range low)
	// 2. Closes back inside the range (or near support)
	// 3. Often on increased volume
	// 4. Followed by upward movement

	brokeSupport := current.Low < tr.Min
	closedAbove := current.Close > tr.Min*0.99
	reversedUp := next.Close > current.Close && next.Close > current.Open

	// Measure the penetration depth
	if tr.Min > 0 {
		penetration := (tr.Min - current.Low) / tr.Min
		// Spring shouldn't penetrate too deep (less than 3%)
		if penetration > 0.03 {
			return nil
		}
	}

	if brokeSupport && closedAbove && reversedUp {
		volumeRatio := float64(current.Volume) / avgVolume
		confidence := 0.7
		if volumeRatio > 1.5 {
			confidence = 0.85
		}

		return &models.WyckoffEvent{
			Name:       "Spring",
			Type:       "accumulation",
			Date:       current.Date,
			Price:      current.Close,
			Volume:     current.Volume,
			Confidence: confidence,
		}
	}

	return nil
}

// detectUpthrust identifies an Upthrust pattern (false breakout above resistance)
func detectUpthrust(current, prev, next models.StockData, tr models.PriceRange, avgVolume float64) *models.WyckoffEvent {
	// Upthrust characteristics:
	// 1. Price breaks above resistance (trading range high)
	// 2. Closes back inside the range (or near resistance)
	// 3. Often on increased volume
	// 4. Followed by downward movement

	brokeResistance := current.High > tr.Max
	closedBelow := current.Close < tr.Max*1.01
	reversedDown := next.Close < current.Close && next.Close < current.Open

	// Measure the penetration depth
	if tr.Max > 0 {
		penetration := (current.High - tr.Max) / tr.Max
		// Upthrust shouldn't penetrate too deep (less than 3%)
		if penetration > 0.03 {
			return nil
		}
	}

	if brokeResistance && closedBelow && reversedDown {
		volumeRatio := float64(current.Volume) / avgVolume
		confidence := 0.7
		if volumeRatio > 1.5 {
			confidence = 0.85
		}

		return &models.WyckoffEvent{
			Name:       "Upthrust",
			Type:       "distribution",
			Date:       current.Date,
			Price:      current.Close,
			Volume:     current.Volume,
			Confidence: confidence,
		}
	}

	return nil
}

// detectSignOfStrength identifies a Sign of Strength (SOS) event
func detectSignOfStrength(data []models.StockData, idx int, avgVolume float64, tr models.PriceRange) *models.WyckoffEvent {
	if idx < 3 || idx >= len(data) {
		return nil
	}

	current := data[idx]

	// SOS characteristics:
	// 1. Strong bullish bar (close near high)
	// 2. High volume
	// 3. Price moves above recent swing highs or resistance
	// 4. Wide spread up

	priceRange := current.High - current.Low
	if priceRange == 0 {
		return nil
	}

	closePosition := (current.Close - current.Low) / priceRange
	isBullish := current.Close > current.Open
	volumeRatio := float64(current.Volume) / avgVolume
	avgRange := calculateAverageRange(data, idx, 10)
	rangeRatio := priceRange / avgRange

	// Check if breaking above resistance
	breakingUp := current.Close > tr.Max*0.98

	if isBullish && closePosition > 0.7 && volumeRatio > 1.5 && rangeRatio > 1.3 && breakingUp {
		return &models.WyckoffEvent{
			Name:       "Sign of Strength",
			Type:       "accumulation",
			Date:       current.Date,
			Price:      current.Close,
			Volume:     current.Volume,
			Confidence: calculateConfidence(volumeRatio, rangeRatio, 0.75),
		}
	}

	return nil
}

// detectSignOfWeakness identifies a Sign of Weakness (SOW) event
func detectSignOfWeakness(data []models.StockData, idx int, avgVolume float64, tr models.PriceRange) *models.WyckoffEvent {
	if idx < 3 || idx >= len(data) {
		return nil
	}

	current := data[idx]

	// SOW characteristics:
	// 1. Strong bearish bar (close near low)
	// 2. High volume
	// 3. Price moves below recent swing lows or support
	// 4. Wide spread down

	priceRange := current.High - current.Low
	if priceRange == 0 {
		return nil
	}

	closePosition := (current.Close - current.Low) / priceRange
	isBearish := current.Close < current.Open
	volumeRatio := float64(current.Volume) / avgVolume
	avgRange := calculateAverageRange(data, idx, 10)
	rangeRatio := priceRange / avgRange

	// Check if breaking below support
	breakingDown := current.Close < tr.Min*1.02

	if isBearish && closePosition < 0.3 && volumeRatio > 1.5 && rangeRatio > 1.3 && breakingDown {
		return &models.WyckoffEvent{
			Name:       "Sign of Weakness",
			Type:       "distribution",
			Date:       current.Date,
			Price:      current.Close,
			Volume:     current.Volume,
			Confidence: calculateConfidence(volumeRatio, rangeRatio, 0.75),
		}
	}

	return nil
}

// ============================================================================
// PHASE DETERMINATION
// ============================================================================

// determinePhase analyzes events and price action to determine the current Wyckoff phase
func determinePhase(data []models.StockData, events []models.WyckoffEvent, tr models.PriceRange) (string, float64) {
	if len(data) < 20 {
		return "unknown", 0
	}

	currentPrice := data[len(data)-1].Close
	recentData := data[len(data)-20:]

	// Count recent event types
	accumulationEvents := 0
	distributionEvents := 0

	for _, event := range events {
		if event.Type == "accumulation" {
			accumulationEvents++
		} else if event.Type == "distribution" {
			distributionEvents++
		}
	}

	// Analyze price position relative to trading range
	rangeSize := tr.Max - tr.Min
	if rangeSize == 0 {
		rangeSize = 1
	}

	pricePosition := (currentPrice - tr.Min) / rangeSize

	// Check for trending conditions
	priceChange := (recentData[len(recentData)-1].Close - recentData[0].Close) / recentData[0].Close
	isUptrending := priceChange > 0.05
	isDowntrending := priceChange < -0.05

	// Determine phase based on multiple factors
	if isUptrending && pricePosition > 0.8 {
		// Price trending up and above range = Markup
		return "markup", 0.7 + float64(accumulationEvents)*0.05
	}

	if isDowntrending && pricePosition < 0.2 {
		// Price trending down and below range = Markdown
		return "markdown", 0.7 + float64(distributionEvents)*0.05
	}

	if accumulationEvents > distributionEvents && pricePosition < 0.5 {
		// More accumulation events, price in lower half = Accumulation
		confidence := 0.6 + float64(accumulationEvents)*0.1
		return "accumulation", math.Min(confidence, 0.95)
	}

	if distributionEvents > accumulationEvents && pricePosition > 0.5 {
		// More distribution events, price in upper half = Distribution
		confidence := 0.6 + float64(distributionEvents)*0.1
		return "distribution", math.Min(confidence, 0.95)
	}

	// Check for range-bound conditions (consolidation)
	if !isUptrending && !isDowntrending {
		if pricePosition > 0.5 {
			return "distribution", 0.5
		}
		return "accumulation", 0.5
	}

	return "unknown", 0.3
}

// ============================================================================
// EFFORT VS RESULT ANALYSIS
// ============================================================================

// analyzeEffortVsResult compares volume (effort) to price movement (result)
func analyzeEffortVsResult(data []models.StockData) string {
	if len(data) < 10 {
		return "unknown"
	}

	recentData := data[len(data)-10:]

	// Calculate volume trend
	firstHalfVolume := int64(0)
	secondHalfVolume := int64(0)
	for i := 0; i < 5; i++ {
		firstHalfVolume += recentData[i].Volume
		secondHalfVolume += recentData[i+5].Volume
	}

	volumeIncreasing := secondHalfVolume > firstHalfVolume

	// Calculate price movement
	priceChange := recentData[len(recentData)-1].Close - recentData[0].Close
	avgRange := calculateAverageRange(data, len(data)-1, 10)

	// Normalize price change relative to average range
	normalizedPriceChange := math.Abs(priceChange) / avgRange

	// Effort vs Result analysis:
	// - If volume is increasing but price movement is small = diverging (potential reversal)
	// - If volume and price movement are aligned = confirming (trend continuation)

	if volumeIncreasing && normalizedPriceChange < 2.0 {
		// High effort (volume), low result (price movement) = divergence
		return "diverging"
	}

	if volumeIncreasing && normalizedPriceChange >= 2.0 {
		// High effort, high result = confirmation
		return "confirming"
	}

	if !volumeIncreasing && normalizedPriceChange < 2.0 {
		// Low effort, low result = neutral/consolidation
		return "confirming"
	}

	if !volumeIncreasing && normalizedPriceChange >= 2.0 {
		// Low effort, high result = possible exhaustion
		return "diverging"
	}

	return "unknown"
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// calculateAverageVolume computes the average volume over a lookback period
func calculateAverageVolume(data []models.StockData, lookback int) float64 {
	if len(data) < lookback {
		lookback = len(data)
	}

	total := int64(0)
	for i := len(data) - lookback; i < len(data); i++ {
		total += data[i].Volume
	}

	return float64(total) / float64(lookback)
}

// calculateAverageRange computes the average true range over a lookback period
func calculateAverageRange(data []models.StockData, idx int, lookback int) float64 {
	startIdx := max(0, idx-lookback)
	count := idx - startIdx
	if count == 0 {
		return 1
	}

	total := 0.0
	for i := startIdx; i < idx; i++ {
		total += data[i].High - data[i].Low
	}

	return total / float64(count)
}

// averageFloat64 calculates the arithmetic mean of a slice of float64
func averageFloat64(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}

	sum := 0.0
	for _, v := range values {
		sum += v
	}
	return sum / float64(len(values))
}

// maxHigh finds the maximum high in the data
func maxHigh(data []models.StockData) float64 {
	if len(data) == 0 {
		return 0
	}

	maxVal := data[0].High
	for _, d := range data {
		if d.High > maxVal {
			maxVal = d.High
		}
	}
	return maxVal
}

// minLow finds the minimum low in the data
func minLow(data []models.StockData) float64 {
	if len(data) == 0 {
		return 0
	}

	minVal := data[0].Low
	for _, d := range data {
		if d.Low < minVal {
			minVal = d.Low
		}
	}
	return minVal
}

// calculateConfidence determines confidence based on volume and range ratios
func calculateConfidence(volumeRatio, rangeRatio, baseConfidence float64) float64 {
	// Boost confidence based on how strong the signals are
	boost := 0.0
	if volumeRatio > 2.5 {
		boost += 0.1
	}
	if rangeRatio > 2.0 {
		boost += 0.05
	}

	return math.Min(baseConfidence+boost, 0.95)
}

// ============================================================================
// WYCKOFF RECOMMENDATION
// ============================================================================

// generateWyckoffRecommendation calculates buy/sell/hold recommendation based purely on Wyckoff signals
func generateWyckoffRecommendation(
	data []models.StockData,
	phase string,
	phaseConfidence float64,
	events []models.WyckoffEvent,
	tradingRange models.PriceRange,
	effortResult string,
) (string, float64) {
	if len(data) == 0 || phase == "insufficient_data" || phase == "unknown" {
		return "hold", 0
	}

	currentPrice := data[len(data)-1].Close
	score := 0.0

	// 1. Phase Scoring (primary signal, weight: 3.0)
	switch phase {
	case "accumulation":
		score += 3.0 * phaseConfidence
	case "markup":
		score += 1.5 * phaseConfidence
	case "distribution":
		score -= 3.0 * phaseConfidence
	case "markdown":
		score -= 1.5 * phaseConfidence
	}

	// 2. Trading Range Position (secondary signal, weight: 2.0)
	rangeSize := tradingRange.Max - tradingRange.Min
	if rangeSize > 0 {
		pricePosition := (currentPrice - tradingRange.Min) / rangeSize

		if pricePosition < 0.3 {
			// Price in lower 30% of range - accumulation zone
			score += 2.0
		} else if pricePosition > 0.7 {
			// Price in upper 30% of range - distribution zone
			score -= 2.0
		}
		// Middle 40% contributes 0
	}

	// 3. Recent Events (tertiary signal, look back 10 bars)
	recentThreshold := 10
	if len(data) >= recentThreshold {
		recentDate := data[len(data)-recentThreshold].Date

		for _, event := range events {
			if event.Date.After(recentDate) || event.Date.Equal(recentDate) {
				switch event.Name {
				case "Spring":
					score += 2.5 * event.Confidence
				case "Sign of Strength":
					score += 2.0 * event.Confidence
				case "Selling Climax":
					score += 1.5 * event.Confidence
				case "Upthrust":
					score -= 2.5 * event.Confidence
				case "Sign of Weakness":
					score -= 2.0 * event.Confidence
				case "Buying Climax":
					score -= 1.5 * event.Confidence
				}
			}
		}
	}

	// 4. Effort vs Result (confirming/diverging)
	if effortResult == "diverging" {
		// Determine trend from recent price action
		if len(data) >= 10 {
			recentStart := data[len(data)-10].Close
			recentEnd := currentPrice
			isUptrending := recentEnd > recentStart

			if isUptrending {
				// Diverging in uptrend = reversal warning
				score -= 1.5
			} else {
				// Diverging in downtrend = reversal opportunity
				score += 1.5
			}
		}
	} else if effortResult == "confirming" {
		// Trend is healthy
		score += 0.5
	}

	// Normalize score to [-1, 1]
	// Max possible score: ~3.0 + 2.0 + 2.5 + 1.5 = 9.0
	// Min possible score: ~-3.0 + -2.0 + -2.5 + -1.5 = -9.0
	normalizedScore := math.Max(-1, math.Min(1, score/9.0))

	// Determine recommendation
	recommendation := "hold"
	if normalizedScore > 0.4 {
		recommendation = "buy"
	} else if normalizedScore < -0.4 {
		recommendation = "sell"
	}

	return recommendation, normalizedScore
}

// ============================================================================
// WYCKOFF TRADING ZONES
// ============================================================================

// calculateWyckoffZones determines buy/accumulation/distribution/sell zones based on trading range and events
func calculateWyckoffZones(
	data []models.StockData,
	tradingRange models.PriceRange,
	events []models.WyckoffEvent,
	phase string,
) (buyZone, accumZone, distZone, sellZone models.PriceRange) {
	rangeSize := tradingRange.Max - tradingRange.Min

	// Default zone calculations based on trading range
	// Buy Zone: Bottom 15% of range + 3% buffer below for Springs
	buyZone = models.PriceRange{
		Min: tradingRange.Min - (rangeSize * 0.03),
		Max: tradingRange.Min + (rangeSize * 0.15),
	}

	// Accumulation Zone: 15-35% of range
	accumZone = models.PriceRange{
		Min: tradingRange.Min + (rangeSize * 0.15),
		Max: tradingRange.Min + (rangeSize * 0.35),
	}

	// Distribution Zone: 65-85% of range
	distZone = models.PriceRange{
		Min: tradingRange.Max - (rangeSize * 0.35),
		Max: tradingRange.Max - (rangeSize * 0.15),
	}

	// Sell Zone: Top 15% of range + 3% buffer above for Upthrusts
	sellZone = models.PriceRange{
		Min: tradingRange.Max - (rangeSize * 0.15),
		Max: tradingRange.Max + (rangeSize * 0.03),
	}

	// Event-based adjustments (look back 10 bars for recent events)
	if len(data) >= 10 {
		recentDate := data[len(data)-10].Date

		for _, event := range events {
			if event.Date.After(recentDate) || event.Date.Equal(recentDate) {
				switch event.Name {
				case "Spring":
					// Spring: False breakdown below support
					// Shift buy zone lower bound to capture Spring entry
					springLow := event.Price * 0.98 // 2% below Spring price
					if springLow < buyZone.Min {
						buyZone.Min = springLow
					}

				case "Upthrust":
					// Upthrust: False breakout above resistance
					// Shift sell zone upper bound to capture Upthrust exit
					upthrustHigh := event.Price * 1.02 // 2% above Upthrust price
					if upthrustHigh > sellZone.Max {
						sellZone.Max = upthrustHigh
					}

				case "Selling Climax":
					// Selling Climax: Panic selling exhaustion
					// Expand buy zone by 10% (stronger buy opportunity)
					expansion := rangeSize * 0.10
					buyZone.Max = buyZone.Max + expansion

				case "Buying Climax":
					// Buying Climax: Euphoric buying exhaustion
					// Expand sell zone by 10% (stronger sell opportunity)
					expansion := rangeSize * 0.10
					sellZone.Min = sellZone.Min - expansion
				}
			}
		}
	}

	return buyZone, accumZone, distZone, sellZone
}

