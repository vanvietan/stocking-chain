# Yahoo Finance API Integration

## Overview

The application uses Yahoo Finance API for fetching Vietnamese stock market data.

## API Details

**Base URL**: `https://query1.finance.yahoo.com`

**Endpoint**: `/v8/finance/chart/{symbol}`

**Authentication**: Not required

## Query Parameters

```
?period1={unix_start}&period2={unix_end}&interval=1d&includeAdjustedClose=true
```

### Parameters:
- `symbol`: Stock symbol with exchange suffix (e.g., VNM.VN for Vietnamese stocks)
- `period1`: Start date as Unix timestamp
- `period2`: End date as Unix timestamp
- `interval`: Data interval (1d for daily)
- `includeAdjustedClose`: Include adjusted close prices

## Vietnamese Stock Symbols

Vietnamese stocks on Yahoo Finance use the `.VN` suffix:
- VNM → VNM.VN
- VIC → VIC.VN
- HPG → HPG.VN

The backend automatically appends `.VN` to symbols, so users can enter just the stock code.

## Response Format

```json
{
  "chart": {
    "result": [
      {
        "meta": {
          "currency": "VND",
          "symbol": "VNM.VN",
          "exchangeName": "HNM",
          "regularMarketPrice": 75500,
          "previousClose": 75000
        },
        "timestamp": [1704067200, 1704153600, ...],
        "indicators": {
          "quote": [
            {
              "open": [75000, 75200, ...],
              "high": [76000, 76500, ...],
              "low": [74500, 74800, ...],
              "close": [75500, 76000, ...],
              "volume": [1234567, 1345678, ...]
            }
          ],
          "adjclose": [
            {
              "adjclose": [75500, 76000, ...]
            }
          ]
        }
      }
    ],
    "error": null
  }
}
```

## Data Fields

### Meta
- **currency**: Trading currency (VND for Vietnamese stocks)
- **symbol**: Full symbol with exchange suffix
- **exchangeName**: Exchange name
- **regularMarketPrice**: Current market price
- **previousClose**: Previous closing price

### Indicators
- **timestamp**: Array of Unix timestamps for each data point
- **quote.open**: Opening prices
- **quote.high**: Highest prices
- **quote.low**: Lowest prices
- **quote.close**: Closing prices
- **quote.volume**: Trading volumes
- **adjclose**: Adjusted closing prices

## Example Usage

### Get Historical Data for VNM
```bash
curl "https://query1.finance.yahoo.com/v8/finance/chart/VNM.VN?period1=1704067200&period2=1735689600&interval=1d"
```

This fetches daily data for VNM stock from January 1, 2024 to December 31, 2024.

### Get Recent Data
```bash
curl "https://query1.finance.yahoo.com/v8/finance/chart/VNM.VN?range=1mo&interval=1d"
```

## Advantages of Yahoo Finance API

1. **No Authentication Required**: Public API accessible without API keys
2. **Global Coverage**: Includes Vietnamese stocks with .VN suffix
3. **Adjusted Prices**: Provides adjusted close prices for accurate historical analysis
4. **Multiple Intervals**: Supports various time intervals (1m, 5m, 1h, 1d, 1wk, 1mo)
5. **Rich Metadata**: Includes exchange info, currency, and real-time prices

## Rate Limits

Yahoo Finance API has unofficial rate limits. The application includes:
- 30-second timeout for requests
- User-Agent header to avoid blocking
- Reasonable request intervals

## Error Handling

The API returns errors in this format:
```json
{
  "chart": {
    "result": null,
    "error": {
      "code": "Not Found",
      "description": "No data found, symbol may be delisted"
    }
  }
}
```

## Notes

- Timestamps are in Unix format (seconds since epoch)
- Data is returned in ascending order (oldest first)
- Some days may have null values for holidays/non-trading days
- Historical data is typically available for the last 5+ years
- Weekend/holiday data points are excluded

