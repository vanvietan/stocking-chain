package api

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"stocking-chain/internal/analysis"
	"stocking-chain/pkg/ssi"
)

type Handler struct {
	ssiClient *ssi.Client
	analyzer  *analysis.Analyzer
}

func NewHandler(ssiClient *ssi.Client, analyzer *analysis.Analyzer) *Handler {
	return &Handler{
		ssiClient: ssiClient,
		analyzer:  analyzer,
	}
}

type AnalyzeRequest struct {
	Symbol     string `json:"symbol"`
	DaysBack   int    `json:"days_back,omitempty"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func (h *Handler) AnalyzeStock(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req AnalyzeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Symbol == "" {
		respondWithError(w, http.StatusBadRequest, "Symbol is required")
		return
	}

	if req.DaysBack == 0 {
		req.DaysBack = 200
	}

	toDate := time.Now()
	fromDate := toDate.AddDate(0, 0, -req.DaysBack)

	log.Printf("Fetching data for %s from %s to %s", req.Symbol, fromDate.Format("2006-01-02"), toDate.Format("2006-01-02"))

	stockData, err := h.ssiClient.GetHistoricalData(req.Symbol, fromDate, toDate)
	if err != nil {
		log.Printf("Error fetching stock data: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch stock data: "+err.Error())
		return
	}

	if len(stockData) == 0 {
		respondWithError(w, http.StatusNotFound, "No data found for symbol: "+req.Symbol)
		return
	}

	log.Printf("Analyzing %d data points for %s", len(stockData), req.Symbol)

	report, err := h.analyzer.Analyze(req.Symbol, stockData)
	if err != nil {
		log.Printf("Error analyzing stock: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to analyze stock")
		return
	}

	// Fetch company info (non-blocking - continue even if it fails)
	stockInfo, err := h.ssiClient.GetStockInfo(req.Symbol)
	if err != nil {
		log.Printf("Warning: Could not fetch company info for %s: %v", req.Symbol, err)
		// Use symbol as fallback for company name
		report.CompanyName = req.Symbol
	} else {
		log.Printf("Stock info for %s: LongName='%s', ShortName='%s'", req.Symbol, stockInfo.LongName, stockInfo.ShortName)
		// Prefer long name, fall back to short name, then symbol
		if stockInfo.LongName != "" {
			report.CompanyName = stockInfo.LongName
		} else if stockInfo.ShortName != "" {
			report.CompanyName = stockInfo.ShortName
		} else {
			report.CompanyName = req.Symbol
		}
	}

	respondWithJSON(w, http.StatusOK, report)
}

func (h *Handler) GetStockPrice(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	symbol := r.URL.Query().Get("symbol")
	if symbol == "" {
		respondWithError(w, http.StatusBadRequest, "Symbol parameter is required")
		return
	}

	stockData, err := h.ssiClient.GetLatestPrice(symbol)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch stock price")
		return
	}

	respondWithJSON(w, http.StatusOK, stockData)
}

func (h *Handler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, http.StatusOK, map[string]string{
		"status": "healthy",
		"time":   time.Now().Format(time.RFC3339),
	})
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, ErrorResponse{Error: message})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, err := json.Marshal(payload)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"error":"Failed to encode response"}`))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.WriteHeader(code)
	w.Write(response)
}

func (h *Handler) RegisterRoutes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/health", h.HealthCheck)
	mux.HandleFunc("/api/analyze", h.AnalyzeStock)
	mux.HandleFunc("/api/price", h.GetStockPrice)

	return enableCORS(mux)
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
