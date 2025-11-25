package main

import (
	"log"
	"net/http"
	"os"

	"stocking-chain/internal/analysis"
	"stocking-chain/internal/api"
	"stocking-chain/pkg/ssi"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	yahooClient := ssi.NewClient("")
	analyzer := analysis.NewAnalyzer()
	handler := api.NewHandler(yahooClient, analyzer)

	server := &http.Server{
		Addr:    ":" + port,
		Handler: handler.RegisterRoutes(),
	}

	log.Printf("Starting server on port %s...", port)
	log.Printf("Using Yahoo Finance API for stock data")
	log.Printf("Vietnamese stocks will automatically use .VN suffix")
	log.Printf("API endpoints:")
	log.Printf("  - POST /api/analyze - Analyze a stock")
	log.Printf("  - GET  /api/price?symbol=XXX - Get latest price")
	log.Printf("  - GET  /api/health - Health check")

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
