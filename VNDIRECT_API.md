# VNDIRECT API Integration

## Overview

The application now uses VNDIRECT API instead of SSI for fetching Vietnamese stock market data.

## API Details

**Base URL**: `https://finfo-api.vndirect.com.vn`

**Endpoint**: `/v4/stock_prices`

**Authentication**: Not required for public data (optional API key support available)

## Query Parameters

The API uses a query string format for filtering:

```
?q=code:SYMBOL~date:gte:FROM_DATE~date:lte:TO_DATE&sort=date&size=1000
```

### Parameters:
- `code`: Stock symbol (e.g., VNM, VIC, HPG)
- `date:gte`: Greater than or equal to date (YYYY-MM-DD format)
- `date:lte`: Less than or equal to date (YYYY-MM-DD format)
- `sort`: Sort field (date)
- `size`: Maximum number of results (up to 1000)

## Response Format

```json
{
  "data": [
    {
      "code": "VNM",
      "date": "2024-01-01",
      "open": 75000,
      "high": 76000,
      "low": 74500,
      "close": 75500,
      "average": 75250,
      "volume": 1234567,
      "nmVolume": 1200000,
      "ptVolume": 34567,
      "change": 500,
      "pctChange": 0.67,
      "basicPrice": 75000,
      "ceilingPrice": 78000,
      "floorPrice": 72000
    }
  ],
  "errors": []
}
```

## Data Fields

- **code**: Stock symbol
- **date**: Trading date in YYYY-MM-DD format
- **open**: Opening price
- **high**: Highest price
- **low**: Lowest price
- **close**: Closing price
- **average**: Average price
- **volume**: Total trading volume
- **nmVolume**: Normal market volume
- **ptVolume**: Put-through volume
- **change**: Price change
- **pctChange**: Percentage change
- **basicPrice**: Reference price
- **ceilingPrice**: Maximum allowed price
- **floorPrice**: Minimum allowed price

## Example Usage

### Get Historical Data for VNM
```
GET https://finfo-api.vndirect.com.vn/v4/stock_prices?q=code:VNM~date:gte:2024-01-01~date:lte:2024-12-31&sort=date&size=1000
```

This fetches data for VNM stock for the year 2024.

## Advantages of VNDIRECT API

1. **No Authentication Required**: Public API accessible without API keys
2. **Comprehensive Data**: Includes all major Vietnamese exchanges (HOSE, HNX, UPCOM)
3. **Reliable**: Official data from a major securities company
4. **Good Documentation**: Well-documented API with consistent response format
5. **High Rate Limits**: Generous rate limits for public access

## Testing

To test the API manually:

```bash
# Get recent data for VNM stock
curl "https://finfo-api.vndirect.com.vn/v4/stock_prices?q=code:VNM&sort=date&size=10"
```

## Notes

- The API returns data in ascending order by default (oldest first)
- Maximum 1000 records per request
- Dates are in YYYY-MM-DD format
- Trading dates are only available for trading days (no weekends/holidays)
- Data is typically available for the last 2-3 years
