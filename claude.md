# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Market Analyzer - Vietnamese Stocks & Cryptocurrencies

A full-stack web application for technical analysis of Vietnamese stocks and cryptocurrencies using Yahoo Finance API with advanced technical indicators, candlestick patterns, support/resistance analysis, trend detection, and Wyckoff Method analysis.

## Tech Stack

### Backend
- **Language**: Go 1.21+ (no external dependencies, uses only standard library)
- **Server**: Standard library `net/http`
- **Port**: 8080 (configurable via `PORT` env var)

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Charts**: Recharts

### External API
- **Yahoo Finance API**: `https://query1.finance.yahoo.com` (public, no authentication)
- Vietnamese stocks use `.VN` suffix (e.g., VNM.VN, VIC.VN)
- Cryptocurrencies use `-USD` suffix (e.g., BTC-USD, ETH-USD)
- Suffix automatically appended by backend based on `market_type` parameter in `pkg/ssi/client.go:formatSymbol`

## Development Commands

### Backend
```bash
cd backend

# Run development server
go run cmd/server/main.go

# Run tests
go test ./...

# Run tests for specific package
go test ./internal/analysis
go test ./pkg/ssi

# Build production binary
go build -o bin/server cmd/server/main.go

# Install/update dependencies
go mod tidy

# Check for Go module issues
go mod verify
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run linter
npm run lint

# Fix linter issues automatically
npm run lint -- --fix
```

## Architecture

### Backend Architecture

The backend follows a clean layered architecture with clear separation of concerns:

**Entry Point (`cmd/server/main.go`)**
- Initializes dependencies: Yahoo Finance client, analyzer, HTTP handler
- Configures HTTP server with port from environment
- No business logic at this layer

**API Layer (`internal/api/handler.go`)**
- HTTP request/response handling
- CORS middleware (enabled for all origins in development)
- Three main endpoints: `/api/analyze`, `/api/price`, `/api/health`
- Error handling and JSON marshaling
- Calls data client and analysis layers

**Data Client (`pkg/ssi/client.go`)**
- Yahoo Finance API integration
- `formatSymbol()`: Automatically adds `.VN` suffix for Vietnamese stocks
- `GetHistoricalData()`: Fetches OHLCV data using Unix timestamps
- `GetLatestPrice()`: Fetches most recent price data
- `GetStockInfo()`: Fetches company metadata (name, exchange)
- Handles Yahoo's API response format with proper error checking

**Analysis Layer (`internal/analysis/`)**
- **`analyzer.go`**: Main orchestrator that coordinates all analysis modules
  - `Analyze()`: Main entry point, calls all sub-analyzers
  - `generateRecommendation()`: Scoring algorithm that combines all signals (RSI, MACD, MA, patterns, Wyckoff, etc.)
  - `calculatePriceRanges()`: Determines buy/sell ranges based on support/resistance

- **`indicators.go`**: Technical indicator calculations
  - RSI (14-period), MACD (12/26/9), SMA (20/50/200), EMA (12/26), Bollinger Bands (20-period)
  - Pure functions with no side effects

- **`patterns.go`**: Candlestick pattern detection
  - Supports multiple timeframes (daily, weekly, monthly) via `ConvertToTimeframe()`
  - Detects: Doji, Hammer, Shooting Star, Engulfing patterns, Morning/Evening Star
  - Returns confidence scores for each pattern

- **`support_resistance.go`**: Support and resistance level detection
  - Identifies pivot points (swing highs/lows)
  - Consolidates nearby levels within 2% tolerance
  - Returns top 3 support and resistance levels sorted by significance

- **`trend.go`**: Trend analysis
  - Linear regression for trend direction
  - ADX (Average Directional Index) for trend strength
  - Moving average crossover analysis
  - Returns: "uptrend", "downtrend", or "sideways" with strength (0-1)

- **`wyckoff.go`**: Wyckoff Method analysis
  - Detects trading range boundaries (consolidation zones)
  - Identifies Wyckoff events: Spring, Upthrust, Selling/Buying Climax, Sign of Strength/Weakness
  - Determines phase: "accumulation", "distribution", "markup", "markdown"
  - Analyzes effort vs result (volume vs price movement)
  - Each event includes confidence score, date, price, volume

