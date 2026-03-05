package routes

import (
	"backend/handlers"
	"net/http"
)

func InitRoutesPromotions(mux *http.ServeMux) {
	mux.HandleFunc("/api/promotions/create", handlers.CreatePromotion)    // FUNÇÃO DO ADMIN
	mux.HandleFunc("/api/promotions/add", handlers.AddProductToPromotion) // FUNÇÃO DO ADMIN
	mux.HandleFunc("/api/promotions/", handlers.GetPromotionalProducts)
}
