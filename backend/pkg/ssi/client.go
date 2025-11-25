package ssi

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
	"stocking-chain/internal/models"
)

const (
	VNDIRECT_BASE_URL = "https://finfo-api.vndirect.com.vn"
)

type Client struct {
	httpClient *http.Client
	apiKey     string
}

type VNDirectStockPrice struct {
	Code            string  `json:"code"`
	Date            string  `json:"date"`
	Open            float64 `json:"open"`
	High            float64 `json:"high"`
	Low             float64 `json:"low"`
	Close           float64 `json:"close"`
	Average         float64 `json:"average"`
	Volume          float64 `json:"volume"`
	NmVolume        float64 `json:"nmVolume"`
	PtVolume        float64 `json:"ptVolume"`
	Change          float64 `json:"change"`
	PctChange       float64 `json:"pctChange"`
	BasicPrice      float64 `json:"basicPrice"`
	CeilingPrice    float64 `json:"ceilingPrice"`
	FloorPrice      float64 `json:"floorPrice"`
}

type VNDirectResponse struct {
	Data []VNDirectStockPrice `json:"data"`
	Errors []interface{} `json:"errors"`
}

func NewClient(apiKey string) *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		apiKey: apiKey,
	}
}

func (c *Client) GetHistoricalData(symbol string, fromDate, toDate time.Time) ([]models.StockData, error) {
	// VNDIRECT API uses date strings in YYYY-MM-DD format
	fromDateStr := fromDate.Format("2006-01-02")
	toDateStr := toDate.Format("2006-01-02")

	// VNDIRECT API endpoint for stock quotes
	url := fmt.Sprintf("%s/v4/stock_prices?q=code:%s~date:gte:%s~date:lte:%s&sort=date&size=1000",
		VNDIRECT_BASE_URL,
		symbol,
		fromDateStr,
		toDateStr,
	)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if c.apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.apiKey)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch data: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var vndResp VNDirectResponse
	if err := json.Unmarshal(body, &vndResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(vndResp.Errors) > 0 {
		return nil, fmt.Errorf("API returned errors: %v", vndResp.Errors)
	}

	stockData := make([]models.StockData, 0, len(vndResp.Data))
	for _, item := range vndResp.Data {
		// Parse date - VNDIRECT returns date in format "YYYY-MM-DD"
		date, err := time.Parse("2006-01-02", item.Date)
		if err != nil {
			continue
		}

		stockData = append(stockData, models.StockData{
			Symbol:   symbol,
			Date:     date,
			Open:     item.Open,
			High:     item.High,
			Low:      item.Low,
			Close:    item.Close,
			Volume:   int64(item.Volume),
			AdjClose: item.Close, // Use close price as adjusted close
		})
	}

	return stockData, nil
}

func (c *Client) GetLatestPrice(symbol string) (*models.StockData, error) {
	toDate := time.Now()
	fromDate := toDate.AddDate(0, 0, -10) // Get last 10 days to ensure we get data

	data, err := c.GetHistoricalData(symbol, fromDate, toDate)
	if err != nil {
		return nil, err
	}

	if len(data) == 0 {
		return nil, fmt.Errorf("no data found for symbol %s", symbol)
	}

	// Return the most recent data point
	return &data[len(data)-1], nil
}
