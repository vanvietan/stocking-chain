# Vietnamese Stock Market Analyzer

A full-stack web application for technical analysis of Vietnamese stocks. Uses the Yahoo Finance API to fetch stock data and provides buy/sell recommendations based on technical indicators.

## Tech Stack

### Backend
- **Language**: Go 1.21+
- **Server**: Standard library `net/http`
- **Port**: 8080 (configurable via `PORT` env var)

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Charts**: Recharts

### External API
- **Yahoo Finance API**: `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`
- No authentication required
- Vietnamese stocks use `.VN` suffix (automatically appended by backend)

## Project Structure

```
stocking-chain/
├── backend/
│   ├── cmd/server/main.go          # Entry point, initializes HTTP server
│   ├── pkg/ssi/client.go           # Yahoo Finance API client
│   ├── internal/
│   │   ├── api/handler.go          # HTTP handlers with CORS support
│   │   ├── analysis/
│   │   │   ├── analyzer.go         # Main analysis orchestrator
│   │   │   ├── indicators.go       # Technical indicators (RSI, MACD, SMA, EMA, Bollinger)
│   │   │   ├── patterns.go         # Candlestick pattern detection
│   │   │   ├── support_resistance.go # Support/resistance level detection
│   │   │   └── trend.go            # Trend analysis
│   │   └── models/stock.go         # Data structures
│   └── go.mod
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Main page component
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── StockInput.tsx          # Stock symbol input component
│   │   └── AnalysisReport.tsx      # Analysis results display
│   ├── types/index.ts              # TypeScript interfaces
│   └── package.json
├── README.md                        # User documentation
└── YAHOO_API.md                     # Yahoo Finance API documentation
```

## API Endpoints

### POST /api/analyze
Analyzes a stock symbol and returns technical analysis.

**Request Body:**
```json
{
  "symbol": "VNM",
  "days_back": 200
}
```

Note: The `.VN` suffix is automatically appended for Vietnamese stocks.

**Response:** `AnalysisReport` object with indicators, patterns, support/resistance, trend, and recommendation.

### GET /api/price?symbol=XXX
Returns the latest price data for a stock symbol.

### GET /api/health
Health check endpoint. Returns `{"status": "healthy", "time": "..."}`.

## Key Data Models

### StockData (backend/internal/models/stock.go)
OHLCV data structure: Symbol, Date, Open, High, Low, Close, Volume, AdjClose

### AnalysisReport
- `current_price`: Latest closing price
- `indicators`: RSI, MACD, SMA (20/50/200), EMA (12/26), Bollinger Bands
- `patterns`: Detected candlestick patterns with confidence scores
- `support_resistance`: Support and resistance price levels
- `trend`: Trend direction (uptrend/downtrend/sideways) with strength
- `recommendation`: "buy", "sell", or "hold"
- `buy_range`, `half_buy_range`, `sell_range`: Price range suggestions

## Technical Analysis Features

### Indicators (backend/internal/analysis/indicators.go)
- **RSI**: 14-period Relative Strength Index
- **MACD**: 12/26/9 Moving Average Convergence Divergence
- **SMA**: Simple Moving Averages (20, 50, 200 periods)
- **EMA**: Exponential Moving Averages (12, 26 periods)
- **Bollinger Bands**: 20-period with 2 standard deviations

### Candlestick Patterns (backend/internal/analysis/patterns.go)
- Doji, Hammer, Shooting Star
- Bullish/Bearish Engulfing
- Morning Star, Evening Star

### Recommendation Logic (backend/internal/analysis/analyzer.go)
Generates buy/sell/hold recommendations based on:
- RSI levels (oversold < 30, overbought > 70)
- MACD crossovers
- Moving average alignment
- Bollinger Band position
- Detected candlestick patterns
- Trend strength and direction
- Distance to support/resistance levels

## Development Workflow

### Running the Backend
```bash
cd backend
go run cmd/server/main.go
# Server starts on http://localhost:8080
```

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:3000
```

### Building for Production
```bash
# Backend
cd backend
go build -o bin/server cmd/server/main.go

# Frontend
cd frontend
npm run build
npm start
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Backend server port |

## Common Stock Symbols

Vietnamese stock symbols to test: VNM, VIC, HPG, FPT, MWG, VCB, BID, TCB, MBB, VPB

Note: Enter symbols without the `.VN` suffix - it's automatically added by the backend.

## Notes

- The `pkg/ssi/` directory is named for historical reasons but now uses Yahoo Finance API
- CORS is enabled for all origins in development
- Stock data is fetched for the last 200 days by default
- Yahoo Finance uses Unix timestamps for date ranges
- The API returns adjusted close prices when available
