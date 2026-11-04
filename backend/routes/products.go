package routes

import (
	"backend/handlers"
	"net/http"
)

func InitRoutesProducts(mux *http.ServeMux) {
	publicRoute(mux, http.MethodGet, "GET /products", handlers.ListProducts)
	adminRoute(mux, http.MethodPost, "/upload-image", handlers.UploadProductImage)
	adminRoute(mux, http.MethodPost, "/products", handlers.CreateProduct)
	publicRoute(mux, http.MethodGet, "/products/", handlers.GetProduct)
}
