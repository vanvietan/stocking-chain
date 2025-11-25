package analysis

import (
	"math"
	"stocking-chain/internal/models"
)

func CalculateSMA(data []models.StockData, period int) float64 {
	if len(data) < period {
		return 0
	}

	sum := 0.0
	for i := len(data) - period; i < len(data); i++ {
		sum += data[i].Close
	}
	return sum / float64(period)
}

func CalculateEMA(data []models.StockData, period int) float64 {
	if len(data) < period {
		return 0
	}

	multiplier := 2.0 / float64(period+1)
	ema := CalculateSMA(data[:period], period)

	for i := period; i < len(data); i++ {
		ema = (data[i].Close-ema)*multiplier + ema
	}

	return ema
}

func CalculateRSI(data []models.StockData, period int) float64 {
	if len(data) < period+1 {
		return 50
	}

	gains := 0.0
	losses := 0.0

	for i := len(data) - period; i < len(data); i++ {
		change := data[i].Close - data[i-1].Close
		if change > 0 {
			gains += change
		} else {
			losses -= change
		}
	}

	avgGain := gains / float64(period)
	avgLoss := losses / float64(period)

	if avgLoss == 0 {
		return 100
	}

	rs := avgGain / avgLoss
	rsi := 100 - (100 / (1 + rs))

	return rsi
}

func CalculateMACD(data []models.StockData) (macd, signal, histogram float64) {
	if len(data) < 26 {
		return 0, 0, 0
	}

	ema12 := CalculateEMA(data, 12)
	ema26 := CalculateEMA(data, 26)
	macd = ema12 - ema26

	macdLine := []models.StockData{}
	for i := 26; i < len(data); i++ {
		ema12 := CalculateEMA(data[:i+1], 12)
		ema26 := CalculateEMA(data[:i+1], 26)
		macdLine = append(macdLine, models.StockData{Close: ema12 - ema26})
	}

	if len(macdLine) >= 9 {
		signal = CalculateEMA(macdLine, 9)
	}

	histogram = macd - signal

	return macd, signal, histogram
}

func CalculateBollingerBands(data []models.StockData, period int) (upper, middle, lower float64) {
	if len(data) < period {
		return 0, 0, 0
	}

	middle = CalculateSMA(data, period)

	variance := 0.0
	for i := len(data) - period; i < len(data); i++ {
		variance += math.Pow(data[i].Close-middle, 2)
	}
	stdDev := math.Sqrt(variance / float64(period))

	upper = middle + (2 * stdDev)
	lower = middle - (2 * stdDev)

	return upper, middle, lower
}

func CalculateTechnicalIndicators(data []models.StockData) models.TechnicalIndicators {
	rsi := CalculateRSI(data, 14)
	macd, signal, histogram := CalculateMACD(data)
	sma20 := CalculateSMA(data, 20)
	sma50 := CalculateSMA(data, 50)
	sma200 := CalculateSMA(data, 200)
	ema12 := CalculateEMA(data, 12)
	ema26 := CalculateEMA(data, 26)
	upper, middle, lower := CalculateBollingerBands(data, 20)

	return models.TechnicalIndicators{
		RSI:            rsi,
		MACD:           macd,
		MACDSignal:     signal,
		MACDHistogram:  histogram,
		SMA20:          sma20,
		SMA50:          sma50,
		SMA200:         sma200,
		EMA12:          ema12,
		EMA26:          ema26,
		BollingerUpper: upper,
		BollingerMid:   middle,
		BollingerLower: lower,
	}
}
