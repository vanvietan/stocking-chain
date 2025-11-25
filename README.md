# Vietnamese Stock Market Analyzer

A full-stack web application for analyzing Vietnamese stock market data with advanced technical analysis, including technical indicators, candlestick patterns, support/resistance levels, and trend analysis.

## Features

- **Real-time Stock Data**: Fetches data from Yahoo Finance API
- **Technical Indicators**: RSI, MACD, Moving Averages (SMA/EMA), Bollinger Bands
- **Candlestick Patterns**: Detects patterns like Doji, Hammer, Engulfing, Morning/Evening Star
- **Support & Resistance**: Identifies key price levels
- **Trend Analysis**: Analyzes market trends with strength indicators
- **Buy/Sell Recommendations**: AI-powered recommendations with buy ranges and sell targets
- **Modern UI**: Responsive Next.js frontend with real-time analysis display

## Tech Stack

### Backend
- **Go (Golang)**: High-performance backend
- **Yahoo Finance API**: Stock market data source (public API, no authentication required)
- **REST API**: Clean API architecture

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern, responsive UI
- **Axios**: HTTP client for API calls

## Project Structure

```
stocking-chain/
├── backend/
│   ├── cmd/server/          # Main application entry point
│   ├── internal/
│   │   ├── analysis/        # Technical analysis algorithms
│   │   ├── api/            # HTTP handlers
│   │   └── models/         # Data models
│   └── pkg/ssi/            # Yahoo Finance API client
└── frontend/
    ├── app/                # Next.js app router pages
    ├── components/         # React components
    └── types/             # TypeScript types
```

## Getting Started

### Prerequisites

- Go 1.21 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. (Optional) Configure environment variables:
```bash
# Set custom port (default: 8080)
export PORT=8080
```

3. Install dependencies:
```bash
go mod tidy
```

4. Run the server:
```bash
go run cmd/server/main.go
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a Vietnamese stock symbol (e.g., VNM, VIC, HPG) or click on a popular stock
   - Note: The `.VN` suffix is automatically added for Yahoo Finance
3. Click "Analyze" to get comprehensive analysis
4. View the results including:
   - Buy/Sell recommendation
   - Buy range, half buy range, and sell range
   - Technical indicators (RSI, MACD, Moving Averages)
   - Candlestick patterns
   - Support and resistance levels
   - Trend analysis

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/analyze` - Analyze a stock
  ```json
  {
    "symbol": "VNM",
    "days_back": 200
  }
  ```
- `GET /api/price?symbol=VNM` - Get latest price for a symbol

## Technical Analysis Details

### Indicators
- **RSI (Relative Strength Index)**: Measures momentum (oversold < 30, overbought > 70)
- **MACD**: Trend-following momentum indicator
- **Moving Averages**: SMA 20/50/200 and EMA 12/26
- **Bollinger Bands**: Volatility indicator

### Candlestick Patterns
- Doji, Hammer, Shooting Star
- Bullish/Bearish Engulfing
- Morning/Evening Star

### Support & Resistance
- Identifies pivot points in historical data
- Consolidates nearby levels
- Returns top 3 support and resistance levels

### Trend Analysis
- Linear regression for trend direction
- ADX for trend strength
- Moving average crossovers

## Development

### Running Tests
```bash
cd backend
go test ./...
```

### Building for Production

Backend:
```bash
cd backend
go build -o bin/server cmd/server/main.go
```

Frontend:
```bash
cd frontend
npm run build
npm start
```

## License

MIT

## Disclaimer

This application is for educational purposes only. Stock market trading involves risk. Always do your own research and consult with financial advisors before making investment decisions.