**Data Models (`internal/models/stock.go`)**
- `StockData`: OHLCV data structure
- `AnalysisReport`: Complete analysis result with all indicators, patterns, Wyckoff data, and recommendation
- `TechnicalIndicators`: RSI, MACD, moving averages, Bollinger Bands
- `TimeframePatterns`: Candlestick patterns across daily/weekly/monthly timeframes
- `WyckoffAnalysis`: Phase, events, trading range, effort vs result
- All structs use JSON tags for API serialization

### Recommendation Algorithm

The recommendation system in `analyzer.go:generateRecommendation()` uses a scoring mechanism:

1. **RSI Scoring**: Oversold (<30) = +2.0, Overbought (>70) = -2.0
2. **MACD**: Bullish crossover = +1.5, Bearish = -1.5
3. **Moving Averages**: Price > SMA20 > SMA50 = +1.5 (bullish alignment)
4. **Bollinger Bands**: Price below lower band = +1.0 (oversold)
5. **Candlestick Patterns**: Sum of pattern confidences (bullish = +, bearish = -)
6. **Trend**: Uptrend adds strength*2, Downtrend subtracts strength*2
7. **Support/Resistance**: Bonus if within 2% of support (+1.0) or resistance (-1.0)
8. **Wyckoff Phase**: Accumulation = +1.0, Distribution = -1.0 (weighted by confidence)
9. **Wyckoff Events**: Spring/SOS = +0.75, Upthrust/SOW = -0.75
10. **Effort vs Result**: Divergence adjusts trend confidence by ±0.25

Final score is normalized to [-1, 1] and mapped to: buy (>0.3), sell (<-0.3), hold (between)

### Frontend Architecture

**App Router Structure (`frontend/app/`)**
- `page.tsx`: Main page component with state management
- `layout.tsx`: Root layout with HTML structure
- Client-side rendering with `'use client'` directive

**Components (`frontend/components/`)**
- `StockInput.tsx`: Symbol input with popular stock suggestions
- `AnalysisReport.tsx`: Displays complete analysis results
- `StockChart.tsx`: Price chart visualization using Recharts
- Each component is self-contained with its own styling

**API Integration**
- Axios client configured for `http://localhost:8080`
- Frontend requests 365 days of data (`days_back: 365`)
- Type-safe responses using TypeScript interfaces in `types/index.ts`

## Key Implementation Patterns

### Backend Patterns

**No External Dependencies**: The backend uses only Go standard library. Do not add external packages without justification.

**Error Handling**: All functions return errors that bubble up to the handler layer. Handler converts errors to appropriate HTTP status codes.

**Data Validation**:
- Symbol validation happens in handler before API calls
- Historical data filters out days with zero/null OHLC values
- Minimum data requirements checked in each analyzer (e.g., Wyckoff needs 30+ data points)

**Historical Package Name**: The `pkg/ssi/` directory name is maintained for backward compatibility but actually contains Yahoo Finance API client code. Do not rename this directory.

**Symbol Formatting**: The `.VN` suffix is added in `formatSymbol()` function and stripped from responses to keep the API clean for users.

### Frontend Patterns

**API Base URL**: Hardcoded to `http://localhost:8080` in `page.tsx`. Update this for production deployment.

**Loading States**: Always set loading state before API calls and clear it in finally block to ensure UI is always updated.

**Error Display**: Errors are shown in a red alert box with both generic message and specific error details from API.

**Timeframe Selection**: The frontend requests 365 days but backend defaults to 200 if not specified. Keep this consistent.

## Testing Vietnamese Stocks

Common stock symbols for testing (no `.VN` suffix needed):
- **Banks**: VCB, BID, TCB, MBB, VPB, ACB
- **Real Estate**: VIC, VHM, NVL, DXG
- **Manufacturing**: HPG, HSG, NKG
- **Technology**: FPT, CMG
- **Consumer**: VNM, MSN, MWG, PNJ

Note: Enter symbols WITHOUT `.VN` suffix - it's automatically added by the backend.

## Important Notes

- CORS is enabled for all origins (`*`) in development. Restrict this for production.
- Yahoo Finance API is public but not officially documented. API structure may change.
- Adjusted close prices are used when available for more accurate historical analysis.
- All price calculations use `Close` price unless specifically analyzing intraday movement.
- Volume analysis in Wyckoff module requires non-zero volume data.
- Candlestick patterns can be detected across multiple timeframes (daily/weekly/monthly).
- Wyckoff analysis is computationally intensive with multiple nested loops - consider caching results.
- The recommendation score normalization divides by 10, so max absolute score should stay around 10 for proper scaling.
