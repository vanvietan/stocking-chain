package analysis

import (
	"math"
	"sort"
	"stocking-chain-api/pkg/models"
)

func DetectSupportResistance(data []models.StockData) models.SupportResistance {
	if len(data) < 20 {
		return models.SupportResistance{
			SupportLevels:    []float64{},
			ResistanceLevels: []float64{},
		}
	}

	pivotPoints := findPivotPoints(data)

	supports := []float64{}
	resistances := []float64{}

	currentPrice := data[len(data)-1].Close

	for _, pivot := range pivotPoints {
		if pivot.isLow && pivot.price < currentPrice {
			supports = append(supports, pivot.price)
		} else if !pivot.isLow && pivot.price > currentPrice {
			resistances = append(resistances, pivot.price)
		}
	}

	supports = consolidateLevels(supports)
	resistances = consolidateLevels(resistances)

	sort.Float64s(supports)
	sort.Sort(sort.Reverse(sort.Float64Slice(supports)))

	sort.Float64s(resistances)

	if len(supports) > 3 {
		supports = supports[:3]
	}
	if len(resistances) > 3 {
		resistances = resistances[:3]
	}

	return models.SupportResistance{
		SupportLevels:    supports,
		ResistanceLevels: resistances,
	}
}

type pivotPoint struct {
	price float64
	isLow bool
}

func findPivotPoints(data []models.StockData) []pivotPoint {
	pivots := []pivotPoint{}
	lookback := 5

	for i := lookback; i < len(data)-lookback; i++ {
		isLocalHigh := true
		isLocalLow := true

		for j := i - lookback; j <= i+lookback; j++ {
			if j == i {
				continue
			}
			if data[j].High > data[i].High {
				isLocalHigh = false
			}
			if data[j].Low < data[i].Low {
				isLocalLow = false
			}
		}

		if isLocalHigh {
			pivots = append(pivots, pivotPoint{
				price: data[i].High,
				isLow: false,
			})
		}
		if isLocalLow {
			pivots = append(pivots, pivotPoint{
				price: data[i].Low,
				isLow: true,
			})
		}
	}

	return pivots
}

func consolidateLevels(levels []float64) []float64 {
	if len(levels) == 0 {
		return levels
	}

	sort.Float64s(levels)

	consolidated := []float64{levels[0]}
	threshold := 0.02

	for i := 1; i < len(levels); i++ {
		lastLevel := consolidated[len(consolidated)-1]
		diff := math.Abs(levels[i]-lastLevel) / lastLevel

		if diff > threshold {
			consolidated = append(consolidated, levels[i])
		} else {
			consolidated[len(consolidated)-1] = (lastLevel + levels[i]) / 2
		}
	}

	return consolidated
}

