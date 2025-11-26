package ssi

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"stocking-chain-api/pkg/models"
)

const (
	YAHOO_BASE_URL = "https://query1.finance.yahoo.com"
)

type Client struct {
	httpClient *http.Client
}

// Yahoo Finance API response structures
type YahooChartResponse struct {
	Chart YahooChart `json:"chart"`
}

type YahooChart struct {
	Result []YahooChartResult `json:"result"`
	Error  *YahooError        `json:"error"`
}

type YahooChartResult struct {
	Meta       YahooMeta       `json:"meta"`
	Timestamp  []int64         `json:"timestamp"`
	Indicators YahooIndicators `json:"indicators"`
}

type YahooMeta struct {
	Currency           string  `json:"currency"`
	Symbol             string  `json:"symbol"`
	ExchangeName       string  `json:"exchangeName"`
	RegularMarketPrice float64 `json:"regularMarketPrice"`
	PreviousClose      float64 `json:"previousClose"`
	RegularMarketTime  int64   `json:"regularMarketTime"`
}

type YahooIndicators struct {
	Quote    []YahooQuote    `json:"quote"`
	AdjClose []YahooAdjClose `json:"adjclose"`
}

type YahooQuote struct {
	Open   []float64 `json:"open"`
	High   []float64 `json:"high"`
	Low    []float64 `json:"low"`
	Close  []float64 `json:"close"`
	Volume []int64   `json:"volume"`
}

type YahooAdjClose struct {
	AdjClose []float64 `json:"adjclose"`
}

type YahooError struct {
	Code        string `json:"code"`
	Description string `json:"description"`
}

// StockInfo contains company metadata
type StockInfo struct {
	Symbol    string `json:"symbol"`
	ShortName string `json:"short_name"`
	LongName  string `json:"long_name"`
	Exchange  string `json:"exchange"`
	Currency  string `json:"currency"`
}

// Yahoo Finance Search API response structures
type YahooSearchResponse struct {
	Quotes []YahooSearchQuote `json:"quotes"`
	Count  int                `json:"count"`
}

type YahooSearchQuote struct {
	Symbol       string `json:"symbol"`
	ShortName    string `json:"shortname"`
	LongName     string `json:"longname"`
	Exchange     string `json:"exchange"`
	ExchangeDisp string `json:"exchDisp"`
	Sector       string `json:"sector"`
	Industry     string `json:"industry"`
}

// NewClient creates a new Yahoo Finance API client
// The apiKey parameter is kept for backward compatibility but is not used
func NewClient(apiKey string) *Client {
	return &Client{
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// formatSymbol adds .VN suffix for Vietnamese stocks if not already present
func formatSymbol(symbol string) string {
	symbol = strings.ToUpper(strings.TrimSpace(symbol))
	if !strings.HasSuffix(symbol, ".VN") {
		return symbol + ".VN"
	}
	return symbol
}

// GetHistoricalData fetches historical stock data from Yahoo Finance
func (c *Client) GetHistoricalData(symbol string, fromDate, toDate time.Time) ([]models.StockData, error) {
	yahooSymbol := formatSymbol(symbol)

	// Yahoo Finance uses Unix timestamps
	period1 := fromDate.Unix()
	period2 := toDate.Unix()

	url := fmt.Sprintf("%s/v8/finance/chart/%s?period1=%d&period2=%d&interval=1d&includeAdjustedClose=true",
		YAHOO_BASE_URL,
		yahooSymbol,
		period1,
		period2,
	)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers to mimic a browser request
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
	req.Header.Set("Accept", "application/json")

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

	var yahooResp YahooChartResponse
	if err := json.Unmarshal(body, &yahooResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if yahooResp.Chart.Error != nil {
		return nil, fmt.Errorf("Yahoo Finance API error: %s - %s", yahooResp.Chart.Error.Code, yahooResp.Chart.Error.Description)
	}

	if len(yahooResp.Chart.Result) == 0 {
		return nil, fmt.Errorf("no data found for symbol %s", symbol)
	}

	result := yahooResp.Chart.Result[0]
	if len(result.Timestamp) == 0 || len(result.Indicators.Quote) == 0 {
		return nil, fmt.Errorf("no price data found for symbol %s", symbol)
	}

	quote := result.Indicators.Quote[0]
	stockData := make([]models.StockData, 0, len(result.Timestamp))

	for i, ts := range result.Timestamp {
		// Skip if any OHLC value is nil/missing (Yahoo returns null for some days)
		if i >= len(quote.Open) || i >= len(quote.High) || i >= len(quote.Low) || i >= len(quote.Close) {
			continue
		}

		// Skip days with zero/null values
		if quote.Open[i] == 0 || quote.Close[i] == 0 {
			continue
		}

		date := time.Unix(ts, 0).UTC()

		// Get adjusted close if available, otherwise use close
		adjClose := quote.Close[i]
		if len(result.Indicators.AdjClose) > 0 && i < len(result.Indicators.AdjClose[0].AdjClose) {
			adjClose = result.Indicators.AdjClose[0].AdjClose[i]
		}

		// Get volume, default to 0 if not available
		var volume int64
		if i < len(quote.Volume) {
			volume = quote.Volume[i]
		}

		stockData = append(stockData, models.StockData{
			Symbol:   symbol, // Keep original symbol without .VN suffix
			Date:     date,
			Open:     quote.Open[i],
			High:     quote.High[i],
			Low:      quote.Low[i],
			Close:    quote.Close[i],
			Volume:   volume,
			AdjClose: adjClose,
		})
	}

	return stockData, nil
}

// GetLatestPrice fetches the latest price for a stock
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

// GetStockInfo fetches company metadata including name from Yahoo Finance using search API
func (c *Client) GetStockInfo(symbol string) (*StockInfo, error) {
	yahooSymbol := formatSymbol(symbol)

	// Use search API which is publicly accessible
	url := fmt.Sprintf("%s/v1/finance/search?q=%s&quotesCount=1&newsCount=0",
		YAHOO_BASE_URL,
		yahooSymbol,
	)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers to mimic a browser request
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "*/*")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch stock info: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}

	var searchResp YahooSearchResponse
	if err := json.Unmarshal(body, &searchResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(searchResp.Quotes) == 0 {
		return nil, fmt.Errorf("no info found for symbol %s", symbol)
	}

	// Find exact match for our symbol
	var result *YahooSearchQuote
	for i := range searchResp.Quotes {
		if searchResp.Quotes[i].Symbol == yahooSymbol {
			result = &searchResp.Quotes[i]
			break
		}
	}

	// If no exact match, use first result
	if result == nil {
		result = &searchResp.Quotes[0]
	}

	return &StockInfo{
		Symbol:    symbol, // Keep original symbol without .VN suffix
		ShortName: result.ShortName,
		LongName:  result.LongName,
		Exchange:  result.ExchangeDisp,
		Currency:  "", // Search API doesn't return currency
	}, nil
}

