package analysis

import (
	"math"
	"stocking-chain/internal/models"
)

func AnalyzeTrend(data []models.StockData) models.TrendAnalysis {
	if len(data) < 20 {
		return models.TrendAnalysis{
			Trend:     "sideways",
			Strength:  0,
			TrendLine: 0,
		}
	}

	slope, intercept := linearRegression(data)

	sma20 := CalculateSMA(data, 20)
	sma50 := CalculateSMA(data, 50)

	currentPrice := data[len(data)-1].Close

	trend := "sideways"
	strength := 0.0

	angleThreshold := 0.001
	if slope > angleThreshold {
		trend = "uptrend"
		strength = math.Min(slope*1000, 1.0)
	} else if slope < -angleThreshold {
		trend = "downtrend"
		strength = math.Min(math.Abs(slope)*1000, 1.0)
	}

	if len(data) >= 50 {
		if currentPrice > sma20 && sma20 > sma50 {
			trend = "uptrend"
			strength = math.Max(strength, 0.6)
		} else if currentPrice < sma20 && sma20 < sma50 {
			trend = "downtrend"
			strength = math.Max(strength, 0.6)
		}
	}

	trendLineValue := slope*float64(len(data)-1) + intercept

	adx := calculateADX(data, 14)
	if adx > 25 {
		strength = math.Max(strength, adx/100)
	}

	return models.TrendAnalysis{
		Trend:     trend,
		Strength:  strength,
		TrendLine: trendLineValue,
	}
}

func linearRegression(data []models.StockData) (slope, intercept float64) {
	n := float64(len(data))
	sumX := 0.0
	sumY := 0.0
	sumXY := 0.0
	sumX2 := 0.0

	for i, d := range data {
		x := float64(i)
		y := d.Close

		sumX += x
		sumY += y
		sumXY += x * y
		sumX2 += x * x
	}

	slope = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX)
	intercept = (sumY - slope*sumX) / n

	return slope, intercept
}

func calculateADX(data []models.StockData, period int) float64 {
	if len(data) < period+1 {
		return 0
	}

	plusDM := make([]float64, len(data)-1)
	minusDM := make([]float64, len(data)-1)
	tr := make([]float64, len(data)-1)

	for i := 1; i < len(data); i++ {
		high := data[i].High
		low := data[i].Low
		prevHigh := data[i-1].High
		prevLow := data[i-1].Low
		prevClose := data[i-1].Close

		upMove := high - prevHigh
		downMove := prevLow - low

		if upMove > downMove && upMove > 0 {
			plusDM[i-1] = upMove
		} else {
			plusDM[i-1] = 0
		}

		if downMove > upMove && downMove > 0 {
			minusDM[i-1] = downMove
		} else {
			minusDM[i-1] = 0
		}

		tr1 := high - low
		tr2 := math.Abs(high - prevClose)
		tr3 := math.Abs(low - prevClose)
		tr[i-1] = math.Max(tr1, math.Max(tr2, tr3))
	}

	if len(tr) < period {
		return 0
	}

	avgPlusDM := average(plusDM[len(plusDM)-period:])
	avgMinusDM := average(minusDM[len(minusDM)-period:])
	avgTR := average(tr[len(tr)-period:])

	if avgTR == 0 {
		return 0
	}

	plusDI := (avgPlusDM / avgTR) * 100
	minusDI := (avgMinusDM / avgTR) * 100

	dx := math.Abs(plusDI-minusDI) / (plusDI + minusDI) * 100

	return dx
}

func average(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}
	sum := 0.0
	for _, v := range values {
		sum += v
	}
	return sum / float64(len(values))
}
