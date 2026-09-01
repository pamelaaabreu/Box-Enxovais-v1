package routes

import (
	"backend/handlers"
	"net/http"
)

func InitRoutesProducts(mux *http.ServeMux) {
	adminRoute(mux, http.MethodPost, "/upload-image", handlers.UploadProductImage)
	adminRoute(mux, http.MethodPost, "/products", handlers.CreateProduct)
	publicRoute(mux, http.MethodGet, "/products/", handlers.GetProduct)
}
