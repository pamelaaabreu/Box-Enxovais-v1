package routes

import (
	"backend/handlers"
	"net/http"
)

func InitRoutesPromotions(mux *http.ServeMux) {
	adminRoute(mux, http.MethodPost, "/api/promotions/create", handlers.CreatePromotion)
	adminRoute(mux, http.MethodPost, "/api/promotions/add", handlers.AddProductToPromotion)
	publicRoute(mux, http.MethodGet, "/api/promotions/", handlers.GetPromotionalProducts)
}
